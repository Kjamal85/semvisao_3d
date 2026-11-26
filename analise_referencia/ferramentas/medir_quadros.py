"""Mede cada quadro de um vídeo: diferença para o anterior, corte, e movimento de câmera.

Uso: py -3.14 -I medir_quadros.py <video> <saida.csv>

Por quadro grava:
  q, t            índice e tempo (s)
  mad             diferença média absoluta para o quadro anterior (0-255, cinza)
  hist            distância de histograma de cor (0-1) para o anterior
  dup             1 se o quadro é igual ao anterior (animação em "2s")
  dx, dy          deslocamento da IMAGEM em % da largura (positivo = imagem foi p/ direita / p/ baixo)
  esc             escala da imagem em relação ao anterior (>1 = imagem cresceu = câmera aproxima)
  rot             rotação em graus
  inl, npts       pontos que concordam com o movimento global / pontos rastreados
"""
import sys, subprocess, csv
import numpy as np, cv2

video, saida = sys.argv[1], sys.argv[2]
W, H = 384, 216

probe = subprocess.run(["ffprobe", "-v", "error", "-select_streams", "v:0", "-show_entries",
                        "stream=r_frame_rate", "-of", "csv=p=0", video], capture_output=True, text=True).stdout.strip()
n, d = probe.split("/"); fps = float(n) / float(d)

proc = subprocess.Popen(["ffmpeg", "-v", "error", "-i", video, "-vf", f"scale={W}:{H}:flags=area",
                         "-f", "rawvideo", "-pix_fmt", "bgr24", "-"], stdout=subprocess.PIPE, bufsize=W * H * 3 * 8)

def hist(img):
    hsv = cv2.cvtColor(img, cv2.COLOR_BGR2HSV)
    h = cv2.calcHist([hsv], [0, 1, 2], None, [16, 8, 8], [0, 180, 0, 256, 0, 256])
    return cv2.normalize(h, h).flatten()

out = open(saida, "w", newline="", encoding="utf-8")
wr = csv.writer(out)
wr.writerow(["q", "t", "mad", "hist", "dup", "dx", "dy", "esc", "rot", "inl", "npts"])

prev = prev_g = prev_h = None
q = 0
tam = W * H * 3
while True:
    buf = proc.stdout.read(tam)
    if len(buf) < tam:
        break
    img = np.frombuffer(buf, np.uint8).reshape(H, W, 3)
    g = cv2.cvtColor(img, cv2.COLOR_BGR2GRAY)
    hh = hist(img)
    row = [q, round(q / fps, 4)]
    if prev is None:
        row += [0, 0, 0, 0, 0, 1, 0, 0, 0]
    else:
        mad = float(np.mean(cv2.absdiff(g, prev_g)))
        hd = float(cv2.compareHist(prev_h, hh, cv2.HISTCMP_BHATTACHARYYA))
        dup = 1 if mad < 0.35 else 0
        dx = dy = rot = 0.0; esc = 1.0; inl = npts = 0
        if mad > 0.05:
            p0 = cv2.goodFeaturesToTrack(prev_g, maxCorners=400, qualityLevel=0.01, minDistance=6, blockSize=5)
            if p0 is not None and len(p0) >= 12:
                p1, st, _ = cv2.calcOpticalFlowPyrLK(prev_g, g, p0, None, winSize=(21, 21), maxLevel=3)
                ok = st.flatten() == 1
                a, b = p0[ok].reshape(-1, 2), p1[ok].reshape(-1, 2)
                npts = int(len(a))
                if npts >= 12:
                    M, mask = cv2.estimateAffinePartial2D(a, b, method=cv2.RANSAC, ransacReprojThreshold=1.0,
                                                          maxIters=2000, confidence=0.99)
                    if M is not None:
                        inl = int(mask.sum())
                        s = float(np.hypot(M[0, 0], M[1, 0]))
                        # translação medida no centro da imagem (tira o efeito do zoom no canto)
                        cx, cy = W / 2, H / 2
                        tx = M[0, 0] * cx + M[0, 1] * cy + M[0, 2] - cx
                        ty = M[1, 0] * cx + M[1, 1] * cy + M[1, 2] - cy
                        dx, dy = tx / W * 100, ty / W * 100
                        esc, rot = s, float(np.degrees(np.arctan2(M[1, 0], M[0, 0])))
        row += [round(mad, 3), round(hd, 4), dup, round(dx, 4), round(dy, 4), round(esc, 5), round(rot, 4), inl, npts]
    wr.writerow(row)
    prev, prev_g, prev_h = img, g, hh
    q += 1
    if q % 3000 == 0:
        print(f"{q} quadros ({q / fps:.0f}s)", flush=True)
out.close()
print("fim", q, "quadros, fps", fps)
