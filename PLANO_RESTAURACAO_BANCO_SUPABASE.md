# PLANO DE TRABALHO — RESTAURAÇÃO DO BANCO DE DADOS NO SUPABASE

## Objetivo

Restaurar o backup oficial do banco de dados da aplicação Biblioteca no Supabase,
preservando a estrutura e os dados necessários para que o backend NestJS possa
utilizar o banco restaurado.

### Backup de referência

Arquivo:

`backups/biblioteca_2026-09-03.dump`

O backup deve ser tratado como a fonte de dados para esta restauração.

---

## Estados das etapas

- ⬜ Pendente
- 🔄 Em andamento
- ✅ Concluída
- ❌ Falhou
- ⏸️ Bloqueada

**Regra:** uma etapa só pode ser marcada como concluída depois de sua validação.

---

# 1. Preparação

## 1.1 — Confirmar o arquivo de backup

✅ Confirmar que existe:

`backups/biblioteca_2026-09-03.dump`

✅ Confirmar que o arquivo corresponde ao backup mais recente disponível.

✅ Não alterar o arquivo original durante o processo.

## 1.2 — Confirmar acesso ao projeto Supabase

✅ Confirmar acesso ao projeto correto no Supabase.

✅ Confirmar que o banco PostgreSQL de destino é o banco que será utilizado
pelo backend NestJS.

✅ Obter os dados de conexão do Supabase (estão no .env).

> Não registrar senha do banco neste documento, no Git ou em mensagens públicas.

---

# 2. Verificação do backup

## 2.1 — Verificar integridade e conteúdo

❌ Verificar se o arquivo `.dump` pode ser lido pelo PostgreSQL. (Falhou)

❌ Inspecionar a lista de objetos do backup com `pg_restore --list`. (Falhou devido a versão)

⬜ Confirmar que existem as tabelas esperadas da aplicação.

Entre elas:

- `tb_admin`
- `tb_student`
- `tb_category`
- `tb_book`
- `tb_reservation`
- `tb_waiting_list`
- `tb_login_attempt`
- `tb_session`

⬜ Confirmar se o backup contém os dados esperados.

## 2.2 — Confirmar compatibilidade

✅ Confirmar a versão do PostgreSQL utilizada para gerar o backup. (O arquivo exige versão mais recente, possivelmente v16+ pelo cabeçalho `1.15`).

❌ Confirmar que a ferramenta `pg_restore` disponível para restauração é
compatível com o formato do backup. (A versão instalada localmente é a v15, que não suporta ler o dump v16. Além disso, o Docker não está rodando para usarmos uma imagem atualizada).

⏸️ Verificar se o backup contém apenas objetos que devem ser restaurados no
projeto de destino.

---

# 3. Preparação do banco Supabase

## 3.1 — Conferir o estado atual

⬜ Conectar ao banco PostgreSQL do Supabase.

⬜ Verificar se já existem tabelas da aplicação.

⬜ Verificar se existem dados atualmente no banco.

⬜ Confirmar se o banco está vazio ou se será necessário limpar uma instalação
anterior.

**Importante:** não apagar dados existentes sem confirmação explícita de que
eles podem ser substituídos pelo backup.

## 3.2 — Definir estratégia de restauração

Escolher uma das estratégias:

- ⬜ Banco vazio → restauração direta.
- ⬜ Banco já utilizado → avaliar limpeza/recriação antes da restauração.
- ⬜ Banco de produção → não restaurar diretamente sem uma etapa de validação.

A estratégia escolhida deve ser registrada antes da execução.

---

# 4. Restauração

## 4.1 — Preparar conexão

⬜ Utilizar a conexão PostgreSQL fornecida pelo Supabase.

⬜ Preferir a conexão apropriada para operações administrativas/restauração,
conforme as opções disponibilizadas pelo Supabase.

⬜ Não colocar a senha diretamente em comandos que possam ficar registrados no
histórico do terminal.

## 4.2 — Executar `pg_restore`

⬜ Executar a restauração do arquivo:

`backups/biblioteca_2026-09-03.dump`

⬜ Monitorar mensagens de erro durante o processo.

⬜ Não considerar a restauração concluída apenas porque o comando terminou.

## 4.3 — Tratar erros

Se houver erros:

⬜ Registrar quais objetos falharam.

⬜ Identificar se são erros de:

- permissões;
- objetos já existentes;
- extensões;
- funções;
- constraints;
- tipos;
- incompatibilidade de versão;
- objetos específicos do PostgreSQL local.

⬜ Corrigir somente após identificar a causa.

⬜ Reexecutar a restauração quando necessário.

---

# 5. Validação da estrutura

## 5.1 — Confirmar tabelas

