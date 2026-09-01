# Contexto do Backend NestJS — Biblioteca da ETE Integral

> Última atualização: 1º de setembro de 2026  
> Implementação: NestJS/TypeScript  
> Idioma interno: português do Brasil (`pt-BR`)  
> Fuso horário da aplicação e do banco: `America/Sao_Paulo`

## 1. Visão geral

API REST do sistema de biblioteca escolar da ETE Integral. Esta aplicação é a reimplementação em NestJS do backend Java/Spring Boot existente e mantém compatibilidade com:

- o frontend Next.js do projeto;
- os campos JSON públicos usados pelo backend Java;
- as tabelas PostgreSQL `tb_*`;
- os valores internos das enumerações persistidas;
- a autenticação baseada em sessão e o cookie `JSESSIONID`.

O sistema administra:

- administradores;
- alunos e seus perfis;
- categorias;
- livros e estoque;
- reservas, retiradas e devoluções;
- listas de espera;
- tentativas de acesso;
- sessões HTTP persistidas no PostgreSQL.

Perfis de acesso:

| Perfil | Valor da sessão | Responsabilidades |
|---|---|---|
| Administrador | `ROLE_ADMIN` | Gestão de alunos, administradores, categorias, livros, estoque, reservas e fila. |
| Aluno | `ROLE_STUDENT` | Catálogo, perfil próprio, reservas e lista de espera próprias. |

## 2. Tecnologias

- Node.js 24 no Docker;
- TypeScript 6;
- NestJS 12;
- Express;
- TypeORM;
- PostgreSQL 16;
- `class-validator` e `class-transformer`;
- BCrypt;
- `express-session` e `connect-pg-simple`;
- `@nestjs/schedule`;
- Vitest;
- Oxlint e Prettier;
- Docker e Docker Compose.

Não há JWT nem token Bearer. A identidade autenticada fica na sessão do servidor.

## 3. Estrutura do projeto

```text
backend2/
├── src/
│   ├── app.module.ts                 # Composição de módulos, banco e provedores
│   ├── main.ts                       # Inicialização, CORS, sessão e limite de uso
│   ├── tipos.d.ts                    # Declarações de módulos sem tipos locais
│   ├── comum/
│   │   ├── contratos.ts              # DTOs, validações e conversores de saída
│   │   ├── contratos.spec.ts         # Testes dos contratos públicos
│   │   ├── filtro-erros.ts           # Formato global de erros
│   │   └── seguranca.ts              # Guards e usuário da sessão
│   ├── controladores/
│   │   └── api.controller.ts         # Todos os endpoints REST
│   ├── dominio/
│   │   └── entidades.ts              # Entidades e enumerações TypeORM
│   └── servicos/
│       ├── usuarios.service.ts        # Login, administradores e alunos
│       ├── catalogo.service.ts        # Categorias, livros e estoque
│       └── circulacao.service.ts      # Reservas, fila, retirada e devolução
├── .env.example
├── .dockerignore
├── Dockerfile
├── docker-compose.yml
├── package.json
├── README.md
└── CONTEXTO_BACKEND.md
```

Classes, métodos e variáveis internos usam português sempre que não são nomes obrigatórios do framework ou do contrato externo. Os campos JSON continuam em inglês para não quebrar o frontend existente.

## 4. Execução

### 4.1 Desenvolvimento local

Pré-requisitos:

- Node.js compatível;
- npm;
- PostgreSQL acessível.

```powershell
cd C:\Users\Beto\Downloads\biblioteca\backend2
Copy-Item .env.example .env
npm install
npm run start:dev
```

Endereço padrão: `http://localhost:8080/api`.

### 4.2 Docker Compose

```powershell
cd C:\Users\Beto\Downloads\biblioteca\backend2
docker compose up --build -d
```

| Serviço | Porta | Função |
|---|---:|---|
| `api` | 8080 | API NestJS |
| `banco` | 5432 | PostgreSQL 16 |

Comandos úteis:

