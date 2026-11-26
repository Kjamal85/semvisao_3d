// Banco do Estúdio (SQLite embutido no Node, modo WAL): fila, etapas, pareceres, execuções,
// histórico e configurações. Servidor e executor abrem o mesmo arquivo; cada escrita é atômica.
import { mkdirSync } from "node:fs";
import { join } from "node:path";
import { DatabaseSync } from "node:sqlite";
import { DADOS } from "./config.mjs";
import { limpar } from "./segredos.mjs";

mkdirSync(DADOS, { recursive: true });
export const db = new DatabaseSync(join(DADOS, "estudio.db"));
db.exec("PRAGMA journal_mode = WAL; PRAGMA busy_timeout = 8000; PRAGMA foreign_keys = ON;");

db.exec(`
CREATE TABLE IF NOT EXISTS producoes (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  titulo TEXT NOT NULL,
  perfil TEXT NOT NULL,                 -- '2d' | '3d'
  tipo_entrada TEXT NOT NULL,           -- 'ideia' | 'briefing' | 'roteiro'
  entrada TEXT NOT NULL,
  opcoes TEXT NOT NULL DEFAULT '{}',    -- duração alvo, série, teste, capítulos...
  pasta TEXT,                           -- pasta do conteúdo (absoluta)
  status TEXT NOT NULL DEFAULT 'na_fila',
  etapa_atual TEXT NOT NULL DEFAULT 'preparar',
  progresso INTEGER NOT NULL DEFAULT 0,
  prioridade INTEGER NOT NULL DEFAULT 3, -- 1 = mais alta
  data_postagem TEXT,                   -- 'AAAA-MM-DDTHH:MM' (planejamento, sem publicação automática)
  modos_revisao TEXT NOT NULL,
  motivo TEXT,                          -- por que está pausada / aguardando / com erro
  motivo_tipo TEXT,                     -- 'usuario' | 'limite' | 'auth' | 'cota' | 'erro' | 'interrompido' | 'bloqueado' | 'revisao'
  proxima_tentativa_em TEXT,
  retomadas_automaticas INTEGER NOT NULL DEFAULT 0,
  rodada_correcao INTEGER NOT NULL DEFAULT 0,
  execucoes_agente INTEGER NOT NULL DEFAULT 0,
  feedback TEXT,                        -- correções pedidas, consumidas pela próxima etapa de agente
  metadados TEXT,                       -- { titulo, descricao, tags, hashtags, comentario_fixado }
  metadados_sugeridos TEXT,
  metadados_editados_em TEXT,
  entrega TEXT,                         -- pasta de entrega
  publicado_em TEXT,
  link_publicacao TEXT,
  criado_em TEXT NOT NULL,
  atualizado_em TEXT NOT NULL
);
CREATE TABLE IF NOT EXISTS etapas (
  producao_id INTEGER NOT NULL REFERENCES producoes(id) ON DELETE CASCADE,
  etapa TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'pendente', -- pendente | executando | concluida | aguardando | falhou | pulada
  tentativas INTEGER NOT NULL DEFAULT 0,
  impressao TEXT,                       -- impressão digital das entradas (evita refazer voz e render)
  aprovacao TEXT,                       -- portões: 'automatica' | 'humana'
  saida TEXT,
  ultimo_erro TEXT,
  pid_filho INTEGER,
  iniciado_em TEXT,
  concluido_em TEXT,
  PRIMARY KEY (producao_id, etapa)
);
CREATE TABLE IF NOT EXISTS execucoes (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  producao_id INTEGER NOT NULL REFERENCES producoes(id) ON DELETE CASCADE,
  etapa TEXT NOT NULL,
  tentativa INTEGER NOT NULL,
  inicio TEXT NOT NULL,
  fim TEXT,
  resultado TEXT,                       -- ok | pulada | erro | limite | auth | cota | timeout | interrompido | bloqueado | correcao
  resumo TEXT,
  log TEXT,
  custo_usd REAL,
  tokens TEXT
);
CREATE TABLE IF NOT EXISTS revisoes (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  producao_id INTEGER NOT NULL REFERENCES producoes(id) ON DELETE CASCADE,
  portao TEXT NOT NULL,                 -- roteiro | previa | final
  rodada INTEGER NOT NULL,
  revisor TEXT NOT NULL,                -- 'subagente' | 'humano'
  decisao TEXT NOT NULL,                -- 'aprovado' | 'correcao' | 'parecer'
  efeito TEXT,                          -- 'aprovacao_automatica' | 'aprovacao_humana' | 'correcao_pedida' | 'aguardando_humano'
  parecer TEXT,
  criterios TEXT,
  correcoes TEXT,
  modelo TEXT,
  arquivo TEXT,
  criado_em TEXT NOT NULL
);
CREATE TABLE IF NOT EXISTS historico (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  producao_id INTEGER REFERENCES producoes(id) ON DELETE CASCADE,
  em TEXT NOT NULL,
  tipo TEXT NOT NULL,
  mensagem TEXT NOT NULL
);
CREATE TABLE IF NOT EXISTS ajustes (chave TEXT PRIMARY KEY, valor TEXT NOT NULL);
`);
// Migrações simples (colunas novas em bancos já existentes)
const colunas = (t) => db.prepare(`PRAGMA table_info(${t})`).all().map((c) => c.name);
// servidor e executor abrem o banco quase ao mesmo tempo (iniciar.mjs) — o outro processo
// pode ter adicionado a coluna entre o PRAGMA e o ALTER, então ignoramos esse erro específico.
if (!colunas("etapas").includes("arvore")) {
  try { db.exec("ALTER TABLE etapas ADD COLUMN arvore TEXT"); } catch (e) { if (!/duplicate column/i.test(e.message)) throw e; } // processos da etapa em andamento
}

