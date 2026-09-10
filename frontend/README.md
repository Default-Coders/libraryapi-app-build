# Sistema de Biblioteca Virtual — ETE (Escola Técnica Estadual)

Plataforma completa para gestão de acervo, catálogo digital, autenticação e controle de empréstimos, reservas e lista de espera da biblioteca escolar.

![Logo da ETE](public/ete-logo.png)

---

## 🚀 Tecnologias Utilizadas

### Frontend
- **Framework**: [Next.js 16 (App Router)](https://nextjs.org/)
- **Biblioteca Principal**: [React 19](https://react.dev/)
- **Linguagem**: TypeScript
- **Estilização**: Tailwind CSS v4
- **Ícones**: Lucide React
- **Animações da Landing Page**: GSAP (GreenSock)
- **Notificações**: React Toastify v11
- **Substituição de Alertas Nativos**: Modal de confirmação personalizado (`ConfirmModal`)

### Backend
- **API REST**: Node.js / NestJS / TypeScript
- **Banco de Dados**: Prisma ORM / PostgreSQL
- **Autenticação**: JWT / Cookies HTTP-Only / BCrypt

---

## 🔑 Credenciais Iniciais de Administrador

```text
E-mail: admin@biblioteca.com
Senha:  123456
```

---

## 💻 Como Executar o Projeto

### 1. Iniciar o Backend
```powershell
cd backend
npm install
npm run start:dev
```
*A API estará disponível em `http://localhost:8080/api`*

### 2. Iniciar o Frontend
```powershell
cd frontend
npm install
npm run dev
```
*A interface web estará disponível em `http://localhost:3000` (e na rede local)*

---

## 📚 Módulos e Rotas da Aplicação

### Visual / Roteamento Frontend
- **Página Inicial / Landing Page (`/`)**:
  - Apresentação inicial da marca ETE com animações GSAP.
  - Mensagem de boas-vindas ao acervo.
  - Painel de autenticação via botão "Acessar o Sistema" (Login e Cadastro).
- **Painel do Administrador (`/admin/*`)**:
  - Dashboard de Métricas (`/admin/dashboard`)
  - Gestão de Administradores (`/admin/administradores`)
  - Gestão de Alunos (`/admin/alunos`)
  - Gestão de Categorias (`/admin/categorias`)
  - Gestão de Livros (`/admin/livros`)
  - Gestão de Reservas e Empréstimos (`/admin/reservas`)
- **Painel do Aluno (`/aluno/*`)**:
  - Catálogo de Livros e Solicitação de Reserva (`/aluno/dashboard`)
  - Minhas Reservas e Lista de Espera (`/aluno/reservas`)
  - Perfil do Aluno e Troca de Senha (`/aluno/perfil`)

---

## ✨ Destaques de UX e Design

1. **Favicon e Marca Própria**: Ícone do navegador e marca 100% personalizados com a logo oficial da ETE (sem símbolos padrão do Next.js/Vercel).
2. **Modais de Confirmação Personalizados**: Substituição do alerta nativo do navegador (`confirm`) por um modal moderno que elimina a mensagem `localhost:3000 diz`.
3. **Notificações Animadas**: Alertas de sucesso, aviso e erro gerenciados globalmente com `react-toastify`.
4. **Tema Claro / Escuro (Dark Mode)**: Suporte completo a tema dark com persistência local e inicialização sem oscilação de tela (*flash*).
