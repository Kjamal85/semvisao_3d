// Perfil 3D (parcial): capítulos novos ou correções sobre o projeto ep1 da série de apocalipse
// zumbi (curso-animacao-laboratiorio-2). Reaproveita os scripts do ep1: gerar-vozes.mjs (pula
// lotes prontos, sai com 2 na cota), gerar-composicoes.mjs, render-partes.sh (pula capítulos em
// dia, nunca apaga um MP4 bom), juntar.sh e montar-indice.mjs.
// Cada tarefa vive em ep1/tarefas/<nome>/; o corte final vai para renders/final/<nome>.mp4
// (o ep1.mp4 existente não é tocado).
import { spawnSync } from "node:child_process";
import { existsSync, mkdirSync, readdirSync, readFileSync, writeFileSync } from "node:fs";
import { homedir } from "node:os";
import { basename, join } from "node:path";
import { acharBash, ENTREGAS, REGRAS } from "../config.mjs";
import { ErroEtapa, rodar, ultimasLinhas } from "../processos.mjs";
import { ambienteLimpo } from "../segredos.mjs";
import {
  escreverEntrega, extrairQuadro, hyperframes, impressao, loudness, node, quadrosDeRevisao,
  renderizar, secaoLicencas, slug, sondar, textoPublicacao,
} from "./comum.mjs";
import { ESQUEMA_METADADOS } from "./perfil-2d.mjs";

export const ETAPAS = [
  "preparar", "roteiro", "revisao_roteiro", "voz", "cenas", "montagem", "previa",
  "revisao_previa", "render_final", "metadados", "revisao_final", "entrega",
];

const caminhos = (ctx) => {
  const P = ctx.perfil;
  const ep = join(P.raiz, P.episodio);
  return {
    P, ep, tarefa: ctx.prod.pasta, nome: ctx.prod.pasta && basename(ctx.prod.pasta),
    minimundo: join(P.raiz, "briefing", "minimundo.md"),
    briefing: join(P.raiz, "episodios", "BRIEFING_DE_PRODUCAO_EP1.md"),
    roteiroEp1: join(P.raiz, "episodios", "ROTEIRO_FALADO_EP1.md"),
  };
};
const capitulosDe = (ep) => readdirSync(join(ep, "compositions")).filter((f) => /^c\d\d-.*\.html$/.test(f)).sort();
const duracaoComposicao = (arquivo) => Number(/data-composition-id=[^>]*data-duration="([\d.]+)"/.exec(readFileSync(arquivo, "utf8"))?.[1] || 0);
const shell = (padroes) => padroes.flatMap((p) => [`PowerShell(${p})`, `Bash(${p})`]);
const SHELL_CENAS = ["node scripts/gerar-composicoes.mjs*", "npx --yes hyperframes@0.8.206 lint*", "npx --yes hyperframes@0.8.206 snapshot*", "npx hyperframes lint*", "npx hyperframes snapshot*", "ffprobe *"];
const NEGADO_CENAS = ["node scripts/gerar-vozes.mjs*", "bash scripts/*", "npx --yes hyperframes@0.8.206 render*", "npx hyperframes render*", "npx --yes hyperframes@0.8.206 preview*", "npx hyperframes preview*", "npm run *"];

const ESQUEMA_3D = {
  type: "object",
  properties: {
    status: { type: "string", enum: ["ok", "bloqueado"] },
    resumo: { type: "string" },
    capitulos: { type: "array", items: { type: "string" }, description: "ids dos capítulos criados ou alterados, ex.: c08-ponte" },
    pendencias: { type: "array", items: { type: "string" } },
  },
  required: ["status", "resumo", "capitulos", "pendencias"],
};

function exigirOk(r, etapa) {
  const e = r.estruturado;
  if (!e) throw new ErroEtapa("erro", `A etapa ${etapa} terminou sem a resposta estruturada.`);
  if (e.status === "bloqueado") throw new ErroEtapa("bloqueado", `O agente precisa de uma decisão: ${e.resumo}\n- ${(e.pendencias || []).join("\n- ")}`);
  return e;
}

async function bash(ctx, cwd, args, tempoMaxMs) {
  return rodar(acharBash(ctx.cfg), args, { cwd, env: ambienteLimpo(), tempoMaxMs, sinal: ctx.sinal, log: ctx.log, aoIniciar: ctx.aoIniciar });
}

function guardarCapitulos(ctx, lista) {
  const atuais = new Set(ctx.prod.opcoes.capitulos || []);
  for (const c of lista || []) atuais.add(c.replace(/\.html$/, ""));
  ctx.atualizar({ opcoes: { ...ctx.prod.opcoes, capitulos: [...atuais].sort() } });
}

