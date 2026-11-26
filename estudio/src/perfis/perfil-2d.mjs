// Perfil 2D: Shorts do canal de curiosidades históricas absurdas (curso-animacao-lab-2d).
// Reaproveita o modelo de episódio e o kit do EP001 (tools/voz.mjs, build.mjs, master.mjs,
// sfx.py, rig.js, fontes e efeitos). Cada episódio novo vive em producao/epNNN-nome/.
import { copyFileSync, existsSync, mkdirSync, readdirSync, readFileSync, writeFileSync } from "node:fs";
import { basename, join } from "node:path";
import { ENTREGAS, REGRAS } from "../config.mjs";
import { ErroEtapa, ultimasLinhas } from "../processos.mjs";
import { ambienteLimpo, lerEnv } from "../segredos.mjs";
import {
  copiarPasta, escreverEntrega, extrairQuadro, hyperframes, impressao, loudness, node,
  quadrosDeRevisao, renderizar, secaoLicencas, slug, sondar, textoPublicacao,
} from "./comum.mjs";

export const ETAPAS = [
  "preparar", "roteiro", "revisao_roteiro", "voz", "cenas", "montagem", "previa",
  "revisao_previa", "render_final", "metadados", "revisao_final", "entrega",
];

const caminhos = (ctx) => {
  const P = ctx.perfil;
  const ep = ctx.prod.pasta;
  return {
    P, ep, video: ep && join(ep, "video"), nome: ep && basename(ep),
    modelo: join(P.raiz, P.modelo_episodio),
    kit: join(P.raiz, P.kit_video),
    ref: join(P.raiz, P.referencia),
    biblia: join(P.raiz, "identidade-visual", "biblia-visual.md"),
    escopo: join(P.raiz, "docs", "escopo.md"),
  };
};
const alvo = (ctx) => Number(ctx.prod.opcoes.duracao_alvo_s || ctx.perfil.duracao_alvo_s);
const palavras = (t) => t.split(/\s+/).filter(Boolean).length;
const lerTiming = (video) => {
  const t = readFileSync(join(video, "assets", "js", "timing.js"), "utf8");
  return JSON.parse(t.slice(t.indexOf("{"), t.lastIndexOf("}") + 1));
};
const fontesDoVideo = (video) => impressao(video, ["index.html", "compositions", "assets", "cenas.json"]);

// Ferramentas do agente de cenas: escrever no projeto, montar e conferir. Voz e render são
// do executor (custo e tempo controlados), por isso ficam negados aqui.
const SHELL_CENAS = ["node tools/build.mjs*", "npx hyperframes *", "npx --yes hyperframes@0.8.206 *", "python tools/sfx.py*", "ffprobe *"];
const NEGADO_CENAS = ["node tools/voz.mjs*", "npx hyperframes render*", "npx --yes hyperframes@0.8.206 render*", "npx hyperframes preview*", "npx --yes hyperframes@0.8.206 preview*", "npx hyperframes publish*", "npm run *"];
const shell = (padroes) => padroes.flatMap((p) => [`PowerShell(${p})`, `Bash(${p})`]);

const ESQUEMA_TRABALHO = {
  type: "object",
  properties: {
    status: { type: "string", enum: ["ok", "bloqueado"] },
    resumo: { type: "string" },
    pendencias: { type: "array", items: { type: "string" } },
  },
  required: ["status", "resumo", "pendencias"],
};

function exigirOk(r, etapa) {
  const e = r.estruturado;
  if (!e) throw new ErroEtapa("erro", `A etapa ${etapa} terminou sem a resposta estruturada.`);
  if (e.status === "bloqueado") throw new ErroEtapa("bloqueado", `O agente precisa de uma decisão: ${e.resumo}\n- ${(e.pendencias || []).join("\n- ")}`);
  return e;
}