```powershell
docker compose ps
docker compose logs -f api
docker compose restart api
docker compose down
```

O volume `dados_biblioteca2` preserva o banco. `docker compose down -v` também remove esse volume e, portanto, os dados.

### 4.3 Produção

```powershell
npm run build
npm run start:prod
```

Antes de produção:

- defina um `SESSION_SECRET` longo e aleatório;
- use `NODE_ENV=production` para habilitar `Secure` no cookie;
- use HTTPS;
- restrinja `ALLOWED_ORIGINS`;
- prefira `DATABASE_SYNCHRONIZE=false` com migrações controladas;
- não utilize as credenciais de exemplo do Docker.

## 5. Configuração

| Variável | Padrão | Finalidade |
|---|---|---|
| `DATABASE_URL` | `postgresql://library_user:library_password@localhost:5432/library_db` | URL de conexão PostgreSQL. Uma URL iniciada por `jdbc:` também é aceita e tem o prefixo removido. |
| `DATABASE_USER` | definido na URL | Usuário opcional separado. |
| `DATABASE_PASSWORD` | definido na URL | Senha opcional separada. |
| `DATABASE_SYNCHRONIZE` | `true` | Permite ao TypeORM sincronizar o esquema. Em produção ou banco restaurado, use `false`. |
| `ALLOWED_ORIGINS` | `http://localhost:3000` | Lista de origens CORS separadas por vírgula. |
| `SESSION_SECRET` | valor local inseguro | Assinatura da sessão. Deve ser alterado fora do desenvolvimento. |
| `PORT` | `8080` | Porta HTTP da API. |
| `NODE_ENV` | `development` | Em `production`, o cookie de sessão recebe `secure: true`. |

## 6. Banco de dados

### 6.1 Estratégia

O TypeORM usa PostgreSQL e as mesmas tabelas principais do backend Java. Todas as chaves de domínio usam UUID. Datas usam colunas `timestamp`; o bloqueio de acesso usa `timestamp with time zone`.

Por padrão, `DATABASE_SYNCHRONIZE=true`. Essa opção é conveniente em desenvolvimento, mas não substitui migrações versionadas em produção.

### 6.2 Tabelas

| Entidade NestJS | Tabela | Finalidade |
|---|---|---|
| `Administrador` | `tb_admin` | Contas administrativas. |
| `Aluno` | `tb_student` | Contas e dados escolares dos alunos. |
| `Categoria` | `tb_category` | Classificação do acervo. |
| `Livro` | `tb_book` | Acervo e quantidades. |
| `Reserva` | `tb_reservation` | Solicitações, retiradas e devoluções. |
| `EntradaFila` | `tb_waiting_list` | Ordem de espera por livro. |
| `TentativaAcesso` | `tb_login_attempt` | Falhas de login e bloqueio temporário. |
| Sessão Express | `tb_session` | Sessões HTTP criadas pelo `connect-pg-simple`. |

### 6.3 Campos comuns e exclusão lógica

As entidades de domínio herdam:

- `id`: UUID;
- `is_active`: situação lógica;
- `created_at`: criação;
- `updated_at`: última atualização.

As operações normais de exclusão de aluno, categoria e livro alteram `is_active` para `false`. A exclusão permanente existe apenas para categorias e é recusada quando há livros relacionados.

### 6.4 Compatibilidade com o backup Java

O backup localizado em `backend/backups/biblioteca_2026-09-01.dump` pode ser restaurado no PostgreSQL usado pelo NestJS. Para usar um esquema já restaurado:

1. restaure o backup conforme a documentação do backend Java;
2. aponte `DATABASE_URL` para esse banco;
3. defina `DATABASE_SYNCHRONIZE=false`;
4. valide as colunas e relações antes de iniciar em produção.

Não restaure por cima de um banco com dados importantes sem criar um backup prévio.

## 7. Entidades e enumerações

### 7.1 Administrador

Campos públicos relevantes: UUID, nome, e-mail, situação ativa e indicador de primeiro acesso. A senha é armazenada com BCrypt e nunca é devolvida pela API.

