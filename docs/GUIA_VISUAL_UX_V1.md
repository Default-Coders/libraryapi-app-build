# GUIA VISUAL & UX — V1
## Biblioteca Virtual — ETE Integrado

> Documento de referência para a construção visual e de experiência do usuário
> do frontend da Biblioteca Virtual.
>
> Este documento define princípios, padrões e direcionamentos para que os
> desenvolvedores consigam evoluir a interface sem perder a identidade visual
> definida para o projeto.

---

# 1. OBJETIVO

A Biblioteca Virtual deve possuir uma identidade própria.

A interface não deve parecer apenas um sistema CRUD escolar com alguns
componentes estilizados.

A proposta é construir uma experiência que combine:

- biblioteca digital;
- tecnologia;
- modernidade;
- elegância;
- identidade institucional;
- inspiração retro-futurista;
- facilidade de uso.

A estética pode receber inspiração de linguagens visuais presentes em trailers
como **GTA — An Extended Look**, especialmente na utilização de:

- composição cinematográfica;
- tipografia;
- contraste;
- movimento;
- atmosfera retro-futurista;
- uso inteligente de espaços.

Essa referência NÃO significa copiar elementos do GTA.

A inspiração deve servir apenas como direção estética.

---

# 2. PRINCÍPIO VISUAL

A identidade pode ser resumida como:

> RETRO-FUTURISMO SOFISTICADO + BIBLIOTECA DIGITAL + TECNOLOGIA

O projeto deve evitar dois extremos.

## 2.1 Evitar aparência de sistema escolar genérico

Não transformar a interface em:

- excesso de cards;
- tabelas por toda parte;
- muitos botões;
- excesso de componentes administrativos;
- cores aleatórias;
- aparência de dashboard pronto;
- template genérico.

---

## 2.2 Evitar cyberpunk genérico

Também não utilizar:

- neon exagerado;
- glow em praticamente tudo;
- excesso de roxo;
- excesso de azul;
- gradientes excessivos;
- efeitos exagerados;
- aparência de "site gamer".

A interface deve ser tecnológica sem ser visualmente carregada.

---

# 3. PALETA DE CORES

A paleta deve trabalhar principalmente com contraste e variações sutis.

## 3.1 Modo claro

Evitar utilizar branco puro como fundo predominante.

Preferir:

> Branco gelo / Off-white

A intenção é deixar a interface mais confortável e sofisticada.

O branco puro pode aparecer pontualmente quando necessário, mas não deve
ser obrigatoriamente a cor principal da página.

---

## 3.2 Modo escuro

O Dark Mode deve utilizar tons escuros coerentes com a identidade.

Preto pode ser utilizado de forma mais intensa em áreas específicas.

Exemplos:

- footer;
- seções de destaque;
- blocos de transição;
- áreas cinematográficas;
- componentes de alto contraste.

---

## 3.3 Light Mode e Dark Mode

Os dois modos devem representar a mesma identidade visual.

Não criar:

> "uma interface clara"

e

> "outra interface completamente diferente no escuro".

A estrutura, hierarquia e comportamento devem permanecer consistentes.

Devem ser preservados:

- contraste;
- legibilidade;
- estados dos componentes;
- identidade;
- hierarquia;
- feedback visual.

---

# 4. TIPOGRAFIA

A tipografia deve possuir hierarquia clara.

Prioridade:

1. título;
2. subtítulo;
3. conteúdo;
4. informação secundária;
5. ação.

Títulos podem ter maior personalidade.

Textos funcionais devem priorizar legibilidade.

Evitar:

- utilizar várias fontes sem necessidade;
- textos excessivamente pequenos;
- excesso de caixa alta;
- blocos enormes sem espaçamento;
- hierarquia confusa.

---

# 5. ESPAÇAMENTO E COMPOSIÇÃO

O espaço vazio faz parte da identidade visual.

Não é necessário preencher todos os espaços disponíveis.

Priorizar:

