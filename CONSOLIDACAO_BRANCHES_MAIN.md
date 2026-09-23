# CONSOLIDAÇÃO DE BRANCHES → MAIN

## Biblioteca Virtual — ETE Integrado

**Repositório:** `Default-Coders/libraryapi-app-build`

**Objetivo:** consolidar as melhorias existentes nas branches do projeto em uma `main` organizada, funcional e coerente com o estado atual do projeto.

---

# 1. OBJETIVO

Este documento define o plano para analisar e consolidar as diferentes branches do repositório na `main`.

A consolidação não deve ser tratada como:

> "fazer merge de todas as branches".

O objetivo é:

> **identificar o que cada branch possui de relevante, preservar melhorias válidas, eliminar duplicações/legado e estabelecer uma MAIN coerente como nova referência do projeto.**

A `main` resultante deve representar o estado mais confiável do projeto.

---

# 2. PRINCÍPIO DA CONSOLIDAÇÃO

A regra principal será:

```text
BRANCH
   ↓
ANALISAR
   ↓
IDENTIFICAR MELHORIAS
   ↓
VALIDAR COMPATIBILIDADE
   ↓
DECIDIR
   ↓
INCORPORAR NA MAIN
```

Não realizar merges cegos.

Uma branch pode conter:

* funcionalidades úteis;
* correções;
* melhorias de arquitetura;
* documentação;
* código experimental;
* código duplicado;
* código antigo;
* alterações incompatíveis;
* configurações temporárias.

Somente o que for considerado válido deve chegar à `main`.

---

# 3. ESTADO ATUAL DA MAIN

A `main` atualmente representa um backend NestJS.

A estrutura pública observada inclui:

* `src/`
* `backups/`
* `.env.example`
* `Dockerfile`
* `docker-compose.yml`
* `typeorm-datasource.ts`
* `vitest.config.ts`
* `vitest.config.e2e.ts`
* `package.json`
* configurações TypeScript;
* documentação do backend;
* documentação de restauração do banco.

O README identifica o projeto como:

> Backend NestJS — Biblioteca da ETE Integral

e informa utilização de:

* NestJS;
* TypeORM;
* PostgreSQL;
* autenticação baseada em sessão HTTP persistida no banco.

A execução é prevista tanto via Docker quanto diretamente com Node.js.

---

# 4. BRANCH COM BACKEND + FRONTEND

## ⚠️ PONTO IMPORTANTE

Foi identificada uma branch que possui simultaneamente:

```text
backend/
frontend/
```

Essa branch deve receber atenção especial durante a consolidação.

Ela não deve ser simplesmente tratada como:

> "mais uma branch de backend".

Sua estrutura indica uma possível tentativa de reunir as duas partes da aplicação em um único espaço de desenvolvimento.

---

# 5. ANÁLISE DA BRANCH BACKEND + FRONTEND

A existência das pastas:

```text
backend/
frontend/
```

deve ser analisada antes de qualquer merge.

É necessário verificar:

### Backend

* qual versão do NestJS está presente;
* estrutura de módulos;
* entidades;
* controllers;
* services;
* autenticação;
* sessões;
* TypeORM;
* variáveis de ambiente;
* CORS;
* banco;
* testes;
* Docker;
* documentação.

### Frontend

* framework utilizado;
* estrutura do projeto;
* páginas;
* componentes;
* autenticação;
* consumo da API;
* variáveis de ambiente;
* responsividade;
* design;
* funcionalidades do aluno;
* funcionalidades do administrador;
* GSAP;
* recuperação de senha;
* demais features.

---

# 6. NÃO TRANSFORMAR AUTOMATICAMENTE A MAIN EM MONOREPO

A existência de:

```text
backend/
frontend/
```

não significa automaticamente que a `main` deva adotar essa estrutura.

Antes de incorporar essa organização, verificar:

