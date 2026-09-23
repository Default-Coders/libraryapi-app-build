import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Cron } from '@nestjs/schedule';
import { InjectRepository } from '@nestjs/typeorm';
import { LessThan, Repository } from 'typeorm';
import {
  EntradaFila,
  RegistroNotificacao,
  Reserva,
  SituacaoNotificacao,
  TipoNotificacao,
} from '../dominio/entidades.js';
import { EmailService } from './email.service.js';
import {
  templateBoasVindas,
  templateLivroDisponivel,
  templateReservaCriada,
  templateReservaExpirada,
  templateReservaExpirando,
  templateSenhaTemporaria,
} from './notificacao-templates.js';

const MAX_TENTATIVAS = 3;

@Injectable()
export class NotificationService {
  private readonly logger = new Logger(NotificationService.name);

  constructor(
    @InjectRepository(RegistroNotificacao)
    private registros: Repository<RegistroNotificacao>,
    @InjectRepository(Reserva) private reservas: Repository<Reserva>,
    @InjectRepository(EntradaFila) private fila: Repository<EntradaFila>,
    private readonly emailService: EmailService,
    private readonly config: ConfigService,
  ) {}

  async agendarBoasVindas(dados: { nome: string; email: string; perfil: 'aluno' | 'administrador' }) {
    await this.agendar({ tipo: TipoNotificacao.BOAS_VINDAS, destinatario: dados.email, assunto: 'Bem-vindo(a) à Biblioteca Virtual — ETE', chave: `boas-vindas:${dados.email}` });
  }

  async agendarSenhaTemporaria(dados: { nome: string; email: string }) {
    await this.agendar({ tipo: TipoNotificacao.SENHA_TEMPORARIA, destinatario: dados.email, assunto: 'Sua senha foi redefinida — Biblioteca Virtual ETE' });
  }

  async agendarReservaCriada(reserva: Reserva) {
    if (!reserva.prazoRetirada) return;
    await this.agendar({ tipo: TipoNotificacao.RESERVA_CRIADA, destinatario: reserva.aluno.email, assunto: `Reserva confirmada: ${reserva.livro.titulo}`, chave: `reserva-criada:${reserva.id}` });
  }

  async agendarLivroDisponivel(entrada: EntradaFila, reserva: Reserva) {
    await this.agendar({ tipo: TipoNotificacao.LIVRO_DISPONIVEL, destinatario: entrada.aluno.email, assunto: `Seu livro esta disponivel: ${entrada.livro.titulo}`, chave: `livro-disponivel:${reserva.id}` });
  }

  async agendarReservaExpirando(reserva: Reserva) {
    await this.agendar({ tipo: TipoNotificacao.RESERVA_EXPIRANDO, destinatario: reserva.aluno.email, assunto: `Aviso: prazo de retirada proximo — ${reserva.livro.titulo}`, chave: `reserva-expirando:${reserva.id}` });
  }

  async agendarReservaExpirada(reserva: Reserva) {
    await this.agendar({ tipo: TipoNotificacao.RESERVA_EXPIRADA, destinatario: reserva.aluno.email, assunto: `Reserva expirada: ${reserva.livro.titulo}`, chave: `reserva-expirada:${reserva.id}` });
  }

  @Cron('0 */5 * * * *')
  async processarPendentes() {
    if (!this.emailService.habilitado) return;
    const pendentes = await this.registros.find({ where: { situacao: SituacaoNotificacao.PENDENTE }, order: { criadoEm: 'ASC' }, take: 50 });
    for (const registro of pendentes) { await this.processar(registro); }
  }

  @Cron('0 0 * * * *')
  async notificarReservasExpirando() {
    if (!this.emailService.habilitado) return;
    const limite = new Date();
    limite.setHours(limite.getHours() + 4);
    const reservas = await this.reservas.find({ where: { prazoRetirada: LessThan(limite) } });
    for (const reserva of reservas.filter((r) => r.prazoRetirada && r.prazoRetirada > new Date())) {
      const chave = `reserva-expirando:${reserva.id}`;
      const jaAgendada = await this.registros.existsBy({ chaveIdempotencia: chave });
      if (!jaAgendada) { await this.agendarReservaExpirando(reserva); }
    }
  }

