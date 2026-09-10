# Contexto de UX/UI — Landing Page com GSAP, Boas-vindas e Login

## Visão geral

Criar uma experiência de página única, construída com **GSAP (GreenSock Animation Platform)**, na qual o usuário percorre uma sequência visual controlada pelo scroll.

A página deve funcionar como uma pequena narrativa de entrada:

**Logo do projeto → Scroll → Mensagem de boas-vindas → Scroll → Tela de login**

Tudo acontece **na mesma página**, sem navegação entre URLs ou carregamentos de telas independentes.

O objetivo é fazer com que a entrada no sistema pareça uma experiência contínua, elegante e intencional, em vez de simplesmente apresentar um formulário de login imediatamente.

---

## 1. Estrutura geral da experiência

A página será dividida conceitualmente em três momentos principais:

1. **Tela inicial / Logo**
2. **Tela de boas-vindas**
3. **Tela de login**

Esses momentos não precisam necessariamente ser três páginas ou três rotas. Eles devem existir dentro de uma única composição visual e ser revelados progressivamente conforme o usuário interage com o scroll.

O GSAP será responsável por controlar:

- Entrada e saída dos elementos.
- Opacidade.
- Escala.
- Movimento vertical e/ou horizontal.
- Transformações visuais da logo.
- Transições entre as etapas.
- Sincronização da animação com o scroll.
- Sensação de continuidade entre os estados.

---

# 2. Primeiro momento — Tela da logo

Ao acessar a página, o usuário deve encontrar uma tela inicial limpa e visualmente impactante.

O foco principal é a **logo do projeto**.

### Composição

A tela inicial deve possuir:

- Fundo seguindo a identidade visual do projeto.
- Logo centralizada.
- Poucos elementos secundários, evitando distrações.
- Sensação de abertura ou introdução.
- Espaçamento generoso.
- Composição visual minimalista.

A logo deve ser o elemento dominante da primeira etapa.

### Animação inicial

Antes de qualquer interação de scroll, a logo pode surgir de maneira suave.

A sequência visual pode transmitir:

- Fade in.
- Pequena escala inicial.
- Movimento vertical sutil.
- Acomodação da logo no centro da tela.

A animação deve ser rápida o suficiente para não parecer uma tela de carregamento, mas perceptível o bastante para criar uma introdução.

### Estado de espera

Depois da animação inicial, a página permanece nesse primeiro estado até que o usuário comece a rolar.

Opcionalmente, pode existir uma indicação discreta de que o usuário deve continuar:

- "Role para continuar"
- Uma pequena seta.
- Um indicador animado de scroll.

Esse indicador deve ser secundário e não competir com a logo.

---

# 3. Transição acionada pelo scroll

O scroll é o mecanismo principal da experiência.

Ao começar a rolar, a primeira tela não deve simplesmente desaparecer de maneira abrupta.

A transição deve ser construída como uma sequência cinematográfica.

### Comportamento esperado

Conforme o usuário avança:

1. A logo começa a perder destaque.
2. A logo pode diminuir ou deslocar-se.
3. O fundo pode sofrer uma transição suave.
4. A primeira composição começa a sair da área principal.
5. A mensagem de boas-vindas começa a entrar.
6. Os elementos devem compartilhar uma mesma linha temporal de animação.

A sensação desejada é:

> "Estou avançando para a próxima etapa da mesma experiência."

E não:

> "Uma tela acabou e outra foi carregada."

---

# 4. Segundo momento — Mensagem de boas-vindas

Depois da transição da logo, deve surgir uma mensagem de boas-vindas.

Essa etapa funciona como uma ponte entre a identidade visual do projeto e o acesso ao sistema.

### Conteúdo

A mensagem pode conter:

- Um título de boas-vindas.
- Uma frase curta explicando a experiência.
- Uma chamada para continuar.
- Um elemento visual complementar, se necessário.

Exemplo conceitual:

> **Bem-vindo.**  
> Estamos felizes em ter você aqui.

O texto real deve ser adaptado à identidade e ao propósito do projeto.

### Hierarquia visual

O título deve ser o principal elemento dessa etapa.

A descrição deve ser menor e mais discreta.

Caso exista um CTA ou indicação de continuação, ele deve aparecer somente depois que a mensagem principal estiver estabelecida visualmente.

---

# 5. Animação da mensagem de boas-vindas

A entrada da mensagem deve ser diferente da animação da logo, mas manter a mesma linguagem visual.

Uma possibilidade é:

- Título entrando com deslocamento vertical.
- Opacidade aumentando gradualmente.
- Texto secundário aparecendo alguns instantes depois.
- Pequena pausa visual.
- Elementos estabilizando no centro.

A animação deve ser vinculada ao progresso do scroll sempre que isso contribuir para uma sensação mais fluida.

O GSAP pode funcionar como controlador da progressão entre os estados.

