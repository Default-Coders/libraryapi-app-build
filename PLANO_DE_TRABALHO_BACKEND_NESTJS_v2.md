# Plano de Trabalho — Validação e Evolução do Backend NestJS

> **Versão-base:** `lib-backend`, branch `main`
>
> **Data de referência:** 03/09/2026
>
> **Objetivo:** validar a versão atual do backend, adaptar a infraestrutura à arquitetura definida e, somente depois, iniciar o endurecimento para produção.

## Arquitetura-alvo

```text
Execução local ──┐
                 ├──> NestJS ──> Supabase PostgreSQL
Docker ──────────┘
```

O Docker não terá PostgreSQL local. Ele será apenas uma segunda forma de executar o backend.

---

# 0. Reconhecimento da versão atual

Antes dos testes, registrar o estado real do repositório.

A versão atual documenta NestJS/TypeScript, compatibilidade com o frontend Next.js, tabelas PostgreSQL `tb_*` e autenticação por sessão `JSESSIONID`. Também possui Vitest, `connect-pg-simple`, scheduler, contratos e regras de circulação mais detalhadas.

## 0.1 — Estado do código

- [x] Confirmar branch e commit de referência.
- [x] Confirmar estrutura atual.
- [x] Confirmar dependências.
- [x] Confirmar scripts do `package.json`.
- [x] Confirmar endpoints.
- [x] Confirmar autenticação.
- [x] Confirmar regras de estoque/reserva.
- [x] Confirmar testes existentes.
- [x] Confirmar documentação.

## 0.2 — Arquitetura

Arquitetura atualmente documentada:

```text
Docker
├── NestJS
└── PostgreSQL
```

Arquitetura definida para esta fase:

```text
Terminal ──> NestJS ──> Supabase
Docker ────> NestJS ──> Supabase
```

- [x] Registrar a diferença.
- [x] Tratar o PostgreSQL do Compose como arquitetura legada desta versão.
- [x] Não remover backups antes de entender sua finalidade.
- [x] Não misturar alterações de produção com os testes iniciais.

---

# 1. Validação da execução local

## Objetivo

Provar que o backend executa pelo terminal e conecta ao Supabase.

## 1.1 — Ambiente

- [x] Confirmar Node.js.
- [x] Confirmar npm.
- [x] Confirmar versão compatível.
- [x] Confirmar branch correta.
- [x] Conferir `git status`.

## 1.2 — `.env`

Criar `.env` a partir do `.env.example`.

Variáveis:

```env
DATABASE_URL=
DATABASE_USER=
DATABASE_PASSWORD=
DATABASE_SYNCHRONIZE=
ALLOWED_ORIGINS=
SESSION_SECRET=
PORT=
NODE_ENV=
```

- [x] Configurar conexão Supabase.
- [x] Configurar credenciais.
- [x] Definir `DATABASE_SYNCHRONIZE` para o ambiente de teste.
- [x] Configurar CORS.
- [x] Criar `SESSION_SECRET` local.
- [x] Configurar porta `8080`.
- [x] Configurar `NODE_ENV=development`.
- [x] Confirmar que `.env` está ignorado pelo Git.

## 1.3 — Dependências

```bash
npm install
```

- [x] Instalação sem erro.
- [x] Nenhuma dependência ausente.

## 1.4 — Inicialização

```bash
npm run start:dev
```

- [x] NestJS inicia.
- [x] Rotas são registradas.
- [x] API responde.
- [x] Não ocorre `ECONNREFUSED`.
- [x] Não ocorre `ENOTFOUND`.
- [x] Não ocorre erro de autenticação do banco.
- [x] API fica em `http://localhost:8080/api`.

## 1.5 — Supabase

- [x] TypeORM inicializa.
- [x] Entidades são carregadas.
- [x] Banco acessível.
- [x] Não há dependência de PostgreSQL local.
- [x] `tb_session` consegue ser usada.
- [x] Registrar eventuais erros.

## 1.6 — Conclusão

- [x] Terminal → NestJS → Supabase funcionando.
- [x] Sessão consegue acessar PostgreSQL.
- [x] API funcionando.

---

# 2. Validação da autenticação e sessão

O modelo atual usa sessão HTTP, não JWT/Bearer.

## 2.1 — Login

`POST /api/auth/login`

- [x] Credenciais válidas.
- [x] Senha inválida.
- [x] Usuário inexistente.
- [x] Status HTTP.
- [x] Corpo da resposta.
- [x] Criação da sessão.

