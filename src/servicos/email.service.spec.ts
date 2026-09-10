import { ConfigService } from '@nestjs/config';
import nodemailer from 'nodemailer';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { EmailService } from './email.service.js';

vi.mock('nodemailer', () => ({
  default: { createTransport: vi.fn() },
}));

describe('EmailService', () => {
  const sendMail = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(nodemailer.createTransport).mockReturnValue({
      sendMail,
    } as never);
  });

  const criarServico = (valores: Record<string, string> = {}) =>
    new EmailService({
      get: (chave: string) =>
        valores[chave] ??
        (
          {
            SMTP_HOST: 'smtp.exemplo.com',
            SMTP_PORT: '587',
            SMTP_USER: 'biblioteca@exemplo.com',
            SMTP_PASSWORD: 'segredo',
            FRONTEND_URL: 'https://biblioteca.exemplo.com',
          } as Record<string, string>
        )[chave],
    } as ConfigService);

  it('envia a notificação de disponibilidade com texto e HTML seguros', async () => {
    sendMail.mockResolvedValue({ messageId: '1' });
    const servico = criarServico();

    const resultado = await servico.enviarReservaDisponivel({
      nome: '<Ana>',
      email: 'ana@exemplo.com',
      livro: 'Código & Café',
      prazoRetirada: new Date('2026-09-09T18:00:00.000Z'),
    });

    expect(resultado).toBe(true);
    expect(sendMail).toHaveBeenCalledOnce();
    expect(sendMail).toHaveBeenCalledWith(
      expect.objectContaining({
        to: 'ana@exemplo.com',
        subject: 'Livro disponível: Código & Café',
        text: expect.stringContaining('Código & Café'),
        html: expect.stringContaining('&lt;Ana&gt;'),
      }),
    );
  });

  it('não tenta enviar quando o SMTP não está configurado', async () => {
    const servico = criarServico({ SMTP_HOST: '' });

    const resultado = await servico.enviarReservaDisponivel({
      nome: 'Ana',
      email: 'ana@exemplo.com',
      livro: 'Livro',
      prazoRetirada: new Date(),
    });

    expect(resultado).toBe(false);
    expect(sendMail).not.toHaveBeenCalled();
  });

  it('envia a nova senha temporária somente ao e-mail cadastrado', async () => {
    sendMail.mockResolvedValue({ messageId: '2' });
    const servico = criarServico();

    const resultado = await servico.enviarSenhaTemporaria({
      nome: '<Ana>',
      email: 'ana@exemplo.com',
      senhaTemporaria: 'Temporaria-123',
    });

    expect(resultado).toBe(true);
    expect(sendMail).toHaveBeenCalledWith(
      expect.objectContaining({
        to: 'ana@exemplo.com',
        subject: 'Nova senha temporária — Biblioteca Virtual',
        text: expect.stringContaining('Temporaria-123'),
        html: expect.stringContaining('&lt;Ana&gt;'),
      }),
    );
  });

  it('mantém a operação segura quando o provedor SMTP falha', async () => {
    sendMail.mockRejectedValue(new Error('SMTP indisponível'));
    const servico = criarServico();

    await expect(
      servico.enviarReservaDisponivel({
        nome: 'Ana',
        email: 'ana@exemplo.com',
        livro: 'Livro',
        prazoRetirada: new Date(),
      }),
    ).resolves.toBe(false);
  });
});
