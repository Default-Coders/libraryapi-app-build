import 'reflect-metadata';
import { ValidationPipe } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import { NestExpressApplication } from '@nestjs/platform-express';
import { mkdir } from 'node:fs/promises';
import { resolve } from 'node:path';
import session from 'express-session';
import connectPgSimple from 'connect-pg-simple';
import pg from 'pg';
import { AppModule } from './app.module.js';
import { FiltroErros } from './comum/filtro-erros.js';
async function iniciar() {
  const aplicacao = await NestFactory.create<NestExpressApplication>(AppModule);
  const pastaUploads = resolve(process.cwd(), 'uploads');
  await mkdir(resolve(pastaUploads, 'covers'), { recursive: true });
  aplicacao.useStaticAssets(pastaUploads, { prefix: '/uploads/' });
  const origens = (process.env.ALLOWED_ORIGINS ?? 'http://localhost:3000')
    .split(',')
    .map((o) => o.trim());
  aplicacao.enableCors({
    origin: origens,
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Cache-Control', 'Content-Type'],
  });
  const dbUrl = process.env.DATABASE_URL;
  if (!dbUrl) {
    throw new Error('DATABASE_URL is not defined in the environment variables.');
  }
  const url = dbUrl.replace(/^jdbc:/, '');
  const Armazenamento = connectPgSimple(session);
  const sessionSecret = process.env.SESSION_SECRET;
  if (!sessionSecret) {
    throw new Error('SESSION_SECRET is not defined in the environment variables.');
  }
  aplicacao.use(
    session({
      name: 'JSESSIONID',
      secret: sessionSecret,
      resave: false,
      saveUninitialized: false,
   cookie: {
  httpOnly: true,
  sameSite: process.env.NODE_ENV === 'production' ? 'none' : 'lax',
  secure: process.env.NODE_ENV === 'production',
  maxAge: 8 * 60 * 60 * 1000,
},
      store: new Armazenamento({
        pool: new pg.Pool({
          connectionString: url,
          user: process.env.DATABASE_USER,
          password: process.env.DATABASE_PASSWORD,
        }),
        createTableIfMissing: true,
        tableName: 'tb_session',
      }),
    }),
  );
  // Rate limit: Atualmente utiliza um Map em memória (60 req/min).
  // Avaliação: Em um ambiente com múltiplas instâncias (ex: Kubernetes), o limite será aplicado
  // por instância, o que é aceitável para o cenário inicial. Se for estritamente necessário
  // um limite global, deve-se usar Redis ou uma tabela no banco (ex: Supabase) como armazenamento compartilhado.
  const acessos = new Map<string, { inicio: number; quantidade: number }>();
  aplicacao.use((requisicao: any, resposta: any, proximo: () => void) => {
    const chave =
      requisicao.session?.usuario?.id ?? requisicao.ip ?? 'desconhecido';
    const agora = Date.now();
    const atual = acessos.get(chave);
    if (!atual || agora - atual.inicio >= 60_000) {
      acessos.set(chave, { inicio: agora, quantidade: 1 });
      return proximo();
    }
    atual.quantidade++;
    if (atual.quantidade > 60)
      return resposta.status(429).json({
        timestamp: new Date().toISOString(),
        status: 429,
        erro: 'Limite Excedido',
        mensagem: 'Limite de 60 requisições por minuto excedido.',
        path: requisicao.originalUrl,
      });
    proximo();
  });
  aplicacao.setGlobalPrefix('api');
  aplicacao.useGlobalPipes(
    new ValidationPipe({ whitelist: true, transform: true }),
  );
  aplicacao.useGlobalFilters(new FiltroErros());
  await aplicacao.listen(Number(process.env.PORT ?? 8080));
}
void iniciar();
