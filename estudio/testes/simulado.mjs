// Teste do fluxo com o perfil simulado, num banco à parte (não toca na fila real).
// Sobe servidor e executor, cria produções pela API e confere: correção automática por parecer,
// nova tentativa após falha, portão humano, pausa/retomada, cancelamento, queda do executor
// (taskkill) com e sem retomada automática, e que etapas concluídas não são refeitas.
// Uso: node testes/simulado.mjs
import { spawn } from "node:child_process";
import { existsSync, mkdtempSync, readFileSync, rmSync } from "node:fs";
import { tmpdir } from "node:os";
import { join, resolve, dirname } from "node:path";
import { fileURLToPath } from "node:url";

const RAIZ = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const DADOS = mkdtempSync(join(tmpdir(), "estudio-teste-"));
const PORTA = 4391;
const env = { ...process.env, ESTUDIO_DADOS: DADOS, ESTUDIO_SIMULADO: "1", ESTUDIO_PORTA: String(PORTA) };
const BASE = `http://127.0.0.1:${PORTA}`;
let falhas = 0;
const ok = (cond, msg) => { console.log(`${cond ? "✓" : "✗"} ${msg}`); if (!cond) falhas++; };
const esperar = (ms) => new Promise((r) => setTimeout(r, ms));

function subir(script) {
  const p = spawn(process.execPath, [join(RAIZ, "src", script)], { cwd: RAIZ, env, stdio: ["ignore", "pipe", "pipe"] });
  p.stdout.on("data", (d) => process.env.VERBOSO && process.stdout.write(`[${script}] ${d}`));
  p.stderr.on("data", (d) => process.stdout.write(`[${script} ERR] ${d}`));
  return p;
}
const matar = (p) => spawn("taskkill", ["/PID", String(p.pid), "/T", "/F"], { stdio: "ignore" });
// Mata só o processo (sem a árvore): os filhos ficam órfãos, como numa queda real do executor.
const matarSo = (p) => spawn("taskkill", ["/PID", String(p.pid), "/F"], { stdio: "ignore" });

async function api(caminho, metodo = "GET", corpo, extra = {}) {
  const r = await fetch(BASE + caminho, { method: metodo, headers: { "Content-Type": "application/json", "X-Estudio": "1", ...extra }, body: corpo ? JSON.stringify(corpo) : undefined });
  const t = await r.text();
  try { return { status: r.status, corpo: JSON.parse(t) }; } catch { return { status: r.status, corpo: t }; }
}
const detalhe = async (id) => (await api(`/api/producoes/${id}`)).corpo;
async function ate(id, cond, limiteS = 90) {
  for (let i = 0; i < limiteS * 4; i++) {
    const d = await detalhe(id);
    if (cond(d.producao, d)) return d;
    await esperar(250);
  }
  const d = await detalhe(id);
  throw new Error(`Tempo esgotado esperando a produção ${id} (status ${d.producao.status}, etapa ${d.producao.etapa_atual}, motivo ${d.producao.motivo})`);
}
const criar = async (titulo, opcoesExtras, modos = { roteiro: "subagente", previa: "subagente", final: "subagente" }) => {
  const r = await api("/api/producoes", "POST", { perfil: "simulado", tipo_entrada: "ideia", titulo, entrada: "Ideia de teste.", modos_revisao: modos, ...opcoesExtras });
  if (r.status !== 201) throw new Error(JSON.stringify(r.corpo));
  return r.corpo.id;
};
// opções do perfil simulado vão em opcoes; a API só aceita os campos públicos, então gravamos direto
async function opcoes(id, extra) {
  const { DatabaseSync } = await import("node:sqlite");
  const db = new DatabaseSync(join(DADOS, "estudio.db"));
  db.exec("PRAGMA busy_timeout = 5000");
  const atual = JSON.parse(db.prepare("SELECT opcoes FROM producoes WHERE id = ?").get(id).opcoes);
  db.prepare("UPDATE producoes SET opcoes = ? WHERE id = ?").run(JSON.stringify({ ...atual, ...extra }), id);
  db.close();
}
const contagem = (id) => {
  const f = join(DADOS, "simulado", String(id), "contagem.json");
  return existsSync(f) ? JSON.parse(readFileSync(f, "utf8")) : {};
};