* se o backend atual já possui repositório próprio;
* se o frontend já possui repositório próprio;
* se o deploy atual espera projetos separados;
* se Railway está configurado para o backend;
* se Vercel está configurado para o frontend;
* se a equipe trabalha com os dois projetos separadamente;
* se a branch representa apenas uma cópia de integração/teste.

---

# 7. DECISÃO ARQUITETURAL

A decisão sobre `backend/ + frontend/` deve ser registrada explicitamente.

## Opção A — Manter separados

```text
lib-backend
lib-frontend
```

Vantagens:

* deploy independente;
* responsabilidades separadas;
* desenvolvimento independente;
* Railway pode cuidar do backend;
* Vercel pode cuidar do frontend;
* menor acoplamento.

Essa opção deve ser considerada especialmente porque o projeto atual já possui essa separação.

---

## Opção B — Monorepo

```text
libraryapi-app-build/
│
├── backend/
└── frontend/
```

Pode ser adotada somente se a equipe realmente quiser trabalhar com
monorepo.

Nesse caso deverão ser definidos:

* scripts raiz;
* gerenciamento de dependências;
* comandos independentes;
* builds;
* deploy;
* variáveis de ambiente;
* documentação;
* CI/CD;
* responsabilidades.

---

# 8. REGRA PARA A BRANCH BACKEND + FRONTEND

Não fazer merge integral automaticamente.

Primeiro realizar:

```text
BACKEND DA BRANCH
       ↓
comparar com backend atual

FRONTEND DA BRANCH
       ↓
comparar com frontend atual
```

Depois:

```text
melhorias válidas
       ↓
integração controlada
```

Isso evita que uma estrutura experimental substitua uma estrutura atualmente
mais estável.

---

# 9. MATRIZ DE ANÁLISE DAS BRANCHES

Cada branch deverá ser classificada conforme:

| Categoria       | Pergunta                                        |
| --------------- | ----------------------------------------------- |
| Funcionalidade  | O que essa branch adiciona?                     |
| Correção        | Qual problema ela resolve?                      |
| UX              | Existe melhoria de experiência?                 |
| Design          | Existe melhoria visual?                         |
| Backend         | Existem alterações de API?                      |
| Frontend        | Existem alterações de interface?                |
| Banco           | Existem alterações de schema/dados?             |
| Segurança       | Existem alterações de autenticação/autorização? |
| Deploy          | Existem alterações de infraestrutura?           |
| Documentação    | Existem documentos novos/atualizados?           |
| Testes          | Existem testes novos?                           |
| Risco           | O que pode quebrar?                             |
| Compatibilidade | Funciona com o estado atual?                    |

---

# 10. CLASSIFICAÇÃO DAS ALTERAÇÕES

Cada alteração encontrada deve receber uma classificação.

## INCORPORAR

Alteração válida e compatível.

---

## INCORPORAR COM AJUSTES

A ideia é válida, mas o código precisa ser adaptado.

---

## ANALISAR

Não há informação suficiente para decidir.

---

## NÃO INCORPORAR

Código desnecessário, antigo, duplicado ou incompatível.

---

## BACKLOG

Ideia válida, mas não prioritária para a consolidação atual.

---

# 11. BACKEND

A consolidação do backend deve preservar a migração atual para NestJS.

O projeto não deve retornar ao modelo antigo de Spring Boot.

A arquitetura atual deve ser considerada a referência.

---

# 12. AUTENTICAÇÃO E SESSÃO

A `main` atual documenta autenticação baseada em sessão HTTP persistida
no banco.

Qualquer branch que utilize outro modelo de autenticação deve ser analisada
antes de integração.

Não substituir autenticação funcional simplesmente porque uma branch utiliza
uma abordagem diferente.

---

# 13. BANCO DE DADOS

Alterações relacionadas ao banco devem ser analisadas individualmente.

Verificar:

* entidades;
* relacionamentos;
* migrations;
* seeds;
* backups;
* nomes de tabelas;
* compatibilidade com o banco existente;
* alterações destrutivas.

---

# 14. TYPEORM

A configuração do TypeORM deve ser analisada especialmente quando uma branch
alterar:

* entities;
* migrations;
* datasource;
* synchronize;
* conexão;
* PostgreSQL.

Configurações de desenvolvimento não devem ser promovidas automaticamente
para produção.

---

# 15. DATABASE_SYNCHRONIZE

A `main` atualmente documenta:

```env
DATABASE_SYNCHRONIZE=true
```

no `.env.example`.

Isso deve ser revisado durante a consolidação.

A configuração deve ser separada conforme o ambiente.

Produção não deve depender de sincronização automática do schema sem uma
decisão explícita da equipe.

---

# 16. VARIÁVEIS DE AMBIENTE

Todas as branches devem ser verificadas em relação às variáveis:

```text
DATABASE_URL
DATABASE_USER
DATABASE_PASSWORD
DATABASE_SYNCHRONIZE
ALLOWED_ORIGINS
SESSION_SECRET
PORT
NODE_ENV
```

Qualquer variável encontrada em uma branch deve ser:

1. documentada;
2. validada;
3. comparada;
4. incorporada somente se necessária.

---

# 17. FRONTEND

O frontend deve ser analisado separadamente do backend.

Verificar:

* rotas;
* componentes;
* páginas;
* autenticação;
* chamadas HTTP;
* URL da API;
* variáveis de ambiente;
* dashboards;
* responsividade;
* design;
* animações;
* recuperação de senha;
* funcionalidades do aluno;
* funcionalidades do administrador.

---

# 18. FRONTEND + BACKEND

Sempre que uma branch modificar ambos os lados, verificar se as alterações
são compatíveis.

Exemplo:

```text
Backend
GET /livros
        ↓
Frontend
GET /books
```

Uma mudança de endpoint não pode ser incorporada sem verificar o consumidor.

---

# 19. ROTAS

Durante a consolidação, verificar consistência dos nomes das rotas.

Quando apropriado, priorizar a nomenclatura definida para o projeto atual.

Exemplo:

```text
/books
```

versus:

```text
/livros
```

Não alterar apenas por preferência.

Qualquer alteração deve considerar:

* frontend;
* documentação;
* testes;
* integrações;
* compatibilidade.

---

# 20. DESIGN E UX

Alterações visuais encontradas nas branches devem ser avaliadas em conjunto
com:

```text
GUIA_VISUAL_UX_V1.md
```

O Guia Visual/UX passa a funcionar como referência para decidir se uma
melhoria visual está alinhada à identidade atual.

---

# 21. GSAP

Alterações relacionadas ao GSAP devem ser avaliadas com cuidado.

A regra do projeto permanece:

```text
FEATURE FUNCIONAL
       ↓
VALIDAÇÃO
       ↓
DESIGN
       ↓
GSAP
```

Não incorporar animações apenas porque uma branch possui animações.

Avaliar:

* necessidade;
* desempenho;
* responsividade;
* acessibilidade;
* manutenção.

---

# 22. RESPONSIVIDADE

Toda alteração de frontend deve ser validada em:

* desktop;
* tablet;
* mobile.

Não considerar uma feature concluída somente porque funciona em desktop.

---

# 23. RECUPERAÇÃO DE SENHA

Caso alguma branch possua implementação de recuperação de senha, ela deve
ser analisada como feature própria.

Verificar:

* fluxo;
* backend;
* frontend;
* tokens;
* expiração;
* segurança;
* mensagens;
* integração com email;
* compatibilidade com autenticação atual.

Se a implementação estiver funcional e compatível, registrar como possível
melhoria para incorporação.

---

# 24. BOT / EMAIL

Alterações relacionadas ao bot ou envio de email devem ser separadas da
interface visual.

O projeto deve preservar a separação entre:

```text
Lógica do bot
       ↓
serviço de email
       ↓
template HTML
```

Não misturar lógica de email com componentes do frontend.

---

# 25. DOCKER

Docker deve ser analisado como ferramenta de execução/deploy, não como
obrigatoriedade para todos os desenvolvedores.