## 2.2 — Cookie

- [x] `JSESSIONID` presente.
- [x] `HttpOnly`.
- [x] `SameSite`.
- [x] `Secure` conforme ambiente.
- [x] Validade.
- [x] Persistência em `tb_session`.

## 2.3 — Sessão

- [x] Requisição autenticada funciona.
- [x] Requisição sem sessão é recusada.
- [x] Sessão persiste conforme esperado.
- [x] Expiração funciona.

## 2.4 — Roles

### `ROLE_ADMIN`

- [x] Recursos administrativos permitidos.
- [x] Recursos não permitidos recusados.

### `ROLE_STUDENT`

- [x] Recursos de aluno permitidos.
- [x] Recursos administrativos recusados.

## 2.5 — Logout

`POST /api/auth/logout`

- [x] Logout executa.
- [x] Retorna `204`.
- [x] Sessão é destruída.
- [x] Requisição posterior é recusada.

## 2.6 — Tentativas de login

- [x] Registrar falhas.
- [x] Confirmar limite de 5 falhas.
- [x] Confirmar bloqueio de 15 minutos.
- [x] Login correto limpa falhas.
- [x] Bloqueio funciona.

## 2.7 — Rate limit

O limite atual é de 60 requisições/minuto e o contador fica em memória.

- [x] Testar limite.
- [x] Confirmar `429`.
- [x] Testar usuário autenticado.
- [x] Testar usuário não autenticado.
- [x] Registrar limitação de múltiplas instâncias.

---

# 3. Contratos, DTOs e erros

## 3.1 — Validação

- [x] Campos obrigatórios.
- [x] Tipos inválidos.
- [x] Strings vazias.
- [x] Limites.
- [x] E-mail.
- [x] Senha.
- [x] UUID.
- [x] Enumerações.

## 3.2 — Erros

- [x] Validação.
- [x] Não encontrado.
- [x] Não autenticado.
- [x] Acesso negado.
- [x] Conflito.
- [x] Erro interno.
- [x] Formato global consistente.

## 3.3 — Testes existentes

Existe `src/comum/contratos.spec.ts`.

- [x] Executar testes.
- [x] Identificar cobertura.
- [x] Registrar falhas.
- [x] Comparar contratos com respostas reais.

---

# 4. Validação dos módulos

Ordem:

```text
Categorias
   ↓
Livros
   ↓
Alunos
   ↓
Administradores
   ↓
Reservas
   ↓
Lista de espera
```

## 4.1 — Categorias

- [x] Listar.
- [x] Consultar.
- [x] Criar.
- [x] Atualizar.
- [x] Exclusão lógica.
- [x] Exclusão permanente.
- [x] Nome duplicado.
- [x] Categoria com livros.
- [x] Normalização.
- [x] Permissões.

## 4.2 — Livros

- [x] Listar.
- [x] Consultar.
- [x] Criar.
- [x] Atualizar.
- [x] Desativar.
- [x] ISBN 10.
- [x] ISBN 13.
- [x] ISBN inválido.
- [x] ISBN duplicado.
- [x] ISBN ausente.
- [x] Geração automática quando aplicável.
- [x] Categoria.
- [x] Estoque.
- [x] Capa.
- [x] QR Code.
- [x] Permissões.

## 4.3 — Alunos

- [x] Listar.
- [x] Consultar.
- [x] Criar.
- [x] Atualizar.
- [x] Desativar.
- [x] Reativar.
- [x] Redefinir senha.
- [x] Alterar senha.
- [x] `/students/me`.
- [x] E-mail único.
- [x] Curso.
- [x] Turma.
- [x] Telefone.
- [x] Permissões.

## 4.4 — Administradores

- [x] Consultar/listar conforme endpoints atuais.
- [x] Criar.
- [x] Atualizar.
- [x] Desativar.
- [x] Reativar.
- [x] Redefinir senha.
- [x] Primeiro acesso.
- [x] Permissões.

## 4.5 — Reservas

- [x] Criar.
- [x] Listar.
- [x] Consultar individual.
- [x] Cancelar.
- [x] Retirada.
- [x] Devolução.
- [x] Proprietário.
- [x] Administrador.
- [x] Status.
- [x] Prazo.
- [x] Estoque.
- [x] Duplicidade de reserva ativa.

## 4.6 — Lista de espera

- [x] Entrar na fila.
- [x] Listar.
- [x] Consultar posição.
- [x] Cancelar.
- [x] Notificar.
- [x] Converter em reserva.
- [x] Expirar.
- [x] Impedir duplicidade.
- [x] Promover quando houver estoque.

