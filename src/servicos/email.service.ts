import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import nodemailer, { Transporter } from 'nodemailer';

@Injectable()
export class EmailService {
  private readonly logger = new Logger(EmailService.name);
  private readonly transporter?: Transporter;

  constructor(private readonly config: ConfigService) {
    const host = this.config.get<string>('SMTP_HOST');
    const user = this.config.get<string>('SMTP_USER');
    const password = this.config.get<string>('SMTP_PASSWORD');
    if (!host || !user || !password) {
      this.logger.warn(
        'E-mail desativado: configure SMTP_HOST, SMTP_USER e SMTP_PASSWORD.',
      );
      return;
    }
    const port = Number(this.config.get<string>('SMTP_PORT') ?? 587);
    this.transporter = nodemailer.createTransport({
      host,
      port,
      secure: this.config.get<string>('SMTP_SECURE') === 'true' || port === 465,
      auth: { user, pass: password },
    });
  }

  async enviarBoasVindas(dados: {
    nome: string;
    email: string;
    senhaInicial: string;
    perfil: 'aluno' | 'administrador';
  }) {
    if (!this.transporter) return false;
    const acesso =
      this.config.get<string>('FRONTEND_URL') ?? 'http://localhost:3000';
    const nome = this.escapar(dados.nome);
    const email = this.escapar(dados.email);
    const senha = this.escapar(dados.senhaInicial);
    try {
      await this.transporter.sendMail({
        from: this.remetente(),
        to: dados.email,
        subject: 'Bem-vindo(a) à Biblioteca Virtual',
        text: [
          `Olá, ${dados.nome}!`,
          '',
          `Seu cadastro de ${dados.perfil} na Biblioteca Virtual foi realizado.`,
          `Acesse: ${acesso}/login`,
          `E-mail: ${dados.email}`,
          `Senha inicial: ${dados.senhaInicial}`,
          '',
          'No primeiro acesso, altere sua senha antes de utilizar o sistema.',
          'Não compartilhe sua senha com outras pessoas.',
        ].join('\n'),
        html: `
          <div style="font-family:Arial,sans-serif;max-width:600px;margin:auto;color:#172033">
            <div style="background:#145bdb;padding:24px;border-radius:14px 14px 0 0;color:#fff">
              <h1 style="font-size:22px;margin:0">Biblioteca Virtual</h1>
              <p style="margin:8px 0 0">Seu cadastro foi realizado com sucesso.</p>
            </div>
            <div style="border:1px solid #dbe3ef;border-top:0;padding:26px;border-radius:0 0 14px 14px">
              <p>Olá, <strong>${nome}</strong>!</p>
              <p>Você foi cadastrado(a) como <strong>${dados.perfil}</strong> no sistema da biblioteca.</p>
              <div style="background:#f3f6fb;border-radius:10px;padding:16px;margin:20px 0">
                <p style="margin:0 0 8px"><strong>E-mail:</strong> ${email}</p>
                <p style="margin:0"><strong>Senha inicial:</strong> ${senha}</p>
              </div>
              <p><strong>Procedimentos iniciais:</strong></p>
              <ol style="line-height:1.7">
                <li>Acesse o sistema pelo botão abaixo.</li>
                <li>Entre com o e-mail e a senha inicial informados.</li>
                <li>Crie uma nova senha no primeiro acesso.</li>
                <li>Não compartilhe suas credenciais.</li>
              </ol>
              <a href="${acesso}/login" style="display:inline-block;background:#145bdb;color:#fff;text-decoration:none;padding:12px 20px;border-radius:9px;font-weight:bold">Acessar Biblioteca Virtual</a>
            </div>
          </div>`,
      });
      this.logger.log(`E-mail de boas-vindas enviado para ${dados.email}.`);
      return true;
    } catch (erro) {
      this.logger.error(
        `Não foi possível enviar o e-mail para ${dados.email}.`,
        erro instanceof Error ? erro.stack : String(erro),
      );
      return false;
    }
  }

