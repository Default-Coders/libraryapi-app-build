module.exports=[27572,a=>{"use strict";var b=a.i(7997),c=a.i(35009);let d=`
  (function () {
    try {
      var savedTheme = localStorage.getItem('biblioteca-theme') || localStorage.getItem('theme');
      var prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
      var isDark = savedTheme === 'dark' || (savedTheme !== 'light' && prefersDark);
      document.documentElement.classList.toggle('dark', isDark);
      document.documentElement.style.colorScheme = isDark ? 'dark' : 'light';
    } catch (_) {}
  })();
`;a.s(["default",0,function({children:a}){return(0,b.jsxs)("html",{lang:"pt-BR",suppressHydrationWarning:!0,children:[(0,b.jsxs)("head",{children:[(0,b.jsx)("link",{rel:"preconnect",href:"https://fonts.googleapis.com"}),(0,b.jsx)("link",{rel:"preconnect",href:"https://fonts.gstatic.com",crossOrigin:"anonymous"}),(0,b.jsx)("link",{href:"https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800;900&family=Outfit:wght@400;500;600;700;800;900&display=swap",rel:"stylesheet"}),(0,b.jsx)("script",{dangerouslySetInnerHTML:{__html:d}})]}),(0,b.jsxs)("body",{children:[a,(0,b.jsx)(c.ToastProvider,{})]})]})},"metadata",0,{title:"Biblioteca Virtual — ETE Integrado",description:"Plataforma digital completa de gestão de acervo, catálogo, reservas e empréstimos da Biblioteca da Escola Técnica Estadual (ETE). Acesse o acervo, solicite reservas online e gerencie seu perfil.",icons:{icon:"/ete-logo.png",shortcut:"/ete-logo.png",apple:"/ete-logo.png"}}])},50645,function(a){a.n(a.i(27572))},12245,a=>{"use strict";a.s(["ToastProvider",()=>b]);let b=(0,a.i(11857).registerClientReference)(function(){throw Error("Attempted to call ToastProvider() from the server but ToastProvider is on the client. It's not possible to invoke a client function from the server, it can only be rendered as a Component or passed to props of a Client Component.")},"[project]/src/components/toast-provider.tsx","ToastProvider")},35009,a=>{"use strict";var b=a.i(12245);a.n(b)}];

//# sourceMappingURL=src_0tlx01x._.js.map