// Interface local do Estúdio: fila, cronograma, revisões, prévias e metadados.
// Só escuta em 127.0.0.1. Pedidos que alteram algo exigem o cabeçalho X-Estudio (bloqueia
// formulários de outros sites) e o Host precisa ser local (bloqueia DNS rebinding).
// Uso: node src/servidor.mjs   →   http://127.0.0.1:4380
import { spawn } from "node:child_process";
import { createReadStream, existsSync, readdirSync, readFileSync, statSync, writeFileSync } from "node:fs";
import { createServer } from "node:http";
import { basename, extname, join, resolve, sep } from "node:path";
import { estadoLogin } from "./agente.mjs";
import { carregarConfig, LOGS, RAIZ } from "./config.mjs";
import * as D from "./db.mjs";
import { decidir, PERFIS, PORTOES, ROTULOS } from "./pipeline.mjs";
import { secaoLicencas, textoPublicacao } from "./perfis/comum.mjs";
import { carregarSegredos, limpar } from "./segredos.mjs";

const cfg = carregarConfig();
carregarSegredos(cfg);
const PORTA = Number(process.env.ESTUDIO_PORTA || cfg.porta);
const WEB = join(RAIZ, "web");
const TIPOS = { ".html": "text/html; charset=utf-8", ".js": "text/javascript; charset=utf-8", ".css": "text/css; charset=utf-8", ".mp4": "video/mp4", ".wav": "audio/wav", ".jpg": "image/jpeg", ".png": "image/png", ".md": "text/plain; charset=utf-8", ".txt": "text/plain; charset=utf-8", ".json": "application/json; charset=utf-8", ".log": "text/plain; charset=utf-8" };
const ATALHO = join(process.env.APPDATA || "", "Microsoft", "Windows", "Start Menu", "Programs", "Startup", "Estudio-Video.vbs");

// ------------------------------------------------------------------ apoio
const enviar = (res, codigo, corpo, tipo = "application/json; charset=utf-8") => {
  res.writeHead(codigo, { "Content-Type": tipo, "Cache-Control": "no-store", "X-Content-Type-Options": "nosniff" });
  res.end(typeof corpo === "string" || Buffer.isBuffer(corpo) ? corpo : JSON.stringify(corpo));
};
const lerCorpo = (req) =>
  new Promise((ok, falha) => {
    let t = "";
    req.on("data", (c) => { t += c; if (t.length > 2_000_000) { falha(new Error("Pedido grande demais.")); req.destroy(); } });
    req.on("end", () => { try { ok(t ? JSON.parse(t) : {}); } catch { falha(new Error("JSON inválido.")); } });
  });

function executorVivo() {
  const e = D.ajuste("executor");
  return !!(e && Date.now() - Date.parse(e.batimento) < 12_000);
}

// Pastas que a interface pode servir para uma produção.
function raizesPermitidas(prod) {
  const r = [prod.pasta, prod.entrega].filter(Boolean);
  if (prod.perfil === "3d") r.push(join(cfg.perfis["3d"].raiz, cfg.perfis["3d"].episodio, "renders"));
  return r.map((p) => resolve(p));
}
function caminhoPermitido(prod, f) {
  const abs = resolve(f);
  if (/^\.env/i.test(basename(abs)) || /credentials/i.test(basename(abs))) return null;
  return raizesPermitidas(prod).some((r) => abs === r || abs.startsWith(r + sep)) && existsSync(abs) ? abs : null;
}
const urlArquivo = (id, f, baixar) => `/api/producoes/${id}/arquivo?f=${encodeURIComponent(f)}${baixar ? "&baixar=1" : ""}`;

function resumo(p) {
  return {
    id: p.id, titulo: p.titulo, perfil: p.perfil, status: p.status, etapa_atual: p.etapa_atual, etapa_rotulo: ROTULOS[p.etapa_atual],
    progresso: p.progresso, prioridade: p.prioridade, data_postagem: p.data_postagem, motivo: p.motivo, motivo_tipo: p.motivo_tipo,
    modos_revisao: p.modos_revisao, criado_em: p.criado_em, atualizado_em: p.atualizado_em, publicado_em: p.publicado_em,
    titulo_publicacao: p.metadados?.titulo || null, rodada_correcao: p.rodada_correcao, teste: !!p.opcoes.teste,
  };
}

