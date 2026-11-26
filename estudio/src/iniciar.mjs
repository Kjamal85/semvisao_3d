// Inicia a interface e o executor em segundo plano (processos independentes desta janela).
// Cada um se recusa a abrir em dobro, então rodar de novo é seguro.
//   node src/iniciar.mjs              interface + executor
//   node src/iniciar.mjs --abrir      ... e abre o navegador
//   node src/iniciar.mjs --sem-executor
// O executor iniciado aqui NÃO retoma produções interrompidas sozinho, a menos que a
// "retomada automática" esteja autorizada nas Configurações da interface.
import { spawn } from "node:child_process";
import { mkdirSync, openSync } from "node:fs";
import { join } from "node:path";
import { carregarConfig, LOGS, RAIZ } from "./config.mjs";

const cfg = carregarConfig();
mkdirSync(LOGS, { recursive: true });
const args = process.argv.slice(2);

function lancar(script, log) {
  const saida = openSync(join(LOGS, log), "a");
  const f = spawn(process.execPath, [join(RAIZ, "src", script)], { cwd: RAIZ, detached: true, windowsHide: true, stdio: ["ignore", saida, saida] });
  f.unref();
}

lancar("servidor.mjs", "servidor.log");
if (!args.includes("--sem-executor")) lancar("executor.mjs", "executor.log");
const url = `http://127.0.0.1:${cfg.porta}`;
console.log(`Estúdio iniciando em ${url}`);
if (args.includes("--abrir")) setTimeout(() => spawn("explorer.exe", [url], { detached: true, stdio: "ignore" }).unref(), 1500);
