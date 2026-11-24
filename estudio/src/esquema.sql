CREATE TABLE IF NOT EXISTS producoes (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  titulo TEXT NOT NULL,
  etapa TEXT NOT NULL,
  status TEXT NOT NULL,
  modo_revisao_roteiro TEXT NOT NULL DEFAULT 'subagente',
  modo_revisao_previa TEXT NOT NULL DEFAULT 'subagente',
  prioridade INTEGER NOT NULL DEFAULT 0,
  data_planejada TEXT,
  tentativas INTEGER NOT NULL DEFAULT 0,
  motivo_pausa TEXT,
  criado_em TEXT NOT NULL,
  atualizado_em TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS historico (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  producao_id INTEGER NOT NULL,
  etapa TEXT NOT NULL,
  ator TEXT NOT NULL,
  resultado TEXT NOT NULL,
  nota TEXT,
  criado_em TEXT NOT NULL,
  FOREIGN KEY (producao_id) REFERENCES producoes(id)
);
