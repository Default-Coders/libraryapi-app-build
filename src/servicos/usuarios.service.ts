import {
  BadRequestException,
  ConflictException,
  Injectable,
  Logger,
  NotFoundException,
  OnApplicationBootstrap,
  UnauthorizedException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import * as bcrypt from 'bcrypt';
import { randomBytes } from 'node:crypto';
import {
  Administrador,
  Aluno,
  Curso,
  EntradaFila,
  Reserva,
  TentativaAcesso,
  Turma,
} from '../dominio/entidades.js';
import {
  DadosAdministrador,
  DadosAluno,
  DadosAtualizacaoAluno,
} from '../comum/contratos.js';
import { EmailService } from './email.service.js';

@Injectable()
export class UsuariosService implements OnApplicationBootstrap {
  private gerarSenhaTemporaria() {
    return randomBytes(18).toString('base64url');
  }
  constructor(
    @InjectRepository(Aluno) private alunos: Repository<Aluno>,
    @InjectRepository(Administrador)
    private administradores: Repository<Administrador>,
    @InjectRepository(TentativaAcesso)
    private tentativas: Repository<TentativaAcesso>,
    @InjectRepository(Reserva) private reservas: Repository<Reserva>,
    @InjectRepository(EntradaFila) private entradasFila: Repository<EntradaFila>,
    private readonly emailService: EmailService,
  ) {}
  async onApplicationBootstrap() {
    const emailAdmin = 'admin@biblioteca.com';
    const admin = await this.administradores.findOneBy({ email: emailAdmin });

    if (!admin) {
      const senhaTemporaria = this.gerarSenhaTemporaria();
      const senhaHash = await bcrypt.hash(senhaTemporaria, 10);
      await this.administradores.save(
        this.administradores.create({
          nome: 'Administrador',
          email: emailAdmin,
          senha: senhaHash,
          primeiroAcesso: true,
        }),
      );
      new Logger(UsuariosService.name).log(
        `Administrador inicial criado. Configure o acesso por um canal seguro para ${emailAdmin}.`,
      );
      await this.emailService.enviarBoasVindas({
        nome: 'Administrador',
        email: emailAdmin,
        senhaInicial: senhaTemporaria,
        perfil: 'administrador',
      });
    }
  }
  private normalizar(valor = '') {
    return valor
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .trim()
      .toUpperCase()
      .replace(/[^A-Z0-9]+/g, '_')
      .replace(/^_|_$/g, '');
  }
  private obterCurso(valor: string): Curso {
    const chave = this.normalizar(valor);
    if (['DESENVOLVIMENTO_DE_SISTEMAS', 'SYSTEMS_DEVELOPMENT'].includes(chave))
      return Curso.DESENVOLVIMENTO_DE_SISTEMAS;
    if (['NUTRICAO_E_DIETETICA', 'NUTRITION_AND_DIETETICS'].includes(chave))
      return Curso.NUTRICAO_E_DIETETICA;
    throw new BadRequestException(`Curso inválido: ${valor}`);
  }
  private obterTurma(valor: string): Turma {
    const mapa: Record<string, Turma> = {
      '1_ANO_A': Turma.PRIMEIRO_A,
      '1_A': Turma.PRIMEIRO_A,
      FIRST_A: Turma.PRIMEIRO_A,
      '1_ANO_B': Turma.PRIMEIRO_B,
      '1_B': Turma.PRIMEIRO_B,
      FIRST_B: Turma.PRIMEIRO_B,
      '2_ANO_A': Turma.SEGUNDO_A,
      '2_A': Turma.SEGUNDO_A,
      SECOND_A: Turma.SEGUNDO_A,
      '2_ANO_B': Turma.SEGUNDO_B,
      '2_B': Turma.SEGUNDO_B,
      SECOND_B: Turma.SEGUNDO_B,
      '3_ANO_A': Turma.TERCEIRO_A,
      '3_A': Turma.TERCEIRO_A,
      THIRD_A: Turma.TERCEIRO_A,
      '3_ANO_B': Turma.TERCEIRO_B,
      '3_B': Turma.TERCEIRO_B,
      THIRD_B: Turma.TERCEIRO_B,
    };
    const turma = mapa[this.normalizar(valor)];
    if (!turma) throw new BadRequestException(`Turma inválida: ${valor}`);
    return turma;
  }
  async autenticar(email: string, senha: string) {
    const registro = await this.tentativas.findOneBy({ email });
    if (registro?.bloqueadoAte && registro.bloqueadoAte > new Date())
      throw new UnauthorizedException(
        'Muitas tentativas de login incorretas. Tente novamente em alguns minutos.',
      );
    const administrador = await this.administradores.findOneBy({
      email,
      ativo: true,
    });
    if (administrador && (await bcrypt.compare(senha, administrador.senha))) {
      await this.tentativas.delete({ email });
      return {
        id: administrador.id,
        perfil: 'ROLE_ADMIN' as const,
        email,
        nome: administrador.nome,
        primeiroAcesso: administrador.primeiroAcesso,
      };
    }
    const aluno = await this.alunos.findOneBy({ email, ativo: true });
    if (aluno && (await bcrypt.compare(senha, aluno.senha))) {
      await this.tentativas.delete({ email });
      return {
        id: aluno.id,
        perfil: 'ROLE_STUDENT' as const,
        email,
        nome: aluno.nome,
        primeiroAcesso: aluno.primeiroAcesso,
      };
    }
    const falha = registro ?? this.tentativas.create({ email, quantidade: 0 });
    falha.quantidade++;
    if (falha.quantidade >= 5) {
      falha.bloqueadoAte = new Date(Date.now() + 15 * 60 * 1000);
      falha.quantidade = 0;
    }
    await this.tentativas.save(falha);
    throw new UnauthorizedException('E-mail ou senha inválidos.');
  }
  async resgatarSenha(email: string, novaSenha: string) {
    const emailNormalizado = email.trim().toLowerCase();
    const administrador = await this.administradores
      .createQueryBuilder('administrador')
      .where('LOWER(administrador.email) = :email', { email: emailNormalizado })
      .andWhere('administrador.ativo = :ativo', { ativo: true })
      .getOne();

    if (administrador) {
      administrador.senha = await bcrypt.hash(novaSenha, 10);
      administrador.primeiroAcesso = false;
      await this.administradores.save(administrador);
      await this.tentativas.delete({ email: administrador.email });
      return;
    }

    const aluno = await this.alunos
      .createQueryBuilder('aluno')
      .where('LOWER(aluno.email) = :email', { email: emailNormalizado })
      .andWhere('aluno.ativo = :ativo', { ativo: true })
      .getOne();

    if (!aluno)
      throw new NotFoundException(
        'Não existe uma conta ativa com este e-mail.',
      );

    aluno.senha = await bcrypt.hash(novaSenha, 10);
    aluno.primeiroAcesso = false;
    await this.alunos.save(aluno);
    await this.tentativas.delete({ email: aluno.email });
  }
  async criarAdministrador(dados: DadosAdministrador) {
    if (await this.administradores.existsBy({ email: dados.email }))
      throw new ConflictException(
        'Já existe um administrador com este e-mail.',
      );
    const senhaTemporaria = this.gerarSenhaTemporaria();
    const administrador = await this.administradores.save(
      this.administradores.create({
        nome: dados.name,
        email: dados.email,
        senha: await bcrypt.hash(senhaTemporaria, 10),
        primeiroAcesso: true,
      }),
    );
    const emailEnviado = await this.emailService.enviarBoasVindas({
      nome: administrador.nome,
      email: administrador.email,
      senhaInicial: senhaTemporaria,
      perfil: 'administrador',
    });
    return { usuario: administrador, senhaTemporaria, emailEnviado };
  }
  async listarAdministradores(consulta?: string, incluirInativos = false) {
    const todos = await this.administradores.find({
      where: incluirInativos ? {} : { ativo: true },
      order: { nome: 'ASC' },
    });
    const busca = (consulta ?? '').trim().toLowerCase();
    return todos.filter(
      (admin) =>
        !busca ||
        admin.nome.toLowerCase().includes(busca) ||
        admin.email.toLowerCase().includes(busca),
    );
  }
  async obterAdministrador(id: string) {
    const admin = await this.administradores.findOneBy({ id });
    if (!admin) throw new NotFoundException('Administrador não encontrado.');
    return admin;
  }
  async atualizarAdministrador(
    id: string,
    dados: { name: string; email: string },
  ) {
    const admin = await this.obterAdministrador(id);
    const repetido = await this.administradores.findOneBy({
      email: dados.email,
    });
    if (repetido && repetido.id !== id)
      throw new ConflictException(
        'Já existe um administrador com este e-mail.',
      );
    admin.nome = dados.name;
    admin.email = dados.email;
    return this.administradores.save(admin);
  }
  async redefinirSenhaAdministrador(id: string, novaSenha: string) {
    const admin = await this.obterAdministrador(id);
    admin.senha = await bcrypt.hash(novaSenha, 10);
    admin.primeiroAcesso = true;
    await this.administradores.save(admin);
    return this.emailService.enviarSenhaTemporaria({
      nome: admin.nome,
      email: admin.email,
      senhaTemporaria: novaSenha,
    });
  }
  async reativarAdministrador(id: string) {
    const admin = await this.obterAdministrador(id);
    admin.ativo = true;
    await this.administradores.save(admin);
  }
  async desativarAdministrador(id: string) {
    const admin = await this.obterAdministrador(id);
    admin.ativo = false;
    await this.administradores.save(admin);
  }
  async criarAluno(dados: DadosAluno) {
    if (await this.alunos.existsBy({ email: dados.email }))
      throw new ConflictException(
        'Já existe um aluno cadastrado com este e-mail.',
      );
    const senhaTemporaria = this.gerarSenhaTemporaria();
    const aluno = await this.alunos.save(
      this.alunos.create({
        nome: dados.name,
        email: dados.email,
        senha: await bcrypt.hash(senhaTemporaria, 10),
        primeiroAcesso: true,
        curso: this.obterCurso(dados.course),
        turma: this.obterTurma(dados.schoolClass),
        telefone: dados.phone,
      }),
    );
    const emailEnviado = await this.emailService.enviarBoasVindas({
      nome: aluno.nome,
      email: aluno.email,
      senhaInicial: senhaTemporaria,
      perfil: 'aluno',
    });
    return { usuario: aluno, senhaTemporaria, emailEnviado };
  }
  async listar(
    consulta?: string,
    incluirInativos = false,
    curso?: string,
    turma?: string,
  ) {
    const todos = await this.alunos.find({
      where: incluirInativos ? {} : { ativo: true },
      order: { nome: 'ASC' },
    });
    const busca = (consulta ?? '').toLowerCase();
    let cursoAlvo: Curso | undefined;
    let turmaAlvo: Turma | undefined;
    try {
      if (curso) cursoAlvo = this.obterCurso(curso);
    } catch {}
    try {
      if (turma) turmaAlvo = this.obterTurma(turma);
    } catch {}
    return todos.filter(
      (a) =>
        (!busca ||
          a.nome.toLowerCase().includes(busca) ||
          a.email.toLowerCase().includes(busca) ||
          a.telefone?.includes(busca)) &&
        (!cursoAlvo || a.curso === cursoAlvo) &&
        (!turmaAlvo || a.turma === turmaAlvo),
    );
  }
  async obter(id: string, incluirInativo = true) {
    const aluno = await this.alunos.findOne({
      where: { id, ...(!incluirInativo ? { ativo: true } : {}) },
    });
    if (!aluno)
      throw new NotFoundException(`Aluno não encontrado com o ID: ${id}`);
    return aluno;
  }
  async atualizar(id: string, dados: DadosAtualizacaoAluno, proprio = false) {
    const aluno = await this.obter(id);
    if (
      !proprio &&
      dados.email !== aluno.email &&
      (await this.alunos.existsBy({ email: dados.email }))
    )
      throw new ConflictException(
        'Já existe um aluno cadastrado com este e-mail.',
      );
    aluno.nome = dados.name;
    if (!proprio) aluno.email = dados.email;
    aluno.curso = this.obterCurso(dados.course);
    aluno.turma = this.obterTurma(dados.schoolClass);
    aluno.telefone = dados.phone;
    return this.alunos.save(aluno);
  }
  async redefinirSenha(id: string, nova: string) {
    const aluno = await this.obter(id);
    aluno.senha = await bcrypt.hash(nova, 10);
    aluno.primeiroAcesso = true;
    await this.alunos.save(aluno);
    return this.emailService.enviarSenhaTemporaria({
      nome: aluno.nome,
      email: aluno.email,
      senhaTemporaria: nova,
    });
  }
  async alterarSenha(id: string, atual: string | undefined, nova: string) {
    const aluno = await this.obter(id);
    if (!atual || !(await bcrypt.compare(atual, aluno.senha)))
      throw new UnauthorizedException(
        'A senha atual informada está incorreta.',
      );
    aluno.senha = await bcrypt.hash(nova, 10);
    aluno.primeiroAcesso = false;
    await this.alunos.save(aluno);
  }
  async concluirPrimeiroAcesso(
    usuario: { id: string; perfil: 'ROLE_ADMIN' | 'ROLE_STUDENT' },
    atual: string | undefined,
    nova: string,
  ) {
    const repositorio =
      usuario.perfil === 'ROLE_ADMIN' ? this.administradores : this.alunos;
    const conta = await repositorio.findOneBy({ id: usuario.id } as any);
    if (!conta || !atual || !(await bcrypt.compare(atual, conta.senha)))
      throw new UnauthorizedException(
        'A senha atual informada está incorreta.',
      );
    if (await bcrypt.compare(nova, conta.senha))
      throw new BadRequestException(
        'A nova senha deve ser diferente da senha inicial.',
      );
    conta.senha = await bcrypt.hash(nova, 10);
    conta.primeiroAcesso = false;
    await repositorio.save(conta as any);
  }
  async reativar(id: string) {
    const resultado = await this.alunos.update(id, { ativo: true });
    if (!resultado.affected)
      throw new NotFoundException('Aluno não encontrado.');
  }
  async desativar(id: string) {
    const aluno = await this.obter(id);
    aluno.ativo = false;
    await this.alunos.save(aluno);
  }
  async excluirDefinitivamente(id: string) {
    const aluno = await this.obter(id);
    const possuiHistorico =
      (await this.reservas.exists({ where: { aluno: { id } } })) ||
      (await this.entradasFila.exists({ where: { aluno: { id } } }));
    if (possuiHistorico)
      throw new ConflictException(
        'Não é possível excluir definitivamente um aluno que possui reservas ou registros na fila de espera.',
      );
    await this.alunos.remove(aluno);
  }
}