function detalhe(id) {
  const p = D.producao(id);
  if (!p) return null;
  const P = PERFIS[p.perfil];
  const etapas = D.etapasDe(id);
  const ordem = [...P.ETAPAS, "correcao"];
  etapas.sort((a, b) => ordem.indexOf(a.etapa) - ordem.indexOf(b.etapa));
  const arquivos = P.arquivosVisiveis(p).map((a) => ({ ...a, url: urlArquivo(id, a.caminho), baixar: urlArquivo(id, a.caminho, true), nome: basename(a.caminho) }));
  if (p.entrega && existsSync(p.entrega)) {
    for (const f of listarPasta(p.entrega)) arquivos.push({ rotulo: `Entrega · ${f}`, caminho: join(p.entrega, f), nome: f, entrega: true, tipo: f.endsWith(".mp4") ? "video" : f.endsWith(".jpg") ? "imagem" : null, papel: f.endsWith(".mp4") ? "entrega" : null, url: urlArquivo(id, join(p.entrega, f)), baixar: urlArquivo(id, join(p.entrega, f), true) });
  }
  const portao = PORTOES[p.etapa_atual] || null;
  return {
    producao: { ...resumo(p), entrada: p.entrada, tipo_entrada: p.tipo_entrada, opcoes: p.opcoes, pasta: p.pasta, entrega: p.entrega, metadados: p.metadados, metadados_sugeridos: p.metadados_sugeridos, metadados_editados_em: p.metadados_editados_em, link_publicacao: p.link_publicacao, feedback: p.feedback, execucoes_agente: p.execucoes_agente },
    etapas: etapas.map((e) => ({ etapa: e.etapa, rotulo: ROTULOS[e.etapa], status: e.status, tentativas: e.tentativas, aprovacao: e.aprovacao, ultimo_erro: e.ultimo_erro ? limpar(e.ultimo_erro) : null, iniciado_em: e.iniciado_em, concluido_em: e.concluido_em, portao: PORTOES[e.etapa] || null, resumo_saida: e.saida ? limpar(JSON.stringify(e.saida)).slice(0, 600) : null })),
    revisoes: D.revisoesDe(id),
    execucoes: D.execucoesDe(id).map((x) => ({ ...x, rotulo: ROTULOS[x.etapa] || x.etapa, log: undefined, tem_log: !!x.log && existsSync(x.log) })),
    historico: D.historicoDe(id),
    arquivos,
    decisao: p.status === "aguardando_humano" ? { portao, etapa: p.etapa_atual, rotulo: ROTULOS[p.etapa_atual], motivo: p.motivo, motivo_tipo: p.motivo_tipo } : null,
  };
}
const listarPasta = (pasta) => readdirSync(pasta).filter((f) => !f.startsWith("."));

// Reescreve publicacao.md (pasta do conteúdo e entrega) a partir dos metadados atuais.
function sincronizarPublicacao(p) {
  if (!p.pasta || !p.metadados) return;
  const m = { ...p.metadados, data_postagem: p.data_postagem };
  const arq = join(p.pasta, "publicacao.md");
  writeFileSync(arq, textoPublicacao(m, `Publicação — ${p.titulo}`, secaoLicencas(arq)));
  if (p.entrega && existsSync(p.entrega)) {
    writeFileSync(join(p.entrega, "publicacao.md"), readFileSync(arq, "utf8"));
    writeFileSync(join(p.entrega, "metadados.json"), JSON.stringify(m, null, 2));
  }
}

function iniciarExecutor() {
  const filho = spawn(process.execPath, [join(RAIZ, "src", "executor.mjs")], {
    cwd: RAIZ, detached: true, windowsHide: true,
    stdio: ["ignore", "ignore", "ignore"],
  });
  filho.unref();
}