---

# 6. Terceiro momento — Tela de login

Somente depois da etapa de boas-vindas deve surgir a tela de login.

O formulário não deve estar visualmente disponível desde o início da experiência.

Essa regra é importante para manter a narrativa:

**Primeiro o usuário conhece o projeto → depois recebe as boas-vindas → então tem acesso ao login.**

---

## 7. Entrada do login

A tela de login deve surgir gradualmente a partir da etapa de boas-vindas.

A transição pode envolver:

- Saída ou redução da mensagem de boas-vindas.
- Mudança gradual do foco visual.
- Entrada do card ou container de login.
- Fade e deslocamento vertical.
- Pequena animação de escala.
- Revelação progressiva dos campos.

A transição deve parecer parte da mesma página.

Não deve existir uma quebra visual brusca.

---

# 8. Composição da tela de login

A tela final deve ser simples e funcional.

Pode conter:

- Logo reduzida ou marca do projeto.
- Título como "Entrar".
- Campo de usuário/e-mail.
- Campo de senha.
- Botão de acesso.
- Link para recuperação de senha.
- Outras ações relacionadas à autenticação, se necessárias.

O formulário deve priorizar usabilidade.

As animações não devem prejudicar:

- Leitura.
- Digitação.
- Acessibilidade.
- Foco dos campos.
- Navegação por teclado.
- Velocidade de interação.

Depois que o login estiver visível, a interface deve se comportar como uma tela de autenticação normal.

---

# 9. Papel do GSAP

O GSAP será o principal sistema de animação da experiência.

A implementação conceitual deve separar claramente:

### Timeline

Uma timeline principal pode representar a narrativa completa:

**Intro → Boas-vindas → Login**

Essa timeline deve permitir controlar a ordem e a duração relativa das transições.

### Scroll

O progresso do scroll deve controlar a evolução dessa timeline.

O objetivo é fazer com que o usuário tenha a sensação de estar "dirigindo" a animação através do scroll.

### ScrollTrigger

O **GSAP ScrollTrigger** deve ser utilizado para conectar o scroll à sequência de animações.

Conceitualmente:

- A seção inicial ocupa a viewport.
- O scroll aumenta o progresso da timeline.
- A timeline controla a saída da logo.
- Em seguida controla a entrada da mensagem.
- Por fim controla a transição para o login.

O uso de `pin` pode ser considerado para manter a composição visual fixa enquanto a animação progride.

---

# 10. Sensação de página única

Um dos requisitos fundamentais é que tudo aconteça na mesma página.

Não criar:

- Rota separada para a introdução.
- Rota separada para boas-vindas.
- Rota separada para login.
- Recarregamentos entre etapas.
- Transições que pareçam troca de página.

Visualmente, o usuário deve perceber uma única experiência contínua.

A estrutura pode ser entendida como:

```text
┌───────────────────────────────┐
│                               │
│          LOGO DO PROJETO      │
│                               │
└───────────────────────────────┘
                ↓ scroll
┌───────────────────────────────┐
│                               │
│        BEM-VINDO!              │
│                               │
│  Mensagem curta de introdução │
│                               │
└───────────────────────────────┘
                ↓ scroll
┌───────────────────────────────┐
│                               │
│             LOGIN             │
│                               │
│          E-mail               │
│          Senha                │
│                               │
│          [ Entrar ]           │
│                               │
└───────────────────────────────┘
```

Esse desenho é apenas conceitual. A implementação visual deve ser definida de acordo com a identidade do projeto.

---

# 11. Controle da experiência pelo scroll

O scroll deve ser progressivo e previsível.

Evitar situações em que:

- Uma pequena rolagem pule várias etapas.
- A animação fique rápida demais.
- O usuário fique preso em uma seção sem entender o motivo.
- A tela avance sozinha sem interação.
- O formulário apareça antes da mensagem de boas-vindas.

A quantidade de scroll necessária para cada etapa deve ser equilibrada.

A primeira etapa pode receber um espaço maior para reforçar a apresentação da marca.

A segunda etapa deve ser mais curta, funcionando como uma introdução.

A terceira etapa deve permanecer acessível e estável.

---

# 12. Estrutura conceitual das seções

Uma organização possível:

### Seção 01 — Intro

Responsável por:

- Logo.
- Identidade visual.
- Animação inicial.
- Indicação de scroll.

### Seção 02 — Welcome

Responsável por:

- Título.
- Mensagem.
- CTA ou indicação de continuidade.
- Transição para autenticação.

### Seção 03 — Authentication

Responsável por:

- Formulário.
- Login.
- Ações auxiliares.
- Estado final da experiência.

Essas seções podem coexistir no mesmo documento e serem posicionadas de forma estratégica para trabalhar com o ScrollTrigger.

---

# 13. Direção visual