let servidor = subir("servidor.mjs");
let executor;
try {
  await esperar(1200);

  // ---------------------------------------------------------- segurança
  {
    const semCab = await fetch(`${BASE}/api/ajustes`, { method: "POST", body: "{}" });
    ok(semCab.status === 403, "POST sem cabeçalho X-Estudio é recusado (403)");
    // o fetch ignora o cabeçalho Host; node:http envia o que pedimos (simula DNS rebinding)
    const { request } = await import("node:http");
    const hostRuim = await new Promise((r) => request({ host: "127.0.0.1", port: PORTA, path: "/api/estado", headers: { Host: "evil.example" } }, (res) => { res.resume(); r(res.statusCode); }).end());
    ok(hostRuim === 403, "Host diferente de 127.0.0.1/localhost é recusado");
  }

  // A: correção pedida pelo subagente na prévia + 1 falha na montagem → termina pronto
  // (pausada antes de o executor subir, para configurar as opções de teste com calma)
  const A = await criar("A · correção e tentativa", { iniciar: false });
  await opcoes(A, { ms: 300, falhar: { montagem: 1 }, parecer: { previa: "correcao" } });
  await api(`/api/producoes/${A}/acao`, "POST", { acao: "retomar" });
  executor = subir("executor.mjs");
  let d = await ate(A, (p) => p.status === "pronto");
  const c = contagem(A);
  ok(true, `A ficou pronta (etapas: ${JSON.stringify(c)})`);
  ok(c.montagem >= 2, "A: a montagem falhou uma vez e passou na nova tentativa");
  ok(c.correcao === 1, "A: o parecer do subagente gerou exatamente 1 correção");
  ok(c.cenas === 1, `A: Cenas (agente caro) não rodou de novo depois da correção (${c.cenas})`);
  ok(d.revisoes.some((r) => r.efeito === "correcao_pedida" && r.revisor === "subagente"), "A: parecer de correção registrado como do subagente");
  ok(d.revisoes.some((r) => r.efeito === "aprovacao_automatica"), "A: aprovação automática registrada");
  ok(d.etapas.find((e) => e.etapa === "revisao_previa").aprovacao === "automatica", "A: etapa marcada como aprovação automática (não humana)");
  ok(c.voz === 1, "A: voz não foi refeita depois da correção (entradas iguais)");

  // B: portão final humano + queda do executor no render final, sem retomada automática
  const B = await criar("B · queda e retomada manual", { iniciar: false }, { roteiro: "subagente", previa: "subagente", final: "humano" });
  await opcoes(B, { ms: 1500, ms_etapa: { render_final: 30000 } }); // render longo: fica órfão na queda
  await api(`/api/producoes/${B}/acao`, "POST", { acao: "retomar" });
  await ate(B, (p) => p.etapa_atual === "render_final" && p.status === "executando", 120);
  await esperar(4000); // tempo para o executor registrar a árvore de processos da etapa
  matarSo(executor);
  await esperar(1500);
  d = await detalhe(B);
  ok(d.producao.status === "executando", "B: após o taskkill o banco ainda diz 'executando' (queda real, sem limpeza)");
  executor = subir("executor.mjs");
  d = await ate(B, (p) => p.status === "pausado");
  ok(d.producao.motivo_tipo === "interrompido", `B: ao religar, ficou pausada esperando autorização ("${d.producao.motivo.split(".")[0]}")`);
  ok(d.etapas.find((e) => e.etapa === "voz").status === "concluida", "B: a voz continua concluída");
  ok(d.historico.some((h) => /Processos órfãos da etapa render_final encerrados/.test(h.mensagem)), "B: o processo órfão do render foi encerrado na recuperação");
  await opcoes(B, { ms_etapa: {} });
  await api(`/api/producoes/${B}/acao`, "POST", { acao: "retomar" });
  d = await ate(B, (p) => p.status === "aguardando_humano", 120);
  ok(d.decisao?.portao === "final", "B: parou no portão final esperando você");
  const semComentario = await api(`/api/producoes/${B}/decisao`, "POST", { decisao: "corrigir", comentario: "" });
  ok(semComentario.status === 409, "B: pedir correção sem comentário é recusado");
  await api(`/api/producoes/${B}/decisao`, "POST", { decisao: "aprovar", comentario: "ok no teste" });
  d = await ate(B, (p) => p.status === "pronto", 60);
  const cb = contagem(B);
  ok(cb.voz === 1, `B: voz executada 1 vez no total (não refeita após a queda)`);
  ok(cb.render_final === 2, `B: render final rodou 2 vezes (a interrompida + a retomada): ${cb.render_final}`);
  ok(d.etapas.find((e) => e.etapa === "revisao_final").aprovacao === "humana", "B: final marcado como aprovação humana");
  ok(d.execucoes.some((x) => x.resultado === "interrompido"), "B: execução interrompida aparece no histórico de execuções");

  // C: pausar durante a execução, retomar, cancelar
  const C = await criar("C · pausa e cancelamento", { iniciar: false });
  await opcoes(C, { ms: 4000 });
  await api(`/api/producoes/${C}/acao`, "POST", { acao: "retomar" });
  await ate(C, (p) => p.status === "executando" && p.etapa_atual === "roteiro", 30);
  await api(`/api/producoes/${C}/acao`, "POST", { acao: "pausar" });
  d = await ate(C, (p) => p.status === "pausado", 20);
  ok(d.producao.motivo_tipo === "usuario", "C: pausa durante a execução encerrou a etapa e pausou");
  await api(`/api/producoes/${C}/acao`, "POST", { acao: "retomar" });
  await ate(C, (p) => p.status === "executando", 20);
  await api(`/api/producoes/${C}/acao`, "POST", { acao: "cancelar" });
  d = await ate(C, (p) => p.status === "cancelado", 20);
  ok(true, "C: cancelamento durante a execução");

  // D: retomada automática autorizada + queda
  await api("/api/ajustes", "POST", { auto_retomar: true });
  const D = await criar("D · retomada automática", { iniciar: false });
  await opcoes(D, { ms: 2500 });
  await api(`/api/producoes/${D}/acao`, "POST", { acao: "retomar" });
  await ate(D, (p) => p.etapa_atual === "cenas" && p.status === "executando", 60);
  matar(executor);
  await esperar(1500);
  executor = subir("executor.mjs");
  d = await ate(D, (p) => p.status === "pronto", 120);
  ok(d.historico.some((h) => /Retomada automática após interrupção/.test(h.mensagem)), "D: com autorização, retomou sozinha e terminou");
  await api("/api/ajustes", "POST", { auto_retomar: false });

  // E: erro repetido → para depois do limite de tentativas
  const E = await criar("E · limite de tentativas", { iniciar: false });
  await opcoes(E, { ms: 200, falhar: { cenas: 9 } });
  await api(`/api/producoes/${E}/acao`, "POST", { acao: "retomar" });
  d = await ate(E, (p) => p.status === "erro", 60);
  ok(contagem(E).cenas === 3, `E: parou após 3 tentativas (${contagem(E).cenas}) com o motivo registrado`);
  await api(`/api/producoes/${E}/acao`, "POST", { acao: "tentar_novamente" });
  d = await ate(E, (p) => p.status === "erro", 60);
  ok(contagem(E).cenas === 6, "E: 'Tentar novamente' zera o contador e tenta mais 3 vezes (sem laço infinito)");

  // F: arquivo fora das pastas permitidas
  const fora = await api(`/api/producoes/${A}/arquivo?f=${encodeURIComponent(join(RAIZ, "config", "estudio.json"))}`);
  ok(fora.status === 404, "Arquivo fora das pastas da produção não é servido");

  // G: redação de segredos
  const { limpar } = await import("../src/segredos.mjs");
  const exemplo = "chave AIzaSyA1234567890abcdefghijklmnopqrstuv e sk-ant-api03-abcdefghijklmnopqrstuvwxyz";
  ok(!/AIza|sk-ant/.test(limpar(exemplo)), "Padrões de chave são apagados dos logs");

  // H: persistência — servidor reiniciado mantém a fila
  matar(servidor);
  await esperar(1000);
  servidor = subir("servidor.mjs");
  await esperar(1200);
  const lista = (await api("/api/producoes")).corpo;
  ok(lista.length === 5, `Fila persiste após reiniciar o servidor (${lista.length} produções)`);
} catch (e) {
  falhas++;
  console.log(`✗ ${e.message}`);
} finally {
  if (executor) matar(executor);
  matar(servidor);
  await esperar(800);
  console.log(`\n${falhas ? `${falhas} falha(s)` : "Tudo certo"} · banco de teste em ${DADOS}`);
  if (!falhas && !process.env.MANTER) rmSync(DADOS, { recursive: true, force: true });
  process.exit(falhas ? 1 : 0);
}
