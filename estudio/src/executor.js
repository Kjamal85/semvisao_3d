import { ETAPAS, STATUS, proximaEtapa, etapaPorId } from "./etapas.js";

const LIMITE_TENTATIVAS = 3;

function agora() {
  return new Date().toISOString();
}

function registrar(db, producaoId, etapa, ator, resultado, nota) {
  db.prepare(
    `INSERT INTO historico (producao_id, etapa, ator, resultado, nota, criado_em) VALUES (?, ?, ?, ?, ?, ?)`
  ).run(producaoId, etapa, ator, resultado, nota ?? null, agora());
}

export function criarProducao(db, { titulo, modo_revisao_roteiro = "subagente", modo_revisao_previa = "subagente", prioridade = 0, data_planejada = null }) {
  const t = agora();
  const r = db
    .prepare(
      `INSERT INTO producoes (titulo, etapa, status, modo_revisao_roteiro, modo_revisao_previa, prioridade, data_planejada, criado_em, atualizado_em)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`
    )
    .run(titulo, ETAPAS[0].id, STATUS.FILA, modo_revisao_roteiro, modo_revisao_previa, prioridade, data_planejada, t, t);
  return r.lastInsertRowid;
}

export function listarProducoes(db) {
  return db.prepare(`SELECT * FROM producoes ORDER BY prioridade DESC, criado_em ASC`).all();
}

export function buscarProducao(db, id) {
  return db.prepare(`SELECT * FROM producoes WHERE id = ?`).get(id);
}

export function historicoDaProducao(db, id) {
  return db.prepare(`SELECT * FROM historico WHERE producao_id = ? ORDER BY id ASC`).all(id);
}

function atualizar(db, id, campos) {
  const chaves = Object.keys(campos);
  const sets = chaves.map((k) => `${k} = ?`).join(", ");
  const valores = chaves.map((k) => campos[k]);
  db.prepare(`UPDATE producoes SET ${sets}, atualizado_em = ? WHERE id = ?`).run(...valores, agora(), id);
}

// handlers injetáveis: permitem trocar execução real por etapas simuladas nos testes.
// handlers.mecanica(etapaId, producao) -> { ok: boolean, nota?: string }
// handlers.subagente(etapaId, producao) -> { aprovado: boolean, criterios: [...], nota?: string }
export function avancar(db, id, handlers) {
  const producao = buscarProducao(db, id);
  if (!producao) throw new Error(`produção ${id} não existe`);
  if ([STATUS.PAUSADO_HUMANO, STATUS.PAUSADO_ERRO, STATUS.CONCLUIDO, STATUS.CANCELADO].includes(producao.status)) {
    return { ...producao, acao: "nenhuma (status não avançável sem ação explícita)" };
  }

  const etapaDef = etapaPorId(producao.etapa);
  atualizar(db, id, { status: STATUS.EM_ANDAMENTO });

  try {
    if (etapaDef.tipo === "humano") {
      atualizar(db, id, { status: STATUS.PAUSADO_HUMANO, motivo_pausa: `aguardando aprovação humana: ${etapaDef.label}` });
      registrar(db, id, producao.etapa, "sistema", "pausado", "etapa humana — espera aprovação explícita");
      return buscarProducao(db, id);
    }

    if (etapaDef.tipo === "subagente") {
      const parecer = handlers.subagente(producao.etapa, producao);
      registrar(db, id, producao.etapa, "subagente", parecer.aprovado ? "aprovado" : "reprovado", JSON.stringify(parecer));
      const proxima = parecer.aprovado ? proximaEtapa(producao.etapa) : "correcoes";
      atualizar(db, id, { etapa: proxima, status: STATUS.FILA, motivo_pausa: null, tentativas: 0 });
      return buscarProducao(db, id);
    }

    // mecânica
    const resultado = handlers.mecanica(producao.etapa, producao);
    if (!resultado.ok) throw new Error(resultado.nota || "falha na etapa mecânica");
    registrar(db, id, producao.etapa, "mecanico", "ok", resultado.nota);
    const proxima = proximaEtapa(producao.etapa);
    if (proxima === null) {
      atualizar(db, id, { status: STATUS.CONCLUIDO, motivo_pausa: null });
    } else {
      atualizar(db, id, { etapa: proxima, status: STATUS.FILA, motivo_pausa: null, tentativas: 0 });
    }
    return buscarProducao(db, id);
  } catch (erro) {
    const tentativas = producao.tentativas + 1;
    registrar(db, id, producao.etapa, "sistema", "erro", String(erro.message || erro));
    atualizar(db, id, {
      status: STATUS.PAUSADO_ERRO,
      tentativas,
      motivo_pausa: tentativas >= LIMITE_TENTATIVAS
        ? `limite de ${LIMITE_TENTATIVAS} tentativas atingido: ${erro.message}`
        : `erro: ${erro.message}`,
    });
    return buscarProducao(db, id);
  }
}

export function aprovarHumano(db, id) {
  const producao = buscarProducao(db, id);
  if (!producao || producao.status !== STATUS.PAUSADO_HUMANO) {
    throw new Error("produção não está esperando aprovação humana");
  }
  registrar(db, id, producao.etapa, "humano", "aprovado", null);
  const proxima = proximaEtapa(producao.etapa);
  if (proxima === null) {
    atualizar(db, id, { status: STATUS.CONCLUIDO, motivo_pausa: null });
  } else {
    atualizar(db, id, { etapa: proxima, status: STATUS.FILA, motivo_pausa: null, tentativas: 0 });
  }
  return buscarProducao(db, id);
}

export function pausar(db, id) {
  const producao = buscarProducao(db, id);
  if (!producao) throw new Error(`produção ${id} não existe`);
  if ([STATUS.CONCLUIDO, STATUS.CANCELADO].includes(producao.status)) return producao;
  atualizar(db, id, { status: STATUS.PAUSADO_HUMANO, motivo_pausa: "pausado manualmente" });
  registrar(db, id, producao.etapa, "humano", "pausado", "pausa manual");
  return buscarProducao(db, id);
}

export function retomar(db, id) {
  const producao = buscarProducao(db, id);
  if (!producao) throw new Error(`produção ${id} não existe`);
  atualizar(db, id, { status: STATUS.FILA, motivo_pausa: null });
  registrar(db, id, producao.etapa, "humano", "retomado", null);
  return buscarProducao(db, id);
}

export function cancelar(db, id) {
  const producao = buscarProducao(db, id);
  if (!producao) throw new Error(`produção ${id} não existe`);
  atualizar(db, id, { status: STATUS.CANCELADO, motivo_pausa: null });
  registrar(db, id, producao.etapa, "humano", "cancelado", null);
  return buscarProducao(db, id);
}

export function tentarDeNovo(db, id) {
  const producao = buscarProducao(db, id);
  if (!producao || producao.status !== STATUS.PAUSADO_ERRO) {
    throw new Error("produção não está pausada por erro");
  }
  if (producao.tentativas >= LIMITE_TENTATIVAS) {
    throw new Error(`limite de ${LIMITE_TENTATIVAS} tentativas atingido — corrija a causa antes de tentar de novo`);
  }
  atualizar(db, id, { status: STATUS.FILA, motivo_pausa: null });
  registrar(db, id, producao.etapa, "humano", "tentar_de_novo", null);
  return buscarProducao(db, id);
}