export const agora = () => new Date().toISOString();
const json = (v) => (v == null ? null : JSON.stringify(v));
const parse = (v, padrao = null) => {
  if (v == null) return padrao;
  try { return JSON.parse(v); } catch { return padrao; }
};

// ------------------------------------------------------------------ ajustes
export function ajuste(chave, padrao = null) {
  const r = db.prepare("SELECT valor FROM ajustes WHERE chave = ?").get(chave);
  return r ? parse(r.valor, padrao) : padrao;
}
export function definirAjuste(chave, valor) {
  db.prepare("INSERT INTO ajustes (chave, valor) VALUES (?, ?) ON CONFLICT(chave) DO UPDATE SET valor = excluded.valor").run(chave, JSON.stringify(valor));
}

// --------------------------------------------------------------- produções
function lerProducao(r) {
  if (!r) return null;
  return {
    ...r,
    opcoes: parse(r.opcoes, {}),
    modos_revisao: parse(r.modos_revisao, {}),
    metadados: parse(r.metadados),
    metadados_sugeridos: parse(r.metadados_sugeridos),
  };
}
export const producao = (id) => lerProducao(db.prepare("SELECT * FROM producoes WHERE id = ?").get(id));
export const listarProducoes = () => db.prepare("SELECT * FROM producoes ORDER BY id DESC").all().map(lerProducao);

export function criarProducao(p, etapas) {
  const t = agora();
  const r = db
    .prepare(
      `INSERT INTO producoes (titulo, perfil, tipo_entrada, entrada, opcoes, prioridade, data_postagem, modos_revisao, etapa_atual, criado_em, atualizado_em)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`
    )
    .run(p.titulo, p.perfil, p.tipo_entrada, p.entrada, json(p.opcoes || {}), p.prioridade ?? 3, p.data_postagem || null, json(p.modos_revisao), etapas[0], t, t);
  const id = Number(r.lastInsertRowid);
  const ins = db.prepare("INSERT INTO etapas (producao_id, etapa) VALUES (?, ?)");
  for (const e of [...etapas, "correcao"]) ins.run(id, e);
  registrar(id, "criada", `Produção criada (${p.perfil}, entrada: ${p.tipo_entrada}).`);
  return id;
}