A arquitetura deve continuar permitindo desenvolvimento local com Node.js.

A `main` atual já documenta as duas possibilidades:

```text
Docker
```

e:

```text
Node.js local
```

Essa flexibilidade deve ser preservada.

---

# 26. DEPLOY

Qualquer alteração de deploy encontrada nas branches deve ser comparada
com a estratégia atual do projeto.

Considerar:

```text
Frontend → Vercel

Backend → Railway

Banco → Supabase
```

Alterações antigas voltadas a plataformas que não fazem mais parte da
estratégia atual devem ser tratadas como legado, salvo decisão contrária.

---

# 27. DOCUMENTAÇÃO

Documentos importantes encontrados nas branches não devem ser descartados
automaticamente.

Avaliar:

* CONTEXTO;
* planos;
* instruções;
* documentação de banco;
* documentação de deploy;
* documentação de API.

Documentação duplicada deve ser consolidada.

---

# 28. CÓDIGO LEGADO

Código antigo não deve entrar na `main` simplesmente porque ainda compila.

Perguntar:

* ainda é utilizado?
* ainda representa a arquitetura atual?
* existe substituto?
* existe dependência?
* está documentado?
* está testado?

Se não possuir utilidade atual, marcar para remoção ou arquivamento.

---

# 29. DUPLICAÇÃO

Se duas branches possuem a mesma funcionalidade implementada de maneiras
diferentes, não fazer merge das duas.

Escolher uma implementação após análise técnica.

Registrar:

```text
Implementação A
Implementação B
Decisão
Justificativa
```

---

# 30. CONFLITOS

Conflitos não devem ser resolvidos apenas escolhendo:

> "ours"

ou:

> "theirs".

Cada conflito deve responder:

1. Qual implementação é mais atual?
2. Qual está funcional?
3. Qual possui menos acoplamento?
4. Qual está alinhada à arquitetura atual?
5. Qual possui testes?
6. Qual afeta frontend/backend?
7. Qual exige menos retrabalho?

---

# 31. ORDEM DE CONSOLIDAÇÃO

A ordem recomendada é:

```text
1. Identificar branches
        ↓
2. Catalogar alterações
        ↓
3. Comparar com MAIN
        ↓
4. Identificar dependências
        ↓
5. Separar melhorias de legado
        ↓
6. Validar backend
        ↓
7. Validar frontend
        ↓
8. Validar banco
        ↓
9. Validar integração
        ↓
10. Validar testes
        ↓
11. Integrar
        ↓
12. Testar novamente
        ↓
13. Atualizar documentação
        ↓
14. Consolidar MAIN
```

---

# 32. NÃO FAZER

Não:

* fazer merge de todas as branches de uma vez;
* sobrescrever a `main` inteira;
* apagar funcionalidades sem análise;
* importar `.env` real;
* importar credenciais;
* importar `node_modules`;
* misturar código experimental;
* assumir que código mais recente é necessariamente melhor;
* tratar documentação antiga como verdade atual;
* alterar arquitetura sem registrar a decisão.

---

# 33. SEGURANÇA

Durante a consolidação verificar:

* `.env`;
* secrets;
* tokens;
* senhas;
* chaves;
* credenciais;
* arquivos de configuração.

Nenhuma credencial real deve entrar na `main`.

Somente exemplos devem permanecer versionados.

---

# 34. TESTES

Antes de finalizar a consolidação:

### Backend

* [ ] build;
* [ ] testes unitários;
* [ ] testes E2E;
* [ ] lint;
* [ ] conexão com banco;
* [ ] autenticação;
* [ ] endpoints principais.

### Frontend

* [ ] build;
* [ ] login;
* [ ] cadastro;
* [ ] recuperação de senha, se implementada;
* [ ] consulta de livros;
* [ ] detalhes;
* [ ] reserva;
* [ ] dashboard;
* [ ] responsividade.

### Integração

* [ ] frontend conversa com backend;
* [ ] CORS;
* [ ] variáveis de ambiente;
* [ ] autenticação;
* [ ] sessões;
* [ ] respostas da API.

