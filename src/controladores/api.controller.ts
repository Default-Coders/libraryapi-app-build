import {
  Body,
  BadRequestException,
  Controller,
  Delete,
  Get,
  HttpCode,
  InternalServerErrorException,
  Param,
  Patch,
  Post,
  Put,
  Query,
  Req,
  Res,
  UseGuards,
  UseInterceptors,
  UploadedFile,
  ParseUUIDPipe,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { mkdir, unlink, writeFile } from 'node:fs/promises';
import { randomUUID } from 'node:crypto';
import { resolve } from 'node:path';
import type { Response } from 'express';
import {
  DadosAcesso,
  DadosAdministrador,
  DadosAtualizacaoAdministrador,
  DadosAluno,
  DadosRegistroAluno,
  DadosAtualizacaoAluno,
  DadosAtualizacaoFila,
  DadosAtualizacaoReserva,
  DadosCategoria,
  DadosEstoque,
  DadosLivro,
  DadosLivroId,
  DadosResgateSenha,
  DadosSenha,
  saidaAluno,
  saidaCategoria,
  saidaFila,
  saidaLivro,
  saidaReserva,
} from '../comum/contratos.js';
import {
  Autenticado,
  SomenteAdministrador,
  SomenteAluno,
  UsuarioAtual,
} from '../comum/seguranca.js';
import { UsuariosService } from '../servicos/usuarios.service.js';
import { CatalogoService } from '../servicos/catalogo.service.js';
import { CirculacaoService } from '../servicos/circulacao.service.js';
import { SessoesService } from '../servicos/sessoes.service.js';

async function renovarSessao(req: any, usuario: any) {
  await new Promise<void>((resolve, reject) => {
    req.session.regenerate((erro: Error | null) =>
      erro ? reject(erro) : resolve(),
    );
  });
  req.session.usuario = usuario;
}

@Controller('health')
export class HealthController {
  @Get()
  verificar() {
    return { status: 'ok', timestamp: new Date().toISOString() };
  }
}

@Controller('auth')
export class AutenticacaoController {
  constructor(
    private usuarios: UsuariosService,
    private sessoes: SessoesService,
  ) {}

  @Post('login') @HttpCode(200) async entrar(
    @Body() d: DadosAcesso,
    @Req() req: any,
  ) {
    const usuario = await this.usuarios.autenticar(d.email, d.password);
    await renovarSessao(req, usuario);
    return {
      role: usuario.perfil,
      name: usuario.nome,
      email: usuario.email,
      firstLogin: usuario.primeiroAcesso,
    };
  }

  @Post('register') @HttpCode(201) async registrar(
    @Body() d: DadosRegistroAluno,
    @Req() req: any,
  ) {
    const aluno = await this.usuarios.registrarAluno(d);
    const usuario = {
      id: aluno.id,
      perfil: 'ROLE_STUDENT' as const,
      email: aluno.email,
      nome: aluno.nome,
      primeiroAcesso: aluno.primeiroAcesso,
    };
    await renovarSessao(req, usuario);
    return {
      role: usuario.perfil,
      name: usuario.nome,
      email: usuario.email,
      firstLogin: usuario.primeiroAcesso,
    };
  }

  @Patch('first-access/password')
  @UseGuards(Autenticado)
  @HttpCode(204)
  async concluirPrimeiroAcesso(
    @UsuarioAtual() u: any,
    @Body() d: DadosSenha,
    @Req() req: any,
  ) {
    await this.usuarios.concluirPrimeiroAcesso(u, d.currentPassword, d.newPassword);
    await this.sessoes.revogarDoUsuario(u.id);
    await renovarSessao(req, { ...u, primeiroAcesso: false });
  }

  @Patch('recover')
  @HttpCode(204)
  async recuperarSenha(@Body() d: DadosResgateSenha) {
    await this.usuarios.resgatarSenha(d.email, d.newPassword);
  }

  @Post('logout') @HttpCode(204) async sair(
    @Req() req: any,
    @Res() res: Response,
  ) {
    await new Promise<void>((resolve, reject) => {
      req.session.destroy((erro: Error | null) => {
        if (erro) {
          reject(
            new InternalServerErrorException(
              'Não foi possível encerrar a sessão.',
            ),
          );
          return;
        }
        resolve();
      });
    });
    res.clearCookie('JSESSIONID', {
      httpOnly: true,
      sameSite: 'lax',
      secure: process.env.NODE_ENV === 'production',
      path: '/',
    });
    res.status(204).send();
  }
}

@Controller('admins')
@UseGuards(SomenteAdministrador)
export class AdministradoresController {
  constructor(
    private usuarios: UsuariosService,
    private sessoes: SessoesService,
  ) {}

  @Post() async criar(@Body() d: DadosAdministrador) {
    const { usuario: a, senhaTemporaria } =
      await this.usuarios.criarAdministrador(d);
    return {
      id: a.id,
      name: a.nome,
      email: a.email,
      firstLogin: a.primeiroAcesso,
      active: a.ativo,
      temporaryPassword: senhaTemporaria,
    };
  }

  @Get() async listar(
    @Query('query') consulta?: string,
    @Query('includeInactive') incluirInativos?: string,
  ) {
    return (
      await this.usuarios.listarAdministradores(
        consulta,
        incluirInativos === 'true',
      )
    ).map((a) => ({
      id: a.id,
      name: a.nome,
      email: a.email,
      firstLogin: a.primeiroAcesso,
      active: a.ativo,
    }));
  }

  @Put(':id') async atualizar(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() d: DadosAtualizacaoAdministrador,
  ) {
    const a = await this.usuarios.atualizarAdministrador(id, d);
    return { id: a.id, name: a.nome, email: a.email, firstLogin: a.primeiroAcesso, active: a.ativo };
  }

  @Patch(':id/password') async senha(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() d: DadosSenha,
    @UsuarioAtual() u: any,
    @Req() req: any,
  ) {
    await this.usuarios.redefinirSenhaAdministrador(id, d.newPassword);
    await this.sessoes.revogarDoUsuario(id);
    if (id === u.id) await renovarSessao(req, u);
  }

  @Patch(':id/reactivate') @HttpCode(204) async reativar(
    @Param('id', ParseUUIDPipe) id: string,
  ) {
    await this.usuarios.reativarAdministrador(id);
  }

  @Delete(':id') @HttpCode(204) async desativar(
    @Param('id', ParseUUIDPipe) id: string,
    @UsuarioAtual() u: any,
  ) {
    if (id === u.id)
      throw new BadRequestException('Você não pode desativar a própria conta.');
    await this.usuarios.desativarAdministrador(id);
    await this.sessoes.revogarDoUsuario(id);
  }
}

@Controller('students')
export class AlunosController {
  constructor(
    private usuarios: UsuariosService,
    private sessoes: SessoesService,
  ) {}

  @Post() @UseGuards(SomenteAdministrador) async criar(@Body() d: DadosAluno) {
    const { usuario, senhaTemporaria } =
      await this.usuarios.criarAluno(d);
    return {
      ...saidaAluno(usuario),
      temporaryPassword: senhaTemporaria,
    };
  }

  @Get() @UseGuards(SomenteAdministrador) async listar(
    @Query('query') q?: string,
    @Query('includeInactive') i?: string,
    @Query('course') c?: string,
    @Query('schoolClass') t?: string,
  ) {
    return (await this.usuarios.listar(q, i === 'true', c, t)).map(saidaAluno);
  }

  @Get('me') @UseGuards(SomenteAluno) async perfil(@UsuarioAtual() u: any) {
    return saidaAluno(await this.usuarios.obter(u.id, false));
  }

  @Put('me') @UseGuards(SomenteAluno) async atualizarPerfil(
    @UsuarioAtual() u: any,
    @Body() d: DadosAtualizacaoAluno,
  ) {
    return saidaAluno(await this.usuarios.atualizar(u.id, d, true));
  }

  @Patch('me/password')
  @UseGuards(SomenteAluno)
  @HttpCode(204)
  async alterarSenha(
    @UsuarioAtual() u: any,
    @Body() d: DadosSenha,
    @Req() req: any,
  ) {
    await this.usuarios.alterarSenha(u.id, d.currentPassword, d.newPassword);
    await this.sessoes.revogarDoUsuario(u.id);
    await renovarSessao(req, { ...u, primeiroAcesso: false });
  }

  @Get(':id') @UseGuards(SomenteAdministrador) async obter(
    @Param('id', ParseUUIDPipe) id: string,
  ) {
    return saidaAluno(await this.usuarios.obter(id));
  }

  @Put(':id') @UseGuards(SomenteAdministrador) async atualizar(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() d: DadosAtualizacaoAluno,
  ) {
    return saidaAluno(await this.usuarios.atualizar(id, d));
  }

  @Patch(':id/password')
  @UseGuards(SomenteAdministrador)
  async senha(@Param('id', ParseUUIDPipe) id: string, @Body() d: DadosSenha) {
    const emailEnviado = await this.usuarios.redefinirSenha(id, d.newPassword);
    await this.sessoes.revogarDoUsuario(id);
    return { emailSent: emailEnviado };
  }

  @Patch(':id/reactivate')
  @UseGuards(SomenteAdministrador)
  @HttpCode(204)
  async reativar(@Param('id', ParseUUIDPipe) id: string) {
    await this.usuarios.reativar(id);
  }

  @Delete(':id/permanent')
  @UseGuards(SomenteAdministrador)
  @HttpCode(204)
  async excluirDefinitivamente(@Param('id', ParseUUIDPipe) id: string) {
    await this.usuarios.excluirDefinitivamente(id);
    await this.sessoes.revogarDoUsuario(id);
  }

  @Delete(':id') @UseGuards(SomenteAdministrador) @HttpCode(204) async apagar(
    @Param('id', ParseUUIDPipe) id: string,
  ) {
    await this.usuarios.desativar(id);
    await this.sessoes.revogarDoUsuario(id);
  }
}

@Controller('categories')
@UseGuards(Autenticado)
export class CategoriasController {
  constructor(private catalogo: CatalogoService) {}

  @Get('search') async pesquisar(@Query('name') n: string) {
    return (await this.catalogo.listarCategorias(n)).map(saidaCategoria);
  }

  @Get() async listar() {
    return (await this.catalogo.listarCategorias()).map(saidaCategoria);
  }

  @Get(':id') async obter(@Param('id', ParseUUIDPipe) id: string) {
    return saidaCategoria(await this.catalogo.obterCategoria(id));
  }

  @Post() @UseGuards(SomenteAdministrador) async criar(
    @Body() d: DadosCategoria,
  ) {
    return saidaCategoria(await this.catalogo.salvarCategoria(d));
  }

  @Put(':id') @UseGuards(SomenteAdministrador) async atualizar(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() d: DadosCategoria,
  ) {
    return saidaCategoria(await this.catalogo.salvarCategoria(d, id));
  }

  @Delete(':id/permanent')
  @UseGuards(SomenteAdministrador)
  @HttpCode(204)
  async excluir(@Param('id', ParseUUIDPipe) id: string) {
    await this.catalogo.excluirCategoria(id);
  }

  @Delete(':id')
  @UseGuards(SomenteAdministrador)
  @HttpCode(204)
  async desativar(@Param('id', ParseUUIDPipe) id: string) {
    await this.catalogo.desativarCategoria(id);
  }
}

@Controller('public/books')
export class LivrosPublicosController {
  constructor(private catalogo: CatalogoService) {}

  @Get()
  async listar() {
    return (await this.catalogo.listarLivros()).map(saidaLivro);
  }

  @Get(':id')
  async obter(@Param('id', ParseUUIDPipe) id: string) {
    return saidaLivro(await this.catalogo.obterLivro(id));
  }
}

@Controller('books')
@UseGuards(Autenticado)
export class LivrosController {
  constructor(private catalogo: CatalogoService) {}

  @Get() async listar() {
    return (await this.catalogo.listarLivros()).map(saidaLivro);
  }

  @Get(':id') async obter(@Param('id', ParseUUIDPipe) id: string) {
    return saidaLivro(await this.catalogo.obterLivro(id));
  }

  @Post() @UseGuards(SomenteAdministrador) async criar(@Body() d: DadosLivro) {
    return saidaLivro(await this.catalogo.salvarLivro(d));
  }

  @Put(':id') @UseGuards(SomenteAdministrador) async atualizar(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() d: DadosLivro,
  ) {
    return saidaLivro(await this.catalogo.salvarLivro(d, id));
  }

  @Patch(':id/stock') @UseGuards(SomenteAdministrador) async estoque(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() d: DadosEstoque,
  ) {
    return saidaLivro(await this.catalogo.ajustarEstoque(id, d));
  }

  @Post(':id/cover')
  @UseGuards(SomenteAdministrador)
  @UseInterceptors(FileInterceptor('cover', { limits: { fileSize: 2 * 1024 * 1024 } }))
  async enviarCapa(@Param('id', ParseUUIDPipe) id: string, @UploadedFile() arquivo: any) {
    if (!arquivo) throw new BadRequestException('Selecione uma imagem para a capa.');
    const extensoes: Record<string, string> = {
      'image/jpeg': '.jpg',
      'image/png': '.png',
      'image/webp': '.webp',
    };
    const extensao = extensoes[arquivo.mimetype];
    if (!extensao)
      throw new BadRequestException('A capa deve ser uma imagem JPEG, PNG ou WebP.');
    const nome = `${id}-${randomUUID()}${extensao}`;
    const pasta = resolve(process.cwd(), 'uploads', 'covers');
    await mkdir(pasta, { recursive: true });
    const destino = resolve(pasta, nome);
    await writeFile(destino, arquivo.buffer);
    try {
      return saidaLivro(
        await this.catalogo.atualizarCapa(id, `/uploads/covers/${nome}`),
      );
    } catch (erro) {
      await unlink(destino).catch(() => undefined);
      throw erro;
    }
  }

  @Delete(':id/cover')
  @UseGuards(SomenteAdministrador)
  @HttpCode(204)
  async removerCapa(@Param('id', ParseUUIDPipe) id: string) {
    await this.catalogo.removerCapa(id);
  }

  @Delete(':id') @UseGuards(SomenteAdministrador) @HttpCode(204) async apagar(
    @Param('id', ParseUUIDPipe) id: string,
  ) {
    await this.catalogo.desativarLivro(id);
  }
}

@Controller('reservations')
@UseGuards(Autenticado)
export class ReservasController {
  constructor(private circulacao: CirculacaoService) {}

  @Post() @UseGuards(SomenteAluno) async criar(
    @UsuarioAtual() u: any,
    @Body() d: DadosLivroId,
  ) {
    const r = await this.circulacao.reservar(u.id, d.bookId);
    return (r as any).fila ? r : saidaReserva(r);
  }

  @Get('me') @UseGuards(SomenteAluno) async minhas(@UsuarioAtual() u: any) {
    return (await this.circulacao.listarReservas(u.id)).map(saidaReserva);
  }

  @Get() @UseGuards(SomenteAdministrador) async listar(
    @Query('includeInactive') includeInactive?: string,
  ) {
    return (
      await this.circulacao.listarReservas(undefined, includeInactive === 'true')
    ).map(saidaReserva);
  }

  @Get(':id') async obter(
    @Param('id', ParseUUIDPipe) id: string,
    @UsuarioAtual() u: any,
  ) {
    const r = await this.circulacao.obterReserva(id);
    if (u.perfil !== 'ROLE_ADMIN' && r.aluno.id !== u.id)
      throw new (await import('@nestjs/common')).ForbiddenException(
        'Você não possui acesso a esta reserva.',
      );
    return saidaReserva(r);
  }

  @Patch(':id/cancel') @UseGuards(SomenteAluno) async cancelar(
    @Param('id', ParseUUIDPipe) id: string,
    @UsuarioAtual() u: any,
  ) {
    return saidaReserva(await this.circulacao.cancelarReserva(id, u.id));
  }

  @Patch(':id/pickup') @UseGuards(SomenteAdministrador) async retirar(
    @Param('id', ParseUUIDPipe) id: string,
  ) {
    return saidaReserva(await this.circulacao.retirar(id));
  }

  @Patch(':id/return') @UseGuards(SomenteAdministrador) async devolver(
    @Param('id', ParseUUIDPipe) id: string,
  ) {
    return saidaReserva(await this.circulacao.devolver(id));
  }

  @Put(':id') @UseGuards(SomenteAdministrador) async atualizar(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() d: DadosAtualizacaoReserva,
  ) {
    return saidaReserva(await this.circulacao.atualizarReserva(id, d));
  }

  @Delete(':id/permanent')
  @UseGuards(SomenteAdministrador)
  @HttpCode(204)
  async excluirDefinitivamente(@Param('id', ParseUUIDPipe) id: string) {
    await this.circulacao.excluirReservaDefinitivamente(id);
  }
}

@Controller('waiting-list')
@UseGuards(Autenticado)
export class FilaController {
  constructor(private circulacao: CirculacaoService) {}

  @Post() @UseGuards(SomenteAluno) async entrar(
    @UsuarioAtual() u: any,
    @Body() d: DadosLivroId,
  ) {
    return saidaFila(await this.circulacao.entrar(u.id, d.bookId));
  }

  @Get('me') @UseGuards(SomenteAluno) async minhas(@UsuarioAtual() u: any) {
    return (await this.circulacao.listarFila(u.id)).map(saidaFila);
  }

  @Get() @UseGuards(SomenteAdministrador) async listar(
    @Query('includeInactive') includeInactive?: string,
  ) {
    return (
      await this.circulacao.listarFila(undefined, includeInactive === 'true')
    ).map(saidaFila);
  }

  @Get(':id') async obter(
    @Param('id', ParseUUIDPipe) id: string,
    @UsuarioAtual() u: any,
  ) {
    const item = await this.circulacao.obterFila(id);
    if (u.perfil !== 'ROLE_ADMIN' && item.aluno.id !== u.id)
      throw new (await import('@nestjs/common')).ForbiddenException(
        'Você não possui acesso a este registro da fila.',
      );
    return saidaFila(item);
  }

  @Patch(':id/cancel') @UseGuards(SomenteAluno) async cancelar(
    @Param('id', ParseUUIDPipe) id: string,
    @UsuarioAtual() u: any,
  ) {
    return saidaFila(await this.circulacao.cancelarFila(id, u.id));
  }

  @Put(':id') @UseGuards(SomenteAdministrador) async atualizar(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() d: DadosAtualizacaoFila,
  ) {
    return saidaFila(await this.circulacao.atualizarFila(id, d));
  }

  @Delete(':id/permanent')
  @UseGuards(SomenteAdministrador)
  @HttpCode(204)
  async excluirDefinitivamente(@Param('id', ParseUUIDPipe) id: string) {
    await this.circulacao.excluirFilaDefinitivamente(id);
  }

  @Delete(':id')
  @UseGuards(SomenteAdministrador)
  @HttpCode(204)
  async desativar(@Param('id', ParseUUIDPipe) id: string) {
    await this.circulacao.desativarFila(id);
  }
}