Na primeira inicialização, se `tb_admin` estiver vazia, o sistema cria:

- nome: `Administrador`;
- e-mail: `admin@biblioteca.com`;
- senha temporária aleatória de 12 caracteres;
- primeiro acesso: verdadeiro.

A senha temporária aparece uma vez no log da aplicação.

### 7.2 Aluno

Dados: nome, e-mail único, senha BCrypt, curso, turma, telefone e situação ativa.

Cursos aceitos:

| Entrada aceita | Persistência | Saída pública |
|---|---|---|
| `Desenvolvimento de Sistemas`, `DESENVOLVIMENTO_DE_SISTEMAS`, `SYSTEMS_DEVELOPMENT` | `SYSTEMS_DEVELOPMENT` | `Desenvolvimento de Sistemas` |
| `Nutrição e Dietética`, `NUTRICAO_E_DIETETICA`, `NUTRITION_AND_DIETETICS` | `NUTRITION_AND_DIETETICS` | `Nutrição e Dietética` |

Turmas aceitas e retornadas:

| Persistência | Exemplos de entrada | Saída pública |
|---|---|---|
| `FIRST_A` | `1º ano A`, `1_A`, `FIRST_A` | `1º ano A` |
| `FIRST_B` | `1º ano B`, `1_B`, `FIRST_B` | `1º ano B` |
| `SECOND_A` | `2º ano A`, `2_A`, `SECOND_A` | `2º ano A` |
| `SECOND_B` | `2º ano B`, `2_B`, `SECOND_B` | `2º ano B` |
| `THIRD_A` | `3º ano A`, `3_A`, `THIRD_A` | `3º ano A` |
| `THIRD_B` | `3º ano B`, `3_B`, `THIRD_B` | `3º ano B` |

Entradas são normalizadas sem acentos, em maiúsculas e com separadores convertidos para `_`.

### 7.3 Categoria

Campos: UUID, nome único, descrição e situação ativa. O nome é salvo em maiúsculas e sem espaços externos.

### 7.4 Livro

Campos: título, autor, editora, ISBN, ano de publicação, quantidade total, quantidade disponível, URL de QR Code, categoria e situação ativa.

- ISBN é opcional, mas, quando informado, deve conter exatamente 10 ou 13 dígitos;
- ISBN não pode ser duplicado;
- ISBN não é alterado durante a edição;
- um novo livro começa com quantidade disponível igual à total;
- o total não pode ficar abaixo dos exemplares reservados ou emprestados.

### 7.5 Reserva

| Valor persistido/público | Significado |
|---|---|
| `REQUESTED` | Solicitada |
| `APPROVED` | Aprovada; mantido por compatibilidade com dados existentes |
| `PICKED_UP` | Retirada |
| `RETURNED` | Devolvida |
| `CANCELLED` | Cancelada |
| `EXPIRED` | Expirada |

Datas: criação da reserva, prazo de retirada, retirada e devolução.

### 7.6 Lista de espera

| Valor persistido/público | Significado |
|---|---|
| `WAITING` | Aguardando |
| `NOTIFIED` | Notificado |
| `RESERVED` | Convertido em reserva |
| `EXPIRED` | Expirado |
| `CANCELLED` | Cancelado |

Cada entrada registra posição, aluno, livro, criação e eventual notificação.

## 8. Autenticação, sessão e segurança

### 8.1 Login

```http
POST /api/auth/login
Content-Type: application/json

{"email":"admin@biblioteca.com","password":"senha"}
```

Resposta:

```json
{"role":"ROLE_ADMIN"}
```

Após autenticar, o servidor grava na sessão apenas:

- UUID do usuário;
- perfil;
- e-mail.

O frontend deve enviar `credentials: "include"` em todas as chamadas autenticadas.

### 8.2 Cookie e armazenamento

- nome: `JSESSIONID`;
- `httpOnly: true`;
- `sameSite: "lax"`;
- `secure: true` somente quando `NODE_ENV=production`;
- validade: 8 horas;
- armazenamento: tabela PostgreSQL `tb_session`.

