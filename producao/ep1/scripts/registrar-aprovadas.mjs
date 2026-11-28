// Registra em voz/aprovadas.json as falas com .wav APROVADO (duração real medida no arquivo).
// Uso: node scripts/registrar-aprovadas.mjs <id> [<id> ...]   (sem argumentos: só re-mede as que já estão lá)
// Uma fala só entra aqui depois que a pessoa ouviu e aprovou o .wav. gerar-composicoes.mjs lê este arquivo.
import fs from "node:fs";
import path from "node:path";
import { lerWav } from "./wav.mjs";

const RAIZ = path.resolve(path.dirname(new URL(import.meta.url).pathname.replace(/^\/([A-Za-z]:)/, "$1")), "..");
const ARQ = path.join(RAIZ, "voz", "aprovadas.json");
const atual = fs.existsSync(ARQ) ? JSON.parse(fs.readFileSync(ARQ, "utf8")) : { falas: {} };
const ids = new Set([...Object.keys(atual.falas), ...process.argv.slice(2)]);
for (const id of ids) {
  const rel = (atual.falas[id] && atual.falas[id].arquivo) || `voz/audio/${(id.match(/^(ep\d+)-/) || [, "ep1"])[1]}/${id}.wav`;
  const abs = path.join(RAIZ, rel);
  if (!fs.existsSync(abs)) { console.error(`✗ ${id}: não achei ${rel}`); process.exitCode = 1; continue; }
  const d = +lerWav(abs).duracao.toFixed(2);
  atual.falas[id] = Object.assign({}, atual.falas[id], { arquivo: rel, dur: d });
  console.log(`✓ ${id}  ${d.toFixed(2)} s`);
}
atual.nota = "Falas com .wav ouvido e aprovado. dur = duração real do arquivo (s). Gerado por scripts/registrar-aprovadas.mjs.";
fs.writeFileSync(ARQ, JSON.stringify(atual, null, 2) + "\n");
