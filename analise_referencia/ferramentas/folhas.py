"""Folhas de quadros com câmera, cortes, som e fala alinhados no tempo.

Modo 6fps (história):  py -3.14 -I folhas.py 6fps <video> <dados> <saida> [seg_por_folha=10]
  - uma linha = 1 segundo = 6 quadros (q 0,10,20... a 60fps)
Modo todos (momentos): py -3.14 -I folhas.py todos <video> <dados> <saida> <ini_s> <fim_s> <nome>
  - uma linha = 0,2 s = 12 quadros (todos os quadros a 60fps)

<dados> precisa ter: camera_quadro.csv, cortes.csv, transcricao.json, audio22k.wav
Embaixo de cada linha: espectrograma (0-11 kHz, escala mel) e as palavras no instante em que começam.
Barra vermelha à esquerda da miniatura = houve corte desde a miniatura anterior; laranja = transição.
"""
import sys, os, csv, json, wave, subprocess
import numpy as np
from PIL import Image, ImageDraw, ImageFont

modo, video, dados, saida = sys.argv[1:5]
os.makedirs(saida, exist_ok=True)
FPS = 60

# ---------- dados ----------
cam = list(csv.DictReader(open(os.path.join(dados, "camera_quadro.csv"), encoding="utf-8")))
cortes = list(csv.DictReader(open(os.path.join(dados, "cortes.csv"), encoding="utf-8")))
corte_q = {int(c["quadro"]): c for c in cortes}
palavras = [w for s in json.load(open(os.path.join(dados, "transcricao.json"), encoding="utf-8")) for w in s["words"]]
NQ = len(cam)

