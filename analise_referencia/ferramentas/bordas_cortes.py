"""Confirma candidatos a corte comparando a ESTRUTURA (bordas) antes e depois.

Uso: py -3.14 -I bordas_cortes.py <video> <cortes.csv> <saida bordas_cortes.csv>

Para cada candidato (quadro ini..fim), compara o quadro ini-2 com fim+2 pelo
coeficiente de correlação do mapa de bordas (Sobel, borrado). Mudança só de cor/brilho
(personagem que pisca, clarão, brilho de efeito) mantém as bordas do cenário -> ncc alto.
Corte de verdade -> ncc baixo. Também grava ncc de cor (imagem cinza) para referência.
"""
import sys, csv, subprocess
import numpy as np, cv2

video, src, saida = sys.argv[1:4]
c = list(csv.DictReader(open(src, encoding="utf-8")))
pares = {}
for x in c:
    a, b = int(x["quadro"]), int(x["quadro"]) + int(x["quadros"]) - 1
    pares[a] = (a - 2, b + 2)
precisa = {q for p in pares.values() for q in p}
W, H = 192, 108
p = subprocess.Popen(["ffmpeg", "-v", "error", "-i", video, "-vf", f"scale={W}:{H}:flags=area", "-f", "rawvideo",
                      "-pix_fmt", "gray", "-"], stdout=subprocess.PIPE)
guard, q = {}, 0
ult = max(precisa)
while q <= ult:
    buf = p.stdout.read(W * H)
    if len(buf) < W * H: break
    if q in precisa:
        guard[q] = np.frombuffer(buf, np.uint8).reshape(H, W).astype(np.float32)
    q += 1
p.kill()

def bordas(g):
    g = cv2.GaussianBlur(g, (3, 3), 0)
    m = cv2.magnitude(cv2.Sobel(g, cv2.CV_32F, 1, 0), cv2.Sobel(g, cv2.CV_32F, 0, 1))
    return cv2.GaussianBlur(m, (7, 7), 0)
def ncc(a, b):
    a = a - a.mean(); b = b - b.mean()
    return float((a * b).sum() / (np.sqrt((a * a).sum() * (b * b).sum()) + 1e-6))

with open(saida, "w", newline="", encoding="utf-8") as f:
    w = csv.writer(f); w.writerow(["quadro", "ncc_bordas", "ncc_cinza"])
    for a, (qa, qb) in pares.items():
        if qa in guard and qb in guard:
            w.writerow([a, round(ncc(bordas(guard[qa]), bordas(guard[qb])), 3), round(ncc(guard[qa], guard[qb]), 3)])
print("ok", len(pares))