### 8.3 Logout

`POST /api/auth/logout` destrói a sessão no servidor e responde `204 No Content`.

### 8.4 Tentativas incorretas

- cada e-mail acumula falhas em `tb_login_attempt`;
- após 5 falhas, o acesso fica bloqueado por 15 minutos;
- um login correto apaga o registro de falhas daquele e-mail;
- durante o bloqueio, a API informa que houve muitas tentativas.

### 8.5 Limite de requisições

Há limite de 60 requisições por minuto:

- usuário autenticado: chaveada pelo UUID;
- usuário não autenticado: chaveada pelo IP;
- o contador atual fica em memória do processo;
- ao exceder, a resposta é `429` no formato padrão da API.

Em execução com várias réplicas, o limite é independente por processo. Para um limite global, deve-se substituir o armazenamento em memória por Redis ou mecanismo compartilhado.

### 8.6 CORS

- permite credenciais;
- aceita `GET`, `POST`, `PUT`, `PATCH`, `DELETE` e `OPTIONS`;
- aceita os cabeçalhos `Cache-Control` e `Content-Type`;
- origens vêm de `ALLOWED_ORIGINS`, separadas por vírgula.

### 8.7 Guards

| Guard | Regra |
|---|---|
| `Autenticado` | Exige qualquer sessão válida. |
| `SomenteAdministrador` | Exige `ROLE_ADMIN`. |
| `SomenteAluno` | Exige `ROLE_STUDENT`. |

## 9. Regras de negócio

### 9.1 Alunos

- e-mail é único;
- senhas possuem no mínimo 6 caracteres na entrada e são armazenadas com BCrypt;
- administrador cadastra, consulta, filtra, edita, desativa, reativa e redefine senha;
- aluno consulta e edita o próprio perfil;
- na edição própria, o e-mail não é alterado;
- aluno só altera sua senha após confirmar a senha atual;
- filtros inválidos de curso ou turma são ignorados na listagem, preservando a busca geral;
- a busca administrativa verifica nome, e-mail e telefone.

### 9.2 Categorias

- nome é único e normalizado para maiúsculas;
- exclusão comum é lógica;
- exclusão permanente é recusada quando a categoria possui livros.

### 9.3 Livros e estoque

- a criação define disponível = total;
- reserva reduz disponível em uma unidade;
- cancelamento, devolução ou expiração libera o exemplar;
- total nunca pode ficar abaixo do número de exemplares ocupados;
- aumento de estoque promove entradas da fila enquanto houver unidades;
- a atualização e o ajuste usam transação e bloqueio pessimista do livro;
- livros desativados deixam de aparecer nas consultas normais.

### 9.4 Reservas

- um aluno não pode manter duas reservas ativas do mesmo livro;
- status considerados ativos: `REQUESTED`, `APPROVED` e `PICKED_UP`;
- prazo de retirada: 2 dias;
- sem estoque, `POST /reservations` insere automaticamente o aluno na fila;
- somente o proprietário ou o administrador consulta uma reserva individual;
- somente o proprietário cancela sua reserva;
- cancelamento é permitido apenas em `REQUESTED` ou `APPROVED`;
- administrador registra retirada e devolução;
- como não existe endpoint separado de aprovação, a retirada aceita `REQUESTED` e `APPROVED`;
- devolução exige `PICKED_UP`;
- vencimentos são processados a cada 15 minutos.

### 9.5 Lista de espera

- entrada direta só é permitida quando não há estoque;
- aluno não pode possuir duas entradas ativas para o mesmo livro;
- posições começam em 1;
- cancelamento reordena as posições restantes;
- ao liberar um exemplar, o primeiro `WAITING` é convertido para `RESERVED` e uma reserva `REQUESTED` é criada;
- quando alguém da fila é promovido, o exemplar permanece comprometido e não aumenta a quantidade disponível.

## 10. Endpoints

Prefixo global: `/api`.

