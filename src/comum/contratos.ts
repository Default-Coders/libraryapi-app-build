import {
  IsEmail,
  IsDateString,
  IsInt,
  IsNotEmpty,
  IsOptional,
  IsString,
  IsUUID,
  Matches,
  Min,
  MinLength,
} from 'class-validator';

export class DadosAcesso {
  @IsEmail({}, { message: 'E-mail inválido.' }) email!: string;
  @IsString() @IsNotEmpty() password!: string;
}
export class DadosResgateSenha {
  @IsEmail({}, { message: 'E-mail inválido.' }) email!: string;
  @IsString() @MinLength(6) newPassword!: string;
}
export class DadosAdministrador {
  @IsString() @IsNotEmpty() name!: string;
  @IsEmail() email!: string;
}
export class DadosAtualizacaoAdministrador {
  @IsString() @IsNotEmpty() name!: string;
  @IsEmail() email!: string;
}
export class DadosAluno {
  @IsString() @IsNotEmpty() name!: string;
  @IsEmail() email!: string;
  @IsString() course!: string;
  @IsString() schoolClass!: string;
  @IsOptional() @IsString() phone?: string;
}
export class DadosAtualizacaoAluno {
  @IsString() @IsNotEmpty() name!: string;
  @IsEmail() email!: string;
  @IsString() course!: string;
  @IsString() schoolClass!: string;
  @IsOptional() @IsString() phone?: string;
}
export class DadosSenha {
  @IsOptional() @IsString() currentPassword?: string;
  @IsString() @MinLength(6) newPassword!: string;
}
export class DadosCategoria {
  @IsString() @IsNotEmpty() name!: string;
  @IsOptional() @IsString() description?: string;
}
export class DadosLivro {
  @IsString() @IsNotEmpty() title!: string;
  @IsString() @IsNotEmpty() author!: string;
  @IsOptional() @IsString() publisher?: string;
  @IsOptional()
  @Matches(/^(\d{10}|\d{13})$/, {
    message: 'ISBN deve possuir 10 ou 13 dígitos.',
  })
  isbn?: string;
  @IsOptional() @IsInt() publicationYear?: number;
  @IsInt() @Min(0) totalQuantity!: number;
  @IsOptional() @IsString() qrcodeUrl?: string;
  @IsUUID() categoryId!: string;
}
export class DadosEstoque {
  @IsInt() @Min(0) newTotalQuantity!: number;
  @IsOptional() @IsString() reason?: string;
}
export class DadosLivroId {
  @IsUUID() bookId!: string;
}
export class DadosAtualizacaoReserva {
  @IsDateString({}, { message: 'Data da reserva inválida.' })
  createdAt!: string;
  @IsOptional()
  @IsDateString({}, { message: 'Prazo de retirada inválido.' })
  pickupDeadline?: string;
}
export class DadosAtualizacaoFila {
  @IsInt() @Min(1) position!: number;
  @IsDateString({}, { message: 'Data de entrada inválida.' })
  createdAt!: string;
}

export type SessaoUsuario = {
  usuario?: {
    id: string;
    perfil: 'ROLE_ADMIN' | 'ROLE_STUDENT';
    email: string;
  };
};

export const resumoAluno = (aluno: any) => ({
  id: aluno.id,
  name: aluno.nome,
  email: aluno.email,
});
export const resumoLivro = (livro: any) => ({
  id: livro.id,
  title: livro.titulo,
  author: livro.autor,
  isbn: livro.isbn,
});
export const saidaCategoria = (categoria: any) => ({
  id: categoria.id,
  name: categoria.nome,
  description: categoria.descricao,
  active: categoria.ativo,
});
export const saidaLivro = (livro: any) => ({
  id: livro.id,
  title: livro.titulo,
  author: livro.autor,
  publisher: livro.editora,
  isbn: livro.isbn,
  publicationYear: livro.anoPublicacao,
  totalQuantity: livro.quantidadeTotal,
  availableQuantity: livro.quantidadeDisponivel,
  qrcodeUrl: livro.urlQrcode,
  coverUrl: livro.urlCapa,
  category: saidaCategoria(livro.categoria),
  active: livro.ativo,
});
const rotulosCurso: Record<string, string> = {
  SYSTEMS_DEVELOPMENT: 'Desenvolvimento de Sistemas',
  NUTRITION_AND_DIETETICS: 'Nutrição e Dietética',
};
const rotulosTurma: Record<string, string> = {
  FIRST_A: '1º ano A',
  FIRST_B: '1º ano B',
  SECOND_A: '2º ano A',
  SECOND_B: '2º ano B',
  THIRD_A: '3º ano A',
  THIRD_B: '3º ano B',
};
export const saidaAluno = (aluno: any) => ({
  id: aluno.id,
  name: aluno.nome,
  email: aluno.email,
  course: rotulosCurso[aluno.curso] ?? aluno.curso,
  schoolClass: rotulosTurma[aluno.turma] ?? aluno.turma,
  phone: aluno.telefone,
  active: aluno.ativo,
  firstLogin: aluno.primeiroAcesso,
});
export const saidaReserva = (reserva: any) => ({
  id: reserva.id,
  active: reserva.ativo,
  createdAt: reserva.reservadoEm,
  pickupDeadline: reserva.prazoRetirada,
  pickupDate: reserva.retiradoEm,
  returnDate: reserva.devolvidoEm,
  status: reserva.situacao,
  student: resumoAluno(reserva.aluno),
  book: resumoLivro(reserva.livro),
});
export const saidaFila = (entrada: any) => ({
  id: entrada.id,
  active: entrada.ativo,
  position: entrada.posicao,
  status: entrada.situacao,
  createdAt: entrada.criadoEm,
  notifiedAt: entrada.notificadoEm,
  student: resumoAluno(entrada.aluno),
  book: resumoLivro(entrada.livro),
});