---

# 35. DEFINITION OF DONE DA CONSOLIDAÇÃO

A consolidação somente poderá ser considerada concluída quando:

* [ ] todas as branches relevantes tiverem sido analisadas;
* [ ] alterações importantes tiverem sido catalogadas;
* [ ] branch `backend/ + frontend/` tiver sido analisada separadamente;
* [ ] nenhuma alteração importante tiver sido incorporada sem avaliação;
* [ ] backend estiver funcional;
* [ ] frontend estiver funcional;
* [ ] integração estiver funcional;
* [ ] banco estiver compatível;
* [ ] testes principais estiverem executados;
* [ ] não existirem credenciais reais versionadas;
* [ ] documentação estiver atualizada;
* [ ] arquitetura estiver coerente;
* [ ] deploy não tiver sido quebrado;
* [ ] `main` puder ser considerada a nova referência do projeto.

---

# 36. RESULTADO ESPERADO

A `main` final deve representar:

```text
             MAIN
              │
      ┌───────┼────────┐
      ↓       ↓        ↓
 Backend   Frontend   Docs
      │       │        │
      └───────┼────────┘
              ↓
        Sistema integrado
              ↓
          Testado
              ↓
          Documentado
```

O objetivo não é preservar todas as linhas de código existentes nas branches.

O objetivo é preservar:

> **as melhores decisões válidas do projeto.**

---

# 37. REGRA ESPECIAL — BRANCH BACKEND + FRONTEND

Esta branch deve permanecer registrada na análise mesmo que sua estrutura
não seja adotada.

Ela pode ser valiosa por conter:

* funcionalidades do backend;
* funcionalidades do frontend;
* integração entre as duas partes;
* alterações que podem não existir isoladamente em outras branches.

Por isso:

> **não apagar nem descartar essa branch antes da análise comparativa.**

Ela deve ser utilizada como fonte de comparação.

---

# 38. ESTRUTURA FINAL RECOMENDADA

Após a consolidação, a equipe deve decidir explicitamente entre:

### Estrutura separada

```text
lib-backend
lib-frontend
```

ou:

### Monorepo

```text
libraryapi-app-build
│
├── backend/
└── frontend/
```

A escolha deve ser registrada em documentação arquitetural.

Não deve acontecer simplesmente como consequência de um merge.

---

# 39. DOCUMENTOS RELACIONADOS

A consolidação deve considerar, quando aplicável:

```text
GUIA_VISUAL_UX_V1.md
DEFINITION_OF_DONE.md
CONTEXTO_BACKEND.md
PLANO_DE_TRABALHO_BACKEND_NESTJS_v2.md
PLANO_RESTAURACAO_BANCO_SUPABASE.md
```

Esses documentos não possuem necessariamente a mesma finalidade.

Cada um deve permanecer responsável por seu próprio assunto.

---

# 40. RESULTADO FINAL

Ao término do processo:

```text
BRANCHES
   ↓
ANÁLISE
   ↓
COMPARAÇÃO
   ↓
SELEÇÃO DAS MELHORIAS
   ↓
INTEGRAÇÃO
   ↓
TESTES
   ↓
DOCUMENTAÇÃO
   ↓
MAIN CONSOLIDADA
```

A `main` passa então a ser:

> **a referência oficial do estado consolidado do projeto.**

Branches antigas podem permanecer no GitHub para histórico, auditoria ou
recuperação.

Não é necessário apagar branches imediatamente após a consolidação.

---

# STATUS

**Documento:** `CONSOLIDACAO_BRANCHES_MAIN.md`

**Projeto:** Biblioteca Virtual — ETE Integrado

**Finalidade:** Planejamento da consolidação das branches na MAIN

**Regra principal:** não realizar merge cego.

**Ponto especial:** branch contendo `backend/` e `frontend/` deve ser
analisada separadamente antes de qualquer decisão sobre monorepo ou
separação dos projetos.