### 10.1 Autenticação

| Método | Rota | Acesso | Resposta/Função |
|---|---|---|---|
| POST | `/auth/login` | Público | Cria sessão e retorna o perfil. |
| POST | `/auth/logout` | Público | Destrói a sessão; `204`. |

### 10.2 Administradores e alunos

| Método | Rota | Acesso | Função |
|---|---|---|---|
| POST | `/admins` | Admin | Cadastra administrador. |
| POST | `/students` | Admin | Cadastra aluno. |
| GET | `/students` | Admin | Lista e filtra alunos. |
| GET | `/students/:id` | Admin | Consulta aluno, inclusive inativo. |
| PUT | `/students/:id` | Admin | Atualiza aluno. |
| PATCH | `/students/:id/password` | Admin | Redefine senha. |
| PATCH | `/students/:id/reactivate` | Admin | Reativa aluno; `204`. |
| DELETE | `/students/:id` | Admin | Desativa aluno; `204`. |
| GET | `/students/me` | Aluno | Consulta perfil próprio. |
| PUT | `/students/me` | Aluno | Atualiza perfil próprio. |
| PATCH | `/students/me/password` | Aluno | Altera senha após validar a atual; `204`. |

Parâmetros de `GET /students`:

| Parâmetro | Tipo | Função |
|---|---|---|
| `query` | texto | Busca em nome, e-mail e telefone. |
| `includeInactive` | `true`/`false` | Inclui alunos desativados. |
| `course` | texto | Filtra por curso aceito. |
| `schoolClass` | texto | Filtra por turma aceita. |

### 10.3 Categorias

Todas as rotas exigem autenticação; mutações exigem administrador.

| Método | Rota | Acesso | Função |
|---|---|---|---|
| GET | `/categories` | Autenticado | Lista categorias ativas. |
| GET | `/categories/search?name=` | Autenticado | Pesquisa pelo nome sem diferenciar maiúsculas. |
| GET | `/categories/:id` | Autenticado | Consulta categoria. |
| POST | `/categories` | Admin | Cadastra categoria. |
| PUT | `/categories/:id` | Admin | Atualiza categoria. |
| DELETE | `/categories/:id` | Admin | Desativa; `204`. |
| DELETE | `/categories/:id/permanent` | Admin | Exclui definitivamente; `204`. |

### 10.4 Livros

| Método | Rota | Acesso | Função |
|---|---|---|---|
| GET | `/books` | Autenticado | Lista livros ativos. |
| GET | `/books/:id` | Autenticado | Consulta livro. |
| POST | `/books` | Admin | Cadastra livro. |
| PUT | `/books/:id` | Admin | Atualiza livro, preservando ISBN. |
| PATCH | `/books/:id/stock` | Admin | Define novo estoque total. |
| DELETE | `/books/:id` | Admin | Desativa; `204`. |

### 10.5 Reservas

| Método | Rota | Acesso | Função |
|---|---|---|---|
| POST | `/reservations` | Aluno | Reserva ou entra automaticamente na fila. |
| GET | `/reservations/me` | Aluno | Lista reservas próprias. |
| PATCH | `/reservations/:id/cancel` | Aluno | Cancela reserva própria. |
| GET | `/reservations` | Admin | Lista todas as reservas ativas logicamente. |
| GET | `/reservations/:id` | Proprietário/Admin | Consulta reserva individual. |
| PATCH | `/reservations/:id/pickup` | Admin | Registra retirada. |
| PATCH | `/reservations/:id/return` | Admin | Registra devolução. |

Quando não há estoque, `POST /reservations` retorna:

```json
{
  "fila": true,
  "mensagem": "Não há exemplares disponíveis no momento. Você foi inserido na lista de espera com sucesso!"
}
```

### 10.6 Lista de espera

