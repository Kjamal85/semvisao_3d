"""Mede luma mediana (0-255, escala cheia) e saturação mediana (%) de imagens.

Compara com a régua da série (aprendizado/registro.md): luma mediana 85-95,
saturação abaixo da referência (33-45%). Usa ffmpeg para decodificar; só stdlib.

Uso: python ferramentas/medir_luma.py quadro1.png [quadro2.png ...]
"""
import statistics
import subprocess
import sys

sys.stdout.reconfigure(encoding="utf-8")
W, H = 480, 270


def medir(caminho):
    rgb = subprocess.run(
        ["ffmpeg", "-v", "error", "-i", caminho, "-vf", f"scale={W}:{H}",
         "-f", "rawvideo", "-pix_fmt", "rgb24", "-"],
        capture_output=True, check=True).stdout
    lum, sat = [], []
    for i in range(0, len(rgb), 3):
        r, g, b = rgb[i], rgb[i + 1], rgb[i + 2]
        lum.append(0.299 * r + 0.587 * g + 0.114 * b)
        mx, mn = max(r, g, b), min(r, g, b)
        sat.append(0 if mx == 0 else (mx - mn) / mx)
    return statistics.median(lum), statistics.median(sat) * 100


if __name__ == "__main__":
    for arq in sys.argv[1:]:
        l, s = medir(arq)
        nota = "OK" if 85 <= l <= 95 else ("ESCURO" if l < 85 else "CLARO")
        print(f"luma {l:5.1f} [{nota:6}]  saturação {s:4.1f}%  {arq}")