const CAMPOS_JSON = new Set(["opcoes", "modos_revisao", "metadados", "metadados_sugeridos"]);
export function atualizarProducao(id, campos) {
  const chaves = Object.keys(campos);
  if (!chaves.length) return;
  const sets = chaves.map((k) => `${k} = ?`).join(", ");
  const vals = chaves.map((k) => (CAMPOS_JSON.has(k) ? json(campos[k]) : campos[k]));
  db.prepare(`UPDATE producoes SET ${sets}, atualizado_em = ? WHERE id = ?`).run(...vals, agora(), id);
}

// Troca de status condicionada ao status atual (evita corrida entre servidor e executor).
export function trocarStatus(id, de, para, extra = {}) {
  const lista = Array.isArray(de) ? de : [de];
  const r = db
    .prepare(`UPDATE producoes SET status = ?, atualizado_em = ? WHERE id = ? AND status IN (${lista.map(() => "?").join(",")})`)
    .run(para, agora(), id, ...lista);
  if (r.changes && Object.keys(extra).length) atualizarProducao(id, extra);
  return r.changes > 0;
}

export function apagarProducao(id) {
  db.prepare("DELETE FROM producoes WHERE id = ?").run(id);
}

// ------------------------------------------------------------------ etapas
export function etapa(id, nome) {
  const r = db.prepare("SELECT * FROM etapas WHERE producao_id = ? AND etapa = ?").get(id, nome);
  return r ? { ...r, saida: parse(r.saida), arvore: parse(r.arvore, []) } : null;
}
export const etapasDe = (id) =>
  db.prepare("SELECT * FROM etapas WHERE producao_id = ?").all(id).map((r) => ({ ...r, saida: parse(r.saida) }));
export function atualizarEtapa(id, nome, campos) {
  const chaves = Object.keys(campos);
  const vals = chaves.map((k) => (k === "saida" || k === "arvore" ? json(campos[k]) : campos[k]));
  db.prepare(`UPDATE etapas SET ${chaves.map((k) => `${k} = ?`).join(", ")} WHERE producao_id = ? AND etapa = ?`).run(...vals, id, nome);
}

// --------------------------------------------------------------- execuções
export function abrirExecucao(id, nome, tentativa, log) {
  return Number(
    db.prepare("INSERT INTO execucoes (producao_id, etapa, tentativa, inicio, log) VALUES (?, ?, ?, ?, ?)").run(id, nome, tentativa, agora(), log).lastInsertRowid
  );
}
export function fecharExecucao(execId, resultado, resumo, extra = {}) {
  db.prepare("UPDATE execucoes SET fim = ?, resultado = ?, resumo = ?, custo_usd = ?, tokens = ? WHERE id = ?").run(
    agora(), resultado, limpar(resumo || "").slice(0, 4000), extra.custo_usd ?? null, json(extra.tokens), execId
  );
}
export const execucoesDe = (id) => db.prepare("SELECT * FROM execucoes WHERE producao_id = ? ORDER BY id DESC").all(id);
export const execucao = (execId) => db.prepare("SELECT * FROM execucoes WHERE id = ?").get(execId);

// ---------------------------------------------------------------- revisões
export function registrarRevisao(r) {
  db.prepare(
    `INSERT INTO revisoes (producao_id, portao, rodada, revisor, decisao, efeito, parecer, criterios, correcoes, modelo, arquivo, criado_em)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`
  ).run(r.producao_id, r.portao, r.rodada, r.revisor, r.decisao, r.efeito || null, limpar(r.parecer || ""), json(r.criterios), json(r.correcoes), r.modelo || null, r.arquivo || null, agora());
}
export const revisoesDe = (id) =>
  db.prepare("SELECT * FROM revisoes WHERE producao_id = ? ORDER BY id DESC").all(id).map((r) => ({ ...r, criterios: parse(r.criterios, []), correcoes: parse(r.correcoes, []) }));

// --------------------------------------------------------------- histórico
export function registrar(id, tipo, mensagem) {
  db.prepare("INSERT INTO historico (producao_id, em, tipo, mensagem) VALUES (?, ?, ?, ?)").run(id, agora(), tipo, limpar(mensagem).slice(0, 4000));
}
export const historicoDe = (id) => db.prepare("SELECT * FROM historico WHERE producao_id = ? ORDER BY id DESC LIMIT 400").all(id);