wf = wave.open(os.path.join(dados, "audio22k.wav"))
SR = wf.getframerate()
aud = np.frombuffer(wf.readframes(wf.getnframes()), np.int16).astype(np.float32) / 32768
HOP, NFFT, NMEL = 128, 1024, 56
def mel_fb(sr, n_fft, n_mel):
    hz2mel = lambda h: 2595 * np.log10(1 + h / 700)
    mel2hz = lambda m: 700 * (10 ** (m / 2595) - 1)
    pts = mel2hz(np.linspace(hz2mel(40), hz2mel(sr / 2), n_mel + 2))
    bins = np.floor((n_fft + 1) * pts / sr).astype(int)
    fb = np.zeros((n_mel, n_fft // 2 + 1))
    for m in range(1, n_mel + 1):
        a, b, c = bins[m - 1], bins[m], bins[m + 1]
        for k in range(a, b): fb[m - 1, k] = (k - a) / max(b - a, 1)
        for k in range(b, c): fb[m - 1, k] = (c - k) / max(c - b, 1)
    return fb
FB = mel_fb(SR, NFFT, NMEL)
JAN = np.hanning(NFFT).astype(np.float32)
def espectro(t0, t1, largura, altura):
    a, b = int(t0 * SR), int(t1 * SR)
    seg = aud[max(0, a - NFFT // 2):max(0, b + NFFT // 2)]
    if len(seg) < NFFT:
        seg = np.pad(seg, (0, NFFT - len(seg)))
    n = 1 + (len(seg) - NFFT) // HOP
    fr = np.lib.stride_tricks.as_strided(seg, (n, NFFT), (seg.strides[0] * HOP, seg.strides[0])) * JAN
    S = FB @ (np.abs(np.fft.rfft(fr, axis=1)) ** 2).T
    db = 10 * np.log10(S + 1e-10)
    db = np.clip((db - DB_LO) / (DB_HI - DB_LO), 0, 1)
    img = (np.stack([db ** 0.7 * 255, db ** 1.4 * 230, db ** 3 * 120], -1)).astype(np.uint8)[::-1]
    return Image.fromarray(img).resize((largura, altura), Image.BILINEAR)
# faixa de cor do espectrograma tirada do próprio áudio (percentis 20 e 99.7)
def _faixa():
    n = 1 + (len(aud) - NFFT) // 2048
    fr = np.lib.stride_tricks.as_strided(aud, (n, NFFT), (aud.strides[0] * 2048, aud.strides[0])) * JAN
    db = 10 * np.log10(FB @ (np.abs(np.fft.rfft(fr, axis=1)) ** 2).T + 1e-10)
    return float(np.percentile(db, 20)), float(np.percentile(db, 99.7))
DB_LO, DB_HI = _faixa()
def rms_db(t0, t1):
    s = aud[int(t0 * SR):int(t1 * SR)]
    return -90.0 if len(s) == 0 else float(20 * np.log10(np.sqrt(np.mean(s ** 2)) + 1e-9))

try:
    F = ImageFont.truetype("C:/Windows/Fonts/arialbd.ttf", 15)
    FP = ImageFont.truetype("C:/Windows/Fonts/arial.ttf", 13)
    FT = ImageFont.truetype("C:/Windows/Fonts/consolab.ttf", 15)
    FG = ImageFont.truetype("C:/Windows/Fonts/arialbd.ttf", 22)
except OSError:
    F = FP = FT = FG = ImageFont.load_default()

ABREV = {"parada": "parada", "incerto": "?", "transicao": "TRANS", "esquerda": "◀", "direita": "▶",
         "sobe": "▲", "desce": "▼", "aproxima": "zoom+", "afasta": "zoom−", "gira": "gira"}
def rot_cam(lab):
    return " ".join(ABREV.get(p, p) for p in lab.split("+"))

def mmss(t):
    m, s = divmod(t, 60); return f"{int(m):02d}:{s:05.2f}"

def quadros(indices, w, h):
    """lê do vídeo os quadros pedidos (índices a 60fps), em ordem"""
    alvo = set(indices)
    a, b = min(alvo), max(alvo)
    # busca 2 s antes (múltiplo exato de quadro) e conta os quadros a partir dali
    pre = max(0, a - 2 * FPS) / FPS
    args = ["ffmpeg", "-v", "error", "-ss", f"{pre:.4f}", "-i", video, "-t", f"{(b - a) / FPS + 2 + 0.2:.4f}",
            "-vf", f"scale={w}:{h}:flags=area", "-f", "rawvideo", "-pix_fmt", "rgb24", "-"]
    p = subprocess.Popen(args, stdout=subprocess.PIPE)
    tam = w * h * 3
    out = {}
    q0 = round(pre * FPS)
    k = 0
    while True:
        buf = p.stdout.read(tam)
        if len(buf) < tam: break
        q = q0 + k
        if q in alvo:
            out[q] = Image.frombuffer("RGB", (w, h), buf)
        if q > b: break
        k += 1
    p.stdout.close(); p.wait()
    return out

def folha(linhas, nome, titulo, tw, th, por_linha, dt_col):
    """linhas: lista de listas de índices de quadro"""
    M_ESQ, GAP, ESP_H, PAL_H = 92, 4, 40, 34
    larg = M_ESQ + por_linha * (tw + GAP)
    lin_h = th + ESP_H + PAL_H + 10
    img = Image.new("RGB", (larg, 46 + lin_h * len(linhas)), (18, 18, 20))
    d = ImageDraw.Draw(img)
    d.text((10, 10), titulo, font=FG, fill=(240, 240, 240))
    todos = [q for l in linhas for q in l if q < NQ]
    fr = quadros(todos, tw, th)
    for li, lin in enumerate(linhas):
        y = 46 + li * lin_h
        t_lin = lin[0] / FPS
        d.text((6, y + 4), mmss(t_lin), font=FT, fill=(255, 220, 120))
        d.text((6, y + 24), f"q{lin[0]}", font=FP, fill=(150, 150, 150))
        d.text((6, y + th - 16), f"{rms_db(t_lin, t_lin + por_linha * dt_col):.0f} dB", font=FP, fill=(140, 200, 255))
        for ci, q in enumerate(lin):
            x = M_ESQ + ci * (tw + GAP)
            if q >= NQ: continue
            if q in fr: img.paste(fr[q], (x, y))
            # corte desde a miniatura anterior?
            q_ant = lin[ci - 1] if ci > 0 else (linhas[li - 1][-1] if li > 0 else q - 1)
            achou = [corte_q[k] for k in range(q_ant + 1, q + 1) if k in corte_q]
            if achou:
                reais = [c for c in achou if c["tipo"] != "mudanca_no_plano"]
                c = reais[0] if reais else achou[0]
                cor = {"corte": (255, 40, 40), "transicao": (255, 150, 0)}.get(c["tipo"], (230, 230, 60))
                txt = {"corte": f"CORTE q{c['quadro']}", "transicao": f"TRANS {c['quadros']}q q{c['quadro']}"}.get(c["tipo"], "≈ muda")
                larg_b = 3 if c["tipo"] != "mudanca_no_plano" else 1
                d.rectangle([x - larg_b, y, x + larg_b, y + th], fill=cor)
                d.rectangle([x + 4, y + 2, x + 6 + d.textlength(txt, font=FP), y + 18], fill=(0, 0, 0))
                d.text((x + 6, y + 2), txt, font=FP, fill=cor)
            lab = rot_cam(cam[q]["camera"])
            d.rectangle([x, y + th - 18, x + tw, y + th], fill=(0, 0, 0))
            d.text((x + 3, y + th - 17), f"{(q / FPS) % 60:05.2f}", font=FP, fill=(200, 200, 200))
            d.text((x + 50, y + th - 17), lab, font=F, fill=(120, 255, 140) if lab != "parada" else (170, 170, 170))
        # espectrograma alinhado: cada coluna cobre [t_q, t_q + dt_col)
        t_a, t_b = t_lin, t_lin + por_linha * dt_col
        x0, x1 = M_ESQ, M_ESQ + por_linha * (tw + GAP) - GAP
        esp = espectro(t_a, t_b, x1 - x0, ESP_H)
        img.paste(esp, (x0, y + th + 2))
        for c in cortes:
            if c["tipo"] == "mudanca_no_plano": continue
            tc = int(c["quadro"]) / FPS
            if t_a <= tc < t_b:
                xc = x0 + (tc - t_a) / (t_b - t_a) * (x1 - x0)
                d.line([xc, y + th + 2, xc, y + th + ESP_H + PAL_H], fill=(255, 40, 40), width=2)
        # palavras
        ocup = [x0 - 99, x0 - 99]
        for w in palavras:
            if t_a <= w["s"] < t_b:
                xw = x0 + (w["s"] - t_a) / (t_b - t_a) * (x1 - x0)
                linha = 0 if xw > ocup[0] + 4 else 1
                yy = y + th + ESP_H + 4 + linha * 15
                d.line([xw, y + th + ESP_H + 2, xw, yy + 2], fill=(255, 255, 255))
                d.text((xw + 2, yy), w["w"], font=FP, fill=(255, 255, 255) if w["p"] >= 0.5 else (255, 160, 160))
                ocup[linha] = xw + d.textlength(w["w"], font=FP) + 2
    img.save(os.path.join(saida, nome), quality=88)

if modo == "6fps":
    seg = int(sys.argv[5]) if len(sys.argv) > 5 else 10
    total = NQ / FPS
    n = 0
    for ini in range(0, int(np.ceil(total)), seg):
        n += 1
        linhas = [[(ini + s) * FPS + k * 10 for k in range(6)] for s in range(seg) if (ini + s) * FPS < NQ]
        folha(linhas, f"folha_{n:03d}_{ini // 60:02d}m{ini % 60:02d}s.jpg",
              f"6 quadros/s · {mmss(ini)} – {mmss(min(ini + seg, total))} · folha {n}", 288, 162, 6, 1 / 6)
        print(n, flush=True)
else:
    a, b, nome = float(sys.argv[5]), float(sys.argv[6]), sys.argv[7]
    qa, qb = int(round(a * FPS)), int(round(b * FPS))
    linhas = [list(range(q, min(q + 12, qb))) for q in range(qa, qb, 12)]
    folha(linhas, f"{nome}.jpg", f"todos os quadros (60/s) · {mmss(a)} – {mmss(b)} · {nome}", 200, 112, 12, 1 / 60)
