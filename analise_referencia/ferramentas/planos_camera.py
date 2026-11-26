"""Lê quadros.csv e separa planos (cortes/transições) e trechos de câmera.

Uso: py -3.14 -I planos_camera.py <quadros.csv> <pasta_saida>

Saídas:
  cortes.csv        cada corte/transição: quadro, tempo, tipo, duração
  camera_quadro.csv por quadro: plano, velocidade suavizada, rótulo de câmera
  camera_trechos.csv trechos contínuos com o mesmo rótulo (início, fim, duração)
  planos.json       cada plano com duração e resumo de câmera

Convenção de câmera (o contrário do movimento da imagem):
  imagem anda p/ direita  -> câmera vai p/ ESQUERDA (pan/travelling esq)
  imagem anda p/ baixo    -> câmera SOBE
  imagem cresce (esc>1)   -> câmera APROXIMA (zoom in / dolly in)
"""
import sys, csv, json, os
import numpy as np

src, pasta = sys.argv[1], sys.argv[2]
r = list(csv.DictReader(open(src, encoding="utf-8")))
N = len(r)
col = lambda k: np.array([float(x[k]) for x in r])
t, mad, hist, dx, dy, esc, rot, inl, npts = (col(k) for k in ["t", "mad", "hist", "dx", "dy", "esc", "rot", "inl", "npts"])
fps = round(1 / (t[1] - t[0]))

# ---------- cortes ----------
def med_local(a, i, w=30):
    lo, hi = max(0, i - w), min(N, i + w + 1)
    viz = np.concatenate([a[lo:max(lo, i - 2)], a[min(hi, i + 3):hi]])
    return float(np.median(viz)) if len(viz) else 0.0

ratio = np.where(npts > 0, inl / np.maximum(npts, 1), 0)
cand = []
for i in range(1, N):
    base = med_local(hist, i)
    forte = hist[i] > max(0.30, 5 * base) and mad[i] > 6
    medio = hist[i] > max(0.18, 6 * base) and mad[i] > 10 and ratio[i] < 0.35
    if forte or medio:
        cand.append(i)
# agrupa candidatos próximos (transições de vários quadros)
cortes = []
for i in cand:
    if cortes and i - cortes[-1]["fim"] <= 4:
        cortes[-1]["fim"] = i
    else:
        cortes.append({"ini": i, "fim": i})
for c in cortes:
    c["quadros"] = c["fim"] - c["ini"] + 1
    c["tipo"] = "corte" if c["quadros"] <= 2 else "transicao"
    c["t"] = round(float(t[c["ini"]]), 3)

# 2ª passada (bordas_cortes.py): se a estrutura do cenário continua igual, não é corte,
# é mudança de cor/brilho dentro do plano (personagem piscando, clarão, brilho de efeito)
arq_b = os.path.join(pasta, "bordas_cortes.csv")
ncc = {}
if os.path.exists(arq_b):
    ncc = {int(x["quadro"]): float(x["ncc_bordas"]) for x in csv.DictReader(open(arq_b, encoding="utf-8"))}
    for c in cortes:
        c["ncc"] = ncc.get(c["ini"], "")
        if c["ini"] in ncc and ncc[c["ini"]] >= 0.5:
            c["tipo"] = "mudanca_no_plano"
todas = cortes
cortes = [c for c in todas if c["tipo"] != "mudanca_no_plano"]

os.makedirs(pasta, exist_ok=True)
with open(os.path.join(pasta, "cortes.csv"), "w", newline="", encoding="utf-8") as f:
    w = csv.writer(f); w.writerow(["n", "quadro", "t", "tipo", "quadros", "hist", "mad", "ncc_bordas"])
    for k, c in enumerate(todas, 1):
        w.writerow([k, c["ini"], c["t"], c["tipo"], c["quadros"], round(hist[c["ini"]], 3), round(mad[c["ini"]], 1),
                    c.get("ncc", "")])

# ---------- planos ----------
limites = [0] + [c["fim"] + 1 for c in cortes] + [N]
plano = np.zeros(N, int)
for k in range(len(limites) - 1):
    plano[limites[k]:limites[k + 1]] = k + 1
em_transicao = np.zeros(N, bool)
for c in cortes:
    em_transicao[c["ini"]:c["fim"] + 1] = True

