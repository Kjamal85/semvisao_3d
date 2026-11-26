// Execução de processos filhos com tempo máximo, cancelamento e log redigido.
// No Windows um processo filho não morre junto com o pai, então o encerramento usa
// `taskkill /T /F` na árvore inteira (render do HyperFrames abre vários Chrome).
import { spawn, spawnSync } from "node:child_process";
import { appendFileSync, mkdirSync } from "node:fs";
import { dirname } from "node:path";
import { limpar } from "./segredos.mjs";

export class ErroEtapa extends Error {
  // tipo: erro | timeout | limite | auth | cota | bloqueado | interrompido | correcao
  constructor(tipo, mensagem, extra = {}) {
    super(mensagem);
    this.tipo = tipo;
    Object.assign(this, extra);
  }
}

export function matarArvore(pid) {
  if (!pid) return;
  if (process.platform === "win32") spawnSync("taskkill", ["/PID", String(pid), "/T", "/F"], { stdio: "ignore" });
  else try { process.kill(-pid, "SIGKILL"); } catch {}
}

export function processoVivo(pid) {
  if (!pid) return false;
  try { process.kill(pid, 0); return true; } catch { return false; }
}

export function nomeDoProcesso(pid) {
  if (process.platform !== "win32") return null;
  const r = spawnSync("tasklist", ["/FI", `PID eq ${pid}`, "/FO", "CSV", "/NH"], { encoding: "utf8" });
  const m = /^"([^"]+)"/.exec((r.stdout || "").trim());
  return m ? m[1].toLowerCase() : null;
}

// Árvore de descendentes de um processo, com o horário de criação de cada um (para não confundir
// com outro processo que reaproveite o mesmo PID). Se o executor cair, um elo do meio (ex.: npx)
// pode morrer e deixar o render e o Chrome órfãos; por isso o executor guarda essa lista.
function tabelaDeProcessos() {
  return new Promise((ok) => {
    const ps = spawn("powershell.exe", ["-NoProfile", "-Command", "Get-CimInstance Win32_Process | ForEach-Object { '{0}|{1}|{2}|{3}' -f $_.ProcessId,$_.ParentProcessId,$_.Name,$_.CreationDate.ToString('o') }"], { windowsHide: true });
    let t = "";
    ps.stdout.on("data", (c) => (t += c));
    ps.on("error", () => ok([]));
    ps.on("close", () => ok(t.split(/\r?\n/).filter(Boolean).map((l) => { const [pid, pai, nome, criado] = l.split("|"); return { pid: Number(pid), pai: Number(pai), nome: (nome || "").toLowerCase(), criado }; })));
  });
}

export async function descendentes(pid) {
  if (process.platform !== "win32" || !pid) return [];
  const todos = await tabelaDeProcessos();
  const filhos = new Map();
  for (const p of todos) (filhos.get(p.pai) || filhos.set(p.pai, []).get(p.pai)).push(p);
  const raiz = todos.find((p) => p.pid === pid);
  const saida = raiz ? [raiz] : [];
  for (let i = 0; i < saida.length; i++) for (const f of filhos.get(saida[i].pid) || []) if (f.criado >= saida[i].criado) saida.push(f);
  return saida.map(({ pid, nome, criado }) => ({ pid, nome, criado }));
}

// Encerra os processos da lista que ainda existem com o mesmo PID, nome e horário de criação.
export async function encerrarRegistrados(lista, nomesPermitidos) {
  if (!lista?.length) return [];
  const vivos = new Map((await tabelaDeProcessos()).map((p) => [p.pid, p]));
  const mortos = [];
  for (const r of lista) {
    const v = vivos.get(r.pid);
    if (v && v.criado === r.criado && v.nome === r.nome && nomesPermitidos.test(v.nome)) {
      matarArvore(r.pid);
      mortos.push(`${r.nome} ${r.pid}`);
    }
  }
  return mortos;
}

export function escreverLog(arquivo, texto) {
  mkdirSync(dirname(arquivo), { recursive: true });
  appendFileSync(arquivo, limpar(texto));
}

// Roda `comando args` e devolve { codigo, saida } (saída = últimos ~20 mil caracteres, redigida).
// opcoes: cwd, env, tempoMaxMs, sinal (AbortSignal), log (arquivo), aoIniciar(pid), entrada (stdin), aoLinha(linha)
export function rodar(comando, args, opcoes = {}) {
  const { cwd, env, tempoMaxMs = 30 * 60_000, sinal, log, aoIniciar, entrada, aoLinha } = opcoes;
  return new Promise((resolver, rejeitar) => {
    if (sinal?.aborted) return rejeitar(new ErroEtapa("interrompido", "Interrompida antes de começar."));
    if (log) escreverLog(log, `\n$ ${comando} ${args.join(" ")}\n  (em ${cwd || process.cwd()})\n`);
    const filho = spawn(comando, args, { cwd, env, windowsHide: true, stdio: ["pipe", "pipe", "pipe"] });
    aoIniciar?.(filho.pid);
    let cauda = "";
    let resto = "";
    const coletar = (buf) => {
      const t = buf.toString("utf8");
      cauda = (cauda + t).slice(-20_000);
      if (log) escreverLog(log, t);
      if (aoLinha) {
        const partes = (resto + t).split(/\r?\n/);
        resto = partes.pop();
        for (const l of partes) aoLinha(l);
      }
    };
    filho.stdout.on("data", coletar);
    filho.stderr.on("data", coletar);
    if (entrada != null) filho.stdin.end(entrada);
    else filho.stdin.end();

    let motivo = null;
    const relogio = setTimeout(() => { motivo = "timeout"; matarArvore(filho.pid); }, tempoMaxMs);
    const aoAbortar = () => { motivo = "interrompido"; matarArvore(filho.pid); };
    sinal?.addEventListener("abort", aoAbortar, { once: true });

    filho.on("error", (e) => {
      clearTimeout(relogio);
      rejeitar(new ErroEtapa("erro", `Não foi possível iniciar ${comando}: ${e.message}`));
    });
    filho.on("close", (codigo) => {
      clearTimeout(relogio);
      sinal?.removeEventListener("abort", aoAbortar);
      if (aoLinha && resto) aoLinha(resto);
      const saida = limpar(cauda);
      if (motivo === "timeout") return rejeitar(new ErroEtapa("timeout", `Passou do tempo máximo (${Math.round(tempoMaxMs / 60000)} min) e foi encerrado.`, { saida }));
      if (motivo === "interrompido") return rejeitar(new ErroEtapa("interrompido", "Interrompida (pausa, cancelamento ou parada do executor).", { saida }));
      resolver({ codigo, saida });
    });
  });
}

export const ultimasLinhas = (texto, n = 25) => String(texto || "").trim().split(/\r?\n/).slice(-n).join("\n");
