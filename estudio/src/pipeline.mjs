// Motor do fluxo: executa UMA etapa da produção por chamada e decide o próximo passo.
// Etapas normais chamam o perfil (scripts existentes ou agente); portões aplicam o modo de
// revisão escolhido (humano, subagente, subagente + humano). Toda decisão fica registrada.
import { existsSync, mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { join } from "node:path";
import { chamarAgente } from "./agente.mjs";
import { LOGS, PROMPTS, REGRAS } from "./config.mjs";
import * as D from "./db.mjs";
import * as perfil2d from "./perfis/perfil-2d.mjs";
import * as perfil3d from "./perfis/perfil-3d.mjs";
import * as perfilSimulado from "./perfis/perfil-simulado.mjs";
import { ErroEtapa, escreverLog } from "./processos.mjs";

export const PERFIS = { "2d": perfil2d, "3d": perfil3d, ...(process.env.ESTUDIO_SIMULADO === "1" ? { simulado: perfilSimulado } : {}) };
export const PORTOES = { revisao_roteiro: "roteiro", revisao_previa: "previa", revisao_final: "final" };
export const ROTULOS = {
  preparar: "Preparar pasta", roteiro: "Roteiro", revisao_roteiro: "Revisão do roteiro", voz: "Voz",
  cenas: "Cenas", montagem: "Montagem e checagem", previa: "Prévia", revisao_previa: "Revisão da prévia",
  render_final: "Render final", metadados: "Título, descrição e tags", revisao_final: "Aprovação final",
  entrega: "Entrega", correcao: "Correção",
};
// Para onde volta cada portão quando pede correção, e onde o fluxo retoma depois da correção.
const VOLTA = { roteiro: "roteiro", previa: "correcao", final: "correcao" };
const APOS_CORRECAO = "voz";

const CRITERIOS = () => JSON.parse(readFileSync(join(REGRAS, "criterios.json"), "utf8"));

export function proxima(perfil, etapa) {
  if (etapa === "correcao") return APOS_CORRECAO;
  const lista = PERFIS[perfil].ETAPAS;
  return lista[lista.indexOf(etapa) + 1] || null;
}
export function progresso(perfil, etapa) {
  const lista = PERFIS[perfil].ETAPAS;
  const i = etapa === "correcao" ? lista.indexOf("cenas") : lista.indexOf(etapa);
  return Math.round((Math.max(0, i) / lista.length) * 100);
}

// Próxima etapa ainda por fazer: pula as que continuam concluídas (ex.: Cenas depois de uma
// correção — a correção ajusta as cenas existentes, não as cria de novo).
function proximaPendente(perfil, prodId, etapa) {
  let s = proxima(perfil, etapa);
  while (s && D.etapa(prodId, s)?.status === "concluida") s = proxima(perfil, s);
  return s;
}

// Ao voltar para uma etapa, tudo dali em diante fica pendente (as impressões digitais
// continuam salvas, então voz e render só são refeitos se as entradas mudaram).
// Numa correção, Cenas continua concluída: só voz (se o texto mudou), montagem e o resto refazem.
export function voltarPara(prod, alvo) {
  const lista = PERFIS[prod.perfil].ETAPAS;
  const desde = alvo === "correcao" ? lista.indexOf(APOS_CORRECAO) : lista.indexOf(alvo);
  for (const e of lista.slice(desde)) {
    if (alvo === "correcao" && e === "cenas") continue;
    D.atualizarEtapa(prod.id, e, { status: "pendente", tentativas: 0, aprovacao: null });
  }
  D.atualizarEtapa(prod.id, "correcao", { status: "pendente", tentativas: 0 });
  D.atualizarProducao(prod.id, { etapa_atual: alvo, progresso: progresso(prod.perfil, alvo) });
}

function preencher(nome, vars) {
  let t = readFileSync(join(PROMPTS, `${nome}.md`), "utf8");
  for (const [k, v] of Object.entries(vars)) t = t.split(`{{${k}}}`).join(String(v ?? ""));
  return t;
}

// ------------------------------------------------------------------ contexto
function contexto(cfg, prod, nomeEtapa, controle) {
  const linha = D.etapa(prod.id, nomeEtapa);
  const tentativa = linha.tentativas + 1;
  const log = join(LOGS, String(prod.id), `${new Date().toISOString().replace(/[:.]/g, "-")}-${nomeEtapa}-t${tentativa}.log`);
  mkdirSync(join(LOGS, String(prod.id)), { recursive: true });
  const ctx = {
    cfg, prod, etapa: linha, tentativa, log,
    perfil: cfg.perfis[prod.perfil],
    sinal: controle.signal,
    custo: 0, tokens: null,
    aoIniciar: (pid) => D.atualizarEtapa(prod.id, nomeEtapa, { pid_filho: pid }),
    tempoMax: (chave) => (cfg.limites.tempo_max_min[chave] || 30) * 60_000,
    atualizar: (campos) => { D.atualizarProducao(prod.id, campos); Object.assign(ctx.prod, campos); },
    saidaDe: (e) => D.etapa(prod.id, e)?.saida,
    prompt: (nome, vars) => preencher(nome, vars),
    feedbackTexto: () => ctx.prod.feedback || "",
    salvarMetadados: (m) => {
      const campos = { metadados_sugeridos: m };
      if (!ctx.prod.metadados_editados_em) campos.metadados = m; // edição humana prevalece
      ctx.atualizar(campos);
    },
    agente: async (o) => {
      const usadas = D.producao(prod.id).execucoes_agente;
      if (usadas >= cfg.limites.execucoes_de_agente_por_producao) {
        throw new ErroEtapa("bloqueado", `Limite de ${cfg.limites.execucoes_de_agente_por_producao} execuções de agente nesta produção. Revise o que está acontecendo antes de continuar.`);
      }
      D.atualizarProducao(prod.id, { execucoes_agente: usadas + 1 });
      const chave = o.etapa.startsWith("revisao") ? "revisao" : o.etapa;
      const r = await chamarAgente({
        cfg, log, sinal: controle.signal, aoIniciar: ctx.aoIniciar,
        modelo: o.modelo || cfg.modelos[chave] || "sonnet",
        turnosMax: cfg.limites.turnos_max[chave] || 40,
        tempoMaxMs: ctx.tempoMax(chave),
        aoAtividade: (t) => D.definirAjuste("atividade", { producao: prod.id, etapa: nomeEtapa, texto: t, em: D.agora() }),
        ...o,
      }).catch((e) => { ctx.custo += e.info?.custo_usd || 0; throw e; });
      ctx.custo += r.info.custo_usd || 0;
      ctx.tokens = r.info.tokens;
      return r;
    },
  };
  return ctx;
}

// ------------------------------------------------------------------- portões
const ESQUEMA_PARECER = {
  type: "object",
  properties: {
    veredito: { type: "string", enum: ["aprovado", "correcao"] },
    resumo: { type: "string" },
    criterios: {
      type: "array",
      items: {
        type: "object",
        properties: { id: { type: "string" }, atendido: { type: "boolean" }, observacao: { type: "string" } },
        required: ["id", "atendido", "observacao"],
      },
    },
    correcoes: { type: "array", items: { type: "string" } },
  },
  required: ["veredito", "resumo", "criterios", "correcoes"],
};

async function revisarPorSubagente(ctx, portao) {
  const P = PERFIS[ctx.prod.perfil];
  const mat = P.materialRevisao(ctx, portao);
  const criterios = CRITERIOS()[ctx.prod.perfil][portao];
  const prompt = preencher("revisao", {
    portao,
    titulo: ctx.prod.titulo,
    regras: mat.regras.map((f) => `- ${f}`).join("\n"),
    arquivos: mat.arquivos.filter((f) => existsSync(f)).map((f) => `- ${f}`).join("\n"),
    medidas: JSON.stringify(mat.medidas ?? {}, null, 2),
    criterios: criterios.map((c) => `- **${c.id}** — ${c.texto}${c.bloqueante ? " (bloqueante)" : ""}`).join("\n"),
    rodada: ctx.prod.rodada_correcao,
  });
  const r = await ctx.agente({
    etapa: `revisao_${portao}`,
    cwd: mat.cwd,
    prompt,
    permitidas: ["Read", "Glob", "Grep", ...(mat.web ? ["WebSearch", "WebFetch"] : [])],
    negadas: ["Write", "Edit", "NotebookEdit", "PowerShell", "Bash", ...(mat.web ? [] : ["WebSearch", "WebFetch"])],
    esquema: ESQUEMA_PARECER,
  });
  const p = r.estruturado;
  if (!p?.veredito) throw new ErroEtapa("erro", "O subagente revisor não devolveu um parecer válido.");
  // Um critério bloqueante não atendido nunca vira aprovação automática.
  const bloqueantes = new Set(criterios.filter((c) => c.bloqueante).map((c) => c.id));
  if (p.veredito === "aprovado" && p.criterios.some((c) => !c.atendido && bloqueantes.has(c.id))) {
    p.veredito = "correcao";
    p.resumo = `[ajustado pelo Estúdio: critério bloqueante não atendido] ${p.resumo}`;
  }
  return { parecer: p, criterios, modelo: ctx.cfg.modelos.revisao };
}

function salvarParecerEmArquivo(prod, portao, rodada, revisor, parecer, criterios) {
  if (!prod.pasta) return null;
  const pasta = join(prod.pasta, "revisoes");
  mkdirSync(pasta, { recursive: true });
  const base = join(pasta, `${portao}-r${rodada}-${revisor}-${Date.now()}`);
  writeFileSync(`${base}.json`, JSON.stringify({ portao, rodada, revisor, em: D.agora(), ...parecer, criterios_usados: criterios }, null, 2));
  const md = [
    `# Parecer — ${ROTULOS[`revisao_${portao}`]} (rodada ${rodada}, ${revisor})`,
    "",
    `**Veredito:** ${parecer.veredito}`,
    "",
    parecer.resumo,
    "",
    "## Critérios",
    ...(parecer.criterios || []).map((c) => `- [${c.atendido ? "x" : " "}] **${c.id}** — ${c.observacao}`),
    "",
    "## Correções pedidas",
    ...((parecer.correcoes || []).length ? parecer.correcoes.map((c) => `- ${c}`) : ["- nenhuma"]),
  ].join("\n");
  writeFileSync(`${base}.md`, md + "\n");
  return `${base}.md`;
}

async function executarPortao(cfg, prod, nomeEtapa, ctx) {
  const portao = PORTOES[nomeEtapa];
  const modo = prod.modos_revisao[portao] || "humano";
  const rodada = prod.rodada_correcao;
  if (modo === "humano") return { aguardarHumano: `Revise ${ROTULOS[nomeEtapa].toLowerCase()} e decida: aprovar ou pedir correção.` };

  const P = PERFIS[prod.perfil];
  const { parecer, criterios, modelo } = P.revisarSimulado ? P.revisarSimulado(ctx, portao) : await revisarPorSubagente(ctx, portao);
  const arquivo = salvarParecerEmArquivo(prod, portao, rodada, "subagente", parecer, criterios);
  const aprovado = parecer.veredito === "aprovado";
  let efeito;
  if (modo === "subagente_humano") efeito = "aguardando_humano";
  else if (aprovado) efeito = "aprovacao_automatica";
  else if (rodada < cfg.limites.rodadas_de_correcao) efeito = "correcao_pedida";
  else efeito = "aguardando_humano";
  D.registrarRevisao({ producao_id: prod.id, portao, rodada, revisor: "subagente", decisao: aprovado ? "aprovado" : "correcao", efeito, parecer: parecer.resumo, criterios: parecer.criterios, correcoes: parecer.correcoes, modelo, arquivo });

  if (efeito === "aprovacao_automatica") return { aprovacao: "automatica", resumo: `Aprovado automaticamente pelo subagente: ${parecer.resumo}` };
  if (efeito === "correcao_pedida") return { correcao: parecer.correcoes.join("\n"), resumo: `Subagente pediu correção (rodada ${rodada + 1}): ${parecer.resumo}` };
  if (modo === "subagente_humano") return { aguardarHumano: `Parecer do subagente: ${aprovado ? "aprovar" : "corrigir"}. A decisão é sua.` };
  return { aguardarHumano: `O subagente ainda pede correção depois de ${rodada} rodada(s) (limite). Decida: aprovar assim, pedir outra correção ou cancelar.` };
}

// ---------------------------------------------------------------- execução
// Executa a etapa atual de `prod`. Devolve o novo status da produção.
export async function executarEtapa(cfg, prodId, controle) {
  const prod = D.producao(prodId);
  const nomeEtapa = prod.etapa_atual;
  const P = PERFIS[prod.perfil];
  const ctx = contexto(cfg, prod, nomeEtapa, controle);
  const execId = D.abrirExecucao(prod.id, nomeEtapa, ctx.tentativa, ctx.log);
  D.atualizarEtapa(prod.id, nomeEtapa, { status: "executando", iniciado_em: D.agora(), pid_filho: null });
  D.registrar(prod.id, "etapa", `▶ ${ROTULOS[nomeEtapa]} (tentativa ${ctx.tentativa})`);
  escreverLog(ctx.log, `# ${prod.titulo} · ${ROTULOS[nomeEtapa]} · tentativa ${ctx.tentativa} · ${D.agora()}\n`);

  try {
    let r;
    if (PORTOES[nomeEtapa]) r = await executarPortao(cfg, prod, nomeEtapa, ctx);
    else {
      const fn = P.executores[nomeEtapa];
      if (!fn) throw new ErroEtapa("erro", `Etapa desconhecida: ${nomeEtapa}`);
      r = await fn(ctx);
    }
    const extra = { custo_usd: ctx.custo || null, tokens: ctx.tokens };

    if (r.aguardarHumano) {
      D.fecharExecucao(execId, "ok", r.aguardarHumano, extra);
      D.atualizarEtapa(prod.id, nomeEtapa, { status: "aguardando", pid_filho: null });
      D.trocarStatus(prod.id, "executando", "aguardando_humano", { motivo: r.aguardarHumano, motivo_tipo: "revisao" });
      D.registrar(prod.id, "revisao", `⏸ ${r.aguardarHumano}`);
      return "aguardando_humano";
    }
    if (r.correcao !== undefined) {
      D.fecharExecucao(execId, "correcao", r.resumo, extra);
      D.atualizarEtapa(prod.id, nomeEtapa, { status: "pendente", pid_filho: null });
      return pedirCorrecao(prod, PORTOES[nomeEtapa], r.correcao, r.resumo);
    }

    D.fecharExecucao(execId, r.pulada ? "pulada" : "ok", r.resumo, extra);
    D.atualizarEtapa(prod.id, nomeEtapa, {
      status: r.pulada ? "pulada" : "concluida", tentativas: 0, concluido_em: D.agora(), pid_filho: null, ultimo_erro: null,
      ...(r.impressao ? { impressao: r.impressao } : {}),
      ...(r.saida !== undefined ? { saida: r.saida } : {}),
      ...(r.aprovacao ? { aprovacao: r.aprovacao } : {}),
    });
    D.registrar(prod.id, r.aprovacao ? "aprovacao" : "etapa", `✓ ${ROTULOS[nomeEtapa]}: ${r.resumo || "concluída"}`);
    // feedback consumido pela etapa que o aplicou
    if (["roteiro", "correcao", "cenas", "metadados"].includes(nomeEtapa) && prod.feedback) D.atualizarProducao(prod.id, { feedback: null });

    const seguinte = proximaPendente(prod.perfil, prod.id, nomeEtapa);
    if (!seguinte) {
      D.trocarStatus(prod.id, "executando", "pronto", { progresso: 100, motivo: "Pronto para você conferir e postar.", motivo_tipo: null, retomadas_automaticas: 0 });
      D.registrar(prod.id, "pronto", "🎬 Conteúdo pronto para conferir e postar.");
      return "pronto";
    }
    D.atualizarProducao(prod.id, { etapa_atual: seguinte, progresso: progresso(prod.perfil, seguinte), retomadas_automaticas: 0 });
    D.trocarStatus(prod.id, "executando", "na_fila", { motivo: null, motivo_tipo: null });
    return "na_fila";
  } catch (e) {
    return tratarErro(cfg, prod, nomeEtapa, ctx, execId, e);
  }
}

function pedirCorrecao(prod, portao, texto, resumo) {
  const alvo = portao ? VOLTA[portao] : "correcao";
  D.atualizarProducao(prod.id, { rodada_correcao: prod.rodada_correcao + 1, feedback: texto });
  voltarPara(prod, alvo);
  D.trocarStatus(prod.id, "executando", "na_fila", { motivo: null, motivo_tipo: null });
  D.registrar(prod.id, "correcao", `↺ ${resumo} → volta para ${ROTULOS[alvo]}`);
  return "na_fila";
}

function tratarErro(cfg, prod, nomeEtapa, ctx, execId, e) {
  const tipo = e instanceof ErroEtapa ? e.tipo : "erro";
  const msg = e instanceof ErroEtapa ? e.message : `Erro inesperado: ${e.stack || e.message}`;
  const extra = { custo_usd: ctx.custo || null, tokens: ctx.tokens };
  D.fecharExecucao(execId, tipo, msg, extra);
  escreverLog(ctx.log, `\n✗ ${tipo}: ${msg}\n`);
  const L = cfg.limites;

  // Interrupção (pausa, cancelamento, parada do executor): não conta como tentativa.
  if (tipo === "interrompido") {
    D.atualizarEtapa(prod.id, nomeEtapa, { status: "pendente", pid_filho: null });
    const atual = D.producao(prod.id).status;
    if (atual === "cancelando") D.trocarStatus(prod.id, "cancelando", "cancelado", { motivo: "Cancelada por você.", motivo_tipo: "usuario" });
    else if (atual === "pausando") D.trocarStatus(prod.id, "pausando", "pausado", { motivo: "Pausada por você.", motivo_tipo: "usuario" });
    else D.trocarStatus(prod.id, "executando", "pausado", { motivo: "Interrompida (executor encerrado). Clique em Retomar.", motivo_tipo: "interrompido" });
    D.registrar(prod.id, "interrupcao", `■ ${ROTULOS[nomeEtapa]} interrompida.`);
    return D.producao(prod.id).status;
  }

  // Montagem recusada: vira correção automática enquanto houver rodadas.
  if (tipo === "correcao") {
    D.atualizarEtapa(prod.id, nomeEtapa, { status: "falhou", ultimo_erro: msg, pid_filho: null });
    if (prod.rodada_correcao < L.rodadas_de_correcao) return pedirCorrecao(prod, null, msg, `${ROTULOS[nomeEtapa]} recusou o resultado`);
    D.trocarStatus(prod.id, "executando", "erro", { motivo: `${ROTULOS[nomeEtapa]} continua falhando após ${L.rodadas_de_correcao} correções.\n${msg}`, motivo_tipo: "erro" });
    D.registrar(prod.id, "erro", `✗ Limite de correções atingido em ${ROTULOS[nomeEtapa]}.`);
    return "erro";
  }

  // Limite de uso, autenticação, cota de voz ou decisão necessária: pausa com o motivo.
  if (["limite", "auth", "cota", "bloqueado"].includes(tipo)) {
    D.atualizarEtapa(prod.id, nomeEtapa, { status: "pendente", ultimo_erro: msg, pid_filho: null });
    const espera = e.reinicio || new Date(Date.now() + L.espera_padrao_limite_min * 60_000).toISOString();
    const textos = {
      limite: `Limite de uso do Claude atingido. ${e.reinicio ? `Libera por volta de ${new Date(e.reinicio).toLocaleString("pt-BR")}.` : "Tente de novo mais tarde."}`,
      auth: msg,
      cota: msg,
      bloqueado: msg,
    };
    const status = tipo === "bloqueado" ? "aguardando_humano" : "pausado";
    D.trocarStatus(prod.id, "executando", status, { motivo: textos[tipo], motivo_tipo: tipo, proxima_tentativa_em: ["limite", "cota"].includes(tipo) ? espera : null });
    D.registrar(prod.id, tipo, `⏸ ${textos[tipo]}`);
    return status;
  }

  // Erro comum ou tempo esgotado: tenta de novo com espera crescente, até o limite.
  const linha = D.etapa(prod.id, nomeEtapa);
  const tentativas = linha.tentativas + 1;
  const repetido = linha.ultimo_erro && linha.ultimo_erro === msg;
  D.atualizarEtapa(prod.id, nomeEtapa, { status: "falhou", tentativas, ultimo_erro: msg, pid_filho: null });
  if (tentativas >= L.tentativas_por_etapa || repetido) {
    const porque = repetido ? "o mesmo erro se repetiu" : `${tentativas} tentativas sem sucesso`;
    D.trocarStatus(prod.id, "executando", "erro", { motivo: `${ROTULOS[nomeEtapa]} parou: ${porque}.\n${msg}`, motivo_tipo: "erro" });
    D.registrar(prod.id, "erro", `✗ ${ROTULOS[nomeEtapa]} parou (${porque}).`);
    return "erro";
  }
  const espera = L.espera_entre_tentativas_s[Math.min(tentativas - 1, L.espera_entre_tentativas_s.length - 1)];
  D.trocarStatus(prod.id, "executando", "na_fila", {
    motivo: `Falhou (tentativa ${tentativas}/${L.tentativas_por_etapa}); nova tentativa em ${espera}s.`, motivo_tipo: "erro",
    proxima_tentativa_em: new Date(Date.now() + espera * 1000).toISOString(),
  });
  D.registrar(prod.id, "erro", `✗ ${ROTULOS[nomeEtapa]} falhou (tentativa ${tentativas}): ${msg.split("\n")[0]}`);
  return "na_fila";
}

// ------------------------------------------------------- decisões humanas
export function decidir(prodId, decisao, comentario) {
  const prod = D.producao(prodId);
  if (prod.status !== "aguardando_humano") throw new Error("Esta produção não está esperando uma decisão.");
  const portao = PORTOES[prod.etapa_atual];
  // Bloqueio fora de portão (o agente pediu uma decisão): a resposta vira instrução da nova tentativa.
  if (!portao) {
    if (decisao !== "responder" || !comentario?.trim()) throw new Error("Escreva a sua resposta para o agente.");
    D.atualizarEtapa(prod.id, prod.etapa_atual, { status: "pendente", tentativas: 0, ultimo_erro: null });
    const pergunta = (prod.motivo || "").slice(0, 3000);
    D.atualizarProducao(prod.id, { feedback: `Você parou pedindo uma decisão:\n${pergunta}\n\nResposta da pessoa:\n${comentario.trim()}` });
    D.trocarStatus(prod.id, "aguardando_humano", "na_fila", { motivo: null, motivo_tipo: null });
    D.registrar(prod.id, "decisao", `✎ Você respondeu ao agente (${ROTULOS[prod.etapa_atual]}): ${comentario.trim().split("\n")[0]}`);
    return;
  }
  const rodada = prod.rodada_correcao;
  if (decisao === "aprovar") {
    D.registrarRevisao({ producao_id: prod.id, portao, rodada, revisor: "humano", decisao: "aprovado", efeito: "aprovacao_humana", parecer: comentario || "Aprovado." });
    salvarParecerEmArquivo(prod, portao, rodada, "humano", { veredito: "aprovado", resumo: comentario || "Aprovado.", criterios: [], correcoes: [] }, []);
    D.atualizarEtapa(prod.id, prod.etapa_atual, { status: "concluida", aprovacao: "humana", concluido_em: D.agora() });
    const seguinte = proximaPendente(prod.perfil, prod.id, prod.etapa_atual);
    D.atualizarProducao(prod.id, { etapa_atual: seguinte, progresso: progresso(prod.perfil, seguinte) });
    D.trocarStatus(prod.id, "aguardando_humano", "na_fila", { motivo: null, motivo_tipo: null });
    D.registrar(prod.id, "aprovacao", `✓ ${ROTULOS[`revisao_${portao}`]}: aprovado por você.${comentario ? " " + comentario : ""}`);
    return;
  }
  if (!comentario?.trim()) throw new Error("Descreva a correção que você quer.");
  D.registrarRevisao({ producao_id: prod.id, portao, rodada, revisor: "humano", decisao: "correcao", efeito: "correcao_pedida", parecer: comentario, correcoes: [comentario] });
  salvarParecerEmArquivo(prod, portao, rodada, "humano", { veredito: "correcao", resumo: comentario, criterios: [], correcoes: [comentario] }, []);
  D.atualizarProducao(prod.id, { rodada_correcao: rodada + 1, feedback: comentario });
  voltarPara(prod, VOLTA[portao]);
  D.trocarStatus(prod.id, "aguardando_humano", "na_fila", { motivo: null, motivo_tipo: null });
  D.registrar(prod.id, "correcao", `↺ Você pediu correção: ${comentario.split("\n")[0]}`);
}
