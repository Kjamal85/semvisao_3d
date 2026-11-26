// Segredos: o Estúdio lê os .env dos projetos só para (1) entregar a chave de voz ao script
// que precisa dela e (2) saber o que apagar dos logs. Nada daqui vai para a interface ou o Git.
import { existsSync, readFileSync } from "node:fs";
import { join } from "node:path";

const PADROES = [
  /AIza[0-9A-Za-z_\-]{30,}/g, // Google / Gemini
  /sk-ant-[A-Za-z0-9_\-]{20,}/g, // Anthropic
  /sk-[A-Za-z0-9]{32,}/g, // OpenAI e similares
  /(Bearer\s+)[A-Za-z0-9._\-]{20,}/gi,
  /("?(?:access|refresh)_?token"?\s*[:=]\s*"?)[A-Za-z0-9._\-]{20,}/gi,
];
const NOME_SECRETO = /(KEY|TOKEN|SECRET|PASSWORD|SENHA)/i;

export function lerEnv(arquivo) {
  const out = {};
  if (!existsSync(arquivo)) return out;
  for (const bruta of readFileSync(arquivo, "utf8").split(/\r?\n/)) {
    const linha = bruta.trim().replace(/^export\s+/, "");
    if (!linha || linha.startsWith("#") || !linha.includes("=")) continue;
    const k = linha.slice(0, linha.indexOf("=")).trim();
    const v = linha.slice(linha.indexOf("=") + 1).trim().replace(/^(["'])(.*)\1$/, "$2");
    if (v && !(k in out)) out[k] = v; // a 1ª linha vale (mesma regra do loadEnv dos projetos)
  }
  return out;
}

export function arquivosEnv(cfg) {
  const lista = [];
  for (const p of Object.values(cfg.perfis)) for (const rel of p.env_voz || []) lista.push(join(p.raiz, rel));
  return lista;
}

let valores = null;
export function carregarSegredos(cfg) {
  const s = new Set();
  for (const f of arquivosEnv(cfg)) {
    if (!existsSync(f)) continue;
    // todas as linhas, inclusive chaves repetidas (o 3D usa uma 2ª GEMINI_API_KEY)
    for (const linha of readFileSync(f, "utf8").split(/\r?\n/)) {
      const m = /^\s*(?:export\s+)?([A-Za-z0-9_]+)\s*=\s*(.+?)\s*$/.exec(linha);
      if (m && NOME_SECRETO.test(m[1])) {
        const v = m[2].replace(/^(["'])(.*)\1$/, "$2");
        if (v.length >= 8) s.add(v);
      }
    }
  }
  for (const [k, v] of Object.entries(process.env)) if (NOME_SECRETO.test(k) && v && v.length >= 12) s.add(v);
  valores = [...s].sort((a, b) => b.length - a.length);
}

export function limpar(texto) {
  let t = String(texto ?? "");
  for (const v of valores || []) t = t.split(v).join("[redigido]");
  for (const p of PADROES) t = t.replace(p, (m, prefixo) => (typeof prefixo === "string" && m.startsWith(prefixo) ? prefixo : "") + "[redigido]");
  return t;
}

// Ambiente para processos filhos: sem chaves e sem as variáveis da sessão do VS Code
// (o agente roda como processo independente, autenticado pelo login salvo do claude.exe).
export function ambienteLimpo(extra = {}) {
  const env = {};
  for (const [k, v] of Object.entries(process.env)) {
    if (NOME_SECRETO.test(k)) continue;
    if (/^(CLAUDECODE|CLAUDE_CODE_|CLAUDE_AGENT_SDK|CLAUDE_PID|CLAUDE_EFFORT|ANTHROPIC_)/.test(k)) continue;
    env[k] = v;
  }
  return { ...env, ...extra };
}