export const executores = {
  async preparar(ctx) {
    const c = caminhos(ctx);
    if (ctx.prod.pasta && existsSync(join(ctx.prod.pasta, "estudio.json"))) return { pulada: true, resumo: "Tarefa já preparada." };
    // Não mistura o trabalho do agente com alterações suas ainda não commitadas no ep1.
    const g = spawnSync("git", ["-C", c.P.raiz, "status", "--porcelain", "--", c.P.episodio], { encoding: "utf8" });
    const sujos = (g.stdout || "").trim();
    if (g.status === 0 && sujos) {
      throw new ErroEtapa("bloqueado", `Há alterações não commitadas em ${c.P.episodio}/. Faça commit (ou descarte) e clique em "Tentar novamente":\n${ultimasLinhas(sujos, 15)}`);
    }
    const head = spawnSync("git", ["-C", c.P.raiz, "rev-parse", "--short", "HEAD"], { encoding: "utf8" }).stdout?.trim();
    let nome = `${ctx.prod.opcoes.teste ? "_teste-estudio" : slug(ctx.prod.titulo)}`;
    if (existsSync(join(c.ep, "tarefas", nome))) nome = `${nome}-${ctx.prod.id}`;
    const tarefa = join(c.ep, "tarefas", nome);
    mkdirSync(tarefa, { recursive: true });
    writeFileSync(join(tarefa, "entrada.md"), `# Entrada (${ctx.prod.tipo_entrada})\n\n${ctx.prod.entrada.trim()}\n`);
    writeFileSync(join(tarefa, "estudio.json"), JSON.stringify({ producao_id: ctx.prod.id, perfil: "3d", git_head: head, criado_em: new Date().toISOString() }, null, 2) + "\n");
    ctx.atualizar({ pasta: tarefa });
    return { resumo: `Tarefa criada em ${c.P.episodio}/tarefas/${nome} (git ${head}).`, saida: { pasta: tarefa, git_head: head } };
  },

  async roteiro(ctx) {
    const c = caminhos(ctx);
    const r = await ctx.agente({
      etapa: "roteiro",
      cwd: c.ep,
      prompt: ctx.prompt("3d-roteiro", {
        tipo_entrada: ctx.prod.tipo_entrada, entrada: ctx.prod.entrada, tarefa: c.tarefa, ep: c.ep,
        minimundo: c.minimundo, briefing: c.briefing, roteiro_ep1: c.roteiroEp1,
        regras: join(REGRAS, "serie-3d.md"), processo: join(REGRAS, "processo.md"),
        duracao_alvo: ctx.prod.opcoes.duracao_alvo_s || c.P.duracao_alvo_s, feedback: ctx.feedbackTexto(),
      }),
      permitidas: ["Read", "Write", "Edit", "Glob", "Grep"],
      negadas: ["PowerShell", "Bash", "WebFetch", "WebSearch"],
      esquema: ESQUEMA_3D,
    });
    const e = exigirOk(r, "roteiro");
    if (!existsSync(join(c.tarefa, "roteiro.md"))) throw new ErroEtapa("erro", "O agente não escreveu o roteiro da tarefa.");
    guardarCapitulos(ctx, e.capitulos);
    return { resumo: e.resumo, saida: { capitulos: e.capitulos, pendencias: e.pendencias } };
  },

  async voz(ctx) {
    const c = caminhos(ctx);
    const fp = impressao(c.ep, ["voz/lotes.json"]);
    if (ctx.etapa.impressao === fp) return { pulada: true, impressao: fp, resumo: "Vozes reaproveitadas (lotes iguais aos da última geração).", saida: ctx.etapa.saida };
    // gerar-vozes.mjs acha o .env sozinho (subindo pastas) e nunca imprime a chave
    const r = await node(ctx, c.ep, ["scripts/gerar-vozes.mjs"], ctx.tempoMax("voz"));
    if (r.codigo === 2) throw new ErroEtapa("cota", "Cota da voz (Gemini) atingida: 3 por minuto / 10 por dia no plano gratuito. Os lotes prontos ficam salvos.");
    if (r.codigo !== 0) {
      if (/API key|PERMISSION_DENIED|\b401\b|\b403\b/i.test(r.saida)) throw new ErroEtapa("auth", "Chave de voz ausente ou inválida.");
      throw new ErroEtapa("erro", `gerar-vozes.mjs falhou.\n${ultimasLinhas(r.saida, 12)}`);
    }
    const py = join(homedir(), ".cache", "ep1-whisper", "Scripts", "python.exe");
    if (c.P.alinhar_vozes && existsSync(py)) {
      const a = await rodar(py, ["scripts/alinhar-vozes.py"], { cwd: c.ep, env: ambienteLimpo(), tempoMaxMs: ctx.tempoMax("voz"), sinal: ctx.sinal, log: ctx.log, aoIniciar: ctx.aoIniciar });
      if (a.codigo !== 0) throw new ErroEtapa("erro", `alinhar-vozes.py falhou.\n${ultimasLinhas(a.saida, 10)}`);
      const rc = await node(ctx, c.ep, ["scripts/gerar-vozes.mjs", "--recortar"], ctx.tempoMax("voz"));
      if (rc.codigo !== 0) throw new ErroEtapa("erro", `Recorte das vozes falhou.\n${ultimasLinhas(rc.saida, 10)}`);
    }
    return { impressao: fp, resumo: ultimasLinhas(r.saida, 3), saida: { log: ultimasLinhas(r.saida, 20) } };
  },

  async cenas(ctx) {
    const c = caminhos(ctx);
    const r = await ctx.agente({
      etapa: "cenas",
      cwd: c.ep,
      prompt: ctx.prompt("3d-cenas", {
        ep: c.ep, tarefa: c.tarefa, regras: join(REGRAS, "serie-3d.md"), processo: join(REGRAS, "processo.md"),
        capitulos: (ctx.prod.opcoes.capitulos || []).join(", ") || "(definir)", feedback: ctx.feedbackTexto(),
      }),
      permitidas: ["Read", "Write", "Edit", "Glob", "Grep", "Skill", ...shell(SHELL_CENAS)],
      negadas: [...shell(NEGADO_CENAS), "WebFetch", "WebSearch"],
      esquema: ESQUEMA_3D,
    });
    const e = exigirOk(r, "cenas");
    guardarCapitulos(ctx, e.capitulos);
    return { resumo: e.resumo, saida: { capitulos: e.capitulos, pendencias: e.pendencias } };
  },

  async correcao(ctx) {
    const c = caminhos(ctx);
    const r = await ctx.agente({
      etapa: "correcao",
      cwd: c.ep,
      prompt: ctx.prompt("3d-correcao", {
        ep: c.ep, tarefa: c.tarefa, regras: join(REGRAS, "serie-3d.md"), processo: join(REGRAS, "processo.md"),
        capitulos: (ctx.prod.opcoes.capitulos || []).join(", "), feedback: ctx.feedbackTexto() || "(sem texto)",
      }),
      permitidas: ["Read", "Write", "Edit", "Glob", "Grep", "Skill", ...shell(SHELL_CENAS)],
      negadas: [...shell(NEGADO_CENAS), "WebFetch", "WebSearch"],
      esquema: ESQUEMA_3D,
    });
    const e = exigirOk(r, "correcao");
    guardarCapitulos(ctx, e.capitulos);
    return { resumo: e.resumo, saida: { capitulos: e.capitulos, pendencias: e.pendencias } };
  },

  async montagem(ctx) {
    const c = caminhos(ctx);
    const g = await node(ctx, c.ep, ["scripts/gerar-composicoes.mjs"], ctx.tempoMax("montagem"));
    if (g.codigo !== 0) throw new ErroEtapa("correcao", `gerar-composicoes.mjs recusou:\n${ultimasLinhas(g.saida, 20)}`);
    const l = await hyperframes(ctx, c.ep, ["lint"], ctx.tempoMax("montagem"));
    if (l.codigo !== 0) throw new ErroEtapa("correcao", `hyperframes lint encontrou erros:\n${ultimasLinhas(l.saida, 30)}`);
    const caps = ctx.prod.opcoes.capitulos || [];
    const faltando = caps.filter((id) => !existsSync(join(c.ep, "compositions", `${id}.html`)));
    if (faltando.length) throw new ErroEtapa("correcao", `Capítulos sem composição: ${faltando.join(", ")}`);
    return { resumo: `Composições geradas e lint sem erros (${caps.join(", ") || "nenhum capítulo marcado"}).`, saida: { capitulos: caps } };
  },

  async previa(ctx) {
    const c = caminhos(ctx);
    const caps = ctx.prod.opcoes.capitulos || [];
    if (!caps.length) throw new ErroEtapa("bloqueado", "Nenhum capítulo marcado para a prévia.");
    const pasta = join(c.ep, "renders", "previa");
    const partes = [];
    let reaproveitadas = 0;
    const anteriores = ctx.etapa.saida?.impressoes || {};
    const impressoes = {};
    for (const id of caps) {
      const comp = join(c.ep, "compositions", `${id}.html`);
      const fp = impressao(c.ep, ["lib", "voz", "assets", "vendor", "cenas/comum.js", `cenas/${id}.js`, `cenas/${id}.dados.js`, `compositions/${id}.html`]);
      const saida = join(pasta, `${id}.mp4`);
      impressoes[id] = fp;
      if (anteriores[id] === fp && existsSync(saida)) reaproveitadas++;
      else await renderizar(ctx, c.ep, { qualidade: "draft", saida, composicao: `compositions/${id}.html`, duracaoEsperada: duracaoComposicao(comp), tempoMaxMs: ctx.tempoMax("previa") });
      partes.push(saida);
    }
    let video = partes[0];
    if (partes.length > 1) {
      video = join(pasta, `${c.nome}.mp4`);
      const j = await bash(ctx, c.ep, ["scripts/juntar.sh", `renders/previa/${c.nome}.mp4`, ...caps.map((id) => `renders/previa/${id}.mp4`)], ctx.tempoMax("previa"));
      if (j.codigo !== 0) throw new ErroEtapa("erro", `juntar.sh falhou.\n${ultimasLinhas(j.saida, 10)}`);
    }
    const q = quadrosDeRevisao(video, join(pasta, `${c.nome}-quadros`), 10);
    const l = loudness(video);
    return {
      resumo: `Prévia de ${caps.length} capítulo(s): ${q.duracao_s}s (${reaproveitadas} reaproveitado(s)).`,
      saida: { arquivo: video, impressoes, ...q, ...l, quadros: q.quadros.map((x) => join(pasta, `${c.nome}-quadros`, x.arquivo)), folha: join(pasta, `${c.nome}-quadros`, q.folha) },
    };
  },

  async render_final(ctx) {
    const c = caminhos(ctx);
    const todos = capitulosDe(c.ep).map((f) => `compositions/${f}`);
    // render-partes.sh pula sozinho o que já está em dia
    const r = await bash(ctx, c.ep, ["scripts/render-partes.sh", ...todos], ctx.tempoMax("render_final"));
    if (r.codigo !== 0) throw new ErroEtapa("erro", `render-partes.sh falhou.\n${ultimasLinhas(r.saida, 12)}`);
    const saidaRel = `renders/final/${c.nome}.mp4`;
    const j = await bash(ctx, c.ep, ["scripts/juntar.sh", saidaRel, ...todos.map((f) => `renders/partes/${basename(f, ".html")}.mp4`)], ctx.tempoMax("render_final"));
    if (j.codigo !== 0) throw new ErroEtapa("erro", `juntar.sh falhou.\n${ultimasLinhas(j.saida, 10)}`);
    await node(ctx, c.ep, ["scripts/montar-indice.mjs"], ctx.tempoMax("montagem"));
    const final = join(c.ep, saidaRel);
    const info = sondar(final);
    const l = loudness(final);
    const pastaQ = join(c.ep, "renders", "final", `${c.nome}-quadros`);
    const q = quadrosDeRevisao(final, pastaQ, 12);
    return {
      resumo: `Episódio montado: ${info.duracao_s}s, ${todos.length} capítulos, ${l.lufs} LUFS. ${ultimasLinhas(r.saida, 1)}`,
      saida: { arquivo: final, ...info, ...l, quadros: q.quadros.map((x) => join(pastaQ, x.arquivo)), folha: join(pastaQ, q.folha) },
    };
  },

  async metadados(ctx) {
    const c = caminhos(ctx);
    const r = await ctx.agente({
      etapa: "metadados",
      cwd: c.tarefa,
      prompt: ctx.prompt("3d-metadados", { tarefa: c.tarefa, minimundo: c.minimundo, briefing: c.briefing, regras: join(REGRAS, "serie-3d.md"), duracao: ctx.saidaDe("render_final")?.duracao_s ?? "?", feedback: ctx.feedbackTexto() }),
      permitidas: ["Read", "Write", "Edit", "Glob", "Grep"],
      negadas: ["PowerShell", "Bash", "WebFetch", "WebSearch"],
      esquema: ESQUEMA_METADADOS,
    });
    const m = r.estruturado;
    if (!m?.titulo) throw new ErroEtapa("erro", "O agente não devolveu título e descrição.");
    const final = ctx.saidaDe("render_final")?.arquivo;
    if (final) extrairQuadro(final, Math.max(0, Number(m.capa_segundo) || 1), join(c.tarefa, "capa-sugerida.jpg"));
    ctx.salvarMetadados(m);
    return { resumo: `Título sugerido: ${m.titulo}` };
  },

  async entrega(ctx) {
    const c = caminhos(ctx);
    const final = ctx.saidaDe("render_final")?.arquivo;
    if (!final || !existsSync(final)) throw new ErroEtapa("erro", "Render final não encontrado.");
    const versao = (ctx.prod.opcoes.versao_entrega || 0) + 1;
    const m = { ...(ctx.prod.metadados || {}), data_postagem: ctx.prod.data_postagem };
    const dia = (ctx.prod.data_postagem || new Date().toISOString()).slice(0, 10);
    const pasta = join(ENTREGAS, `${dia}-3d-${c.nome}`);
    const nomeMp4 = `${c.nome}_final_v${String(versao).padStart(2, "0")}.mp4`;
    writeFileSync(join(c.tarefa, "publicacao.md"), textoPublicacao(m, `Publicação — ${ctx.prod.titulo}`, secaoLicencas(join(c.tarefa, "publicacao.md"))));
    escreverEntrega(pasta, { [nomeMp4]: final, "capa-sugerida.jpg": join(c.tarefa, "capa-sugerida.jpg"), "publicacao.md": join(c.tarefa, "publicacao.md") }, m,
      `${ctx.prod.titulo}\nData planejada: ${ctx.prod.data_postagem || "a definir"}\n\nVídeo: ${nomeMp4}\nTexto e tags: publicacao.md / metadados.json\nCréditos de áudio: ${join(c.ep, "CREDITOS.md")}\n\nDepois de postar, marque como publicado no Estúdio.\n`);
    ctx.atualizar({ entrega: pasta, opcoes: { ...ctx.prod.opcoes, versao_entrega: versao } });
    return { resumo: `Pronto para conferir e postar: ${pasta}`, saida: { pasta, video: join(pasta, nomeMp4) } };
  },
};

