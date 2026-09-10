import { DataSource } from 'typeorm';
import { config } from 'dotenv';
import { resolve } from 'node:path';
import { Administrador, Aluno, Categoria, Livro, Reserva, EntradaFila, TentativaAcesso } from './src/dominio/entidades.js';

config({ path: resolve(process.cwd(), '.env') });

const url = (process.env.DATABASE_URL || '').replace(/^jdbc:/, '');

export default new DataSource({
  type: 'postgres',
  url,
  username: process.env.DATABASE_USER,
  password: process.env.DATABASE_PASSWORD,
  entities: [Administrador, Aluno, Categoria, Livro, Reserva, EntradaFila, TentativaAcesso],
  migrations: ['./src/migrations/*.ts'],
  synchronize: false,
});
