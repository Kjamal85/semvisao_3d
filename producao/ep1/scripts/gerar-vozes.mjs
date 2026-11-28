/**
 * Gera vozes via VoiceStudio local (http://127.0.0.1:3900).
 *
 * Lê todos os voz/falas_*.json, monta voz/lotes.json (índice consolidado) e
 * gera os áudios que ainda não existem (ou cujo lote mudou).
 *
 * Uso:
 *   node scripts/gerar-vozes.mjs            # gera tudo pendente
 *   node scripts/gerar-vozes.mjs --so ID   # só essa fala
 *
 * Sai com código 0 (ok), 1 (erro), 2 (cota/VoiceStudio offline).
 */
import { createWriteStream, existsSync, mkdirSync, readdirSync, readFileSync, writeFileSync } from "node:fs";
import { basename, dirname, join, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { pipeline } from "node:stream/promises";

const EP = resolve(fileURLToPath(import.meta.url), "..", "..");
const VOZ_DIR = join(EP, "voz");
const AUDIO_DIR = join(VOZ_DIR, "audio");
// Pasta do episódio pela fala: id "ep2-…" → audio/ep2, sem prefixo (EP1) → audio/ep1.
const pastaDe = (id) => join(AUDIO_DIR, (id.match(/^(ep\d+)-/) || [, "ep1"])[1]);
const LOTES_JSON = join(VOZ_DIR, "lotes.json");
const API = "http://127.0.0.1:3900";

// ---------------------------------------------------------------- elenco
// Mapeamento: chave do arquivo falas_<chave>.json → profile_id do VoiceStudio.
// Para adicionar um personagem novo: só acrescentar aqui.
const ELENCO = {
  gabi:         "e2130413",  // Gabriel
  mae:          "44d4f8af",  // Mãe do Gabriel
  pai:          "9a410ca3",  // Pai do Gabriel
  duda:         "e1ef926f",  // Duda
  mae_duda:     "10d9e9ca",  // Mãe da Duda
  menino:       "b976889b",  // Menino Novo (EP3)
  radio:        "1ec45d72",  // c05-radio-01
  reporter:     "c436fbaa",  // c04-reporter-01
  reporter2:    "4cd3c4b4",  // c04-reporter-02
  agente:       "dba7fdb8",  // c10-agente-03-recorte
  narrador:     "7ff49092",  // Narrador
};

// ---------------------------------------------------------------- emoção
// Palavras-chave no campo "estilo" → emo_alpha (intensidade da emoção).
const INTENSIDADE_ALTA = /grito|pânico|desespero|raiva|ódio|chorando|choro|explosão|agonia|quebrando|berrando|horror/i;
const INTENSIDADE_BAIXA = /sussurro|suave|neutro|informativo|jornalístico|seco|calmo|calma|grave e calm|lento/i;

function emoAlpha(estilo) {
  if (INTENSIDADE_ALTA.test(estilo)) return 0.88;
  if (INTENSIDADE_BAIXA.test(estilo)) return 0.45;
  return 0.70;
}

// Extrai texto de emoção: remove prefixos genéricos e pega o núcleo descritivo.
function emoTexto(estilo) {
  return estilo
    .replace(/^(diga em português do brasil,?\s*|com voz de (menino|menina|criança),?\s*|narrador de suspense,?\s*)/i, "")
    .slice(0, 200);
}

// ---------------------------------------------------------------- lotes
function lerLotes() {
  const lotes = [];
  const arquivos = readdirSync(VOZ_DIR)
    .filter((f) => f.startsWith("falas_") && f.endsWith(".json"))
    .sort();

  for (const arq of arquivos) {
    const chave = basename(arq, ".json").replace("falas_", "");
    const profileId = ELENCO[chave];
    const itens = JSON.parse(readFileSync(join(VOZ_DIR, arq), "utf8"));

    for (const item of itens) {
      lotes.push({
        id: item.id,
        texto: item.texto,
        estilo: item.estilo || "",
        instruct: item.instruct || null, // só etiquetas do motor (ex.: "whisper"); o estilo livre vai em emo_text
        profile_id: profileId || null,
        personagem: chave,
        // campos de emoção derivados na hora da geração
      });
    }
  }
  return lotes;
}

// ---------------------------------------------------------------- API
async function checarVoiceStudio() {
  try {
    const r = await fetch(`${API}/health`, { signal: AbortSignal.timeout(5000) });
    return r.ok;
  } catch {
    return false;
  }
}

function montarForm(campos) {
  const form = new URLSearchParams();
  for (const [k, v] of Object.entries(campos)) {
    if (v !== undefined && v !== null) form.append(k, v);
  }
  return form;
}

async function gerarFala(item) {
  const base = {
    profile_id: item.profile_id,
    text: item.texto,
    // omnivoice só aceita etiquetas fixas (campo instruct da fala); voxcpm2 aceita o estilo livre
    instruct: item.instruct || item.estilo.slice(0, 500) || undefined,
    language: "pt",
    wav_bits: "24",
    effect_preset: "broadcast",
  };

  // Tenta com emoção primeiro; se o engine não suportar, tenta sem.
  const camposComEmo = { ...base, emo_text: emoTexto(item.estilo), emo_alpha: String(emoAlpha(item.estilo)) };

  async function enviar(campos) {
    return fetch(`${API}/generate`, {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body: montarForm(campos).toString(),
      signal: AbortSignal.timeout(120_000),
    });
  }

  let resp = await enviar(camposComEmo);
  if (!resp.ok) {
    const txt = await resp.text().catch(() => "");
    if (resp.status === 422 && txt.includes("emotion controls")) {
      // Engine não suporta emoção — tenta só com instruct.
      resp = await enviar(base);
    }
    if (!resp.ok) {
      const txt2 = await resp.text().catch(() => txt);
      throw new Error(`HTTP ${resp.status}: ${txt2.slice(0, 200)}`);
    }
  }

  // A API pode devolver JSON com audio_id ou stream de áudio diretamente.
  const ct = resp.headers.get("content-type") || "";
  if (ct.includes("application/json")) {
    const dados = await resp.json();
    const audioId = dados.audio_id || dados.id;
    if (!audioId) throw new Error(`Resposta sem audio_id: ${JSON.stringify(dados).slice(0, 200)}`);
    // Busca o arquivo WAV pelo ID
    const wavResp = await fetch(`${API}/audio/${audioId}.wav`, { signal: AbortSignal.timeout(60_000) });
    if (!wavResp.ok) throw new Error(`Falha ao baixar áudio ${audioId}: HTTP ${wavResp.status}`);
    return wavResp;
  }
  // Stream de áudio direto
  return resp;
}

async function salvarAudio(resp, destino) {
  mkdirSync(dirname(destino), { recursive: true });
  const ws = createWriteStream(destino);
  await pipeline(resp.body, ws);
}

// ---------------------------------------------------------------- main
const args = process.argv.slice(2);
const soId = args.includes("--so") ? args[args.indexOf("--so") + 1] : null;

const online = await checarVoiceStudio();
if (!online) {
  console.error("ERRO: VoiceStudio não está respondendo em http://127.0.0.1:3900. Abra o app e tente de novo.");
  process.exit(2);
}

const lotes = lerLotes();
writeFileSync(LOTES_JSON, JSON.stringify(lotes, null, 2) + "\n", "utf8");
console.log(`Lotes: ${lotes.length} falas em ${LOTES_JSON}`);

const pendentes = lotes.filter((item) => {
  if (soId && item.id !== soId) return false;
  if (!item.profile_id) return false; // sem perfil, skipa
  const dest = join(pastaDe(item.id), `${item.id}.wav`);
  // o narrador do EP1 foi salvo como narrador-<id>.wav (n01 → narrador-n01.wav)
  const alt = join(pastaDe(item.id), `${item.personagem}-${item.id}.wav`);
  return !existsSync(dest) && !existsSync(alt);
});

const semPerfil = lotes.filter((i) => !i.profile_id && (!soId || i.id === soId));
for (const i of semPerfil) {
  console.warn(`AVISO: personagem "${i.personagem}" sem perfil no VoiceStudio — fala ${i.id} pulada.`);
}

if (!pendentes.length) {
  console.log("Nenhuma fala nova. Tudo já gerado.");
  process.exit(0);
}

console.log(`Gerando ${pendentes.length} fala(s)...`);
let erros = 0;

for (const item of pendentes) {
  const dest = join(pastaDe(item.id), `${item.id}.wav`);
  const emo = emoTexto(item.estilo);
  const alpha = emoAlpha(item.estilo);
  process.stdout.write(`  ${item.id} [${item.personagem}] emo_alpha=${alpha} "${emo.slice(0, 60)}"... `);
  try {
    const resp = await gerarFala(item);
    await salvarAudio(resp, dest);
    console.log("OK");
  } catch (e) {
    console.error(`ERRO: ${e.message}`);
    erros++;
  }
}

if (erros) {
  console.error(`\n${erros} fala(s) falharam.`);
  process.exit(1);
}
console.log("\nTudo gerado.");
