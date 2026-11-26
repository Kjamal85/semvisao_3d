// Utilidades compartilhadas pelos perfis: impressão digital de arquivos, medições de mídia,
// quadros de revisão e arquivos de entrega.
import { spawnSync } from "node:child_process";
import { createHash } from "node:crypto";
import { copyFileSync, cpSync, existsSync, mkdirSync, readdirSync, readFileSync, renameSync, rmSync, statSync, writeFileSync } from "node:fs";
import { basename, dirname, join, relative } from "node:path";
import { NPX } from "../config.mjs";
import { ErroEtapa, rodar, ultimasLinhas } from "../processos.mjs";
import { ambienteLimpo } from "../segredos.mjs";

export const slug = (t) =>
  String(t).normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "").slice(0, 48) || "sem-titulo";

// Impressão digital de arquivos e pastas (conteúdo + caminho relativo), ignorando pastas geradas.
const IGNORAR = new Set(["renders", ".hyperframes", ".media", ".thumbnails", ".waveform-cache", "node_modules", ".git"]);
export function impressao(base, itens, extra = "") {
  const h = createHash("sha256");
  const visitar = (abs) => {
    if (!existsSync(abs)) { h.update(`ausente:${relative(base, abs)}`); return; }
    const st = statSync(abs);
    if (st.isDirectory()) {
      for (const n of readdirSync(abs).sort()) if (!IGNORAR.has(n)) visitar(join(abs, n));
    } else {
      h.update(relative(base, abs).replace(/\\/g, "/"));
      h.update(readFileSync(abs));
    }
  };
  for (const i of itens) visitar(join(base, i));
  h.update(extra);
  return h.digest("hex");
}

export function sondar(arquivo) {
  const r = spawnSync("ffprobe", ["-v", "error", "-show_entries", "format=duration:stream=codec_type,width,height,r_frame_rate", "-of", "json", arquivo], { encoding: "utf8" });
  if (r.status !== 0) return null;
  const d = JSON.parse(r.stdout);
  const v = d.streams.find((s) => s.codec_type === "video");
  const a = d.streams.find((s) => s.codec_type === "audio");
  const [n, q] = (v?.r_frame_rate || "0/1").split("/").map(Number);
  return { duracao_s: Math.round(Number(d.format.duration) * 100) / 100, largura: v?.width, altura: v?.height, fps: q ? Math.round((n / q) * 100) / 100 : null, audio: !!a };
}

export function loudness(arquivo) {
  const r = spawnSync("ffmpeg", ["-hide_banner", "-nostats", "-i", arquivo, "-af", "ebur128=peak=true", "-f", "null", "-"], { encoding: "utf8" });
  const txt = r.stderr || "";
  const i = /I:\s+(-?[\d.]+) LUFS/.exec(txt.slice(txt.lastIndexOf("Summary")));
  const p = /Peak:\s+(-?[\d.]+) dBFS/.exec(txt.slice(txt.lastIndexOf("Summary")));
  return { lufs: i ? Number(i[1]) : null, pico_dbtp: p ? Number(p[1]) : null };
}

// Quadros de revisão: N imagens em 540 px de largura + uma folha de contato com todos.
export function quadrosDeRevisao(video, pastaSaida, n = 10) {
  const info = sondar(video);
  if (!info) throw new ErroEtapa("erro", `Não consegui ler ${video}.`);
  rmSync(pastaSaida, { recursive: true, force: true });
  mkdirSync(pastaSaida, { recursive: true });
  const tempos = [];
  for (let k = 0; k < n; k++) {
    const t = Math.min(info.duracao_s - 0.1, ((k + 0.5) * info.duracao_s) / n);
    const nome = `q${String(k + 1).padStart(2, "0")}-${t.toFixed(1)}s.jpg`;
    spawnSync("ffmpeg", ["-v", "error", "-y", "-ss", String(t), "-i", video, "-frames:v", "1", "-vf", "scale=540:-2", "-q:v", "3", join(pastaSaida, nome)]);
    tempos.push({ t: Math.round(t * 10) / 10, arquivo: nome });
  }
  const colunas = Math.min(n, 5);
  spawnSync("ffmpeg", ["-v", "error", "-y", "-i", video, "-vf", `fps=${n}/${info.duracao_s},scale=216:-2,tile=${colunas}x${Math.ceil(n / colunas)}`, "-frames:v", "1", "-q:v", "3", join(pastaSaida, "folha.jpg")]);
  return { ...info, quadros: tempos, folha: "folha.jpg" };
}