---

# 5. Regras de negócio e concorrência

## 5.1 — Estoque

- [x] Criação: disponível = total.
- [x] Reserva reduz disponível.
- [x] Cancelamento libera.
- [x] Devolução libera.
- [x] Expiração libera.
- [x] Estoque nunca negativo.
- [x] Total não abaixo dos exemplares ocupados.

## 5.2 — Sem estoque

```text
disponível = 0
        ↓
POST /reservations
        ↓
lista de espera
```

- [x] Confirmar que reserva não é criada.
- [x] Confirmar entrada na fila.
- [x] Confirmar consistência do estoque.

## 5.3 — Concorrência

Cenário crítico:

```text
Estoque = 1

Aluno A ──┐
          ├──> POST /reservations
Aluno B ──┘
```

Esperado:

```text
1 reserva válida
estoque = 0
nenhuma duplicidade
```

- [x] Criar dois usuários.
- [x] Configurar um único exemplar.
- [x] Enviar requisições simultâneas.
- [x] Conferir respostas.
- [x] Conferir estoque.
- [x] Conferir reservas.
- [x] Conferir fila.
- [x] Repetir várias vezes.

## 5.4 — Retirada/devolução

- [x] Retirada válida.
- [x] Retirada inválida.
- [x] Devolução válida.
- [x] Devolução sem retirada.
- [x] Devolução duplicada.
- [x] Estoque.
- [x] Status.

## 5.5 — Scheduler

A documentação atual define processamento de vencimentos a cada 15 minutos.

- [x] Confirmar scheduler.
- [x] Criar cenário expirável.
- [x] Validar status.
- [x] Validar estoque.
- [x] Validar promoção da fila.

---

# 6. Docker → NestJS → Supabase

## Objetivo

Eliminar o PostgreSQL local do fluxo Docker.

## 6.1 — Dockerfile

- [x] Revisar imagem Node.
- [x] Confirmar build.
- [x] Confirmar dependências de produção.
- [x] Confirmar `dist`.

## 6.2 — `docker-compose.yml`

- [x] Remover `db_biblioteca`.
- [x] Remover `volumes` de banco.
- [x] Adicionar `.env` no `env_file`.
- [x] Configurar API.serviço `banco`.
- [x] Remover volume PostgreSQL.
- [x] Remover credenciais locais.
- [x] Remover `depends_on` do banco.
- [x] Manter somente o serviço necessário para a API.
- [x] Configurar variáveis do NestJS.

## 6.3 — Supabase

- [x] API conecta.
- [x] Sessões persistem.

## 6.4 — Execução Docker

- [x] Sobe com sucesso.
- [x] Portas mapeadas corretamente.

## 6.5 — Equivalência

Comparar:

```text
Terminal ──> NestJS ──> Supabase
Docker ────> NestJS ──> Supabase
```

- [x] Mesmas rotas.
- [x] Mesmo banco.
- [x] Mesmo comportamento.
- [x] Mesmo modelo de autenticação.

---

# 7. Integração Next.js ↔ NestJS

## 7.1 — CORS

- [x] Origem do frontend.
- [x] `credentials`.
- [x] Preflight.
- [x] Métodos.
- [x] Headers.

## 7.2 — Sessão

- [x] Login pelo frontend.
- [x] Cookie recebido.
- [x] Cookie enviado.
- [x] Endpoint protegido.
- [x] Logout.

## 7.3 — Contratos

Verificar especialmente:

- [x] `createdAt` × `reservationDate`.
- [x] `createdAt` × `requestDate`.
- [x] `publicationYear` × `year`.
- [x] Outros campos de livros.
- [x] Outros campos de reservas.
- [x] Outros campos da fila.

## 7.4 — Fluxos

- [x] Login admin.
- [x] Dashboard admin.
- [x] Categorias.
- [x] Livros.
- [x] Alunos.
- [x] Administradores.
- [x] Login aluno.
- [x] Catálogo.
- [x] Reserva.
- [x] Lista de espera.
- [x] Perfil.
- [x] Logout.

---

# 8. Regressão geral

Depois das alterações, repetir os principais cenários.

- [x] Execução local.
- [x] Docker.
- [x] Supabase.
- [x] Login.
- [x] Logout.
- [x] Sessão.
- [x] Roles.
- [x] CRUDs.
- [x] Reservas.
- [x] Estoque.
- [x] Lista de espera.
- [x] Concorrência.
- [x] Frontend.

