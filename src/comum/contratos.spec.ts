import { describe, expect, it } from 'vitest';
import { saidaAluno, saidaLivro, saidaReserva } from './contratos.js';

describe('contratos compatíveis com o backend Java', () => {
  it('traduz curso e turma para os rótulos em português', () => {
    expect(
      saidaAluno({
        id: '1',
        nome: 'Ana',
        email: 'ana@ete.br',
        curso: 'SYSTEMS_DEVELOPMENT',
        turma: 'FIRST_A',
        telefone: '81',
        ativo: true,
      }),
    ).toMatchObject({
      name: 'Ana',
      course: 'Desenvolvimento de Sistemas',
      schoolClass: '1º ano A',
      active: true,
    });
  });
  it('mantém os nomes públicos esperados para livros', () => {
    const saida = saidaLivro({
      id: '1',
      titulo: 'Livro',
      autor: 'Autor',
      quantidadeTotal: 2,
      quantidadeDisponivel: 1,
      categoria: { id: '2', nome: 'ROMANCE', ativo: true },
      ativo: true,
    });
    expect(saida).toMatchObject({
      title: 'Livro',
      totalQuantity: 2,
      availableQuantity: 1,
      category: { name: 'ROMANCE' },
    });
  });
  it('produz o resumo aninhado de uma reserva', () => {
    const saida = saidaReserva({
      id: '3',
      situacao: 'REQUESTED',
      aluno: { id: '1', nome: 'Ana', email: 'a@b.c' },
      livro: { id: '2', titulo: 'Livro', autor: 'Autor' },
    });
    expect(saida).toMatchObject({
      status: 'REQUESTED',
      student: { name: 'Ana' },
      book: { title: 'Livro' },
    });
  });
});