A direção visual deve priorizar uma estética moderna e refinada.

Características sugeridas:

- Tipografia forte.
- Poucos elementos.
- Espaçamento amplo.
- Animações suaves.
- Hierarquia clara.
- Transições com aceleração/desaceleração naturais.
- Uso consistente da identidade visual.
- Evitar excesso de efeitos.

O objetivo não é demonstrar quantidade de animações, mas criar uma experiência de entrada memorável.

---

# 14. Responsividade

A experiência deve funcionar em:

- Desktop.
- Tablet.
- Smartphone.

No mobile, a interação deve ser adaptada para telas menores.

É importante considerar:

- Altura real da viewport.
- Áreas de toque.
- Tamanho dos campos.
- Espaçamento entre elementos.
- Velocidade percebida das animações.
- Comportamento do scroll em dispositivos touch.

A experiência não deve depender exclusivamente de movimentos horizontais ou elementos que funcionem apenas em telas grandes.

---

# 15. Acessibilidade e usabilidade

As animações devem ser complementares à interface, não obrigatórias para compreender o conteúdo.

Considerar:

- Navegação por teclado.
- Foco visível.
- Labels apropriadas nos campos.
- Contraste adequado.
- Tamanhos de texto legíveis.
- Respeito à preferência de redução de movimento.
- Possibilidade de chegar ao formulário sem uma experiência excessivamente longa.

Para usuários que preferem movimento reduzido, as animações devem ser simplificadas ou praticamente removidas, mantendo a mesma sequência lógica de conteúdo.

---

# 16. Estados da interface

A experiência deve ser pensada como uma máquina de estados visual:

### Estado 1 — INTRO

A logo está em evidência.

**Ação:** usuário rola.

↓

### Estado 2 — WELCOME

A logo perde destaque e a mensagem aparece.

**Ação:** usuário continua rolando.

↓

### Estado 3 — LOGIN

A mensagem desaparece ou perde destaque e o formulário aparece.

**Ação:** usuário interage normalmente com o login.

---

# 17. Retorno ao scroll

Deve ser definido como a interface se comportará caso o usuário volte a rolar para cima.

O comportamento recomendado é permitir que a animação seja reversível.

Assim:

**Login → Welcome → Logo**

Isso mantém o conceito de timeline controlada pelo scroll e evita que a página fique presa permanentemente no estado final.

Entretanto, depois que o usuário começar a interagir com o formulário, deve-se evitar comportamentos inesperados que retirem o foco ou escondam o formulário durante uma interação.

---

# 18. Performance

Como a experiência depende fortemente de animações, o projeto deve priorizar performance.

Evitar animações pesadas em propriedades que provoquem recálculos excessivos de layout.

Dar preferência a transformações e opacidade quando possível.

Também é importante:

- Evitar excesso de elementos simultaneamente animados.
- Otimizar imagens da logo.
- Evitar efeitos visuais desnecessários.
- Considerar dispositivos de baixo desempenho.
- Garantir que o formulário continue responsivo.

A animação deve parecer sofisticada sem consumir recursos de maneira desnecessária.

---

# 19. Experiência desejada

A experiência final deve transmitir a seguinte narrativa:

> O usuário entra no projeto e encontra sua identidade visual.

> Ao rolar, a identidade dá espaço para uma mensagem pessoal de boas-vindas.

> Ao continuar, essa mensagem conduz naturalmente o usuário ao ambiente de autenticação.

> Finalmente, o usuário encontra o login pronto para utilização.

A transição entre as etapas deve ser contínua, elegante e controlada pelo scroll.

---

# 20. Fluxo final

```text
ACESSO À PÁGINA
       │
       ▼
┌─────────────────┐
│  INTRO / LOGO   │
│                 │
│   Logo central  │
│                 │
│  "Role..."      │
└────────┬────────┘
         │
         │ Scroll
         ▼
┌─────────────────┐
│   WELCOME       │
│                 │
│  Bem-vindo      │
│  Mensagem       │
│  introdutória   │
└────────┬────────┘
         │
         │ Scroll
         ▼
┌─────────────────┐
│      LOGIN      │
│                 │
│  E-mail         │
│  Senha          │
│                 │
│  [ Entrar ]     │
└─────────────────┘
         │
         ▼
   EXPERIÊNCIA
     NORMAL
```

---

# 21. Resultado esperado

O resultado deve ser uma **landing/auth page imersiva em uma única página**, onde o scroll funciona como mecanismo narrativo.

O usuário não deve sentir que está navegando entre páginas.

Deve sentir que está avançando por uma sequência de estados cuidadosamente construída.

O GSAP e o ScrollTrigger serão responsáveis pela parte essencial dessa experiência, coordenando a transição:

**Logo → Boas-vindas → Login**

com animações suaves, reversíveis, responsivas e orientadas à experiência do usuário.
