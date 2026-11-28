/**
 * Gera N takes de cada fala no VoiceStudio (sementes diferentes), normaliza em
 * -18 LUFS (sem NENHUMA outra edição: cortar e colar silêncio picota a voz; a pausa boa é a que o motor faz), transcreve e fica com o melhor take por medida:
 *   - texto: as palavras do roteiro, sem palavra a mais (gaguejo tipo "Tá, tá bom") nem a menos
 *   - ritmo: sílabas por segundo da fala (sem contar as pausas) perto do alvo de conversa
 * Conferir no gráfico (onda + espectro) antes de entregar: respiração no começo e buraco preto aparecem a olho.
 * Os takes ficam em voz/audio/epN/_antigo/takes/ para ouvir e comparar; o escolhido vai para voz/audio/epN/<id>.wav
 * e o bruto dele para voz/audio/epN/bruto/<id>.wav.
 *
 * Uso: node scripts/melhor-take.mjs [--takes 3] ID [ID ...]
 */
import { execFileSync, spawnSync } from "node:child_process";
import { copyFileSync, existsSync, mkdirSync, readdirSync, readFileSync, renameSync, writeFileSync } from "node:fs";
import { basename, join, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const EP = resolve(fileURLToPath(import.meta.url), "..", "..");
const VOZ = join(EP, "voz");
const API = "http://127.0.0.1:3900";
const ELENCO = { gabi: "e2130413", mae: "44d4f8af", pai: "9a410ca3", duda: "e1ef926f", mae_duda: "10d9e9ca",
  menino: "b976889b", radio: "1ec45d72", reporter: "c436fbaa", reporter2: "4cd3c4b4", agente: "dba7fdb8", narrador: "7ff49092" };

const args = process.argv.slice(2);
const nTakes = args.includes("--takes") ? +args.splice(args.indexOf("--takes"), 2)[1] : 3;
const ids = args;

const falas = {};
for (const arq of readdirSync(VOZ).filter((f) => /^falas_.*\.json$/.test(f))) {
  const chave = basename(arq, ".json").replace("falas_", "");
  for (const f of JSON.parse(readFileSync(join(VOZ, arq), "utf8"))) falas[f.id] = { ...f, personagem: chave };
}

const pastaDe = (id) => join(VOZ, "audio", (id.match(/^(ep\d+)-/) || [, "ep1"])[1]);
const semAcento = (t) => t.toLowerCase().normalize("NFD").replace(/[̀-ͯ]/g, "");
const palavras = (t) => semAcento(t).replace(/[^a-z0-9\s-]/g, " ").split(/\s+/).filter(Boolean);
const silabas = (t) => (semAcento(t).match(/[aeiou]+/g) || []).length;
const sh = (cmd, a) => execFileSync(cmd, a, { encoding: "utf8", stdio: ["ignore", "pipe", "pipe"] });

function distancia(a, b) { // Levenshtein por letras
  const d = Array.from({ length: a.length + 1 }, (_, i) => [i, ...Array(b.length).fill(0)]);
  for (let j = 1; j <= b.length; j++) d[0][j] = j;
  for (let i = 1; i <= a.length; i++)
    for (let j = 1; j <= b.length; j++)
      d[i][j] = Math.min(d[i - 1][j] + 1, d[i][j - 1] + 1, d[i - 1][j - 1] + (a[i - 1] === b[j - 1] ? 0 : 1));
  return d[a.length][b.length];
}

// ffmpeg escreve as medidas (loudnorm, silencedetect) no stderr
const ffErr = (a) => spawnSync("ffmpeg", ["-hide_banner", "-nostats", ...a], { encoding: "utf8" }).stderr || "";

async function gerar(f, seed, destino) {
  // reticências fazem o motor arrastar a vogal ("Tá bommm... mãããe"): ele recebe vírgula, e a pausa de verdade
  // fica por conta do motor (vírgula/ponto)
  const motor = f.texto.replace(/\s*\.\.\.\s*$/, ".").replace(/([?!])\s*\.\.\.\s*/g, "$1 ").replace(/\s*\.\.\.\s*/g, ", ");
  const form = new URLSearchParams({
    profile_id: ELENCO[f.personagem], text: motor, language: "pt", wav_bits: "24", effect_preset: "broadcast", seed: String(seed),
  });
  if (f.instruct || f.estilo) form.append("instruct", (f.instruct || f.estilo).slice(0, 500));
  if (f.velocidade) form.append("speed", String(f.velocidade));
  const resp = await fetch(`${API}/generate`, { method: "POST", body: form, signal: AbortSignal.timeout(180_000) });
  if (!resp.ok) throw new Error(`HTTP ${resp.status}: ${(await resp.text()).slice(0, 200)}`);
  if ((resp.headers.get("content-type") || "").includes("json")) throw new Error(`resposta JSON em vez de áudio: ${(await resp.text()).slice(0, 200)}`);
  writeFileSync(destino, Buffer.from(await resp.arrayBuffer()));
}

async function transcrever(wav) {
  const fd = new FormData();
  fd.append("audio", new Blob([readFileSync(wav)]), basename(wav));
  fd.append("language", "pt");
  const r = await fetch(`${API}/transcribe`, { method: "POST", body: fd, signal: AbortSignal.timeout(180_000) });
  return (await r.json()).text || "";
}

for (const id of ids) {
  const f = falas[id];
  if (!f) { console.error(`✗ ${id}: não está em voz/falas_*.json`); process.exitCode = 1; continue; }
  const pasta = pastaDe(id), takes = join(pasta, "_antigo", "takes");
  mkdirSync(takes, { recursive: true }); mkdirSync(join(pasta, "bruto"), { recursive: true });
  const alvo = f.ritmo || (/sussurro|baixinho/.test(f.estilo) ? 4.5 : 5.0);
  const esperado = palavras(f.texto);
  console.log(`== ${id}  "${f.texto}"  (alvo ${alvo} síl/s)`);
  const res = [];
  for (let s = 1; s <= nTakes; s++) {
    const bruto = join(takes, `${id}-s${s}-bruto.wav`), final = join(takes, `${id}-s${s}.wav`);
    try {
      await gerar(f, 1000 + s, bruto);
      // loudnorm em 2 passos (igual ao resto do projeto)
      const m = JSON.parse(ffErr(["-i", bruto, "-af", "loudnorm=I=-18:TP=-1.5:LRA=11:print_format=json", "-f", "null", "-"]).match(/\{[\s\S]*\}/)[0]);
      execFileSync("ffmpeg", ["-hide_banner", "-loglevel", "error", "-y", "-i", bruto, "-af",
        `loudnorm=I=-18:TP=-1.5:LRA=11:measured_I=${m.input_i}:measured_TP=${m.input_tp}:measured_LRA=${m.input_lra}:measured_thresh=${m.input_thresh}:offset=${m.target_offset}:linear=true,aresample=48000`,
        "-ar", "48000", "-ac", "1", "-c:a", "pcm_s16le", final]);
    } catch (e) {
      console.log(`  s${s}: ERRO ${String(e.message || e).slice(0, 160)}`);
      continue;
    }
    // ritmo: no bruto, fala = do 1º ao último som, menos as pausas internas (as que viraram pausa de propósito)
    const sd = ffErr(["-i", bruto, "-af", "silencedetect=n=-40dB:d=0.08", "-f", "null", "-"]);
    const dur = +sh("ffprobe", ["-v", "error", "-show_entries", "format=duration", "-of", "csv=p=0", bruto]);
    const ss = [...sd.matchAll(/silence_start: ([\d.]+)/g)].map((x) => +x[1]);
    const se = [...sd.matchAll(/silence_end: ([\d.]+)/g)].map((x) => +x[1]);
    let ini = 0, fim = dur, pausas = 0;
    ss.forEach((a, i) => {
      const b = se[i] ?? dur;
      if (a < 0.05) ini = b; else if (b >= dur - 0.02) fim = Math.min(fim, a); else pausas += b - a;
    });
    const falaS = Math.max(fim - ini - pausas, 0.1);
    const ritmo = silabas(f.texto) / falaS;
    const ouvido = await transcrever(final);
    const obtido = palavras(ouvido);
    const dist = distancia(esperado.join(""), obtido.join("")) / Math.max(esperado.join("").length, 1);
    const extra = Math.max(obtido.length - esperado.length, 0);
    const repetida = obtido.some((w, i) => i && w === obtido[i - 1]);
    // texto certo é obrigatório: take com palavra trocada, a mais ou repetida nunca ganha de um take com o texto inteiro
    const textoOk = dist <= 0.02 && !extra && !repetida;
    const nota = (textoOk ? 10 : 0) + 10 * (1 - dist) - 2 * extra - (repetida ? 3 : 0) - 1.5 * Math.abs(ritmo - alvo);
    res.push({ s, final, bruto, nota, ritmo, ouvido });
    console.log(`  s${s}: nota ${nota.toFixed(2)} · ritmo ${ritmo.toFixed(1)} síl/s · texto ${(100 * (1 - dist)).toFixed(0)}%${extra ? ` · +${extra} palavra` : ""}${repetida ? " · REPETIU" : ""} · "${ouvido}"`);
  }
  if (!res.length) { console.error(`✗ ${id}: nenhum take saiu`); process.exitCode = 1; continue; }
  const melhor = res.sort((a, b) => b.nota - a.nota)[0];
  const dst = join(pasta, `${id}.wav`);
  if (existsSync(dst)) renameSync(dst, join(takes, `${id}-anterior-${Date.now()}.wav`));
  copyFileSync(melhor.final, dst);
  copyFileSync(melhor.bruto, join(pasta, "bruto", `${id}.wav`));
  const d = +sh("ffprobe", ["-v", "error", "-show_entries", "format=duration", "-of", "csv=p=0", dst]);
  console.log(`  → escolhido s${melhor.s} (${d.toFixed(2)} s)`);
}