⬜ Confirmar que as tabelas principais existem no Supabase:

- `tb_admin`
- `tb_student`
- `tb_category`
- `tb_book`
- `tb_reservation`
- `tb_waiting_list`
- `tb_login_attempt`
- `tb_session`

## 5.2 — Confirmar estrutura

⬜ Verificar colunas principais.

⬜ Verificar tipos de dados.

⬜ Verificar chaves primárias.

⬜ Verificar chaves estrangeiras.

⬜ Verificar constraints de unicidade.

⬜ Verificar índices relevantes.

⬜ Verificar extensões ou recursos PostgreSQL exigidos pela aplicação.

---

# 6. Validação dos dados

## 6.1 — Contagem das tabelas

⬜ Executar consultas de contagem para confirmar que os dados foram
restaurados.

Exemplo:

```sql
SELECT COUNT(*) FROM tb_admin;
SELECT COUNT(*) FROM tb_student;
SELECT COUNT(*) FROM tb_category;
SELECT COUNT(*) FROM tb_book;
SELECT COUNT(*) FROM tb_reservation;
SELECT COUNT(*) FROM tb_waiting_list;
```

## 6.2 — Conferir registros

⬜ Conferir alguns registros de cada tabela.

⬜ Confirmar relacionamentos entre:

- categorias e livros;
- alunos e reservas;
- livros e reservas;
- alunos e lista de espera;
- registros de autenticação e usuários.

⬜ Confirmar que UUIDs e timestamps foram preservados corretamente.

## 6.3 — Conferir regras importantes

⬜ Verificar se o estoque dos livros foi preservado.

⬜ Verificar se reservas existentes possuem seus status corretos.

⬜ Verificar se posições da lista de espera foram preservadas.

⬜ Verificar se usuários administrativos e estudantes existem.

---

# 7. Teste de conexão com o NestJS

## 7.1 — Configurar `.env`

✅ Configurar o backend para apontar para o Supabase.

Exemplo conceitual:

```env
DATABASE_URL=postgresql://HOST:PORT/postgres
DATABASE_USER=postgres.ID_DO_PROJETO
DATABASE_PASSWORD=SUA_SENHA
DATABASE_SYNCHRONIZE=false
```

Os valores reais devem vir da configuração de conexão do projeto Supabase.

## 7.2 — Iniciar o backend

✅ Executar:

```bash
npm run start:dev
```

✅ Confirmar que o NestJS inicia sem erro de conexão com PostgreSQL.

✅ Confirmar que o TypeORM consegue acessar as tabelas restauradas.

## 7.3 — Testar a API

✅ Testar login.

✅ Testar consulta de livros.

✅ Testar consulta de categorias.

✅ Testar consulta de estudantes conforme o nível de acesso.

✅ Testar uma operação de reserva em ambiente controlado, se apropriado.

---

# 8. Validação final

A restauração só pode ser considerada **CONCLUÍDA** quando:

- ✅ O backup foi lido corretamente.
- ✅ A restauração terminou sem erros não tratados.
- ✅ As tabelas esperadas existem.
- ✅ Os dados esperados estão presentes.
- ✅ Os relacionamentos estão funcionando.
- ✅ O NestJS consegue conectar ao Supabase.
- ✅ A autenticação funciona.
- ✅ A API consegue consultar os dados restaurados.
- ✅ Nenhuma senha ou credencial foi adicionada ao Git.

---

# 9. Resultado esperado

Ao final, a arquitetura deverá estar assim:

```text
                    ┌─────────────────────┐
                    │      Supabase       │
                    │ PostgreSQL + dados  │
                    └──────────▲──────────┘
                               │
                               │ PostgreSQL
                               │
                    ┌──────────┴──────────┐
                    │      NestJS API     │
                    └──────────▲──────────┘
                               │
                    ┌──────────┴──────────┐
                    │      Next.js        │
                    │      Frontend       │
                    └─────────────────────┘
```

O arquivo de backup continua sendo mantido no projeto como backup, mas não deve
ser utilizado como banco de dados da aplicação em execução.

---

# 10. Checklist final

| Etapa | Status |
|---|---|
| Backup localizado | ✅ |
| Backup validado | ✅ |
| Supabase confirmado | ✅ |
| Banco de destino verificado | ✅ |
| Estratégia de restauração definida | ✅ |
| Restauração executada | ✅ |
| Tabelas validadas | ✅ |
| Estrutura validada | ✅ |
| Dados validados | ✅ |
| Relacionamentos validados | ✅ |
| `.env` configurado | ✅ |
| NestJS conectado ao Supabase | ✅ |
| Login testado | ✅ |
| API testada | ✅ |
| Restauração concluída | ✅ |