---

# 9. Preparação para produção

**Somente depois das etapas 1–8.**

## 9.1 — Segurança

- [x] Remover segredos hardcoded.
- [x] Revisar senha temporária de primeiro acesso.
- [x] Gerar `SESSION_SECRET` forte.
- [x] Nunca versionar `.env`.
- [x] Revisar logs.
- [x] Revisar CORS.
- [x] Revisar cookies.
- [x] Revisar autorização.

## 9.2 — Banco

- [x] `DATABASE_SYNCHRONIZE=false`.
- [x] Planejar migrations.
- [x] Revisar conexão Supabase.
- [x] Revisar pool.
- [x] Definir timeouts.
- [x] Definir backup.
- [x] Definir restauração.

## 9.3 — Rate limiting

- [x] Avaliar `Map` em memória.
- [x] Avaliar múltiplas instâncias.
- [x] Definir armazenamento compartilhado se necessário.

## 9.4 — Concorrência

- [x] Revisar timeout dos locks.
- [x] Avaliar deadlocks.
- [x] Avaliar rollback.
- [x] Validar transações.

## 9.5 — Observabilidade

- [x] Logs estruturados.
- [x] Health check.
- [x] Tratamento de falha do banco.
- [x] Monitoramento.
- [x] Métricas.
- [x] Rastreamento de erros.

---

# 10. Testes automatizados

Transformar os testes manuais validados em testes permanentes.

## 10.1 — Unitários

- [ ] Contratos.
- [ ] Validações.
- [ ] Conversores.
- [ ] Usuários.
- [ ] Catálogo.
- [ ] Circulação.

## 10.2 — Integração

- [ ] Banco.
- [ ] Sessão.
- [ ] Autenticação.
- [ ] Reservas.
- [ ] Estoque.
- [ ] Fila.

## 10.3 — E2E

- [ ] Login.
- [ ] Autorização.
- [ ] CRUDs.
- [ ] Reserva.
- [ ] Devolução.
- [ ] Fila.
- [ ] Logout.

## 10.4 — Concorrência automatizada

Criar um teste que reproduza:

```text
1 exemplar
+
2 requisições simultâneas
=
1 reserva válida
```

---

# 11


## 11.1 — README

- [ ] Atualizar arquitetura.
- [ ] Remover PostgreSQL local como arquitetura padrão.
- [ ] Documentar Supabase.
- [ ] Documentar execução por terminal.
- [ ] Documentar Docker.
- [ ] Atualizar `.env`.
- [ ] Atualizar comandos.
- [ ] Atualizar endpoints.

## 11.2 — Contexto

- [x] Manter `CONTEXTO_BACKEND.md` alinhado ao código.
- [x] Registrar arquitetura definitiva.
- [x] Registrar regras.
- [x] Registrar limitações.
- [x] Registrar testes.

---

# 12. Critério final

A validação estará concluída quando:

```text
Terminal ──> NestJS ──> Supabase
Docker ────> NestJS ──> Supabase
```

e:

- [ ] execução local funciona;
- [ ] Docker funciona;
- [ ] ambos usam Supabase;
- [ ] autenticação funciona;
- [ ] sessão funciona;
- [ ] roles funcionam;
- [ ] contratos funcionam;
- [ ] CRUDs funcionam;
- [ ] reservas funcionam;
- [ ] estoque funciona;
- [ ] fila funciona;
- [ ] concorrência foi testada;
- [ ] frontend funciona;
- [ ] regressão passou;
- [ ] não existem credenciais reais no repositório.

---

# Ordem oficial

```text
0. Reconhecimento
        ↓
1. Execução local
   ├── 1.1 Ambiente
   ├── 1.2 .env
   ├── 1.3 Dependências
   ├── 1.4 Inicialização
   ├── 1.5 Supabase
   └── 1.6 Conclusão
        ↓
2. Autenticação
        ↓
3. Contratos
        ↓
4. Módulos
        ↓
5. Regras + concorrência
        ↓
6. Docker
        ↓
7. Frontend ↔ Backend
        ↓
8. Regressão
        ↓
9. Produção
        ↓
10. Testes automatizados
        ↓
11. Documentação
```

## Estados de acompanhamento

- ⬜ Pendente
- 🔄 Em andamento
- ✅ Concluída
- ❌ Falhou
- ⏸️ Bloqueada

**Regra:** uma etapa principal só é concluída quando suas sub-etapas críticas estiverem concluídas.
