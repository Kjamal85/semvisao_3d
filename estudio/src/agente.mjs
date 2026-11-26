// Agente headless: `claude.exe -p` (modo não interativo oficial do Claude Code), autenticado
// pelo login salvo da assinatura (sem chave de API no ambiente). O prompt vai pelo stdin e a
// resposta final vem estruturada (--json-schema). Ferramentas por lista de permissões; leitura
// de .env negada em config/agente-settings.json.
import { join } from "node:path";
import { acharClaude, RAIZ } from "./config.mjs";
import { ErroEtapa, escreverLog, rodar } from "./processos.mjs";
import { ambienteLimpo, limpar } from "./segredos.mjs";

const LIMITE_USO = /(usage limit|hit your (usage )?limit|limit reached|limite de uso|out of (extra )?usage|weekly limit|session limit)/i;
const AUTENTICACAO = /(not logged in|please run \/login|run `?claude (auth )?login|invalid api key|authentication_error|oauth token (has )?expired|token (has )?expired|unauthorized|401)/i;
const TRANSITORIO = /(overloaded|529|500 internal|ECONNRESET|ETIMEDOUT|socket hang up|network error|api_error)/i;

export const SETTINGS = join(RAIZ, "config", "agente-settings.json");

function horarioDeReinicio(texto) {
  const epoch = /limit reached\|(\d{10})/.exec(texto);
  if (epoch) return new Date(Number(epoch[1]) * 1000).toISOString();
  return null;
}

function classificar(texto, padrao = "erro") {
  if (LIMITE_USO.test(texto)) return "limite";
  if (AUTENTICACAO.test(texto)) return "auth";
  if (TRANSITORIO.test(texto)) return "erro";
  return padrao;
}

const curto = (v, n = 160) => {
  const s = typeof v === "string" ? v : JSON.stringify(v);
  return (s || "").replace(/\s+/g, " ").slice(0, n);
};

// opcoes: { cfg, prompt, cwd, modelo, turnosMax, tempoMaxMs, permitidas[], negadas[], dirs[], esquema, log, sinal, aoIniciar, aoAtividade }
export async function chamarAgente(o) {
  const exe = acharClaude(o.cfg);
  if (!exe) throw new ErroEtapa("auth", "claude.exe não encontrado. Instale o Claude Code (ou a extensão do VS Code) e faça login.");
  const args = [
    "-p",
    "--output-format", "stream-json",
    "--verbose",
    "--model", o.modelo,
    "--max-turns", String(o.turnosMax),
    "--permission-mode", "acceptEdits",
    "--settings", SETTINGS,
  ];
  if (o.dirs?.length) args.push("--add-dir", ...o.dirs);
  if (o.esquema) args.push("--json-schema", JSON.stringify(o.esquema));
  if (o.negadas?.length) args.push("--disallowedTools", ...o.negadas);
  args.push("--allowedTools", ...o.permitidas);

  let final = null;
  const aoLinha = (linha) => {
    if (!linha.startsWith("{")) return;
    let d;
    try { d = JSON.parse(linha); } catch { return; }
    if (d.type === "system" && d.subtype === "init") {
      escreverLog(o.log, `· sessão ${d.session_id} · modelo ${d.model} · origem da chave: ${d.apiKeySource}\n`);
    } else if (d.type === "assistant") {
      for (const c of d.message?.content || []) {
        if (c.type === "tool_use") {
          const alvo = c.input?.file_path || c.input?.command || c.input?.pattern || c.input?.skill || c.input?.url || "";
          escreverLog(o.log, `→ ${c.name} ${curto(alvo, 200)}\n`);
          o.aoAtividade?.(`${c.name} ${curto(alvo, 90)}`);
        } else if (c.type === "text" && c.text?.trim()) {
          escreverLog(o.log, `· ${curto(c.text, 400)}\n`);
        }
      }
    } else if (d.type === "user") {
      for (const c of d.message?.content || []) {
        if (c?.type === "tool_result" && c.is_error) escreverLog(o.log, `  ✗ ${curto(c.content, 300)}\n`);
      }
    } else if (d.type === "result") {
      final = d;
    }
  };

  // O texto bruto do stream (com o conteúdo dos arquivos lidos) não vai para o log: só o resumo acima.
  const r = await rodar(exe, args, {
    cwd: o.cwd,
    env: ambienteLimpo(),
    tempoMaxMs: o.tempoMaxMs,
    sinal: o.sinal,
    aoIniciar: o.aoIniciar,
    entrada: o.prompt,
    aoLinha,
  });

  const info = {
    custo_usd: final?.total_cost_usd ?? null,
    tokens: final?.usage
      ? { entrada: final.usage.input_tokens, saida: final.usage.output_tokens, cache_lido: final.usage.cache_read_input_tokens, cache_criado: final.usage.cache_creation_input_tokens }
      : null,
    turnos: final?.num_turns ?? null,
    sessao: final?.session_id ?? null,
  };
  const negacoes = (final?.permission_denials || []).map((x) => `${x.tool_name}: ${curto(x.tool_input?.command || x.tool_input?.file_path || x.tool_input, 120)}`);
  if (negacoes.length) escreverLog(o.log, `\n· ferramentas negadas pela lista de permissões:\n  ${negacoes.join("\n  ")}\n`);

  if (!final) {
    const tipo = classificar(r.saida);
    throw new ErroEtapa(tipo, tipo === "limite" ? "Limite de uso do Claude atingido." : tipo === "auth" ? "Autenticação do Claude pendente: rode `claude auth login`." : `O agente terminou sem resposta (código ${r.codigo}).`, {
      saida: r.saida, info, reinicio: horarioDeReinicio(r.saida),
    });
  }
  escreverLog(o.log, `\n· fim: ${final.subtype} · ${final.num_turns} turnos · custo estimado US$ ${(final.total_cost_usd ?? 0).toFixed(3)}\n`);
  if (final.is_error || final.subtype !== "success") {
    const texto = `${final.subtype} ${final.result || ""} ${(final.errors || []).join(" ")}`;
    const tipo = final.subtype === "error_max_turns" ? "erro" : classificar(texto);
    const msg =
      tipo === "limite" ? "Limite de uso do Claude atingido."
      : tipo === "auth" ? "Autenticação do Claude pendente: rode `claude auth login`."
      : final.subtype === "error_max_turns" ? `O agente atingiu o limite de ${o.turnosMax} turnos sem terminar.`
      : `O agente falhou: ${limpar(curto(texto, 300))}`;
    throw new ErroEtapa(tipo, msg, { info, reinicio: horarioDeReinicio(texto) });
  }
  return { texto: final.result, estruturado: final.structured_output ?? null, info, negacoes };
}

// Estado do login (para a interface): só campos não sensíveis.
export async function estadoLogin(cfg) {
  const exe = acharClaude(cfg);
  if (!exe) return { encontrado: false };
  try {
    const r = await rodar(exe, ["auth", "status"], { env: ambienteLimpo(), tempoMaxMs: 30_000 });
    const d = JSON.parse(r.saida.slice(r.saida.indexOf("{"), r.saida.lastIndexOf("}") + 1));
    return { encontrado: true, executavel: exe, logado: !!d.loggedIn, metodo: d.authMethod, assinatura: d.subscriptionType };
  } catch (e) {
    return { encontrado: true, executavel: exe, logado: false, erro: limpar(e.message) };
  }
}
