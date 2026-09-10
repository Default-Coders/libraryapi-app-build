# Contexto e Arquitetura do Frontend — Biblioteca Virtual ETE

> Última atualização: 10 de setembro de 2026
> Framework: Next.js 16 (App Router) / React 19 / TypeScript
> Estilização: Tailwind CSS v4
> Animações: GSAP (GreenSock) com ScrollTrigger

Documentação da arquitetura, fluxo visual, estados, rotas e componentes do frontend.

---

## 1. Visão Geral

O frontend da Biblioteca Virtual ETE oferece uma experiência moderna de autoatendimento para estudantes e um sistema administrativo completo para os gestores da biblioteca da Escola Técnica Estadual (ETE).

A identidade visual segue o princípio de **retro-futurismo sofisticado + biblioteca digital + tecnologia**, conforme definido no GUIA_VISUAL_UX_V1.md.

---

## 2. Design System

### 2.1 Tipografia
- **Títulos (display)**: Outfit (Google Fonts) — personalidade e hierarquia clara
- **Corpo (sans)**: Inter (Google Fonts) — legibilidade máxima
- Hierarquia: título → subtítulo → conteúdo → informação secundária → ação

### 2.2 Paleta de Cores
- **Light Mode**: fundo off-white quente (`#f4f2ee`) — não branco puro
- **Dark Mode**: tons navy/slate profundos (`#0f1d2d` → `#162a3e`)
- Ambos os modos mantêm a mesma identidade visual, hierarquia e contraste

### 2.3 Princípios Visuais
- Espaço vazio como parte da identidade
- Composição equilibrada, sem excesso de cards/tabelas/botões
- Sem neon exagerado, glow excessivo ou aparência de "template genérico"
- Cada elemento visual responde a pelo menos uma das perguntas: melhora compreensão? navegação? identidade? feedback?

### 2.4 Acessibilidade
- `prefers-reduced-motion`: todas as animações e transições são desabilitadas
- Feedback visual nunca depende apenas de cor — sempre inclui ícone + texto
- Foco visível (`focus-visible`) em todos os elementos interativos
- Contraste adequado em ambos os modos

### 2.5 Micro-animações
- `fadeInUp`, `fadeIn`, `scaleIn` — keyframes CSS globais
- Classes utilitárias: `.animate-fade-in-up`, `.animate-scale-in`
- `.modal-overlay` e `.modal-content` — animações de entrada para modais
- `.card-interactive` — hover e active states para cards clicáveis
- GSAP: `.gsap-reveal`, `.gsap-reveal-left`, `.gsap-reveal-right` — revelação ao scroll

---

## 3. Pilares Visuais e de UX

1. **Favicon e Identidade Visual da ETE**: ícone e marca 100% personalizados com a logo oficial.
2. **Landing Page com Scroll Natural + GSAP**:
   - **Hero**: fullscreen com logo, título tipográfico grande com gradiente, indicador de scroll
   - **Seção Boas-Vindas**: apresentação do acervo com reveal ao scroll
   - **Seção Features**: cards de funcionalidades (Catálogo, Reservas, Lista de Espera) com stagger reveal
   - **Seção CTA**: chamada para ação com botão "Acessar o Sistema"
   - **Footer**: identidade institucional
   - **Modal de Autenticação**: sobreposição com Login e Cadastro, aberta ao clicar no CTA
3. **Notificações Animadas Globais (`react-toastify`)**: feedback visual para todas as ações.
4. **Diálogos de Confirmação Personalizados (`ConfirmModal`)**: substituição total dos `confirm()` nativos, com animação de entrada e fechamento ao clicar fora.
5. **Tema Claro / Escuro (Dark Mode)**: script de inicialização anti-flash no `<head>`.
6. **Modal de Detalhes do Livro (`BookDetailModal`)**: ao clicar em um card de livro no catálogo do aluno, abre um modal com capa, metadados completos, sinopse (quando disponível) e ação de reserva/fila.

---

## 4. Estrutura de Rotas e Telas (App Router)

### 4.1. Pública
- **`/`**: Landing Page (Hero → Boas-Vindas → Features → CTA → Footer + Modal de Auth)