  async enviarReservaDisponivel(dados: {
    nome: string;
    email: string;
    livro: string;
    prazoRetirada: Date;
  }) {
    const acesso =
      this.config.get<string>('FRONTEND_URL') ?? 'http://localhost:3000';
    const prazo = new Intl.DateTimeFormat('pt-BR', {
      dateStyle: 'long',
      timeStyle: 'short',
      timeZone: this.config.get<string>('TZ') ?? 'America/Sao_Paulo',
    }).format(dados.prazoRetirada);

    return this.enviar({
      destinatario: dados.email,
      assunto: `Livro disponível: ${dados.livro}`,
      texto: [
        `Olá, ${dados.nome}!`,
        '',
        `O livro "${dados.livro}" ficou disponível e foi reservado para você.`,
        `Retire-o até ${prazo}.`,
        `Consulte sua reserva: ${acesso}/aluno/reservations`,
        '',
        'Após esse prazo, a reserva expirará e o exemplar será destinado ao próximo aluno da fila.',
      ].join('\n'),
      html: `
        <div style="font-family:Arial,sans-serif;max-width:600px;margin:auto;color:#172033">
          <div style="background:#145bdb;padding:24px;border-radius:14px 14px 0 0;color:#fff">
            <h1 style="font-size:22px;margin:0">Seu livro está disponível</h1>
          </div>
          <div style="border:1px solid #dbe3ef;border-top:0;padding:26px;border-radius:0 0 14px 14px">
            <p>Olá, <strong>${this.escapar(dados.nome)}</strong>!</p>
            <p>O livro <strong>${this.escapar(dados.livro)}</strong> foi reservado para você.</p>
            <p>Faça a retirada até <strong>${this.escapar(prazo)}</strong>. Depois desse prazo, o exemplar será destinado ao próximo aluno da fila.</p>
            <a href="${this.escapar(acesso)}/aluno/reservations" style="display:inline-block;background:#145bdb;color:#fff;text-decoration:none;padding:12px 20px;border-radius:9px;font-weight:bold">Ver minha reserva</a>
          </div>
        </div>`,
    });
  }

  async enviarSenhaTemporaria(dados: {
    nome: string;
    email: string;
    senhaTemporaria: string;
  }) {
    const acesso =
      this.config.get<string>('FRONTEND_URL') ?? 'http://localhost:3000';
    return this.enviar({
      destinatario: dados.email,
      assunto: 'Nova senha temporária — Biblioteca Virtual',
      texto: [
        `Olá, ${dados.nome}!`,
        '',
        'Sua senha de acesso à Biblioteca Virtual foi redefinida por um administrador.',
        `Acesse: ${acesso}/login`,
        `E-mail: ${dados.email}`,
        `Senha temporária: ${dados.senhaTemporaria}`,
        '',
        'No próximo acesso, substitua essa senha por uma senha pessoal.',
        'Não compartilhe suas credenciais.',
      ].join('\n'),
      html: `
        <div style="font-family:Arial,sans-serif;max-width:600px;margin:auto;color:#172033">
          <div style="background:#145bdb;padding:24px;border-radius:14px 14px 0 0;color:#fff">
            <h1 style="font-size:22px;margin:0">Nova senha temporária</h1>
          </div>
          <div style="border:1px solid #dbe3ef;border-top:0;padding:26px;border-radius:0 0 14px 14px">
            <p>Olá, <strong>${this.escapar(dados.nome)}</strong>!</p>
            <p>Sua senha da Biblioteca Virtual foi redefinida por um administrador.</p>
            <div style="background:#f3f6fb;border-radius:10px;padding:16px;margin:20px 0">
              <p style="margin:0 0 8px"><strong>E-mail:</strong> ${this.escapar(dados.email)}</p>
              <p style="margin:0"><strong>Senha temporária:</strong> ${this.escapar(dados.senhaTemporaria)}</p>
            </div>
            <p>Use a senha temporária no próximo acesso e substitua-a imediatamente por uma senha pessoal.</p>
            <a href="${this.escapar(acesso)}/login" style="display:inline-block;background:#145bdb;color:#fff;text-decoration:none;padding:12px 20px;border-radius:9px;font-weight:bold">Acessar Biblioteca Virtual</a>
          </div>
        </div>`,
    });
  }

  private async enviar(dados: {
    destinatario: string;
    assunto: string;
    texto: string;
    html: string;
  }) {
    if (!this.transporter) return false;
    try {
      await this.transporter.sendMail({
        from: this.remetente(),
        to: dados.destinatario,
        subject: dados.assunto,
        text: dados.texto,
        html: dados.html,
      });
      this.logger.log(`E-mail enviado para ${dados.destinatario}.`);
      return true;
    } catch (erro) {
      this.logger.error(
        `Não foi possível enviar o e-mail para ${dados.destinatario}.`,
        erro instanceof Error ? erro.stack : String(erro),
      );
      return false;
    }
  }

  private remetente() {
    return (
      this.config.get<string>('SMTP_FROM') ??
      this.config.get<string>('SMTP_USER')!
    );
  }

  private escapar(valor: string) {
    return valor.replace(
      /[&<>'"]/g,
      (caractere) =>
        ({
          '&': '&amp;',
          '<': '&lt;',
          '>': '&gt;',
          "'": '&#39;',
          '"': '&quot;',
        })[caractere]!,
    );
  }
}