export function materialRevisao(ctx, portao) {
  const c = caminhos(ctx);
  const base = { cwd: c.ep, regras: [join(REGRAS, "processo.md"), join(REGRAS, "serie-3d.md"), c.minimundo, c.briefing] };
  if (portao === "roteiro") {
    return { ...base, arquivos: [join(c.tarefa, "entrada.md"), join(c.tarefa, "roteiro.md"), join(c.ep, "voz", "lotes.json")], medidas: ctx.saidaDe("roteiro") };
  }
  const s = ctx.saidaDe(portao === "previa" ? "previa" : "render_final") || {};
  return {
    ...base,
    arquivos: [join(c.tarefa, "roteiro.md"), portao === "final" ? join(c.tarefa, "publicacao.md") : null, s.folha, ...(s.quadros || [])].filter(Boolean),
    medidas: { video: { duracao_s: s.duracao_s, largura: s.largura, altura: s.altura, lufs: s.lufs }, capitulos: ctx.prod.opcoes.capitulos, metadados: portao === "final" ? ctx.prod.metadados : undefined },
  };
}

export function arquivosVisiveis(prod) {
  if (!prod.pasta) return [];
  const ep = join(prod.pasta, "..", "..");
  const nome = basename(prod.pasta);
  const lista = [
    { rotulo: "Entrada", caminho: join(prod.pasta, "entrada.md") },
    { rotulo: "Roteiro da tarefa", caminho: join(prod.pasta, "roteiro.md") },
    { rotulo: "Roteiro da tarefa (texto simples)", caminho: join(prod.pasta, "roteiro.txt") },
    { rotulo: "Publicação", caminho: join(prod.pasta, "publicacao.md") },
    { rotulo: "Prévia", caminho: join(ep, "renders", "previa", `${nome}.mp4`), tipo: "video", papel: "previa" },
    ...(prod.opcoes.capitulos || []).map((id) => ({ rotulo: `Prévia ${id}`, caminho: join(ep, "renders", "previa", `${id}.mp4`), tipo: "video" })),
    { rotulo: "Quadros da prévia", caminho: join(ep, "renders", "previa", `${nome}-quadros`, "folha.jpg"), tipo: "imagem" },
    { rotulo: "Vídeo final", caminho: join(ep, "renders", "final", `${nome}.mp4`), tipo: "video", papel: "final" },
    { rotulo: "Quadros do final", caminho: join(ep, "renders", "final", `${nome}-quadros`, "folha.jpg"), tipo: "imagem" },
    { rotulo: "Capa sugerida", caminho: join(prod.pasta, "capa-sugerida.jpg"), tipo: "imagem" },
  ];
  return lista.filter((a) => existsSync(a.caminho));
}