// ------------------------------------------------------------------- etapas
export const executores = {
  async preparar(ctx) {
    const { P, modelo, kit } = caminhos(ctx);
    if (ctx.prod.pasta && existsSync(join(ctx.prod.pasta, "estudio.json"))) return { pulada: true, resumo: "Pasta já preparada." };
    const producao = join(P.raiz, "producao");
    let nome;
    if (ctx.prod.opcoes.teste) nome = "_teste-estudio";
    else {
      const usados = readdirSync(producao).map((d) => /^ep(\d{3})-/.exec(d)).filter(Boolean).map((m) => Number(m[1]));
      nome = `ep${String(Math.max(0, ...usados) + 1).padStart(3, "0")}-${slug(ctx.prod.titulo)}`;
    }
    if (existsSync(join(producao, nome))) nome = `${nome}-${ctx.prod.id}`;
    const ep = join(producao, nome);
    const video = join(ep, "video");

    copiarPasta(modelo, ep);
    mkdirSync(video, { recursive: true });
    for (const item of ["tools", "assets/js/rig.js", "assets/fonts", "assets/sfx", "hyperframes.json", "AGENTS.md", "CLAUDE.md", ".env.example"]) {
      copiarPasta(join(kit, item), join(video, item));
    }
    mkdirSync(join(video, "assets", "voice"), { recursive: true });
    mkdirSync(join(video, "compositions"), { recursive: true });
    const pkg = JSON.parse(readFileSync(join(kit, "package.json"), "utf8"));
    writeFileSync(join(video, "package.json"), JSON.stringify({ ...pkg, name: nome }, null, 2) + "\n");
    writeFileSync(join(video, "meta.json"), JSON.stringify({ id: nome, name: nome, createdAt: new Date().toISOString() }, null, 2) + "\n");
    writeFileSync(join(ep, "entrada.md"), `# Entrada (${ctx.prod.tipo_entrada})\n\n${ctx.prod.entrada.trim()}\n`);
    writeFileSync(join(ep, "estudio.json"), JSON.stringify({ producao_id: ctx.prod.id, perfil: "2d", criado_em: new Date().toISOString() }, null, 2) + "\n");
    ctx.atualizar({ pasta: ep });
    return { resumo: `Pasta criada: producao/${nome} (modelo de episódio + kit do EP001).`, saida: { pasta: ep } };
  },

  async roteiro(ctx) {
    const c = caminhos(ctx);
    const r = await ctx.agente({
      etapa: "roteiro",
      cwd: c.ep,
      prompt: ctx.prompt("2d-roteiro", {
        tipo_entrada: ctx.prod.tipo_entrada,
        entrada: ctx.prod.entrada,
        serie: ctx.prod.opcoes.serie || "(escolha a série que melhor se encaixa)",
        duracao_alvo: alvo(ctx),
        palavras_max: Math.round(alvo(ctx) * 2.4),
        feedback: ctx.feedbackTexto(),
        regras: join(REGRAS, "canal-2d.md"),
        processo: join(REGRAS, "processo.md"),
        biblia: c.biblia,
        escopo: c.escopo,
        referencia: c.ref,
      }),
      permitidas: ["Read", "Write", "Edit", "Glob", "Grep", "WebSearch", "WebFetch"],
      negadas: ["PowerShell", "Bash"],
      esquema: ESQUEMA_TRABALHO,
    });
    const e = exigirOk(r, "roteiro");
    const narr = join(c.ep, "narracao.txt");
    if (!existsSync(narr) || !readFileSync(narr, "utf8").trim()) throw new ErroEtapa("erro", "O agente não escreveu narracao.txt.");
    const n = palavras(readFileSync(narr, "utf8"));
    return { resumo: e.resumo, saida: { palavras: n, estimativa_s: Math.round(n / 2.5), alvo_s: alvo(ctx), pendencias: e.pendencias } };
  },

  async voz(ctx) {
    const c = caminhos(ctx);
    const wav = join(c.video, "assets", "voice", "narracao.wav");
    // a voz escolhida (nome, não segredo) entra na impressão: trocar de voz regera
    const envs = (c.P.env_voz || []).map((f) => lerEnv(join(c.P.raiz, f)));
    const chaves = envs.find((e) => e.GEMINI_API_KEY || e.ELEVENLABS_API_KEY) || {};
    const fp = impressao(c.video, ["tools/voz.mjs", "../narracao.txt"], `${chaves.GEMINI_VOICE || ""}|${chaves.ELEVENLABS_VOICE_ID || ""}`);
    if (ctx.etapa.impressao === fp && existsSync(wav)) {
      return { pulada: true, impressao: fp, resumo: "Narração reaproveitada (texto e voz iguais aos da última geração).", saida: ctx.etapa.saida };
    }
    if (!existsSync(join(c.video, ".env")) && !chaves.GEMINI_API_KEY && !chaves.ELEVENLABS_API_KEY) {
      throw new ErroEtapa("auth", "Nenhuma chave de voz encontrada. Preencha GEMINI_API_KEY no .env indicado em config/estudio.json (perfis.2d.env_voz).");
    }
    const extra = {};
    for (const k of ["GEMINI_API_KEY", "GEMINI_VOICE", "ELEVENLABS_API_KEY", "ELEVENLABS_VOICE_ID"]) if (chaves[k]) extra[k] = chaves[k];
    const r = await node(ctx, c.video, ["tools/voz.mjs"], ctx.tempoMax("voz"), ambienteLimpo(extra));
    if (r.codigo !== 0) {
      if (/429|RESOURCE_EXHAUSTED|quota|cota/i.test(r.saida)) throw new ErroEtapa("cota", "Cota da voz (Gemini) esgotada. Tente mais tarde.");
      if (/API key not valid|API_KEY_INVALID|PERMISSION_DENIED|\b401\b|\b403\b|Nenhuma chave/i.test(r.saida)) throw new ErroEtapa("auth", "Chave de voz ausente ou inválida.");
      throw new ErroEtapa("erro", `A geração de voz falhou.\n${ultimasLinhas(r.saida, 12)}`);
    }
    const info = sondar(wav);
    const aviso = info.duracao_s > alvo(ctx) * 1.3 ? `A narração ficou com ${info.duracao_s}s (alvo ${alvo(ctx)}s).` : null;
    return { impressao: fp, resumo: `Narração gerada: ${info.duracao_s}s.${aviso ? " " + aviso : ""}`, saida: { duracao_s: info.duracao_s, alvo_s: alvo(ctx), aviso } };
  },

  async cenas(ctx) {
    const c = caminhos(ctx);
    const r = await ctx.agente({
      etapa: "cenas",
      cwd: c.video,
      dirs: [c.ep],
      prompt: ctx.prompt("2d-cenas", {
        ep: c.ep, video: c.video, ref: c.ref, duracao_voz: ctx.saidaDe("voz")?.duracao_s ?? "?",
        regras: join(REGRAS, "canal-2d.md"), processo: join(REGRAS, "processo.md"), biblia: c.biblia,
        hyperframes: ctx.cfg.hyperframes, feedback: ctx.feedbackTexto(),
      }),
      permitidas: ["Read", "Write", "Edit", "Glob", "Grep", "Skill", ...shell(SHELL_CENAS)],
      negadas: [...shell(NEGADO_CENAS), "WebFetch", "WebSearch"],
      esquema: ESQUEMA_TRABALHO,
    });
    const e = exigirOk(r, "cenas");
    if (!existsSync(join(c.video, "cenas.json"))) throw new ErroEtapa("erro", "O agente não escreveu video/cenas.json.");
    return { resumo: e.resumo, saida: { pendencias: e.pendencias } };
  },

  async correcao(ctx) {
    const c = caminhos(ctx);
    const r = await ctx.agente({
      etapa: "correcao",
      cwd: c.video,
      dirs: [c.ep],
      prompt: ctx.prompt("2d-correcao", {
        ep: c.ep, video: c.video, ref: c.ref, feedback: ctx.feedbackTexto() || "(sem texto)",
        regras: join(REGRAS, "canal-2d.md"), processo: join(REGRAS, "processo.md"), biblia: c.biblia, hyperframes: ctx.cfg.hyperframes,
      }),
      permitidas: ["Read", "Write", "Edit", "Glob", "Grep", "Skill", ...shell(SHELL_CENAS)],
      negadas: [...shell(NEGADO_CENAS), "WebFetch", "WebSearch"],
      esquema: ESQUEMA_TRABALHO,
    });
    const e = exigirOk(r, "correcao");
    return { resumo: e.resumo, saida: { pendencias: e.pendencias } };
  },

  async montagem(ctx) {
    const c = caminhos(ctx);
    const b = await node(ctx, c.video, ["tools/build.mjs"], ctx.tempoMax("montagem"));
    if (b.codigo !== 0) throw new ErroEtapa("correcao", `tools/build.mjs falhou:\n${ultimasLinhas(b.saida, 20)}`);
    const k = await hyperframes(ctx, c.video, ["check"], ctx.tempoMax("montagem"));
    if (k.codigo !== 0) throw new ErroEtapa("correcao", `hyperframes check encontrou erros:\n${ultimasLinhas(k.saida, 30)}`);
    const t = lerTiming(c.video);
    return { resumo: `Montado: ${t.total}s, ${Object.keys(t.cenas).length} cenas; check sem erros.`, saida: { duracao_s: t.total, cenas: Object.keys(t.cenas).length, check: ultimasLinhas(k.saida, 8) } };
  },

  async previa(ctx) {
    const c = caminhos(ctx);
    const saida = join(c.video, "renders", "previa.mp4");
    const pastaQ = join(c.video, "renders", "previa-quadros");
    const fp = fontesDoVideo(c.video);
    let info;
    let pulada = false;
    if (ctx.etapa.impressao === fp && existsSync(saida)) {
      pulada = true;
      info = sondar(saida);
    } else {
      info = await renderizar(ctx, c.video, { qualidade: "draft", saida, duracaoEsperada: lerTiming(c.video).total, tempoMaxMs: ctx.tempoMax("previa") });
    }
    const q = quadrosDeRevisao(saida, pastaQ, 10);
    const l = loudness(saida);
    return {
      pulada, impressao: fp,
      resumo: `${pulada ? "Prévia reaproveitada" : "Prévia renderizada"}: ${info.duracao_s}s, ${info.largura}×${info.altura}, ${l.lufs} LUFS.`,
      saida: { arquivo: saida, ...info, ...l, quadros: q.quadros.map((x) => join(pastaQ, x.arquivo)), folha: join(pastaQ, q.folha) },
    };
  },

  async render_final(ctx) {
    const c = caminhos(ctx);
    const mix = join(c.video, "renders", `${c.nome}.mix.mp4`);
    const final = join(c.video, "renders", `${c.nome}.mp4`);
    const fp = fontesDoVideo(c.video);
    if (ctx.etapa.impressao === fp && existsSync(final)) {
      return { pulada: true, impressao: fp, resumo: "Render final reaproveitado (nada mudou desde o último).", saida: ctx.etapa.saida };
    }
    await renderizar(ctx, c.video, { qualidade: "delivery", saida: mix, duracaoEsperada: lerTiming(c.video).total, tempoMaxMs: ctx.tempoMax("render_final") });
    const m = await node(ctx, c.video, ["tools/master.mjs", mix, final], ctx.tempoMax("render_final"));
    if (m.codigo !== 0 || !existsSync(final)) throw new ErroEtapa("erro", `A masterização falhou.\n${ultimasLinhas(m.saida, 10)}`);
    const info = sondar(final);
    const l = loudness(final);
    const pastaQ = join(c.video, "renders", "final-quadros");
    const q = quadrosDeRevisao(final, pastaQ, 10);
    return {
      impressao: fp,
      resumo: `Final: ${info.duracao_s}s, ${info.largura}×${info.altura}, ${l.lufs} LUFS / ${l.pico_dbtp} dBTP.`,
      saida: { arquivo: final, ...info, ...l, quadros: q.quadros.map((x) => join(pastaQ, x.arquivo)), folha: join(pastaQ, q.folha) },
    };
  },

  async metadados(ctx) {
    const c = caminhos(ctx);
    const r = await ctx.agente({
      etapa: "metadados",
      cwd: c.ep,
      prompt: ctx.prompt("2d-metadados", {
        ep: c.ep, ref: c.ref, regras: join(REGRAS, "canal-2d.md"), escopo: c.escopo,
        duracao: ctx.saidaDe("render_final")?.duracao_s ?? "?", feedback: ctx.feedbackTexto(),
      }),
      permitidas: ["Read", "Write", "Edit", "Glob", "Grep"],
      negadas: ["PowerShell", "Bash", "WebFetch", "WebSearch"],
      esquema: ESQUEMA_METADADOS,
    });
    const m = r.estruturado;
    if (!m?.titulo) throw new ErroEtapa("erro", "O agente não devolveu título e descrição.");
    const final = ctx.saidaDe("render_final")?.arquivo;
    const capa = join(c.video, "renders", "capa-sugerida.jpg");
    if (final) extrairQuadro(final, Math.max(0, Number(m.capa_segundo) || 1), capa);
    ctx.salvarMetadados(m);
    return { resumo: `Título sugerido: ${m.titulo}`, saida: { capa } };
  },

  async entrega(ctx) {
    const c = caminhos(ctx);
    const final = ctx.saidaDe("render_final")?.arquivo;
    if (!final || !existsSync(final)) throw new ErroEtapa("erro", "Render final não encontrado.");
    const versao = (ctx.prod.opcoes.versao_entrega || 0) + 1;
    const m = { ...(ctx.prod.metadados || {}), data_postagem: ctx.prod.data_postagem };
    const dia = (ctx.prod.data_postagem || new Date().toISOString()).slice(0, 10);
    const pasta = join(ENTREGAS, `${dia}-${c.nome}`);
    const nomeMp4 = `${c.nome}_final_v${String(versao).padStart(2, "0")}.mp4`;
    // publicacao.md do episódio passa a refletir os metadados aprovados (licenças preservadas)
    const pub = textoPublicacao(m, `Publicação — ${ctx.prod.titulo}`, secaoLicencas(join(c.ep, "publicacao.md")));
    writeFileSync(join(c.ep, "publicacao.md"), pub);
    mkdirSync(join(c.ep, "export"), { recursive: true });
    copyFileSync(final, join(c.ep, "export", nomeMp4));
    escreverEntrega(pasta, { [nomeMp4]: final, "capa-sugerida.jpg": join(c.video, "renders", "capa-sugerida.jpg"), "publicacao.md": join(c.ep, "publicacao.md") }, m, leiame(ctx, nomeMp4, c));
    ctx.atualizar({ entrega: pasta, opcoes: { ...ctx.prod.opcoes, versao_entrega: versao } });
    return { resumo: `Pronto para conferir e postar: ${pasta}`, saida: { pasta, video: join(pasta, nomeMp4) } };
  },
};

