import {
  ArgumentsHost,
  Catch,
  ExceptionFilter,
  HttpException,
  HttpStatus,
} from '@nestjs/common';
import type { Response, Request } from 'express';

@Catch()
export class FiltroErros implements ExceptionFilter {
  catch(excecao: unknown, argumentos: ArgumentsHost) {
    const resposta = argumentos.switchToHttp().getResponse<Response>();
    const requisicao = argumentos.switchToHttp().getRequest<Request>();
    const estado =
      excecao instanceof HttpException
        ? excecao.getStatus()
        : HttpStatus.INTERNAL_SERVER_ERROR;
    const conteudo: any =
      excecao instanceof HttpException ? excecao.getResponse() : {};
    const mensagemOriginal =
      typeof conteudo === 'string' ? conteudo : conteudo.message;
    const mensagem = Array.isArray(mensagemOriginal)
      ? mensagemOriginal.join(' ')
      : mensagemOriginal ||
        (excecao as any)?.message ||
        'Ocorreu um erro interno.';
    const titulos: Record<number, string> = {
      400: 'Dados Inválidos',
      401: 'Não Autorizado',
      403: 'Acesso Negado',
      404: 'Recurso Não Encontrado',
      409: 'Conflito',
      429: 'Limite Excedido',
      500: 'Erro Interno',
    };
    resposta.status(estado).json({
      timestamp: new Date().toISOString(),
      status: estado,
      erro: titulos[estado] ?? 'Erro',
      mensagem,
      path: requisicao.originalUrl,
    });
  }
}
