// Templates de e-mail — Biblioteca ETE José Humberto de Moura Cavalcanti
// Funções puras: recebem dados, retornam { assunto, texto, html }.
// Nenhuma lógica de negócio ou chamada externa aqui.

function esc(valor: string): string {
  return valor.replace(
    /[&<>'"]/g,
    (c) =>
      (({ '&': '&amp;', '<': '&lt;', '>': '&gt;', "'": '&#39;', '"': '&quot;' }) as Record<string, string>)[c]!,
  );
}

function cabecalho(titulo: string, subtitulo = '') {
  return `
    <div style="background:#145bdb;padding:24px;border-radius:14px 14px 0 0;color:#fff">
      <h1 style="font-size:22px;margin:0">Biblioteca Virtual — ETE</h1>
      <p style="margin:6px 0 0;font-size:15px">${esc(titulo)}</p>
      ${subtitulo ? `<p style="margin:4px 0 0;font-size:13px;opacity:.85">${esc(subtitulo)}</p>` : ''}
    </div>`;
}

function rodape() {
  return `
    <div style="margin-top:28px;padding-top:16px;border-top:1px solid #dbe3ef;font-size:11px;color:#8a9ab0;text-align:center">
      ETE José Humberto de Moura Cavalcanti — Limoeiro, Pernambuco<br>
      Esta mensagem foi gerada automaticamente. Não responda este e-mail.
    </div>`;
}

function envoltorio(conteudo: string) {
  return `
    <div style="font-family:Arial,sans-serif;max-width:600px;margin:auto;color:#172033">
      ${cabecalho('')}
      <div style="border:1px solid #dbe3ef;border-top:0;padding:26px;border-radius:0 0 14px 14px">
        ${conteudo}
        ${rodape()}
      </div>
    </div>`;
}

function botao(href: string, texto: string) {
  return `<a href="${esc(href)}" style="display:inline-block;background:#145bdb;color:#fff;text-decoration:none;padding:12px 22px;border-radius:9px;font-weight:bold;margin-top:16px">${esc(texto)}</a>`;
}

function formatarData(data: Date, tz: string) {
  return new Intl.DateTimeFormat('pt-BR', {
    dateStyle: 'long',
    timeStyle: 'short',
    timeZone: tz,
  }).format(data);
}

// ---------------------------------------------------------------

export interface TemplateEmail {
  assunto: string;
  texto: string;
  html: string;
}

export function templateBoasVindas(dados: {
  nome: string;
  email: string;
  perfil: 'aluno' | 'administrador';
  urlAcesso: string;
}): TemplateEmail {
  const assunto = 'Bem-vindo(a) à Biblioteca Virtual — ETE';
  const texto = [
    `Olá, ${dados.nome}!`,
    '',
    `Seu cadastro de ${dados.perfil} na Biblioteca Virtual foi realizado com sucesso.`,
    `Acesse o sistema com seu e-mail: ${dados.email}`,
    `Link de acesso: ${dados.urlAcesso}`,
    '',
    'Se você não realizou este cadastro, entre em contato com a biblioteca.',
  ].join('\n');

  const html = envoltorio(`
    <p>Olá, <strong>${esc(dados.nome)}</strong>!</p>
    <p>Seu cadastro de <strong>${esc(dados.perfil)}</strong> na Biblioteca Virtual foi realizado.</p>
    <p>Acesse o sistema com o e-mail <strong>${esc(dados.email)}</strong>.</p>
    ${botao(dados.urlAcesso, 'Acessar Biblioteca Virtual')}
  `);

  return { assunto, texto, html };
}

export function templateSenhaTemporaria(dados: {
  nome: string;
  email: string;
  urlAcesso: string;
}): TemplateEmail {
  const assunto = 'Sua senha foi redefinida — Biblioteca Virtual ETE';
  const texto = [
    `Olá, ${dados.nome}!`,
    '',
    'Sua senha de acesso à Biblioteca Virtual foi redefinida por um administrador.',
    `Acesse o sistema para definir uma nova senha: ${dados.urlAcesso}`,
    `E-mail de acesso: ${dados.email}`,
    '',
    'Se você não solicitou esta alteração, entre em contato com a biblioteca imediatamente.',
  ].join('\n');

  const html = envoltorio(`
    <p>Olá, <strong>${esc(dados.nome)}</strong>!</p>
    <p>Sua senha da Biblioteca Virtual foi redefinida. Acesse o sistema para criar uma nova senha pessoal.</p>
    <p>E-mail de acesso: <strong>${esc(dados.email)}</strong></p>
    ${botao(dados.urlAcesso, 'Definir nova senha')}
    <p style="margin-top:16px;font-size:13px;color:#8a9ab0">Se você não solicitou esta alteração, entre em contato com a biblioteca imediatamente.</p>
  `);

  return { assunto, texto, html };
}

export function templateReservaCriada(dados: {
  nome: string;
  livro: string;
  prazoRetirada: Date;
  urlReservas: string;
  tz: string;
}): TemplateEmail {
  const prazo = formatarData(dados.prazoRetirada, dados.tz);
  const assunto = `Reserva confirmada: ${dados.livro}`;
  const texto = [
    `Olá, ${dados.nome}!`,
    '',
    `Sua reserva do livro "${dados.livro}" foi confirmada.`,
    `Retire o exemplar na biblioteca até ${prazo}.`,
    `Acompanhe suas reservas: ${dados.urlReservas}`,
    '',
    'Após esse prazo, a reserva expirará automaticamente.',
  ].join('\n');

  const html = envoltorio(`
    <p>Olá, <strong>${esc(dados.nome)}</strong>!</p>
    <p>Sua reserva do livro <strong>${esc(dados.livro)}</strong> foi confirmada.</p>
    <div style="background:#f3f6fb;border-radius:10px;padding:14px 18px;margin:18px 0">
      <p style="margin:0"><strong>Prazo para retirada:</strong> ${esc(prazo)}</p>
    </div>
    <p>Dirija-se à biblioteca e apresente seu cadastro para retirar o exemplar.</p>
    ${botao(dados.urlReservas, 'Ver minha reserva')}
  `);

  return { assunto, texto, html };
}

export function templateLivroDisponivel(dados: {
  nome: string;
  livro: string;
  prazoRetirada: Date;
  urlReservas: string;
  tz: string;
}): TemplateEmail {
  const prazo = formatarData(dados.prazoRetirada, dados.tz);
  const assunto = `Seu livro está disponível: ${dados.livro}`;
  const texto = [
    `Olá, ${dados.nome}!`,
    '',
    `O livro "${dados.livro}" ficou disponível e foi reservado para você.`,
    `Retire-o na biblioteca até ${prazo}.`,
    `Acompanhe sua reserva: ${dados.urlReservas}`,
    '',
    'Após esse prazo, a reserva expirará e o exemplar será destinado ao próximo aluno da fila.',
  ].join('\n');

  const html = envoltorio(`
    <p>Olá, <strong>${esc(dados.nome)}</strong>!</p>
    <p>Boa notícia! O livro <strong>${esc(dados.livro)}</strong> ficou disponível e foi reservado para você com prioridade de fila.</p>
    <div style="background:#f3f6fb;border-radius:10px;padding:14px 18px;margin:18px 0">
      <p style="margin:0"><strong>Prazo para retirada:</strong> ${esc(prazo)}</p>
    </div>
    <p>Após esse prazo, a reserva expirará e o exemplar será destinado ao próximo aluno da fila.</p>
    ${botao(dados.urlReservas, 'Ver minha reserva')}
  `);

  return { assunto, texto, html };
}

export function templateReservaExpirando(dados: {
  nome: string;
  livro: string;
  prazoRetirada: Date;
  urlReservas: string;
  tz: string;
}): TemplateEmail {
  const prazo = formatarData(dados.prazoRetirada, dados.tz);
  const assunto = `Aviso: prazo de retirada próximo — ${dados.livro}`;
  const texto = [
    `Olá, ${dados.nome}!`,
    '',
    `Sua reserva do livro "${dados.livro}" está prestes a expirar.`,
    `Retire o exemplar até ${prazo}.`,
    `Acompanhe sua reserva: ${dados.urlReservas}`,
  ].join('\n');

  const html = envoltorio(`
    <p>Olá, <strong>${esc(dados.nome)}</strong>!</p>
    <p>Sua reserva do livro <strong>${esc(dados.livro)}</strong> está prestes a expirar.</p>
    <div style="background:#fff8e1;border-left:4px solid #f59e0b;border-radius:6px;padding:14px 18px;margin:18px 0">
      <p style="margin:0"><strong>Prazo final:</strong> ${esc(prazo)}</p>
    </div>
    <p>Se não for possível retirar antes desse prazo, cancele a reserva para liberar o exemplar para outros alunos.</p>
    ${botao(dados.urlReservas, 'Ver minha reserva')}
  `);

  return { assunto, texto, html };
}

export function templateReservaExpirada(dados: {
  nome: string;
  livro: string;
  urlAcesso: string;
}): TemplateEmail {
  const assunto = `Reserva expirada: ${dados.livro}`;
  const texto = [
    `Olá, ${dados.nome}!`,
    '',
    `Sua reserva do livro "${dados.livro}" expirou pois o exemplar não foi retirado dentro do prazo.`,
    `Para reservar novamente, acesse: ${dados.urlAcesso}`,
  ].join('\n');

  const html = envoltorio(`
    <p>Olá, <strong>${esc(dados.nome)}</strong>!</p>
    <p>Sua reserva do livro <strong>${esc(dados.livro)}</strong> expirou porque o exemplar não foi retirado dentro do prazo.</p>
    <p>Se ainda desejar o livro, realize uma nova reserva pelo sistema.</p>
    ${botao(dados.urlAcesso, 'Acessar Biblioteca Virtual')}
  `);

  return { assunto, texto, html };
}
