// Executor do Estúdio: pega uma produção por vez na fila e executa uma etapa de cada vez.
// - Um único executor por máquina (trava em dados/executor.lock).
// - Batimento a cada poucos segundos no banco: a interface mostra se ele está vivo.
// - Ao iniciar, recupera o que estava rodando quando ele caiu (ou o PC reiniciou): encerra
//   processos órfãos e devolve a produção à fila só se a retomada automática estiver autorizada.
// Uso: node src/executor.mjs
import { existsSync, readFileSync, rmSync, writeFileSync } from "node:fs";
import { join } from "node:path";
import { carregarConfig, DADOS } from "./config.mjs";
import * as D from "./db.mjs";
import { executarEtapa } from "./pipeline.mjs";
import { descendentes, encerrarRegistrados, matarArvore, nomeDoProcesso, processoVivo } from "./processos.mjs";
import { carregarSegredos } from "./segredos.mjs";

const cfg = carregarConfig();
carregarSegredos(cfg);
const TRAVA = join(DADOS, "executor.lock");
const ORFAOS_PERMITIDOS = /^(node|claude|ffmpeg|ffprobe|chrome|chrome-headless-shell|bash|python|cmd|conhost|powershell)\.exe$/;

// ------------------------------------------------------------------- trava
if (existsSync(TRAVA)) {
  const pid = Number(readFileSync(TRAVA, "utf8"));
  if (pid !== process.pid && processoVivo(pid) && nomeDoProcesso(pid) === "node.exe") {
    console.log(`Executor já em execução (PID ${pid}).`);
    process.exit(0);
  }
}
writeFileSync(TRAVA, String(process.pid));
const soltar = () => { try { if (Number(readFileSync(TRAVA, "utf8")) === process.pid) rmSync(TRAVA); } catch {} };

const log = (m) => console.log(`[${new Date().toLocaleString("pt-BR")}] ${m}`);
let atual = null; // { id, controle }
let parando = false;

function batimento() {
  D.definirAjuste("executor", { pid: process.pid, desde: inicio, batimento: D.agora(), producao: atual?.id ?? null });
}
const inicio = D.agora();

// ---------------------------------------------------------------- recuperação
async function recuperar() {
  const autoRetomar = D.ajuste("auto_retomar", false);
  const presas = D.db.prepare("SELECT id, etapa_atual, status FROM producoes WHERE status IN ('executando','pausando','cancelando')").all();
  for (const p of presas) {
    const e = D.etapa(p.id, p.etapa_atual);
    // Órfãos: a árvore registrada durante a etapa (render, Chrome, ffmpeg, agente...).
    const mortos = await encerrarRegistrados(e?.arvore, ORFAOS_PERMITIDOS);
    if (e?.pid_filho && processoVivo(e.pid_filho) && ORFAOS_PERMITIDOS.test(nomeDoProcesso(e.pid_filho) || "")) {
      matarArvore(e.pid_filho);
      mortos.push(`PID ${e.pid_filho}`);
    }
    if (mortos.length) D.registrar(p.id, "recuperacao", `Processos órfãos da etapa ${p.etapa_atual} encerrados: ${mortos.join(", ")}.`);
    D.atualizarEtapa(p.id, p.etapa_atual, { status: "pendente", pid_filho: null, arvore: null });
    D.db.prepare("UPDATE execucoes SET fim = ?, resultado = 'interrompido', resumo = 'Executor encerrado durante a etapa.' WHERE producao_id = ? AND fim IS NULL").run(D.agora(), p.id);
    if (p.status === "cancelando") {
      D.atualizarProducao(p.id, { status: "cancelado", motivo: "Cancelada por você.", motivo_tipo: "usuario" });
    } else if (p.status === "pausando") {
      D.atualizarProducao(p.id, { status: "pausado", motivo: "Pausada por você.", motivo_tipo: "usuario" });
    } else if (autoRetomar) {
      D.atualizarProducao(p.id, { status: "na_fila", motivo: null, motivo_tipo: null });
      D.registrar(p.id, "recuperacao", `Retomada automática após interrupção (etapa ${p.etapa_atual}; etapas concluídas preservadas).`);
    } else {
      D.atualizarProducao(p.id, { status: "pausado", motivo: "Interrompida (executor encerrado ou PC reiniciado). As etapas concluídas estão salvas. Clique em Retomar.", motivo_tipo: "interrompido" });
      D.registrar(p.id, "recuperacao", `Interrompida na etapa ${p.etapa_atual}; aguardando sua autorização para retomar.`);
    }
    log(`Recuperada a produção ${p.id} (${p.status} → ${D.producao(p.id).status}).`);
  }
}