function rodarPs(args) {
  return new Promise((ok) => {
    const f = spawn("powershell.exe", ["-NoProfile", "-ExecutionPolicy", "Bypass", "-File", join(RAIZ, "scripts", "inicializacao.ps1"), ...args], { windowsHide: true });
    let t = "";
    f.stdout.on("data", (c) => (t += c));
    f.stderr.on("data", (c) => (t += c));
    f.on("close", (codigo) => ok({ codigo, saida: t.trim() }));
  });
}

let loginCache = null;

// ------------------------------------------------------------------ rotas
async function api(req, res, url) {
  const m = (re) => re.exec(url.pathname);
  const metodo = req.method;
  let r;

  if (metodo === "GET" && url.pathname === "/api/estado") {
    const lista = D.listarProducoes();
    const cont = {};
    for (const p of lista) cont[p.status] = (cont[p.status] || 0) + 1;
    return enviar(res, 200, {
      executor: { vivo: executorVivo(), ...(D.ajuste("executor") || {}), suspenso: D.ajuste("executor_suspenso", false) },
      atividade: D.ajuste("atividade"),
      auto_retomar: D.ajuste("auto_retomar", false),
      inicializacao_windows: existsSync(ATALHO),
      contagens: cont,
      perfis: Object.fromEntries(Object.entries(cfg.perfis).map(([k, v]) => [k, { nome: v.nome, duracao_alvo_s: v.duracao_alvo_s, series: v.series || [] }])),
      revisao_padrao: cfg.revisao_padrao,
      limites: cfg.limites,
      modelos: cfg.modelos,
    });
  }
  if (metodo === "GET" && url.pathname === "/api/claude") {
    if (!loginCache || Date.now() - loginCache.em > 5 * 60_000 || url.searchParams.has("atualizar")) loginCache = { em: Date.now(), ...(await estadoLogin(cfg)) };
    const { executavel, ...semCaminho } = loginCache;
    return enviar(res, 200, { ...semCaminho, executavel: executavel ? basename(executavel) : null });
  }
  if (metodo === "GET" && url.pathname === "/api/producoes") return enviar(res, 200, D.listarProducoes().map(resumo));

  if (metodo === "POST" && url.pathname === "/api/producoes") {
    const b = await lerCorpo(req);
    if (!PERFIS[b.perfil]) return enviar(res, 400, { erro: "Perfil inválido." });
    if (!["ideia", "briefing", "roteiro"].includes(b.tipo_entrada)) return enviar(res, 400, { erro: "Tipo de entrada inválido." });
    if (!b.titulo?.trim() || !b.entrada?.trim()) return enviar(res, 400, { erro: "Título e texto de entrada são obrigatórios." });
    const modos = { ...cfg.revisao_padrao, ...(b.modos_revisao || {}) };
    for (const v of Object.values(modos)) if (!["humano", "subagente", "subagente_humano"].includes(v)) return enviar(res, 400, { erro: "Modo de revisão inválido." });
    const opcoes = { serie: b.serie || null, duracao_alvo_s: Number(b.duracao_alvo_s) || cfg.perfis[b.perfil].duracao_alvo_s, teste: !!b.teste };
    const id = D.criarProducao({ titulo: b.titulo.trim(), perfil: b.perfil, tipo_entrada: b.tipo_entrada, entrada: b.entrada, opcoes, prioridade: Math.min(5, Math.max(1, Number(b.prioridade) || 3)), data_postagem: b.data_postagem || null, modos_revisao: modos }, PERFIS[b.perfil].ETAPAS);
    if (b.iniciar === false) { D.atualizarProducao(id, { status: "pausado", motivo: "Cadastrada sem iniciar. Clique em Retomar quando quiser começar.", motivo_tipo: "usuario" }); }
    return enviar(res, 201, { id });
  }

  if ((r = m(/^\/api\/producoes\/(\d+)$/))) {
    const id = Number(r[1]);
    if (!D.producao(id)) return enviar(res, 404, { erro: "Produção não encontrada." });
    if (metodo === "GET") return enviar(res, 200, detalhe(id));
    if (metodo === "PATCH") {
      const b = await lerCorpo(req);
      const campos = {};
      if (b.prioridade !== undefined) campos.prioridade = Math.min(5, Math.max(1, Number(b.prioridade) || 3));
      if (b.data_postagem !== undefined) campos.data_postagem = b.data_postagem || null;
      if (b.titulo !== undefined && b.titulo.trim()) campos.titulo = b.titulo.trim();
      if (b.modos_revisao) {
        const p = D.producao(id);
        const modos = { ...p.modos_revisao, ...b.modos_revisao };
        for (const v of Object.values(modos)) if (!["humano", "subagente", "subagente_humano"].includes(v)) return enviar(res, 400, { erro: "Modo inválido." });
        campos.modos_revisao = modos;
      }
      D.atualizarProducao(id, campos);
      D.registrar(id, "edicao", `Alterado: ${Object.keys(campos).join(", ")}.`);
      if (campos.data_postagem !== undefined) sincronizarPublicacao(D.producao(id));
      return enviar(res, 200, { ok: true });
    }
  }

  if ((r = m(/^\/api\/producoes\/(\d+)\/acao$/)) && metodo === "POST") {
    const id = Number(r[1]);
    const p = D.producao(id);
    if (!p) return enviar(res, 404, { erro: "Produção não encontrada." });
    const { acao, link } = await lerCorpo(req);
    const vivo = executorVivo();
    const ok = (msg) => { D.registrar(id, "acao", msg); return enviar(res, 200, { ok: true }); };
    if (acao === "pausar") {
      if (p.status === "executando" && vivo) { D.trocarStatus(id, "executando", "pausando"); return ok("Pausa pedida por você (encerrando a etapa em andamento)."); }
      if (["na_fila", "executando", "erro", "aguardando_humano"].includes(p.status)) {
        const antes = p.status === "aguardando_humano" ? "aguardando_humano" : null;
        D.atualizarProducao(id, { status: "pausado", motivo: "Pausada por você.", motivo_tipo: "usuario", opcoes: { ...p.opcoes, status_antes_pausa: antes } });
        if (p.status === "executando") D.atualizarEtapa(id, p.etapa_atual, { status: "pendente" });
        return ok("Pausada por você.");
      }
    }
    if (acao === "retomar" && p.status === "pausado") {
      const volta = p.opcoes.status_antes_pausa === "aguardando_humano" ? "aguardando_humano" : "na_fila";
      D.atualizarProducao(id, { status: volta, motivo: volta === "aguardando_humano" ? "Aguardando sua decisão." : null, motivo_tipo: volta === "aguardando_humano" ? "revisao" : null, proxima_tentativa_em: null, retomadas_automaticas: 0, opcoes: { ...p.opcoes, status_antes_pausa: null } });
      return ok(vivo || volta !== "na_fila" ? "Retomada por você." : "Retomada por você (o executor está parado: inicie-o em Configurações).");
    }
    if (acao === "cancelar" && !["cancelado", "publicado"].includes(p.status)) {
      if (p.status === "executando" && vivo) { D.trocarStatus(id, "executando", "cancelando"); return ok("Cancelamento pedido por você."); }
      D.atualizarProducao(id, { status: "cancelado", motivo: "Cancelada por você.", motivo_tipo: "usuario" });
      return ok("Cancelada por você.");
    }
    if (acao === "tentar_novamente" && ["erro", "pausado", "aguardando_humano", "cancelado"].includes(p.status)) {
      D.atualizarEtapa(id, p.etapa_atual, { status: "pendente", tentativas: 0, ultimo_erro: null });
      D.atualizarProducao(id, { status: "na_fila", motivo: null, motivo_tipo: null, proxima_tentativa_em: null, execucoes_agente: 0, retomadas_automaticas: 0 });
      return ok(`Nova tentativa pedida por você na etapa ${ROTULOS[p.etapa_atual]} (contadores de tentativas zerados).`);
    }
    if (acao === "publicado" && p.status === "pronto") {
      D.atualizarProducao(id, { status: "publicado", publicado_em: D.agora(), link_publicacao: link || null, motivo: null });
      return ok(`Marcado como publicado por você${link ? ` (${link})` : ""}.`);
    }
    if (acao === "desfazer_publicado" && p.status === "publicado") {
      D.atualizarProducao(id, { status: "pronto", publicado_em: null, link_publicacao: null });
      return ok("Marcação de publicado desfeita.");
    }
    if (acao === "excluir" && p.status === "cancelado") {
      D.apagarProducao(id);
      return enviar(res, 200, { ok: true, excluida: true });
    }
    return enviar(res, 409, { erro: `Ação "${acao}" não se aplica ao status atual (${p.status}).` });
  }

  if ((r = m(/^\/api\/producoes\/(\d+)\/decisao$/)) && metodo === "POST") {
    const b = await lerCorpo(req);
    try { decidir(Number(r[1]), b.decisao, b.comentario); } catch (e) { return enviar(res, 409, { erro: e.message }); }
    return enviar(res, 200, { ok: true });
  }

  if ((r = m(/^\/api\/producoes\/(\d+)\/metadados$/)) && metodo === "PUT") {
    const id = Number(r[1]);
    const b = await lerCorpo(req);
    const lista = (v) => (Array.isArray(v) ? v : String(v || "").split(/[,\n]/)).map((s) => s.trim()).filter(Boolean);
    const m2 = {
      titulo: String(b.titulo || "").trim(),
      titulos_alternativos: lista(b.titulos_alternativos),
      descricao: String(b.descricao || "").trim(),
      tags: lista(b.tags),
      hashtags: lista(b.hashtags).map((h) => (h.startsWith("#") ? h : `#${h}`)),
      comentario_fixado: String(b.comentario_fixado || "").trim(),
    };
    D.atualizarProducao(id, { metadados: m2, metadados_editados_em: D.agora() });
    sincronizarPublicacao(D.producao(id));
    D.registrar(id, "metadados", "Título, descrição e tags editados por você.");
    return enviar(res, 200, { ok: true });
  }

  if ((r = m(/^\/api\/producoes\/(\d+)\/arquivo$/)) && metodo === "GET") {
    const p = D.producao(Number(r[1]));
    const abs = p && caminhoPermitido(p, url.searchParams.get("f") || "");
    if (!abs) return enviar(res, 404, { erro: "Arquivo não disponível." });
    return servirArquivo(req, res, abs, url.searchParams.has("baixar"));
  }

  if ((r = m(/^\/api\/producoes\/(\d+)\/abrir$/)) && metodo === "POST") {
    const p = D.producao(Number(r[1]));
    const b = await lerCorpo(req);
    const alvo = b.f ? caminhoPermitido(p, b.f) : b.alvo === "entrega" ? caminhoPermitido(p, p.entrega || "") : caminhoPermitido(p, p.pasta || "");
    if (!alvo) return enviar(res, 404, { erro: "Nada para abrir ainda." });
    const ehPasta = statSync(alvo).isDirectory();
    spawn("explorer.exe", ehPasta ? [alvo] : [`/select,${alvo}`], { detached: true, stdio: "ignore" }).unref();
    return enviar(res, 200, { ok: true });
  }

  if ((r = m(/^\/api\/execucoes\/(\d+)\/log$/)) && metodo === "GET") {
    const x = D.execucao(Number(r[1]));
    if (!x?.log || !resolve(x.log).startsWith(resolve(LOGS) + sep) || !existsSync(x.log)) return enviar(res, 404, "Log não encontrado.", TIPOS[".txt"]);
    const t = readFileSync(x.log, "utf8");
    return enviar(res, 200, limpar(t.length > 300_000 ? "…(início omitido)\n" + t.slice(-300_000) : t), TIPOS[".txt"]);
  }

  if (metodo === "POST" && url.pathname === "/api/ajustes") {
    const b = await lerCorpo(req);
    if (typeof b.auto_retomar === "boolean") D.definirAjuste("auto_retomar", b.auto_retomar);
    if (typeof b.executor_suspenso === "boolean") D.definirAjuste("executor_suspenso", b.executor_suspenso);
    return enviar(res, 200, { ok: true });
  }
  if (metodo === "POST" && url.pathname === "/api/executor") {
    const { acao } = await lerCorpo(req);
    if (acao === "iniciar") { if (!executorVivo()) iniciarExecutor(); return enviar(res, 200, { ok: true }); }
    if (acao === "parar") { D.definirAjuste("executor_parar", true); return enviar(res, 200, { ok: true }); }
    return enviar(res, 400, { erro: "Ação inválida." });
  }
  if (metodo === "POST" && url.pathname === "/api/inicializacao") {
    const { ativar } = await lerCorpo(req);
    const r2 = await rodarPs(["-Acao", ativar ? "ativar" : "desativar"]);
    return enviar(res, r2.codigo === 0 ? 200 : 500, { ok: r2.codigo === 0, saida: limpar(r2.saida), ativo: existsSync(ATALHO) });
  }
  return enviar(res, 404, { erro: "Rota não encontrada." });
}