  private async processar(registro: RegistroNotificacao) {
    registro.tentativas++;
    const url = this.config.get<string>('FRONTEND_URL') ?? 'http://localhost:3000';
    const tz = this.config.get<string>('TZ') ?? 'America/Sao_Paulo';
    try {
      const template = await this.montarTemplate(registro, url, tz);
      if (!template) {
        registro.situacao = SituacaoNotificacao.CANCELADA;
        registro.erroResumido = 'Dados do destinatario nao encontrados.';
        await this.registros.save(registro);
        return;
      }
      const resultado = await this.emailService.enviar({ destinatario: registro.destinatario, assunto: template.assunto, texto: template.texto, html: template.html });
      if (resultado.ok) {
        registro.situacao = SituacaoNotificacao.ENVIADA;
        registro.enviadoEm = new Date();
        registro.erroResumido = undefined;
      } else {
        registro.erroResumido = resultado.erro;
        if (registro.tentativas >= MAX_TENTATIVAS) {
          registro.situacao = SituacaoNotificacao.FALHA;
          this.logger.error(`Notificacao ${registro.id} (${registro.tipo}) marcada como FAILED apos ${registro.tentativas} tentativas.`);
        }
      }
    } catch (err) {
      const msg = err instanceof Error ? err.message : String(err);
      registro.erroResumido = msg.slice(0, 500);
      if (registro.tentativas >= MAX_TENTATIVAS) { registro.situacao = SituacaoNotificacao.FALHA; }
      this.logger.error(`Erro ao processar notificacao ${registro.id}: ${msg}`);
    }
    await this.registros.save(registro);
  }

  private async montarTemplate(registro: RegistroNotificacao, url: string, tz: string) {
    const tipo = registro.tipo;
    const email = registro.destinatario;
    if (tipo === TipoNotificacao.BOAS_VINDAS) {
      const aluno = await this.buscarAlunoPorEmail(email);
      return templateBoasVindas({ nome: aluno?.nome ?? email, email, perfil: aluno ? 'aluno' : 'administrador', urlAcesso: `${url}/login` });
    }
    if (tipo === TipoNotificacao.SENHA_TEMPORARIA) {
      const aluno = await this.buscarAlunoPorEmail(email);
      return templateSenhaTemporaria({ nome: aluno?.nome ?? email, email, urlAcesso: `${url}/login` });
    }
    if (tipo === TipoNotificacao.RESERVA_CRIADA) {
      const id = (registro.chaveIdempotencia ?? '').replace('reserva-criada:', '');
      const reserva = await this.reservas.findOne({ where: { id } });
      if (!reserva?.prazoRetirada) return null;
      return templateReservaCriada({ nome: reserva.aluno.nome, livro: reserva.livro.titulo, prazoRetirada: reserva.prazoRetirada, urlReservas: `${url}/aluno/reservas`, tz });
    }
    if (tipo === TipoNotificacao.LIVRO_DISPONIVEL) {
      const id = (registro.chaveIdempotencia ?? '').replace('livro-disponivel:', '');
      const reserva = await this.reservas.findOne({ where: { id } });
      if (!reserva?.prazoRetirada) return null;
      return templateLivroDisponivel({ nome: reserva.aluno.nome, livro: reserva.livro.titulo, prazoRetirada: reserva.prazoRetirada, urlReservas: `${url}/aluno/reservas`, tz });
    }
    if (tipo === TipoNotificacao.RESERVA_EXPIRANDO) {
      const id = (registro.chaveIdempotencia ?? '').replace('reserva-expirando:', '');
      const reserva = await this.reservas.findOne({ where: { id } });
      if (!reserva?.prazoRetirada) return null;
      return templateReservaExpirando({ nome: reserva.aluno.nome, livro: reserva.livro.titulo, prazoRetirada: reserva.prazoRetirada, urlReservas: `${url}/aluno/reservas`, tz });
    }
    if (tipo === TipoNotificacao.RESERVA_EXPIRADA) {
      const id = (registro.chaveIdempotencia ?? '').replace('reserva-expirada:', '');
      const reserva = await this.reservas.findOne({ where: { id } });
      if (!reserva) return null;
      return templateReservaExpirada({ nome: reserva.aluno.nome, livro: reserva.livro.titulo, urlAcesso: `${url}/aluno/dashboard` });
    }
    return null;
  }

  private async agendar(dados: { tipo: TipoNotificacao; destinatario: string; assunto: string; chave?: string }) {
    if (dados.chave) {
      const existe = await this.registros.existsBy({ chaveIdempotencia: dados.chave });
      if (existe) return;
    }
    await this.registros.save(this.registros.create({ tipo: dados.tipo, destinatario: dados.destinatario, assunto: dados.assunto, situacao: SituacaoNotificacao.PENDENTE, tentativas: 0, chaveIdempotencia: dados.chave }));
  }

  private async buscarAlunoPorEmail(email: string) {
    return this.fila.createQueryBuilder('ef').leftJoinAndSelect('ef.aluno', 'aluno').where('aluno.email = :email', { email }).getOne().then((ef) => ef?.aluno ?? null);
  }
}
