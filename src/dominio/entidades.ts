import {
  Column,
  CreateDateColumn,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';

export enum Curso {
  DESENVOLVIMENTO_DE_SISTEMAS = 'SYSTEMS_DEVELOPMENT',
  NUTRICAO_E_DIETETICA = 'NUTRITION_AND_DIETETICS',
}
export enum Turma {
  PRIMEIRO_A = 'FIRST_A',
  PRIMEIRO_B = 'FIRST_B',
  SEGUNDO_A = 'SECOND_A',
  SEGUNDO_B = 'SECOND_B',
  TERCEIRO_A = 'THIRD_A',
  TERCEIRO_B = 'THIRD_B',
}
export enum SituacaoReserva {
  SOLICITADA = 'REQUESTED',
  APROVADA = 'APPROVED',
  RETIRADA = 'PICKED_UP',
  DEVOLVIDA = 'RETURNED',
  CANCELADA = 'CANCELLED',
  EXPIRADA = 'EXPIRED',
}
export enum SituacaoFila {
  AGUARDANDO = 'WAITING',
  NOTIFICADO = 'NOTIFIED',
  RESERVADO = 'RESERVED',
  EXPIRADO = 'EXPIRED',
  CANCELADO = 'CANCELLED',
}

abstract class EntidadeBase {
  @PrimaryGeneratedColumn('uuid') id!: string;
  @Column({ name: 'is_active', default: true }) ativo!: boolean;
  @CreateDateColumn({ name: 'created_at', type: 'timestamp' }) criadoEm!: Date;
  @UpdateDateColumn({ name: 'updated_at', type: 'timestamp' })
  atualizadoEm!: Date;
}

@Entity('tb_admin')
export class Administrador extends EntidadeBase {
  @Column({ name: 'name', length: 150 }) nome!: string;
  @Column({ unique: true, length: 100 }) email!: string;
  @Column({ name: 'password', length: 60 }) senha!: string;
  @Column({ name: 'first_login', default: true }) primeiroAcesso!: boolean;
}

@Entity('tb_student')
export class Aluno extends EntidadeBase {
  @Column({ name: 'name', length: 150 }) nome!: string;
  @Column({ unique: true, length: 100 }) email!: string;
  @Column({ name: 'password', length: 60 }) senha!: string;
  @Column({ name: 'course', type: 'varchar', length: 50 }) curso!: Curso;
  @Column({ name: 'school_class', type: 'varchar', length: 30 }) turma!: Turma;
  @Column({ name: 'phone', nullable: true, length: 20 }) telefone?: string;
}

@Entity('tb_category')
export class Categoria extends EntidadeBase {
  @Column({ name: 'name', unique: true, length: 100 }) nome!: string;
  @Column({ name: 'description', type: 'text', nullable: true })
  descricao?: string;
}

@Entity('tb_book')
export class Livro extends EntidadeBase {
  @Column({ name: 'title', length: 150 }) titulo!: string;
  @Column({ name: 'author', length: 150 }) autor!: string;
  @Column({ name: 'publisher', nullable: true, length: 100 }) editora?: string;
  @Column({ unique: true, nullable: true, length: 20, update: false })
  isbn?: string;
  @Column({ name: 'publication_year', nullable: true }) anoPublicacao?: number;
  @Column({ name: 'total_quantity' }) quantidadeTotal!: number;
  @Column({ name: 'available_quantity', nullable: true })
  quantidadeDisponivel!: number;
  @Column({ name: 'qrcode_url', nullable: true }) urlQrcode?: string;
  @ManyToOne(() => Categoria, { eager: true, nullable: false })
  @JoinColumn({ name: 'category_id' })
  categoria!: Categoria;
}

@Entity('tb_reservation')
export class Reserva extends EntidadeBase {
  @ManyToOne(() => Aluno, { eager: true, nullable: false })
  @JoinColumn({ name: 'student_id' })
  aluno!: Aluno;
  @ManyToOne(() => Livro, { eager: true, nullable: false })
  @JoinColumn({ name: 'book_id' })
  livro!: Livro;
  @Column({ name: 'reserved_at', type: 'timestamp' }) reservadoEm!: Date;
  @Column({ name: 'pickup_deadline', type: 'timestamp', nullable: true })
  prazoRetirada?: Date;
  @Column({ name: 'picked_up_at', type: 'timestamp', nullable: true })
  retiradoEm?: Date;
  @Column({ name: 'returned_at', type: 'timestamp', nullable: true })
  devolvidoEm?: Date;
  @Column({ name: 'status', type: 'varchar', length: 30 })
  situacao!: SituacaoReserva;
}

@Entity('tb_waiting_list')
export class EntradaFila extends EntidadeBase {
  @ManyToOne(() => Aluno, { eager: true, nullable: false })
  @JoinColumn({ name: 'student_id' })
  aluno!: Aluno;
  @ManyToOne(() => Livro, { eager: true, nullable: false })
  @JoinColumn({ name: 'book_id' })
  livro!: Livro;
  @Column({ name: 'position' }) posicao!: number;
  @Column({ name: 'notified_at', type: 'timestamp', nullable: true })
  notificadoEm?: Date;
  @Column({ name: 'status', type: 'varchar', length: 30 })
  situacao!: SituacaoFila;
}

@Entity('tb_login_attempt')
export class TentativaAcesso {
  @PrimaryGeneratedColumn('uuid') id!: string;
  @Column({ unique: true, length: 100 }) email!: string;
  @Column({ name: 'attempt_count', default: 0 }) quantidade!: number;
  @Column({
    name: 'blocked_until',
    type: 'timestamp with time zone',
    nullable: true,
  })
  bloqueadoAte?: Date;
}