export function extrairQuadro(video, t, saida) {
  spawnSync("ffmpeg", ["-v", "error", "-y", "-ss", String(t), "-i", video, "-frames:v", "1", "-q:v", "2", saida]);
  return existsSync(saida);
}

// HyperFrames pela versão fixada no projeto, via npx-cli.js (sem shell).
export async function hyperframes(ctx, cwd, args, tempoMaxMs) {
  return rodar(process.execPath, [NPX, "--yes", ctx.cfg.hyperframes, ...args], {
    cwd, env: ambienteLimpo(), tempoMaxMs, sinal: ctx.sinal, log: ctx.log, aoIniciar: ctx.aoIniciar,
  });
}

export async function node(ctx, cwd, args, tempoMaxMs, env = ambienteLimpo()) {
  return rodar(process.execPath, args, { cwd, env, tempoMaxMs, sinal: ctx.sinal, log: ctx.log, aoIniciar: ctx.aoIniciar });
}

// Render num temporário; só troca o arquivo final se a duração bater e houver áudio.
export async function renderizar(ctx, cwd, { qualidade, saida, composicao, duracaoEsperada, tempoMaxMs }) {
  const temp = join(dirname(saida), `.${basename(saida, ".mp4")}.tmp.mp4`);
  mkdirSync(dirname(saida), { recursive: true });
  rmSync(temp, { force: true });
  const args = ["render", "-o", temp, "--quality", qualidade, "--quiet"];
  if (composicao) args.push("-c", composicao);
  if (ctx.cfg.render_workers && ctx.cfg.render_workers !== "auto") args.push("-w", String(ctx.cfg.render_workers));
  const r = await hyperframes(ctx, cwd, args, tempoMaxMs);
  if (r.codigo !== 0 || !existsSync(temp)) {
    rmSync(temp, { force: true });
    throw new ErroEtapa("erro", `O render falhou (código ${r.codigo}).\n${ultimasLinhas(r.saida, 15)}`);
  }
  const info = sondar(temp);
  if (!info?.audio) { rmSync(temp, { force: true }); throw new ErroEtapa("erro", "O render saiu sem faixa de áudio."); }
  if (duracaoEsperada && Math.abs(info.duracao_s - duracaoEsperada) > 0.25) {
    rmSync(temp, { force: true });
    throw new ErroEtapa("erro", `Duração do render ${info.duracao_s}s, esperado ${duracaoEsperada}s.`);
  }
  renameSync(temp, saida);
  return info;
}

export function copiarPasta(de, para, filtro = () => true) {
  mkdirSync(dirname(para), { recursive: true });
  cpSync(de, para, { recursive: true, filter: (src) => filtro(src) });
}

// --------------------------------------------------------------- publicação
export function textoPublicacao(m, cabecalho, licencas = "") {
  const linhas = [
    `# ${cabecalho}`,
    "",
    `- **Título:** ${m.titulo || ""}`,
    `- **Títulos alternativos:** ${(m.titulos_alternativos || []).join(" · ")}`,
    `- **Texto da postagem:** ${(m.descricao || "").replace(/\n+/g, " ")}`,
    `- **Hashtags:** ${(m.hashtags || []).map((h) => (h.startsWith("#") ? h : `#${h}`)).join(" ")}`,
    `- **Tags:** ${(m.tags || []).join(", ")}`,
    `- **Comentário fixado:** ${m.comentario_fixado || ""}`,
    `- **Data e hora de publicação:** ${m.data_postagem || "a definir"}`,
    "",
  ];
  return linhas.join("\n") + (licencas ? `\n${licencas.trim()}\n` : "");
}

// Preserva a seção de licenças (e o que vier depois) de um publicacao.md existente.
export function secaoLicencas(arquivo) {
  if (!existsSync(arquivo)) return "";
  const t = readFileSync(arquivo, "utf8");
  const i = t.indexOf("## Licenças");
  return i >= 0 ? t.slice(i) : "";
}

export function escreverEntrega(pasta, arquivos, metadados, leiame) {
  mkdirSync(pasta, { recursive: true });
  for (const [destino, origem] of Object.entries(arquivos)) if (origem && existsSync(origem)) copyFileSync(origem, join(pasta, destino));
  writeFileSync(join(pasta, "metadados.json"), JSON.stringify(metadados, null, 2));
  writeFileSync(join(pasta, "LEIA-ME.txt"), leiame);
}