| Método | Rota | Acesso | Função |
|---|---|---|---|
| POST | `/waiting-list` | Aluno | Entra diretamente na fila. |
| GET | `/waiting-list/me` | Aluno | Lista posições próprias. |
| PATCH | `/waiting-list/:id/cancel` | Aluno | Cancela posição própria. |
| GET | `/waiting-list` | Admin | Lista todas as entradas. |
| GET | `/waiting-list/:id` | Autenticado | Consulta entrada. |

## 11. Contratos JSON

### 11.1 Administrador

Entrada:

```json
{"name":"Nome","email":"admin@ete.br","password":"senha123"}
```

### 11.2 Aluno

Cadastro:

```json
{
  "name":"Maria Silva",
  "email":"maria@ete.br",
  "password":"senha123",
  "course":"Desenvolvimento de Sistemas",
  "schoolClass":"1º ano A",
  "phone":"(81) 99999-9999"
}
```

Saída:

```json
{
  "id":"uuid",
  "name":"Maria Silva",
  "email":"maria@ete.br",
  "course":"Desenvolvimento de Sistemas",
  "schoolClass":"1º ano A",
  "phone":"(81) 99999-9999",
  "active":true
}
```

Alteração de senha própria:

```json
{"currentPassword":"senha-antiga","newPassword":"senha-nova"}
```

Redefinição pelo administrador:

```json
{"newPassword":"senha-nova"}
```

### 11.3 Categoria

```json
{"name":"Romance","description":"Romances nacionais e estrangeiros"}
```

### 11.4 Livro

```json
{
  "title":"Dom Casmurro",
  "author":"Machado de Assis",
  "publisher":"Editora Exemplo",
  "isbn":"9781234567890",
  "publicationYear":1899,
  "totalQuantity":5,
  "qrcodeUrl":"https://exemplo/qrcode",
  "categoryId":"uuid-da-categoria"
}
```

Ajuste de estoque:

```json
{"newTotalQuantity":8,"reason":"Aquisição de novos exemplares"}
```

### 11.5 Reserva e fila

Entrada:

```json
{"bookId":"uuid-do-livro"}
```

Saída de reserva:

```json
{
  "id":"uuid",
  "createdAt":"2026-09-01T10:00:00.000Z",
  "pickupDeadline":"2026-09-03T10:00:00.000Z",
  "pickupDate":null,
  "returnDate":null,
  "status":"REQUESTED",
  "student":{"id":"uuid","name":"Maria","email":"maria@ete.br"},
  "book":{"id":"uuid","title":"Dom Casmurro","author":"Machado de Assis","isbn":"9781234567890"}
}
```

Saída de fila:

```json
{
  "id":"uuid",
  "position":1,
  "status":"WAITING",
  "createdAt":"2026-09-01T10:00:00.000Z",
  "notifiedAt":null,
  "student":{"id":"uuid","name":"Maria","email":"maria@ete.br"},
  "book":{"id":"uuid","title":"Dom Casmurro","author":"Machado de Assis","isbn":"9781234567890"}
}
```

## 12. Validação e erros

O `ValidationPipe` global usa:

- remoção de propriedades não declaradas (`whitelist`);
- transformação de entrada (`transform`);
- DTOs com validações de e-mail, UUID, texto, inteiros, mínimos e ISBN.

Formato padrão:

```json
{
  "timestamp":"2026-09-01T10:00:00.000Z",
  "status":400,
  "erro":"Dados Inválidos",
  "mensagem":"E-mail inválido.",
  "path":"/api/students"
}
```

| Código | Título padrão | Situação |
|---:|---|---|
| 400 | `Dados Inválidos` | Entrada inválida ou ação não permitida. |
| 401 | `Não Autorizado` | Sessão ausente, credenciais ou senha atual incorretas. |
| 403 | `Acesso Negado` | Perfil sem permissão ou acesso a recurso alheio. |
| 404 | `Recurso Não Encontrado` | UUID não localizado. |
| 409 | `Conflito` | Duplicidade ou regra de estoque/circulação. |
| 429 | `Limite Excedido` | Mais de 60 requisições no minuto. |
| 500 | `Erro Interno` | Falha não tratada. |

## 13. Transações e concorrência

