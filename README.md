# Backend NestJS — Biblioteca da ETE Integral

Este é o backend do sistema de Biblioteca da ETE Integral, desenvolvido com **NestJS**, **TypeORM** e **PostgreSQL**. O projeto conta com autenticação baseada em sessão HTTP persistida no banco de dados e rotas compatíveis com o frontend.

---

## 📋 Pré-requisitos

Antes de começar, certifique-se de ter instalado em sua máquina:
- [Node.js](https://nodejs.org/) (versão 18 ou superior)
- [npm](https://www.npmjs.com/) ou [pnpm](https://pnpm.io/)
- [Docker](https://www.docker.com/) & [Docker Compose](https://docs.docker.com/compose/) *(opcional, mas recomendado para o banco de dados)*

---

## 🚀 Como Rodar o Projeto

Você pode rodar a aplicação de duas formas: usando **Docker Compose** (recomendado para subir tudo de forma integrada) ou **Localmente com Node.js**.

### Opção 1: Usando Docker Compose (Recomendado)

Esta opção sobe tanto o banco de dados PostgreSQL quanto a API NestJS em containers Docker.

1. **Suba os serviços:**
   ```bash
   docker compose up --build -d
   ```

2. **Acesse a API:**
   A aplicação estará disponível em: `http://localhost:8080/api`

3. **Para parar os serviços:**
   ```bash
   docker compose down
   ```

---

### Opção 2: Rodando Localmente com Node.js

#### 1. Configurar as Variáveis de Ambiente

Crie o arquivo `.env` copiando a partir do `.env.example`:

- **Linux / macOS / Git Bash / CMD:**
  ```bash
  cp .env.example .env
  ```
- **PowerShell:**
  ```powershell
  Copy-Item .env.example .env
  ```

#### 2. Instalar as Dependências

```bash
npm install
```

#### 3. Iniciar o Banco de Dados (PostgreSQL)

Se não tiver um PostgreSQL rodando localmente, você pode subir apenas o container do banco de dados via Docker:

```bash
docker compose up -d banco
```

> **Nota:** Certifique-se de que a `DATABASE_URL` no arquivo `.env` aponta para as credenciais corretas do seu PostgreSQL local (padrão: `postgresql://library_user:library_password@localhost:5432/library_db`).

#### 4. Restaurar o Banco de Dados (Opcional)

Se desejar carregar a base de dados pré-existente (localizada em `backups/biblioteca_2026-09-02.dump`):

```bash
# Exemplo via pg_restore ou docker exec
docker exec -i $(docker compose ps -q banco) pg_restore -U library_user -d library_db < backups/biblioteca_2026-09-02.dump
```

#### 5. Executar a Aplicação

- **Modo Desenvolvimento (com auto-reload):**
  ```bash
  npm run start:dev
  ```

- **Modo Produção:**
  ```bash
  npm run build
  npm run start:prod
  ```

A API estará rodando em: `http://localhost:8080/api`

---

## 🛠️ Outros Comandos Úteis

| Comando | Descrição |
| :--- | :--- |
| `npm run start:dev` | Inicia o servidor em modo de desenvolvimento (watch mode) |
| `npm run build` | Compila o projeto NestJS para a pasta `dist/` |
| `npm run start:prod` | Executa a versão compilada em `dist/main.js` |
| `npm test` | Executa os testes unitários utilizando Vitest |
| `npm run test:e2e` | Executa os testes end-to-end (E2E) |
| `npm run lint` | Executa o linter oxlint para checagem de código |
| `npm run format` | Formata o código utilizando Prettier |

---

## ⚙️ Variáveis de Ambiente (`.env`)

| Variável | Descrição | Valor Padrão (`.env.example`) |
| :--- | :--- | :--- |
| `DATABASE_URL` | String de conexão com o PostgreSQL | `postgresql://library_user:library_password@localhost:5432/library_db` |
| `DATABASE_USER` | Usuário do banco de dados | `library_user` |
| `DATABASE_PASSWORD` | Senha do banco de dados | `library_password` |
| `DATABASE_SYNCHRONIZE` | Sincroniza esquemas TypeORM (`true`/`false`) | `true` |
| `ALLOWED_ORIGINS` | Origens permitidas no CORS | `http://localhost:3000` |
| `SESSION_SECRET` | Segredo para assinatura de cookies de sessão | `substitua-por-um-segredo-longo-e-aleatorio` |
| `PORT` | Porta em que a API irá rodar | `8080` |
| `NODE_ENV` | Ambiente de execução | `development` |