- margens consistentes;
- espaçamento entre seções;
- alinhamento;
- respiro;
- agrupamento lógico;
- hierarquia.

A interface deve possuir uma composição equilibrada.

---

# 6. LANDING PAGE

A Landing Page deve funcionar como uma apresentação da Biblioteca Virtual.

Ela não deve parecer imediatamente um dashboard.

A primeira impressão deve comunicar:

> "Este é um produto digital próprio."

---

## 6.1 Possível estrutura

A Landing Page pode trabalhar com:

1. Hero / abertura;
2. apresentação da Biblioteca;
3. elementos visuais;
4. textos relacionados ao scroll;
5. transições;
6. chamada para login/acesso;
7. footer.

A estrutura pode evoluir durante o desenvolvimento.

---

# 7. EXPERIÊNCIA DE SCROLL

Uma das características visuais planejadas é utilizar o scroll como parte
da experiência.

Pode haver textos que:

- surgem gradualmente;
- desaparecem suavemente;
- mudam de opacidade;
- se deslocam verticalmente;
- possuem parallax;
- ficam temporariamente centralizados;
- acompanham o movimento da página.

---

## 7.1 Texto de baixa opacidade

Uma possibilidade é utilizar textos com baixa opacidade que apareçam e
desapareçam conforme o usuário percorre a página.

A intenção é criar atmosfera.

Não utilizar o efeito para esconder informação importante.

---

## 7.2 Parallax tipográfico

Textos podem possuir movimento diferente do restante da página.

Exemplo conceitual:

- conteúdo principal movimenta normalmente;
- texto se desloca de maneira mais lenta;
- ao subir o scroll, o movimento acompanha a direção;
- ao descer, retorna de forma suave.

O efeito deve ser discreto.

---

## 7.3 Regra principal

A animação nunca pode ser necessária para compreender o conteúdo.

O conteúdo deve continuar funcional mesmo sem os efeitos.

---

# 8. GSAP

GSAP será utilizado para animações do frontend.

Porém:

> GSAP não deve ser utilizado apenas porque está disponível.

---

## 8.1 Ordem recomendada

Para cada feature:

1. implementar funcionalidade;
2. validar funcionamento;
3. finalizar estrutura;
4. trabalhar visual;
5. adicionar animação;
6. testar desempenho;
7. remover efeitos desnecessários.

---

## 8.2 Evitar

Não utilizar GSAP para:

- animar todos os elementos;
- criar efeitos contínuos sem necessidade;
- atrasar acesso ao conteúdo;
- criar animações longas;
- transformar toda interação em uma animação;
- criar efeitos que dificultem acessibilidade.

---

## 8.3 Regra

A animação deve complementar a interface.

Não deve competir com ela.

---

# 9. PRELOADER

O preloader da Landing Page NÃO faz parte da implementação atual.

## Status

> BACKLOG / FUTURO

O preloader deve permanecer em segundo plano até que a identidade da logo
esteja definida.

Não antecipar essa implementação apenas para preencher a Landing Page.

Quando chegar a hora, o preloader deve ser pensado junto com:

- logo;
- identidade visual definitiva;
- animações de entrada;
- carregamento real da página.

---

# 10. PRIMEIRA VISITA E VISITAS POSTERIORES

Existe uma possibilidade futura de diferenciar a experiência do usuário
na primeira visita.

---

## 10.1 Primeira visita

A primeira visita pode possuir:

- apresentação mais rica;
- animações;
- experiência cinematográfica;
- introdução da Biblioteca.

---

## 10.2 Visitas posteriores

Depois que o usuário já conhece a plataforma, a entrada pode ser mais direta.

Por exemplo:

> acesso/login com menos elementos introdutórios.

---

## 10.3 Implementação

A solução deve ser simples.

Pode utilizar futuramente mecanismos como:

- cookie;
- localStorage;
- outro mecanismo simples de persistência no frontend.

Evitar criar grandes blocos de:

```text
if primeira visita
else
if usuário...
else

espalhados pela Landing Page.

A lógica deve permanecer isolada e organizada.

11. LOGIN

O Login deve priorizar:

clareza;
poucos elementos;
hierarquia;
feedback;
facilidade de acesso.

O usuário deve saber imediatamente:

onde está;
o que precisa informar;
como prosseguir;
se algo deu errado.

Evitar decoração excessiva em telas funcionais.

12. LIVROS

Os livros são um dos principais elementos do sistema.

A apresentação deve facilitar:

descoberta;
identificação;
consulta;
acesso aos detalhes;
reserva.
13. CARDS DE LIVROS

Os cards devem mostrar somente as informações necessárias para uma
identificação rápida.

Podem conter:

título;
informações relevantes;
disponibilidade;
ação principal.

Não colocar todas as informações existentes no banco dentro do card.

O card deve funcionar como:

entrada para a experiência do livro.

14. DETALHES DO LIVRO

Ao selecionar um livro, o usuário deve acessar uma experiência específica
para aquele livro.

Informações previstas:

título/nome;
data de publicação;
sinopse;
disponibilidade;
ação de reserva;
possíveis avaliações.

A sinopse deve utilizar o campo:

description

já existente no backend.

14.1 Estrutura

Não é obrigatório criar uma página física independente para cada livro.

A experiência pode utilizar o identificador do livro e carregar os dados
correspondentes.

A arquitetura definitiva deve evitar duplicação desnecessária de páginas.

15. RESERVA

A ação de reservar deve ser evidente.

O usuário precisa compreender:

qual livro está selecionando;
situação atual do livro;
qual ação está realizando;
resultado da operação.

Após a ação:

Sucesso

Deve existir feedback claro.

Erro

Deve existir mensagem compreensível.

Indisponibilidade

O usuário deve saber que não conseguiu reservar e entender o estado atual.

Mensagens não devem depender somente de cores.

16. DASHBOARD DO ALUNO

O Dashboard do aluno deve priorizar simplicidade.

O aluno deve conseguir localizar rapidamente:

informações da conta;
reservas;
livros;
situação das reservas;
ações disponíveis.
16.1 Perguntas para a sabatina

A equipe deve verificar:

O aluno consegue encontrar suas reservas?
O aluno entende o estado de cada reserva?
As ações principais estão claras?
O usuário sabe quando uma reserva foi concluída?
É fácil navegar pelo dashboard?
O dashboard funciona em desktop?
O dashboard funciona em mobile?
Existem informações desnecessárias?
Alguma funcionalidade está escondida ou difícil de encontrar?

17. DASHBOARD DO ADMINISTRADOR

O Dashboard do administrador pode possuir maior densidade de informações.

Entretanto:

mais informação não significa necessariamente melhor dashboard.

A interface deve permitir localizar rapidamente funções importantes.

Áreas esperadas:

livros;
alunos;
reservas;
categorias;
informações do sistema;
ações administrativas.
17.1 Perguntas para a sabatina
O administrador encontra rapidamente as funções principais?
As informações importantes possuem hierarquia?
As ações importantes são claramente identificadas?
Ações destrutivas possuem confirmação/feedback adequado?
O dashboard funciona em diferentes tamanhos de tela?
Existem funções difíceis de descobrir?
Há informações redundantes?
O administrador consegue entender o estado do sistema rapidamente?
18. RESPONSIVIDADE

Responsividade é requisito.

Não deve ser tratada como etapa opcional no final do desenvolvimento.

Cada feature visual deve ser analisada em:

desktop;
tablet;
mobile.
18.1 Não basta diminuir

Responsividade não significa simplesmente:

desktop menor

Pode ser necessário:

reorganizar elementos;
mudar direção de layouts;
alterar espaçamentos;
adaptar navegação;
modificar tamanho de textos;
reorganizar cards;
ajustar animações.
19. MOBILE

O mobile deve ser tratado como uma experiência própria dentro da mesma
identidade visual.

Verificar:

navegação;
botões;
cards;
textos;
espaçamento;
menus;
imagens;
animações;
overflow.
20. ACESSIBILIDADE

A estética nunca deve prejudicar acessibilidade.

Priorizar:

contraste adequado;
textos legíveis;
foco visível;
navegação por teclado quando aplicável;
estados de interação claros;
mensagens de erro compreensíveis.

Não utilizar somente cor para representar:

sucesso;
erro;
disponibilidade;
indisponibilidade.
21. MOVIMENTO REDUZIDO

Animações devem considerar usuários que preferem reduzir movimento.

Sempre que possível:

reduzir efeitos;
diminuir deslocamentos;
evitar movimento excessivo;
preservar a funcionalidade.
22. MICROINTERAÇÕES

Microinterações podem ser utilizadas para dar feedback.

Exemplos:

hover;
focus;
alteração de botão;
feedback de reserva;
entrada de componentes;
saída de componentes;
mudança de estado.
22.1 Regra

Toda microinteração deve possuir uma razão.

Pergunta:

"Esse movimento comunica alguma coisa?"

Se não comunica nada, provavelmente é desnecessário.

CONSISTÊNCIA DOS COMPONENTES

Componentes equivalentes devem se comportar de forma equivalente.

Exemplos:

Botões

Botões primários devem seguir um padrão.

Mensagens

Sucesso, erro e alerta devem possuir padrões consistentes.

Cards

Cards equivalentes devem possuir estruturas semelhantes.

Tipografia

Títulos equivalentes devem possuir hierarquia semelhante.

Espaçamento

Utilizar uma lógica consistente de espaçamento.

24. IMAGENS E CAPAS

Adicionar imagens de capa diretamente no banco de dados NÃO é prioridade
da V1.

Não adicionar complexidade de armazenamento somente para melhorar o
visual dos cards.

Caso imagens sejam implementadas posteriormente, a solução deve ser
avaliada separadamente considerando:

armazenamento;
carregamento;
desempenho;
cache;
manutenção.
25. ZION FLEX
Conceito separado

Zion Flex é um conceito independente dentro do projeto.

Não faz parte da implementação obrigatória desta V1.

25.1 Ideia

A tecnologia poderá futuramente gerar variações de cores da interface a
partir da capa do livro selecionado.

Exemplo conceitual:

Livro com predominância vermelha
        ↓
extração da identidade cromática
        ↓
variações sutis de vermelho
        ↓
aplicação controlada em determinadas áreas
25.2 Objetivo

Criar uma experiência dinâmica em que determinados elementos da interface
possam reagir visualmente ao livro selecionado.

25.3 Restrições

Zion Flex deve:

ser leve;
ser controlado;
não modificar toda a interface indiscriminadamente;
respeitar Light Mode;
respeitar Dark Mode;
não interferir nas funcionalidades;
evitar processamento desnecessário;
possuir arquitetura própria.
25.4 Status

CONCEITO / FUTURO

Não implementar agora.

26. PERFORMANCE

A identidade visual não pode prejudicar o desempenho.

Observar especialmente:

eventos de scroll;
animações;
imagens;
efeitos contínuos;
JavaScript;
carregamento inicial;
componentes desnecessários.
27. ANIMAÇÕES E DESEMPENHO

Especialmente em animações relacionadas ao scroll:

Evitar executar operações pesadas continuamente.

Sempre avaliar:

quantidade de elementos;
frequência dos eventos;
quantidade de animações simultâneas;
comportamento em dispositivos móveis.
28. SEPARAÇÃO ENTRE FUNCIONALIDADE E VISUAL

Uma alteração visual não deve quebrar uma funcionalidade existente.

Da mesma maneira:

uma alteração funcional não deve exigir mudanças visuais desnecessárias.

O frontend deve manter uma separação razoável entre:

lógica;
componentes;
estilos;
animações;
conteúdo.
29. GSAP E FEATURES

A regra do projeto é:

Feature primeiro. Animação depois.

Exemplo:

Reserva
   ↓
funciona
   ↓
interface validada
   ↓
feedback visual
   ↓
microinteração

Não começar uma feature pela animação.

30. O QUE É PRIORIDADE AGORA
V1 — Prioridade
identidade visual;
Landing Page;
Light Mode;
Dark Mode;
responsividade;
UX;
experiência de livros;
detalhes do livro;
reserva;
Dashboard do aluno;
Dashboard do administrador;
microinterações;
GSAP utilizado de forma controlada.
31. O QUE FICA PARA DEPOIS
Backlog
preloader;
logo definitiva integrada ao preloader;
Zion Flex;
sistema avançado de capas;
refinamentos de avaliações;
refinamentos visuais posteriores;
experiências avançadas de entrada.
32. CHECKLIST DE VALIDAÇÃO

Antes de considerar uma feature visual concluída:

Visual
 A hierarquia está clara.
 O espaçamento está consistente.
 A identidade visual foi respeitada.
 Light Mode funciona.
 Dark Mode funciona.
 Não existe excesso de efeitos.
 A página não parece um template genérico.
UX
 A ação principal é evidente.
 O usuário entende o estado atual.
 Existe feedback de sucesso.
 Existe feedback de erro.
 Informações importantes são fáceis de encontrar.
 Não existem etapas desnecessárias.
Responsividade
 Desktop validado.
 Tablet validado.
 Mobile validado.
 Não existe overflow inesperado.
 Botões continuam utilizáveis.
 Textos continuam legíveis.
 Cards continuam funcionais.
 Navegação continua clara.
Animações
 GSAP foi utilizado somente quando necessário.
 A animação não atrasa o usuário.
 O conteúdo continua compreensível sem animação.
 Não existem animações excessivas.
 Scroll não causa comportamento estranho.
 Movimento reduzido foi considerado.
33. SABATINA VISUAL/UX

A equipe deve testar as interfaces como usuários reais.

A sabatina não deve avaliar somente:

"Funciona?"

Também deve avaliar:

"É fácil de entender?"

"É fácil de encontrar?"

"É confortável de usar?"

"Funciona nos dois dispositivos?"

"O visual ajuda ou atrapalha?"

33.1 Aluno

Verificar principalmente:

descoberta de livros;
detalhes;
reserva;
visualização das próprias reservas;
estados das reservas;
navegação;
responsividade.
33.2 Administrador

Verificar principalmente:

gerenciamento;
visualização das informações;
navegação;
clareza das ações;
feedback;
responsividade;
facilidade para localizar funções.

REGRA DE OURO

Toda decisão visual deve responder a pelo menos uma destas perguntas:

Isso melhora a compreensão?
Isso melhora a navegação?
Isso reforça a identidade visual?
Isso melhora o feedback de uma ação?

Se a resposta for:

Não.

O elemento provavelmente é desnecessário.

35. PRINCÍPIO FINAL

A Biblioteca Virtual deve parecer um:

produto digital próprio

e não apenas:

um CRUD escolar com uma interface bonita.

A tecnologia deve estar a serviço da experiência.

A animação deve reforçar a interface.

A estética deve reforçar a identidade.

A identidade não deve dificultar o uso.

A interface deve ser moderna sem ser exagerada.

A experiência deve ser visualmente marcante sem sacrificar:

clareza;
acessibilidade;
desempenho;
responsividade;
funcionalidade.

STATUS DO DOCUMENTO

Arquivo: GUIA_VISUAL_UX_V1.md

Versão: V1

Projeto: Biblioteca Virtual — ETE Integrado

Objetivo: Direção visual e UX do frontend

Estado: Documento de referência para desenvolvimento e validação

Itens explicitamente fora da implementação atual:

Preloader;
Zion Flex;
sistema avançado de capas.