Operações críticas usam `DataSource.transaction`:

- criação de reserva;
- entrada na fila;
- ajuste de estoque;
- cancelamento de reserva;
- devolução;
- cancelamento de fila;
- expiração de reservas;
- promoção da fila.

O livro é carregado com bloqueio pessimista durante alterações de disponibilidade. Isso impede duas solicitações simultâneas de consumirem o mesmo último exemplar.

A promoção da fila, a criação da nova reserva e a atualização do estoque acontecem na mesma transação.

## 14. Tarefa agendada

`CirculacaoService.expirar` executa pelo cron:

```text
0 */15 * * * *
```

Ou seja, a cada 15 minutos. Reservas `REQUESTED` ou `APPROVED` cujo prazo passou tornam-se `EXPIRED`. O exemplar é liberado ou atribuído ao próximo aluno da fila.

## 15. Testes e qualidade

Comandos:

```powershell
npm run format
npm run build
npm run lint
npm test
```

Estado validado em 1º de setembro de 2026:

- compilação NestJS: aprovada;
- Oxlint: aprovado sem avisos;
- Vitest: 1 arquivo e 3 testes aprovados;
- contratos verificados: aluno, livro e reserva.

Os testes atuais são unitários de compatibilidade de saída. Ainda é recomendável acrescentar testes de integração com PostgreSQL para concorrência, sessão, estoque e promoção da fila.

## 16. Scripts npm

| Script | Função |
|---|---|
| `npm run build` | Compila o NestJS. |
| `npm run start` | Inicia a aplicação. |
| `npm run start:dev` | Inicia com observação de arquivos. |
| `npm run start:debug` | Inicia em modo de depuração. |
| `npm run start:prod` | Executa `dist/main`. |
| `npm run format` | Formata os arquivos TypeScript. |
| `npm run lint` | Executa Oxlint. |
| `npm test` | Executa testes Vitest. |
| `npm run test:watch` | Mantém os testes em observação. |
| `npm run test:cov` | Gera cobertura. |

## 17. Diferenças conscientes em relação ao Java

- a implementação interna foi traduzida para português do Brasil;
- os contratos HTTP e os valores persistidos continuam compatíveis;
- sessões são armazenadas na tabela `tb_session`, não na memória padrão do Spring;
- retirada aceita reserva `REQUESTED` ou `APPROVED`, pois não há endpoint de aprovação no contrato original;
- quando a reserva automática entra na fila, a resposta é um JSON de sucesso indicando `fila: true`;
- o limite de requisições é mantido em memória por processo;
- envio de e-mail não foi conectado nesta versão; a promoção da fila e a criação da reserva acontecem normalmente, mas sem notificação externa;
- o esquema é sincronizado pelo TypeORM em desenvolvimento; produção deve usar sincronização desativada e migrações controladas.

## 18. Limitações e próximos passos recomendados

1. Criar migrações TypeORM e definir `DATABASE_SYNCHRONIZE=false` em produção.
2. Implementar testes e2e com PostgreSQL isolado.
3. Integrar serviço de e-mail para avisos de promoção da fila.
4. Mover o rate limit para armazenamento compartilhado caso a API use várias réplicas.
5. Adicionar documentação OpenAPI/Swagger.
6. Definir rotação e política de expiração do `SESSION_SECRET`.
7. Adicionar observabilidade estruturada, métricas e auditoria administrativa.
8. Incluir limpeza periódica das sessões e tentativas de acesso antigas.

## 19. Resumo operacional

- API: `http://localhost:8080/api`;
- frontend padrão: `http://localhost:3000`;
- autenticação: sessão HTTP;
- cookie: `JSESSIONID`;
- banco: PostgreSQL 16;
- ORM: TypeORM;
- expiração de reserva: a cada 15 minutos;
- prazo de retirada: 2 dias;
- bloqueio de login: 5 falhas por 15 minutos;
- limite: 60 requisições/minuto;
- exclusão normal: lógica;
- idioma da implementação e mensagens: português do Brasil.
