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
  Reserva,
  TentativaAcesso,
} from './dominio/entidades.js';
import { UsuariosService } from './servicos/usuarios.service.js';
import { CatalogoService } from './servicos/catalogo.service.js';
import { CirculacaoService } from './servicos/circulacao.service.js';
import {
  AlunosController,
  AdministradoresController,
  AutenticacaoController,
  CategoriasController,
  FilaController,
  LivrosController,
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
];
@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    ScheduleModule.forRoot(),
    TypeOrmModule.forRootAsync({
      inject: [ConfigService],
      useFactory: (config: ConfigService) => {
        const bruta =
          config.get<string>('DATABASE_URL') ??
          'postgresql://library_user:library_password@localhost:5432/library_db';
        const url = bruta.replace(/^jdbc:/, '');
        return {
          type: 'postgres' as const,
          url,
          username: config.get('DATABASE_USER'),
          password: config.get('DATABASE_PASSWORD'),
          entities: entidades,
          synchronize: config.get('DATABASE_SYNCHRONIZE', 'true') === 'true',
          timezone: 'America/Sao_Paulo',
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
    LivrosController,
    ReservasController,
    FilaController,
  ],
  providers: [
    UsuariosService,
    CatalogoService,
    CirculacaoService,
    Autenticado,
    SomenteAdministrador,
    SomenteAluno,
  ],
})
export class AppModule {}