// --------------------------------------------------------------- escolha
function proximaDaFila() {
  const t = D.agora();
  // Pausas por limite/cota voltam sozinhas depois do horário, só com retomada automática autorizada.
  if (D.ajuste("auto_retomar", false)) {
    const max = cfg.limites.retomadas_automaticas_por_limite;
    for (const p of D.db.prepare("SELECT id, retomadas_automaticas FROM producoes WHERE status = 'pausado' AND motivo_tipo IN ('limite','cota') AND proxima_tentativa_em <= ?").all(t)) {
      if (p.retomadas_automaticas >= max) continue;
      D.atualizarProducao(p.id, { status: "na_fila", retomadas_automaticas: p.retomadas_automaticas + 1, motivo: null });
      D.registrar(p.id, "retomada", `Retomada automática após limite (${p.retomadas_automaticas + 1}/${max}).`);
    }
  }
  return D.db
    .prepare(
      `SELECT id FROM producoes WHERE status = 'na_fila' AND (proxima_tentativa_em IS NULL OR proxima_tentativa_em <= ?)
       ORDER BY prioridade ASC, (data_postagem IS NULL), data_postagem ASC, id ASC LIMIT 1`
    )
    .get(t);
}

// Pedidos da interface (pausar/cancelar) chegam pelo status no banco.
function vigiar() {
  if (!atual) return;
  const s = D.producao(atual.id)?.status;
  if (s === "pausando" || s === "cancelando" || s == null) atual.controle.abort();
  registrarArvore();
}

// A cada ~6 s, soma à lista os descendentes vivos do processo da etapa (a lista só cresce
// durante a etapa: um neto continua registrado mesmo se o pai dele já morreu).
let ultimaArvore = 0;
async function registrarArvore() {
  if (!atual || Date.now() - ultimaArvore < 6000) return;
  const { id } = atual;
  const p = D.producao(id);
  const e = p && D.etapa(id, p.etapa_atual);
  if (!e?.pid_filho) return;
  ultimaArvore = Date.now();
  const novos = await descendentes(e.pid_filho);
  if (!atual || atual.id !== id) return;
  const lista = new Map((D.etapa(id, p.etapa_atual)?.arvore || []).map((x) => [`${x.pid}|${x.criado}`, x]));
  for (const x of novos) lista.set(`${x.pid}|${x.criado}`, x);
  D.atualizarEtapa(id, p.etapa_atual, { arvore: [...lista.values()] });
}

async function ciclo() {
  batimento();
  vigiar();
  if (atual || parando) return;
  if (D.ajuste("executor_suspenso", false)) return;
  const p = proximaDaFila();
  if (!p) return;
  if (!D.trocarStatus(p.id, "na_fila", "executando", { proxima_tentativa_em: null })) return;
  const controle = new AbortController();
  atual = { id: p.id, controle };
  ultimaArvore = 0; // primeira captura da árvore logo que a etapa abrir o processo
  const prod = D.producao(p.id);
  log(`Produção ${p.id} "${prod.titulo}": etapa ${prod.etapa_atual}`);
  batimento();
  try {
    const status = await executarEtapa(cfg, p.id, controle);
    log(`Produção ${p.id}: ${status}`);
  } catch (e) {
    log(`Falha inesperada na produção ${p.id}: ${e.stack || e.message}`);
    D.trocarStatus(p.id, "executando", "erro", { motivo: `Falha inesperada do executor: ${e.message}`, motivo_tipo: "erro" });
  } finally {
    const fim = D.producao(p.id);
    if (fim) D.atualizarEtapa(p.id, prod.etapa_atual, { arvore: null });
    atual = null;
    D.definirAjuste("atividade", null);
    batimento();
  }
}

// ---------------------------------------------------------------- parada
function parar(sinal) {
  if (parando) return;
  parando = true;
  log(`Parando (${sinal})...`);
  if (atual) atual.controle.abort(); // a etapa vira "interrompida" e a produção fica pausada
  const fim = () => { D.definirAjuste("executor", null); soltar(); process.exit(0); };
  const espera = setInterval(() => { if (!atual) { clearInterval(espera); fim(); } }, 300);
  setTimeout(fim, 15_000);
}
process.on("SIGINT", () => parar("SIGINT"));
process.on("SIGTERM", () => parar("SIGTERM"));
process.on("exit", soltar);

// Pedido de parada pela interface
setInterval(() => { if (D.ajuste("executor_parar", false)) { D.definirAjuste("executor_parar", false); parar("interface"); } }, 1500);

log(`Executor iniciado (PID ${process.pid}). Retomada automática: ${D.ajuste("auto_retomar", false) ? "autorizada" : "desligada"}.`);
await recuperar();
batimento();
let ocupado = false;
setInterval(async () => {
  if (ocupado) { batimento(); vigiar(); return; }
  // (vigiar também roda a cada 2 s durante a etapa: pausa/cancelamento e registro da árvore)
  ocupado = true;
  try { await ciclo(); } finally { ocupado = false; }
}, 2000);
