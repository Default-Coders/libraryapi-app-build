import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ScheduleModule } from '@nestjs/schedule';
import {
  Administrador,
  Aluno,
  Categoria,
  EntradaFila,
  Livro,
  RegistroNotificacao,
  Reserva,
  TentativaAcesso,
} from './dominio/entidades.js';
import { UsuariosService } from './servicos/usuarios.service.js';
import { CatalogoService } from './servicos/catalogo.service.js';
import { CirculacaoService } from './servicos/circulacao.service.js';
import { EmailService } from './servicos/email.service.js';
import { NotificationService } from './servicos/notification.service.js';
import { SessoesService } from './servicos/sessoes.service.js';
import {
  AlunosController,
  AdministradoresController,
  AutenticacaoController,
  CategoriasController,
  FilaController,
  HealthController,
  LivrosController,
  LivrosPublicosController,
  ReservasController,
} from './controladores/api.controller.js';
import {
  Autenticado,
  SomenteAdministrador,
  SomenteAluno,
} from './comum/seguranca.js';
const entidades = [
  Administrador,
  Aluno,
  Categoria,
  Livro,
  Reserva,
  EntradaFila,
  TentativaAcesso,
  RegistroNotificacao,
];
@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    ScheduleModule.forRoot(),
    TypeOrmModule.forRootAsync({
      inject: [ConfigService],
      useFactory: (config: ConfigService) => {
        const bruta = config.get<string>('DATABASE_URL');
        if (!bruta) {
          throw new Error('DATABASE_URL is not defined in the environment variables.');
        }
        const url = bruta.replace(/^jdbc:/, '');
        return {
          type: 'postgres' as const,
          url,
          username: config.get('DATABASE_USER'),
          password: config.get('DATABASE_PASSWORD'),
          entities: entidades,
          synchronize: config.get('DATABASE_SYNCHRONIZE', 'true') === 'true',
          timezone: 'America/Sao_Paulo',
          extra: {
            max: 20,
            connectionTimeoutMillis: 5000,
            ssl: {
              rejectUnauthorized: false,
            },
          },
        };
      },
    }),
    TypeOrmModule.forFeature(entidades),
  ],
  controllers: [
    AutenticacaoController,
    AdministradoresController,
    AlunosController,
    CategoriasController,
    LivrosPublicosController,
    LivrosController,
    ReservasController,
    FilaController,
    HealthController,
  ],
  providers: [
    UsuariosService,
    CatalogoService,
    CirculacaoService,
    EmailService,
    NotificationService,
    SessoesService,
    Autenticado,
    SomenteAdministrador,
    SomenteAluno,
  ],
})
export class AppModule {}