export const ESQUEMA_METADADOS = {
  type: "object",
  properties: {
    titulo: { type: "string" },
    titulos_alternativos: { type: "array", items: { type: "string" } },
    descricao: { type: "string" },
    hashtags: { type: "array", items: { type: "string" } },
    tags: { type: "array", items: { type: "string" } },
    comentario_fixado: { type: "string" },
    capa_segundo: { type: "number" },
  },
  required: ["titulo", "descricao", "hashtags", "tags", "comentario_fixado", "capa_segundo"],
};

function leiame(ctx, nomeMp4, c) {
  const pend = existsSync(join(c.ep, "checklist.md")) ? readFileSync(join(c.ep, "checklist.md"), "utf8") : "";
  return [
    `${ctx.prod.titulo}`,
    `Data planejada: ${ctx.prod.data_postagem || "a definir"}`,
    "",
    `Vídeo: ${nomeMp4} (1080x1920, masterizado a -14 LUFS)`,
    "Texto, hashtags e tags: publicacao.md e metadados.json",
    "Capa: capa-sugerida.jpg (quadro do vídeo; troque se quiser)",
    "",
    "Antes de postar, confira o checklist do episódio:",
    pend,
    "Depois de postar, marque como publicado no Estúdio.",
  ].join("\n");
}