# ---------- câmera ----------
confiavel = (ratio >= 0.5) & (npts >= 20) & ~em_transicao
# velocidades por segundo
vx, vy = dx * fps, dy * fps                      # % da largura por segundo (imagem)
vz = np.log(np.maximum(esc, 1e-6)) * fps * 100   # % de escala por segundo
vr = rot * fps                                    # graus por segundo
def suave(a, k=9):
    out = np.zeros(N)
    for p in np.unique(plano):
        idx = np.where(plano == p)[0]
        seg = a[idx].copy()
        seg[~confiavel[idx]] = np.nan
        for j in range(len(idx)):
            lo, hi = max(0, j - k // 2), min(len(idx), j + k // 2 + 1)
            v = seg[lo:hi]; v = v[~np.isnan(v)]
            out[idx[j]] = np.median(v) if len(v) else np.nan
    return out
svx, svy, svz, svr = suave(vx), suave(vy), suave(vz), suave(vr)

LIM_T, LIM_Z, LIM_R = 1.0, 1.0, 1.5   # %W/s, %escala/s, graus/s
def rotulo(i):
    if em_transicao[i]:
        return "transicao"
    if np.isnan(svx[i]):
        return "incerto"
    partes = []
    if abs(svz[i]) >= LIM_Z:
        partes.append("aproxima" if svz[i] > 0 else "afasta")
    if abs(svx[i]) >= LIM_T or abs(svy[i]) >= LIM_T:
        if abs(svx[i]) >= abs(svy[i]):
            partes.append("esquerda" if svx[i] > 0 else "direita")
        else:
            partes.append("sobe" if svy[i] > 0 else "desce")
    if abs(svr[i]) >= LIM_R:
        partes.append("gira")
    return "+".join(partes) if partes else "parada"
rot_q = [rotulo(i) for i in range(N)]

# rótulos muito curtos (< 0.2s) viram o vizinho, para não fragmentar
MIN = int(0.2 * fps)
def trechos(lab):
    out = []
    for i, l in enumerate(lab):
        if out and out[-1][2] == l and plano[out[-1][1]] == plano[i]:
            out[-1][1] = i
        else:
            out.append([i, i, l])
    return out
for _ in range(3):
    tr = trechos(rot_q)
    for k, (a, b, l) in enumerate(tr):
        if b - a + 1 < MIN and l not in ("transicao",):
            viz = None
            if k > 0 and plano[tr[k - 1][1]] == plano[a]:
                viz = tr[k - 1][2]
            elif k + 1 < len(tr) and plano[tr[k + 1][0]] == plano[a]:
                viz = tr[k + 1][2]
            if viz and viz != "transicao":
                for i in range(a, b + 1):
                    rot_q[i] = viz
tr = trechos(rot_q)

with open(os.path.join(pasta, "camera_quadro.csv"), "w", newline="", encoding="utf-8") as f:
    w = csv.writer(f); w.writerow(["q", "t", "plano", "vx", "vy", "zoom", "giro", "camera"])
    for i in range(N):
        f_ = lambda v: "" if np.isnan(v) else round(float(v), 2)
        w.writerow([i, round(float(t[i]), 4), int(plano[i]), f_(-svx[i]), f_(-svy[i]), f_(svz[i]), f_(svr[i]), rot_q[i]])
# nota: em camera_quadro, vx/vy já estão no sentido da CÂMERA (positivo = câmera p/ direita / p/ baixo)

with open(os.path.join(pasta, "camera_trechos.csv"), "w", newline="", encoding="utf-8") as f:
    w = csv.writer(f); w.writerow(["plano", "q_ini", "q_fim", "t_ini", "t_fim", "dur_s", "camera", "vel_media_%W_s", "zoom_medio_%_s"])
    for a, b, l in tr:
        sl = slice(a, b + 1)
        v = np.nanmean(np.hypot(svx[sl], svy[sl])) if not np.all(np.isnan(svx[sl])) else np.nan
        z = np.nanmean(svz[sl]) if not np.all(np.isnan(svz[sl])) else np.nan
        w.writerow([int(plano[a]), a, b, round(float(t[a]), 3), round(float(t[b]) + 1 / fps, 3),
                    round((b - a + 1) / fps, 3), l, "" if np.isnan(v) else round(float(v), 2),
                    "" if np.isnan(z) else round(float(z), 2)])

planos = []
for p in range(1, int(plano.max()) + 1):
    idx = np.where(plano == p)[0]
    a, b = int(idx[0]), int(idx[-1])
    meus = [x for x in tr if plano[x[0]] == p]
    resumo = {}
    for x0, x1, l in meus:
        resumo[l] = round(resumo.get(l, 0) + (x1 - x0 + 1) / fps, 2)
    planos.append({"n": p, "q_ini": a, "q_fim": b, "t_ini": round(float(t[a]), 3), "dur": round((b - a + 1) / fps, 3),
                   "camera": resumo,
                   "sequencia": [f"{l} {round((x1 - x0 + 1) / fps, 2)}s" for x0, x1, l in meus]})
json.dump({"fps": fps, "quadros": N, "cortes": len(cortes), "planos": planos},
          open(os.path.join(pasta, "planos.json"), "w", encoding="utf-8"), ensure_ascii=False, indent=1)

dur = np.array([p["dur"] for p in planos])
print(f"{len(cortes)} cortes/transições, {len(planos)} planos; dur média {dur.mean():.2f}s mediana {np.median(dur):.2f}s "
      f"min {dur.min():.2f} max {dur.max():.2f}; {len(cortes) / (N / fps / 60):.1f} cortes/min")
tot = {}
for a, b, l in tr:
    tot[l] = tot.get(l, 0) + (b - a + 1) / fps
for l, v in sorted(tot.items(), key=lambda x: -x[1])[:15]:
    print(f"  {l:22s} {v:7.1f}s  {v / (N / fps) * 100:5.1f}%")
print("transições de vários quadros:", [(c["t"], c["quadros"]) for c in cortes if c["tipo"] == "transicao"])