function servirArquivo(req, res, abs, baixar) {
  const tam = statSync(abs).size;
  const tipo = TIPOS[extname(abs).toLowerCase()] || "application/octet-stream";
  const cab = { "Content-Type": tipo, "Accept-Ranges": "bytes", "Cache-Control": "no-store", "X-Content-Type-Options": "nosniff" };
  if (baixar) cab["Content-Disposition"] = `attachment; filename*=UTF-8''${encodeURIComponent(basename(abs))}`;
  const intervalo = /bytes=(\d*)-(\d*)/.exec(req.headers.range || "");
  if (intervalo) {
    const ini = intervalo[1] ? Number(intervalo[1]) : 0;
    const fim = intervalo[2] ? Math.min(Number(intervalo[2]), tam - 1) : tam - 1;
    if (ini >= tam || ini > fim) { res.writeHead(416, { "Content-Range": `bytes */${tam}` }); return res.end(); }
    res.writeHead(206, { ...cab, "Content-Range": `bytes ${ini}-${fim}/${tam}`, "Content-Length": fim - ini + 1 });
    return createReadStream(abs, { start: ini, end: fim }).pipe(res);
  }
  res.writeHead(200, { ...cab, "Content-Length": tam });
  createReadStream(abs).pipe(res);
}

const servidor = createServer(async (req, res) => {
  try {
    const host = (req.headers.host || "").toLowerCase();
    if (host !== `127.0.0.1:${PORTA}` && host !== `localhost:${PORTA}`) return enviar(res, 403, { erro: "Acesso só local." });
    const url = new URL(req.url, `http://${host}`);
    if (url.pathname.startsWith("/api/")) {
      if (req.method !== "GET" && req.headers["x-estudio"] !== "1") return enviar(res, 403, { erro: "Pedido sem o cabeçalho do Estúdio." });
      return await api(req, res, url);
    }
    const rel = url.pathname === "/" ? "index.html" : url.pathname.slice(1);
    const abs = resolve(WEB, rel);
    if (!abs.startsWith(WEB + sep) || !existsSync(abs) || statSync(abs).isDirectory()) return enviar(res, 404, "Não encontrado.", TIPOS[".txt"]);
    res.writeHead(200, { "Content-Type": TIPOS[extname(abs)] || "application/octet-stream", "Cache-Control": "no-store" });
    createReadStream(abs).pipe(res);
  } catch (e) {
    enviar(res, 500, { erro: limpar(e.message) });
  }
});

servidor.on("error", (e) => {
  if (e.code === "EADDRINUSE") { console.log(`A porta ${PORTA} já está em uso (o Estúdio provavelmente já está aberto).`); process.exit(0); }
  throw e;
});
servidor.listen(PORTA, "127.0.0.1", () => console.log(`Estúdio em http://127.0.0.1:${PORTA}`));