// --------------------------------------------------------- material de revisão
export function materialRevisao(ctx, portao) {
  const c = caminhos(ctx);
  const base = {
    cwd: c.ep,
    regras: [join(REGRAS, "processo.md"), join(REGRAS, "canal-2d.md"), c.biblia],
  };
  if (portao === "roteiro") {
    return {
      ...base,
      regras: [...base.regras, c.escopo],
      arquivos: ["entrada.md", "roteiro.md", "narracao.txt", "briefing.md"].map((f) => join(c.ep, f)),
      medidas: ctx.saidaDe("roteiro"),
      web: true,
    };
  }
  if (portao === "previa") {
    const p = ctx.saidaDe("previa") || {};
    return {
      ...base,
      arquivos: [join(c.ep, "roteiro.md"), join(c.ep, "plano-de-cenas.md"), join(c.ep, "narracao.txt"), p.folha, ...(p.quadros || [])].filter(Boolean),
      medidas: { previa: { duracao_s: p.duracao_s, largura: p.largura, altura: p.altura, fps: p.fps, lufs_previa: p.lufs }, voz: ctx.saidaDe("voz"), alvo_s: alvo(ctx) },
    };
  }
  const f = ctx.saidaDe("render_final") || {};
  return {
    ...base,
    arquivos: [join(c.ep, "roteiro.md"), join(c.ep, "publicacao.md"), f.folha, ...(f.quadros || [])].filter(Boolean),
    medidas: { final: { duracao_s: f.duracao_s, largura: f.largura, altura: f.altura, fps: f.fps, lufs: f.lufs, pico_dbtp: f.pico_dbtp }, metadados: ctx.prod.metadados, alvo_s: alvo(ctx) },
  };
}

