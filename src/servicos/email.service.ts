import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import nodemailer, { Transporter } from 'nodemailer';

// EmailService — transport-only.
// Não contém lógica de negócio nem templates.
// Chame NotificationService para orquestrar envios.

@Injectable()
export class EmailService {
  private readonly logger = new Logger(EmailService.name);
  private readonly transporter?: Transporter;
  private readonly remetentePadrao: string;
  readonly habilitado: boolean;

  constructor(private readonly config: ConfigService) {
    const host = this.config.get<string>('SMTP_HOST');
    const user = this.config.get<string>('SMTP_USER');
    const password = this.config.get<string>('SMTP_PASSWORD');

    this.remetentePadrao =
      this.config.get<string>('SMTP_FROM') ?? user ?? 'noreply@biblioteca.ete';

    if (!host || !user || !password) {
      this.logger.warn(
        'E-mail desativado: configure SMTP_HOST, SMTP_USER e SMTP_PASSWORD.',
      );
      this.habilitado = false;
      return;
    }

    const port = Number(this.config.get<string>('SMTP_PORT') ?? 587);
    this.transporter = nodemailer.createTransport({
      host,
      port,
      secure: this.config.get<string>('SMTP_SECURE') === 'true' || port === 465,
      auth: { user, pass: password },
    });
    this.habilitado = true;
  }

  async enviar(dados: {
    destinatario: string;
    assunto: string;
    texto: string;
    html: string;
  }): Promise<{ ok: boolean; erro?: string }> {
    if (!this.transporter) {
      return { ok: false, erro: 'SMTP não configurado.' };
    }
    try {
      await this.transporter.sendMail({
        from: this.remetentePadrao,
        to: dados.destinatario,
        subject: dados.assunto,
        text: dados.texto,
        html: dados.html,
      });
      this.logger.log(`E-mail enviado para ${dados.destinatario} — "${dados.assunto}".`);
      return { ok: true };
    } catch (erro) {
      const mensagem = erro instanceof Error ? erro.message : String(erro);
      this.logger.error(
        `Falha ao enviar e-mail para ${dados.destinatario}: ${mensagem}`,
      );
      return { ok: false, erro: mensagem.slice(0, 500) };
    }
  }
}


