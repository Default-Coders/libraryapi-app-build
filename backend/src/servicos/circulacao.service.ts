import {
  BadRequestException,
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { Cron } from '@nestjs/schedule';
import { InjectRepository } from '@nestjs/typeorm';
import { DataSource, EntityManager, In, Repository } from 'typeorm';
import {
  Aluno,
  EntradaFila,
  Livro,
  Reserva,
  SituacaoFila,
  SituacaoReserva,
} from '../dominio/entidades.js';

const situacoesReservaAtiva = [
  SituacaoReserva.SOLICITADA,
  SituacaoReserva.APROVADA,
  SituacaoReserva.RETIRADA,
];
const situacoesFilaAtiva = [
  SituacaoFila.AGUARDANDO,
  SituacaoFila.NOTIFICADO,
  SituacaoFila.RESERVADO,
];
@Injectable()
export class CirculacaoService {
  constructor(
    private banco: DataSource,
    @InjectRepository(Reserva) private reservas: Repository<Reserva>,
    @InjectRepository(EntradaFila) private fila: Repository<EntradaFila>,
  ) {}
  private async livroBloqueado(gestor: EntityManager, id: string) {
    const livro = await gestor
      .getRepository(Livro)
      .createQueryBuilder('livro')
      .setLock('pessimistic_write')
      .where('livro.id=:id AND livro.is_active=true', { id })
      .getOne();
    if (!livro)
      throw new NotFoundException(`Livro não encontrado com o ID: ${id}`);
    return livro;
  }
  private async aluno(gestor: EntityManager, id: string) {
    const aluno = await gestor
      .getRepository(Aluno)
      .findOneBy({ id, ativo: true });
    if (!aluno) throw new NotFoundException('Aluno não encontrado.');
    return aluno;
  }
  private async entrarNaFila(
    gestor: EntityManager,
    aluno: Aluno,
    livro: Livro,
  ) {
    const repo = gestor.getRepository(EntradaFila);
    if (
      await repo.exists({
        where: {
          aluno: { id: aluno.id },
          livro: { id: livro.id },
          situacao: In(situacoesFilaAtiva),
        },
      })
    )
      throw new ConflictException(
        'Você já está na lista de espera deste livro.',
      );
    const quantidade = await repo.count({
      where: { livro: { id: livro.id }, situacao: SituacaoFila.AGUARDANDO },
    });
    let entrada =
      (await repo.findOne({
        where: { aluno: { id: aluno.id }, livro: { id: livro.id } },
      })) ?? repo.create({ aluno, livro });
    entrada.posicao = quantidade + 1;
    entrada.situacao = SituacaoFila.AGUARDANDO;
    entrada.notificadoEm = undefined;
    entrada.ativo = true;
    return repo.save(entrada);
  }
  async reservar(alunoId: string, livroId: string) {
    return this.banco.transaction(async (gestor) => {
      const aluno = await this.aluno(gestor, alunoId);
      const livro = await this.livroBloqueado(gestor, livroId);
      const repo = gestor.getRepository(Reserva);
      if (
        await repo.exists({
          where: {
            aluno: { id: aluno.id },
            livro: { id: livro.id },
            situacao: In(situacoesReservaAtiva),
          },
        })
      )
        throw new ConflictException(
          'Você já possui uma reserva ativa para este livro.',
        );
      if (!livro.quantidadeDisponivel) {
        await this.entrarNaFila(gestor, aluno, livro);
        return {
          fila: true,
          mensagem:
            'Não há exemplares disponíveis no momento. Você foi inserido na lista de espera com sucesso!',
        };
      }
      livro.quantidadeDisponivel--;
      await gestor.save(livro);
      const agora = new Date();
      const prazo = new Date(agora);
      prazo.setDate(prazo.getDate() + 2);
      return repo.save(
        repo.create({
          aluno,
          livro,
          reservadoEm: agora,
          prazoRetirada: prazo,
          situacao: SituacaoReserva.SOLICITADA,
        }),
      );
    });
  }
  async entrar(alunoId: string, livroId: string) {
    return this.banco.transaction(async (gestor) => {
      const aluno = await this.aluno(gestor, alunoId);
      const livro = await this.livroBloqueado(gestor, livroId);
      if (livro.quantidadeDisponivel > 0)
        throw new BadRequestException(
          'Este livro possui exemplares disponíveis. Faça a reserva diretamente.',
        );
      return this.entrarNaFila(gestor, aluno, livro);
    });
  }
  async listarReservas(alunoId?: string) {
    return this.reservas.find({
      where: { ativo: true, ...(alunoId ? { aluno: { id: alunoId } } : {}) },
      order: { reservadoEm: 'DESC' },
    });
  }
  async obterReserva(id: string) {
    const item = await this.reservas.findOne({ where: { id, ativo: true } });
    if (!item)
      throw new NotFoundException(`Reserva não encontrada com o ID: ${id}`);
    return item;
  }
  async liberarExemplar(gestor: EntityManager, livro: Livro) {
    const filaRepo = gestor.getRepository(EntradaFila);
    const proximo = await filaRepo.findOne({
      where: { livro: { id: livro.id }, situacao: SituacaoFila.AGUARDANDO },
      order: { posicao: 'ASC' },
    });
    if (!proximo) {
      livro.quantidadeDisponivel++;
      await gestor.save(livro);
      return;
    }
    proximo.situacao = SituacaoFila.RESERVADO;
    await filaRepo.save(proximo);
    const agora = new Date();
    const prazo = new Date(agora);
    prazo.setDate(prazo.getDate() + 2);
    await gestor.save(Reserva, {
      aluno: proximo.aluno,
      livro,
      reservadoEm: agora,
      prazoRetirada: prazo,
      situacao: SituacaoReserva.SOLICITADA,
    });
    await this.reordenar(gestor, livro.id);
  }
  async cancelarReserva(id: string, alunoId: string) {
    return this.banco.transaction(async (gestor) => {
      const reserva = await gestor
        .getRepository(Reserva)
        .findOne({ where: { id }, relations: { livro: true, aluno: true } });
      if (!reserva) throw new NotFoundException('Reserva não encontrada.');
      if (reserva.aluno.id !== alunoId)
        throw new BadRequestException(
          'Você não pode cancelar a reserva de outro aluno.',
        );
      if (
        ![SituacaoReserva.SOLICITADA, SituacaoReserva.APROVADA].includes(
          reserva.situacao,
        )
      )
        throw new ConflictException(
          'Não é possível cancelar uma reserva que já foi retirada.',
        );
      reserva.situacao = SituacaoReserva.CANCELADA;
      await gestor.save(reserva);
      const livro = await this.livroBloqueado(gestor, reserva.livro.id);
      await this.liberarExemplar(gestor, livro);
      return reserva;
    });
  }
  async retirar(id: string) {
    const reserva = await this.obterReserva(id);
    if (
      reserva.situacao !== SituacaoReserva.APROVADA &&
      reserva.situacao !== SituacaoReserva.SOLICITADA
    )
      throw new ConflictException(
        'A reserva deve estar aprovada para ser retirada.',
      );
    reserva.situacao = SituacaoReserva.RETIRADA;
    reserva.retiradoEm = new Date();
    return this.reservas.save(reserva);
  }
  async devolver(id: string) {
    return this.banco.transaction(async (gestor) => {
      const reserva = await gestor
        .getRepository(Reserva)
        .findOne({ where: { id }, relations: { livro: true } });
      if (!reserva) throw new NotFoundException('Reserva não encontrada.');
      if (reserva.situacao !== SituacaoReserva.RETIRADA)
        throw new ConflictException(
          'A reserva deve estar retirada para ser devolvida.',
        );
      reserva.situacao = SituacaoReserva.DEVOLVIDA;
      reserva.devolvidoEm = new Date();
      await gestor.save(reserva);
      const livro = await this.livroBloqueado(gestor, reserva.livro.id);
      await this.liberarExemplar(gestor, livro);
      return reserva;
    });
  }
  async listarFila(alunoId?: string) {
    return this.fila.find({
      where: { ativo: true, ...(alunoId ? { aluno: { id: alunoId } } : {}) },
      order: { criadoEm: 'DESC' },
    });
  }
  async obterFila(id: string) {
    const item = await this.fila.findOne({ where: { id, ativo: true } });
    if (!item)
      throw new NotFoundException(
        `Registro de lista de espera não encontrado com o ID: ${id}`,
      );
    return item;
  }
  private async reordenar(gestor: EntityManager, livroId: string) {
    const itens = await gestor.getRepository(EntradaFila).find({
      where: { livro: { id: livroId }, situacao: SituacaoFila.AGUARDANDO },
      order: { posicao: 'ASC' },
    });
    itens.forEach((i, n) => (i.posicao = n + 1));
    await gestor.save(itens);
  }
  async cancelarFila(id: string, alunoId: string) {
    return this.banco.transaction(async (gestor) => {
      const item = await gestor
        .getRepository(EntradaFila)
        .findOne({ where: { id }, relations: { aluno: true, livro: true } });
      if (!item)
        throw new NotFoundException(
          'Registro de lista de espera não encontrado.',
        );
      if (item.aluno.id !== alunoId)
        throw new BadRequestException(
          'Você não pode cancelar a espera de outro aluno.',
        );
      item.situacao = SituacaoFila.CANCELADO;
      await gestor.save(item);
      await this.reordenar(gestor, item.livro.id);
      return item;
    });
  }
  @Cron('0 */15 * * * *') async expirar() {
    const vencidas = await this.reservas.find({
      where: {
        situacao: In([SituacaoReserva.SOLICITADA, SituacaoReserva.APROVADA]),
      },
    });
    for (const reserva of vencidas.filter(
      (r) => r.prazoRetirada && r.prazoRetirada < new Date(),
    ))
      await this.banco.transaction(async (gestor) => {
        reserva.situacao = SituacaoReserva.EXPIRADA;
        await gestor.save(reserva);
        const livro = await this.livroBloqueado(gestor, reserva.livro.id);
        await this.liberarExemplar(gestor, livro);
      });
  }
}
