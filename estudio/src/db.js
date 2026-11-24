import { DatabaseSync } from "node:sqlite";
import { fileURLToPath } from "node:url";
import path from "node:path";
import fs from "node:fs";

const AQUI = path.dirname(fileURLToPath(import.meta.url));
const ESQUEMA = fs.readFileSync(path.join(AQUI, "esquema.sql"), "utf8");

export function abrirBanco(caminhoRelativo = "dados/estudio.db") {
  const caminho = path.resolve(AQUI, "..", caminhoRelativo);
  fs.mkdirSync(path.dirname(caminho), { recursive: true });
  const db = new DatabaseSync(caminho);
  db.exec(ESQUEMA);
  return db;
}
