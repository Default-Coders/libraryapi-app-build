import { Injectable, Logger } from '@nestjs/common';
import { Cron } from '@nestjs/schedule';
import { InjectRepository } from '@nestjs/typeorm';
import { IsNull, Repository } from 'typeorm';
import {
  EntradaFila,
  Reserva,
  SituacaoFila,
  SituacaoReserva,
} from '../dominio/entidades.js';
import { EmailService } from './email.service.js';

@Injectable()
export class NotificationService {
  private readonly logger = new Logger(NotificationService.name);

  constructor(
    @InjectRepository(Reserva) private reservas: Repository<Reserva>,
    @InjectRepository(EntradaFila) private fila: Repository<EntradaFila>,
    private readonly emailService: EmailService,
  ) {}

  @Cron('0 * * * * *')
  async processarNotificacoesPendentes() {
    const pendentes = await this.fila.find({
      where: {
        situacao: SituacaoFila.RESERVADO,
        ativo: true,
        notificadoEm: IsNull(),
      },
      order: { criadoEm: 'ASC' },
    });

    for (const item of pendentes) {
      const reserva = await this.reservas.findOne({
        where: {
          aluno: { id: item.aluno.id },
          livro: { id: item.livro.id },
          situacao: SituacaoReserva.SOLICITADA,
          ativo: true,
        },
        order: { reservadoEm: 'DESC' },
      });
      if (!reserva?.prazoRetirada) continue;

      try {
        const enviado = await this.emailService.enviarReservaDisponivel({
          nome: item.aluno.nome,
          email: item.aluno.email,
          livro: item.livro.titulo,
          prazoRetirada: reserva.prazoRetirada,
        });

        if (enviado) {
          item.notificadoEm = new Date();
          await this.fila.save(item);
        }
      } catch {
        this.logger.error(
          `Falha ao notificar aluno ${item.aluno.id} sobre reserva do livro ${item.livro.id}`,
        );
      }
    }
  }
}