### 4.2. Painel Administrativo (`/admin/*`)
- **`/admin/dashboard`**: métricas e estatísticas do acervo (livros, alunos, categorias, reservas, fila)
- **`/admin/administradores`**: gestão de contas de administradores (CRUD + reativação + redefinição de senha)
- **`/admin/alunos`**: gestão de estudantes (CRUD + filtros por curso/turma + visualização de reservas do aluno)
- **`/admin/categorias`**: gestão de categorias (CRUD + exclusão permanente)
- **`/admin/livros`**: gestão do acervo (CRUD + capas + ajuste de estoque)
- **`/admin/reservas`**: controle global de reservas e lista de espera (retiradas e devoluções)

### 4.3. Painel do Aluno (`/aluno/*`)
- **`/aluno/dashboard`**: catálogo com busca/filtros → clique abre `BookDetailModal` → reserva/fila
- **`/aluno/reservas`**: reservas ativas e posição na lista de espera, com cancelamento
- **`/aluno/perfil`**: atualização de dados pessoais e alteração de senha

---

## 5. Componentes Compartilhados

| Componente | Arquivo | Função |
|---|---|---|
| `ConfirmModal` | `confirm-modal.tsx` | Modal de confirmação com variantes (danger/warning/info) e animação |
| `BookDetailModal` | `book-detail-modal.tsx` | Modal de detalhes do livro com capa, metadados, sinopse e ação |
| `Pagination` | `pagination.tsx` | Paginação reutilizável com contagem de itens |
| `PasswordInput` | `password-input.tsx` | Input de senha com toggle de visibilidade |
| `ToastProvider` | `toast-provider.tsx` | Provider global do react-toastify |

---

## 6. Bibliotecas de Utilidade

| Arquivo | Função |
|---|---|
| `lib/api.ts` | Client REST (`apiFetch`) com tratamento de erros, `credentials: 'include'`, e redirect em 401/403 |
| `lib/auth.ts` | Gestão de estado de autenticação via cookies (`js-cookie`) |
| `lib/theme.ts` | Toggle e restauração do tema (localStorage + classe `dark` no `<html>`) |
| `lib/masks.ts` | Máscaras de formatação (telefone, ISBN) |

---

## 7. Integração com a API Backend

O client REST (`src/lib/api.ts`) consome as seguintes rotas da API NestJS:

- **Auth**: `POST /api/auth/login`, `POST /api/auth/register`, `POST /api/auth/logout`
- **Administradores**: `GET|POST|PUT|DELETE /api/admins`, `PATCH /api/admins/:id/password`, `PATCH /api/admins/:id/reactivate`
- **Alunos**: `GET|POST|PUT|DELETE /api/students`, `GET|PUT /api/students/me`, `PATCH /api/students/me/password`, `PATCH /api/students/:id/password`, `PATCH /api/students/:id/reactivate`
- **Livros**: `GET|POST|PUT|DELETE /api/books`, `PATCH /api/books/:id/stock`, `POST|DELETE /api/books/:id/cover`
- **Categorias**: `GET|POST|PUT|DELETE /api/categories`, `GET /api/categories/search`, `DELETE /api/categories/:id/permanent`
- **Reservas**: `GET|POST /api/reservations`, `GET /api/reservations/me`, `PATCH /api/reservations/:id/cancel`, `PATCH /api/reservations/:id/pickup`, `PATCH /api/reservations/:id/return`
- **Lista de Espera**: `GET|POST /api/waiting-list`, `GET /api/waiting-list/me`, `PATCH /api/waiting-list/:id/cancel`

---

## 8. GSAP — Uso Controlado

O GSAP é utilizado exclusivamente na Landing Page (`page.tsx`) com ScrollTrigger:

- **Hero**: parallax do conteúdo durante scroll, fade-in do título e subtítulo na carga
- **Seções**: `.gsap-reveal` com `ScrollTrigger` para fade-in + translateY ao entrar na viewport
- **Features**: stagger reveal dos cards
- **Respeito a `prefers-reduced-motion`**: quando ativo, todos os elementos são visíveis sem animação

Regra: **Feature primeiro, animação depois**. O GSAP complementa a interface, não compete com ela.

---

## 9. Scripts de Execução

```powershell
# Desenvolvimento
npm run dev

# Build de produção
npm run build
npm run start

# Lint
npm run lint
```

---

## 10. Itens Fora da V1 (Backlog)

- Preloader da Landing Page (depende de logo definitiva)
- Zion Flex (variações cromáticas baseadas na capa do livro)
- Sistema avançado de capas
- Diferenciação de primeira visita vs. retorno
- Campo `description` (sinopse) na entidade Livro do backend — o frontend está preparado para exibi-lo quando existir
