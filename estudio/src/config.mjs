// Configuração e caminhos do Estúdio. Lê config/estudio.json e acha os executáveis
// (claude.exe, bash, npx) sem depender do PATH do processo que iniciou o Estúdio.
import { existsSync, readdirSync, readFileSync, statSync } from "node:fs";
import { homedir } from "node:os";
import { dirname, join, resolve } from "node:path";
import { fileURLToPath } from "node:url";

export const RAIZ = resolve(dirname(fileURLToPath(import.meta.url)), "..");
// ESTUDIO_DADOS permite um banco à parte (usado pelos testes simulados).
export const DADOS = process.env.ESTUDIO_DADOS ? resolve(process.env.ESTUDIO_DADOS) : join(RAIZ, "dados");
export const LOGS = join(DADOS, "logs");
export const ENTREGAS = process.env.ESTUDIO_DADOS ? join(DADOS, "entregas") : join(RAIZ, "entregas");
export const REGRAS = join(RAIZ, "regras");
export const PROMPTS = join(RAIZ, "prompts");

export function carregarConfig() {
  const cfg = JSON.parse(readFileSync(join(RAIZ, "config", "estudio.json"), "utf8"));
  if (process.env.ESTUDIO_SIMULADO === "1") {
    cfg.perfis.simulado = { nome: "Simulado (teste do fluxo)", raiz: "dados", duracao_alvo_s: 10 };
    cfg.limites.espera_entre_tentativas_s = [1, 2]; // o teste não espera minutos entre tentativas
  }
  if (process.env.ESTUDIO_PORTA) cfg.porta = Number(process.env.ESTUDIO_PORTA);
  for (const p of Object.values(cfg.perfis)) p.raiz = resolve(RAIZ, p.raiz);
  return cfg;
}

// claude.exe: variável CLAUDE_EXE, instalação nativa (~/.local/bin) ou a extensão do VS Code
// mais recente (a pasta muda de nome a cada atualização da extensão).
export function acharClaude(cfg) {
  if (cfg.claude_exe && cfg.claude_exe !== "auto") return cfg.claude_exe;
  const candidatos = [process.env.CLAUDE_EXE, join(homedir(), ".local", "bin", "claude.exe")].filter(Boolean);
  for (const c of candidatos) if (existsSync(c)) return c;
  const ext = join(homedir(), ".vscode", "extensions");
  if (existsSync(ext)) {
    const pastas = readdirSync(ext)
      .filter((d) => d.startsWith("anthropic.claude-code-"))
      .map((d) => join(ext, d, "resources", "native-binary", "claude.exe"))
      .filter((f) => existsSync(f))
      .sort((a, b) => statSync(b).mtimeMs - statSync(a).mtimeMs);
    if (pastas.length) return pastas[0];
  }
  return null;
}

export function acharBash(cfg) {
  if (cfg.bash_exe && cfg.bash_exe !== "auto") return cfg.bash_exe;
  const locais = [
    join(process.env.LOCALAPPDATA || "", "Programs", "Git", "bin", "bash.exe"),
    "C:\\Program Files\\Git\\bin\\bash.exe",
    "C:\\Program Files (x86)\\Git\\bin\\bash.exe",
  ];
  return locais.find((f) => existsSync(f)) || "bash";
}

// npx sem shell: o Node 24 recusa executar .cmd diretamente.
export const NPX = join(dirname(process.execPath), "node_modules", "npm", "bin", "npx-cli.js");