// Arquivos que a interface mostra (só dentro da pasta do conteúdo ou da entrega).
export function arquivosVisiveis(prod) {
  if (!prod.pasta) return [];
  const v = join(prod.pasta, "video", "renders");
  const nome = basename(prod.pasta);
  const lista = [
    { rotulo: "Entrada", caminho: join(prod.pasta, "entrada.md") },
    { rotulo: "Roteiro", caminho: join(prod.pasta, "roteiro.md") },
    { rotulo: "Narração (texto)", caminho: join(prod.pasta, "narracao.txt") },
    { rotulo: "Briefing", caminho: join(prod.pasta, "briefing.md") },
    { rotulo: "Plano de cenas", caminho: join(prod.pasta, "plano-de-cenas.md") },
    { rotulo: "Publicação", caminho: join(prod.pasta, "publicacao.md") },
    { rotulo: "Narração (áudio)", caminho: join(prod.pasta, "video", "assets", "voice", "narracao.wav"), tipo: "audio" },
    { rotulo: "Prévia", caminho: join(v, "previa.mp4"), tipo: "video", papel: "previa" },
    { rotulo: "Quadros da prévia", caminho: join(v, "previa-quadros", "folha.jpg"), tipo: "imagem" },
    { rotulo: "Vídeo final", caminho: join(v, `${nome}.mp4`), tipo: "video", papel: "final" },
    { rotulo: "Quadros do final", caminho: join(v, "final-quadros", "folha.jpg"), tipo: "imagem" },
    { rotulo: "Capa sugerida", caminho: join(v, "capa-sugerida.jpg"), tipo: "imagem" },
  ];
  return lista.filter((a) => existsSync(a.caminho));
}
