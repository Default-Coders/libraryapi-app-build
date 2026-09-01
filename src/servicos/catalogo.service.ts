import {
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { DataSource, ILike, Repository } from 'typeorm';
import {
  Categoria,
  EntradaFila,
  Livro,
  Reserva,
  SituacaoFila,
  SituacaoReserva,
} from '../dominio/entidades.js';
import {
  DadosCategoria,
  DadosEstoque,
  DadosLivro,
} from '../comum/contratos.js';
@Injectable()
export class CatalogoService {
  constructor(
    @InjectRepository(Categoria) private categorias: Repository<Categoria>,
    @InjectRepository(Livro) private livros: Repository<Livro>,
    private banco: DataSource,
  ) {}
  async listarCategorias(nome?: string) {
    return this.categorias.find({
      where: { ativo: true, ...(nome ? { nome: ILike(`%${nome}%`) } : {}) },
      order: { nome: 'ASC' },
    });
  }
  async obterCategoria(id: string) {
    const item = await this.categorias.findOneBy({ id, ativo: true });
    if (!item)
      throw new NotFoundException(`Categoria não encontrada com o ID: ${id}`);
    return item;
  }
  async salvarCategoria(d: DadosCategoria, id?: string) {
    const nome = d.name.trim().toUpperCase();
    const repetida = await this.categorias.findOneBy({ nome });
    if (repetida && repetida.id !== id)
      throw new ConflictException('Já existe uma categoria com este nome.');
    const item = id ? await this.obterCategoria(id) : this.categorias.create();
    item.nome = nome;
    item.descricao = d.description;
    return this.categorias.save(item);
  }
  async desativarCategoria(id: string) {
    const item = await this.obterCategoria(id);
    item.ativo = false;
    await this.categorias.save(item);
  }
  async excluirCategoria(id: string) {
    const item = await this.categorias.findOneBy({ id });
    if (!item) throw new NotFoundException('Categoria não encontrada.');
    if (await this.livros.exists({ where: { categoria: { id } } }))
      throw new ConflictException(
        'Não é possível excluir uma categoria que possui livros.',
      );
    await this.categorias.remove(item);
  }
  async listarLivros() {
    return this.livros.find({
      where: { ativo: true },
      order: { titulo: 'ASC' },
    });
  }
  async obterLivro(id: string) {
    const item = await this.livros.findOne({ where: { id, ativo: true } });
    if (!item)
      throw new NotFoundException(`Livro não encontrado com o ID: ${id}`);
    return item;
  }
  async salvarLivro(d: DadosLivro, id?: string) {
    const categoria = await this.obterCategoria(d.categoryId);
    if (!id && d.isbn && (await this.livros.existsBy({ isbn: d.isbn })))
      throw new ConflictException('Já existe um livro com este ISBN.');
    const item = id
      ? await this.obterLivro(id)
      : this.livros.create({ quantidadeDisponivel: d.totalQuantity });
    item.titulo = d.title;
    item.autor = d.author;
    item.editora = d.publisher;
    if (!id) item.isbn = d.isbn;
    item.anoPublicacao = d.publicationYear;
    item.urlQrcode = d.qrcodeUrl;
    item.categoria = categoria;
    if (id && d.totalQuantity !== item.quantidadeTotal)
      await this.ajustarEstoque(id, { newTotalQuantity: d.totalQuantity });
    else item.quantidadeTotal = d.totalQuantity;
    return this.livros.save(item);
  }
  async ajustarEstoque(id: string, d: DadosEstoque) {
    return this.banco.transaction(async (gestor) => {
      const repo = gestor.getRepository(Livro);
      const livro = await repo
        .createQueryBuilder('l')
        .setLock('pessimistic_write')
        .where('l.id=:id', { id })
        .getOne();
      if (!livro) throw new NotFoundException('Livro não encontrado.');
      const ocupados = livro.quantidadeTotal - livro.quantidadeDisponivel;
      if (d.newTotalQuantity < ocupados)
        throw new ConflictException(
          `O estoque total não pode ser menor que ${ocupados}, pois há exemplares reservados ou emprestados.`,
        );
      const aumento = d.newTotalQuantity - livro.quantidadeTotal;
      livro.quantidadeTotal = d.newTotalQuantity;
      livro.quantidadeDisponivel += aumento;
      await repo.save(livro);
      if (aumento > 0) {
        const repositorioFila = gestor.getRepository(EntradaFila);
        for (
          let indice = 0;
          indice < aumento && livro.quantidadeDisponivel > 0;
          indice++
        ) {
          const proximo = await repositorioFila.findOne({
            where: { livro: { id }, situacao: SituacaoFila.AGUARDANDO },
            order: { posicao: 'ASC' },
            relations: { aluno: true, livro: true },
          });
          if (!proximo) break;
          proximo.situacao = SituacaoFila.RESERVADO;
          await repositorioFila.save(proximo);
          const agora = new Date();
          const prazo = new Date(agora);
          prazo.setDate(prazo.getDate() + 2);
          await gestor.save(Reserva, {
            aluno: proximo.aluno,
            livro,
            reservadoEm: agora,
            prazoRetirada: prazo,
            situacao: SituacaoReserva.SOLICITADA,
          });
          livro.quantidadeDisponivel--;
          await repo.save(livro);
        }
      }
      return livro;
    });
  }
  async desativarLivro(id: string) {
    const item = await this.obterLivro(id);
    item.ativo = false;
    await this.livros.save(item);
  }
}
