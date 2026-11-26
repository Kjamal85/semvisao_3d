// Perfil simulado (só com ESTUDIO_SIMULADO=1): mesmas etapas, mas cada uma é um processo Node
// que espera alguns segundos e grava um arquivo. Serve para testar fila, tentativas, portões,
// pausa/cancelamento e recuperação após interrupção sem gastar uso do Claude nem cota de voz.
// opcoes: { ms: duração de cada etapa, ms_etapa: { etapa: ms }, falhar: { etapa: vezes }, parecer: { portao: 'aprovado'|'correcao' } }
import { existsSync, mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { join } from "node:path";
import { DADOS } from "../config.mjs";
import { ErroEtapa, rodar } from "../processos.mjs";
import { impressao } from "./comum.mjs";

export const ETAPAS = [
  "preparar", "roteiro", "revisao_roteiro", "voz", "cenas", "montagem", "previa",
  "revisao_previa", "render_final", "metadados", "revisao_final", "entrega",
];

function contar(pasta, etapa) {
  const f = join(pasta, "contagem.json");
  const c = existsSync(f) ? JSON.parse(readFileSync(f, "utf8")) : {};
  c[etapa] = (c[etapa] || 0) + 1;
  writeFileSync(f, JSON.stringify(c, null, 2));
  return c[etapa];
}

async function trabalhar(ctx, etapa, arquivo) {
  const ms = ctx.prod.opcoes.ms_etapa?.[etapa] ?? ctx.prod.opcoes.ms ?? 1500;
  const vezes = contar(ctx.prod.pasta, etapa);
  const falhas = ctx.prod.opcoes.falhar?.[etapa] || 0;
  const destino = join(ctx.prod.pasta, arquivo || `${etapa}.txt`);
  // O trabalho roda num "neto" desanexado, como o Chrome/render do HyperFrames: se o executor
  // morrer, o filho direto morre junto (job do Windows), mas o neto fica órfão.
  const trabalho = `setTimeout(() => { require("fs").writeFileSync(${JSON.stringify(destino)}, "feito " + Date.now()); }, ${ms});`;
  const codigo = `const n = require("child_process").spawn(process.execPath, ["-e", ${JSON.stringify(trabalho)}], { detached: true, stdio: "ignore", windowsHide: true });
n.on("exit", () => process.exit(${vezes <= falhas ? 3 : 0}));`;
  const r = await rodar(process.execPath, ["-e", codigo], { tempoMaxMs: ctx.tempoMax(etapa), sinal: ctx.sinal, log: ctx.log, aoIniciar: ctx.aoIniciar });
  if (r.codigo !== 0) throw new ErroEtapa("erro", `Falha simulada em ${etapa} (execução ${vezes}).`);
  return { resumo: `${etapa} simulada (execução nº ${vezes}).` };
}

const comImpressao = (etapa, entradas) => async (ctx) => {
  const fp = impressao(ctx.prod.pasta, entradas);
  if (ctx.etapa.impressao === fp && existsSync(join(ctx.prod.pasta, `${etapa}.txt`))) return { pulada: true, impressao: fp, resumo: `${etapa} reaproveitada (entradas iguais).` };
  return { ...(await trabalhar(ctx, etapa)), impressao: fp };
};

export const executores = {
  async preparar(ctx) {
    const pasta = join(DADOS, "simulado", String(ctx.prod.id));
    mkdirSync(pasta, { recursive: true });
    if (!existsSync(join(pasta, "roteiro.md"))) writeFileSync(join(pasta, "roteiro.md"), ctx.prod.entrada);
    ctx.atualizar({ pasta });
    return { resumo: `Pasta simulada: ${pasta}` };
  },
  roteiro: (ctx) => trabalhar(ctx, "roteiro"),
  voz: comImpressao("voz", ["roteiro.md"]),
  cenas: (ctx) => trabalhar(ctx, "cenas"),
  correcao: async (ctx) => {
    writeFileSync(join(ctx.prod.pasta, "correcoes.txt"), ctx.feedbackTexto());
    return trabalhar(ctx, "correcao");
  },
  montagem: (ctx) => trabalhar(ctx, "montagem"),
  previa: comImpressao("previa", ["roteiro.md", "cenas.txt", "correcoes.txt"]),
  render_final: comImpressao("render_final", ["roteiro.md", "cenas.txt", "correcoes.txt"]),
  metadados: async (ctx) => {
    ctx.salvarMetadados({ titulo: `Título simulado ${ctx.prod.id}`, descricao: "Descrição simulada.", tags: ["teste"], hashtags: ["#teste"], comentario_fixado: "", capa_segundo: 1 });
    return trabalhar(ctx, "metadados");
  },
  entrega: (ctx) => trabalhar(ctx, "entrega"),
};

// Parecer simulado: { portao: 'correcao' } pede correção uma vez, depois aprova.
export function revisarSimulado(ctx, portao) {
  const quer = ctx.prod.opcoes.parecer?.[portao] || "aprovado";
  const veredito = quer === "correcao" && ctx.prod.rodada_correcao === 0 ? "correcao" : "aprovado";
  return {
    parecer: {
      veredito,
      resumo: veredito === "aprovado" ? "Simulação: tudo certo." : "Simulação: ajustar a cena 2.",
      criterios: [{ id: "simulado", atendido: veredito === "aprovado", observacao: "critério de teste" }],
      correcoes: veredito === "aprovado" ? [] : ["Ajustar a cena 2 (simulado)."],
    },
    criterios: [{ id: "simulado", texto: "critério de teste" }],
    modelo: "simulado",
  };
}

export const materialRevisao = () => ({ cwd: DADOS, regras: [], arquivos: [], medidas: {} });
export const arquivosVisiveis = (prod) =>
  prod.pasta ? ["roteiro.md", "contagem.json", "correcoes.txt"].map((f) => ({ rotulo: f, caminho: join(prod.pasta, f) })).filter((a) => existsSync(a.caminho)) : [];
