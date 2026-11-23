"""Monta producao/ep1/index.html como o EPISÓDIO na ordem do roteiro, com os efeitos sonoros no tempo global.
As cenas (compositions/*.html) não mudam. Rodar em producao/ep1: python montar_ep1.py
"""
import html

CENAS = [  # id, duração (s), planos do roteiro
    ("abertura", 12, "1-11"), ("despertar", 8, "12-16"), ("quarto", 8, "17"), ("queda", 8, "18-24"),
    ("revolta", 10, "25-31"), ("tv", 21.5, "32-37"), ("vizinho", 10, "38-41"), ("deixa", 5, "42"),
    ("cozinha", 8, "43"), ("chama", 3.4, "44"), ("corredor", 8, "45-46"), ("faixa", 8, "47-48"),
    ("quintal", 8, "49-51"), ("esperanca", 12, "52-56"), ("portao", 8, "57-60"), ("ouviu", 6, "61"),
    ("buscar", 17, "62-65"), ("levam", 11, "66-67"), ("rua", 8, "68"), ("van", 8, "69"), ("fim", 7.5, "70-71"),
]
INICIO, t = {}, 0.0
for cid, dur, _ in CENAS:
    INICIO[cid] = round(t, 3); t += dur
TOTAL = round(t, 3)

DUR_ARQ = {"baque": 2.04, "batidas-porta": 3.6, "batimento": 11.75, "boom": 7.49, "cidade-noite": 67.7, "cortina": 4.22,
           "energia-cai": 4.39, "gas": 5.94, "grilos": 15.58, "interruptor": 0.36, "mesa-cai": 2.48, "motor": 38.0,
           "passos-pesados": 2.73, "passos-saindo": 5.8, "porta-arrombada": 1.05, "porta-carro": 0.31, "portao-batida": 3.83,
           "queda-corpo": 0.35, "radio-chiado": 6.75, "respiracao": 4.27, "sirene": 13.26, "tv-liga": 9.17, "vento-alto": 7.68,
           "vidro": 3.69, "zumbido-grave": 28.0, "zumbido-ouvido": 10.0}

# início útil de cada arquivo (silêncio no começo; medido com silencedetect -45 dB)
INICIO_ARQ = {"tv-liga": 1.13, "passos-saindo": 0.55, "interruptor": 0.13, "portao-batida": 0.12, "boom": 0.12, "cidade-noite": 0.34, "sirene": 0.32}

# (cena, tempo local, arquivo, duração do trecho ou None = arquivo todo, volume, fade-in, fade-out, abafado(Hz) ou None, nota)
SFX = [
    ("abertura", 0.0, "cidade-noite", 5.0, 0.35, 0.8, 0.25, None, "cidade à noite (planos 1-5)"),
    ("abertura", 2.0, "zumbido-grave", 3.0, 0.5, 1.5, 0.05, None, "zumbido grave subliminar (5); some no FLASH"),
    ("abertura", 5.3, "boom", 6.0, 0.85, 0, 2.0, None, "BOOM — a onda (7)"),
    ("abertura", 5.6, "energia-cai", None, 0.45, 0, 0.8, None, "energia sugada (8)"),
    ("abertura", 8.0, "vento-alto", 4.0, 0.3, 1.0, 1.0, None, "vento de altitude (9-11)"),
    ("despertar", 0.0, "respiracao", None, 0.35, 0.5, 0.6, None, "respiração no preto (12-14)"),
    ("despertar", 5.4, "zumbido-ouvido", 2.6, 0.3, 0.3, 1.2, None, "zunido ao revelar os olhos (15-16)"),
    ("quarto", 0.4, "respiracao", None, 0.22, 0.6, 1.0, None, "respiração tateando (17)"),
    ("queda", 1.55, "queda-corpo", None, 0.9, 0, 0, None, "cai (20)"),
    ("queda", 1.75, "vidro", None, 0.6, 0, 0.5, None, "o abajur quebra (20)"),
    ("queda", 2.45, "batimento", 5.5, 0.4, 0.5, 1.0, None, "batimento começa (21)"),
    ("revolta", 0.0, "batimento", 2.2, 0.35, 0.2, 0.6, None, "batimento sobe (25)"),
    ("revolta", 0.55, "mesa-cai", None, 0.8, 0, 0.3, None, "varre a mesa (26)"),
    ("revolta", 1.15, "vidro", 1.6, 0.45, 0, 0.5, None, "o vaso na parede (27)"),
    ("revolta", 1.45, "baque", 1.0, 0.7, 0, 0.3, None, "chuta a cadeira (27)"),
    ("tv", 3.75, "interruptor", None, 0.6, 0, 0, None, "clique do controle (33)"),
    ("tv", 3.8, "tv-liga", 0.8, 0.3, 0, 0.3, None, "chiado da TV ligando (33)"),
    ("tv", 18.6, "cortina", 2.5, 0.6, 0, 0.6, None, "o pai fecha a cortina (37)"),
    ("vizinho", 1.8, "passos-pesados", None, 0.35, 0.2, 0.4, 1400, "passos na rua, abafados (39)"),
    ("vizinho", 2.1, "radio-chiado", 4.0, 0.12, 0.3, 0.5, 1800, "chiado do rádio por baixo da voz (39)"),
    ("vizinho", 5.3, "porta-carro", None, 0.6, 0, 0, 1600, "portas da van batem, abafado (39)"),
    ("vizinho", 5.3, "baque", 1.0, 0.3, 0, 0.4, 1600, "corpo da batida"),
    ("chama", 0.0, "gas", 1.4, 0.5, 0.15, 0, None, "chiado do gás → corte seco (44)"),
    ("corredor", 4.0, "baque", 1.2, 0.8, 0, 0.4, None, "bate o ombro na quina (45)"),
    ("quintal", 0.0, "grilos", 8.0, 0.35, 0.6, 0.6, None, "grilos (49-51)"),
    ("portao", 1.65, "portao-batida", 1.2, 0.6, 0, 0.2, 1500, "batida no portão de ferro, de fora (57)"),
    ("portao", 6.9, "passos-saindo", 1.1, 0.3, 0, 0.4, 1200, "passos se afastando (60)"),
    ("buscar", 0.0, "sirene", None, 0.4, 2.5, 2.0, 1200, "sirene abafada se aproximando (62)"),
    ("buscar", 3.5, "motor", 3.5, 0.45, 0.4, 0.3, None, "a van chega (63)"),
    ("buscar", 5.4, "radio-chiado", 1.4, 0.3, 0.05, 0.3, None, "rádio da equipe, só chiado (63)"),
    ("buscar", 5.6, "passos-pesados", 1.4, 0.4, 0, 0.3, None, "figuras descem (63)"),
    ("buscar", 7.35, "baque", 0.9, 0.85, 0, 0.3, None, "TUM (64)"),
    ("buscar", 7.7, "baque", 0.9, 0.85, 0, 0.3, None, "TUM"),
    ("buscar", 8.05, "baque", 1.2, 0.85, 0, 0.4, None, "TUM"),
    ("buscar", 11.0, "baque", 1.0, 0.7, 0, 0.4, None, "mais uma batida enquanto o agente fala (65)"),
    ("levam", 0.55, "baque", 0.9, 0.85, 0, 0.3, None, "empurram a porta (66)"),
    ("levam", 1.0, "baque", 0.9, 0.85, 0, 0.3, None, "empurram a porta"),
    ("levam", 1.5, "porta-arrombada", None, 0.9, 0, 0.2, None, "a porta arrebenta (66)"),
    ("levam", 1.5, "baque", 1.2, 0.6, 0, 0.5, None, "baque da porta"),
    ("levam", 1.7, "passos-pesados", 1.4, 0.4, 0, 0.3, None, "os agentes entram"),
    ("rua", 0.0, "motor", 8.0, 0.3, 0.5, 0.5, None, "a van na rua (68)"),
    ("rua", 0.6, "radio-chiado", 2.0, 0.15, 0.2, 0.5, None, "rádio da equipe"),
    ("van", 5.2, "porta-carro", None, 0.9, 0, 0, None, "a porta da van bate — clangor (69)"),
    ("van", 5.2, "baque", 1.6, 0.7, 0, 0.6, None, "clangor metálico"),
    ("van", 5.4, "motor", 2.6, 0.3, 0.6, 0, 900, "a van sai"),
    ("fim", 0.0, "motor", 3.6, 0.25, 0, 3.0, 700, "tudo abafa (70)"),
]

def num(x):
    return ("%.3f" % x).rstrip("0").rstrip(".")

linhas = []
for i, (cid, dur, planos) in enumerate(CENAS):
    linhas.append(f'      <!-- planos {planos} -->\n'
                  f'      <div id="{cid}" data-composition-id="{cid}" data-composition-src="compositions/{cid}.html"\n'
                  f'        data-start="{num(INICIO[cid])}" data-duration="{num(dur)}" data-track-index="{i % 2}" data-track-kind="graphics" data-width="1920" data-height="1080"></div>')

audios = []
for j, (cid, tl, arq, trecho, vol, fi, fo, lp, nota) in enumerate(SFX):
    ms = INICIO_ARQ.get(arq, 0)
    d = trecho if trecho else DUR_ARQ[arq] - ms
    d = min(d, DUR_ARQ[arq] - ms)
    ini = INICIO[cid] + tl
    fim_cena = INICIO[cid] + dict((c, du) for c, du, _ in CENAS)[cid]
    if cid != "fim" and arq not in ("sirene", "batimento", "zumbido-ouvido", "boom"):
        d = min(d, max(0.1, fim_cena + 0.5 - ini))   # efeito não vaza muito para a cena seguinte
    attrs = [f'id="sfx-{j:02d}"', 'class="clip"', f'src="assets/sfx/{arq}.mp3"', f'data-start="{num(ini)}"',
             f'data-duration="{num(d)}"', f'data-track-index="{10 + j}"', f'data-volume="{num(vol)}"']
    if ms: attrs.append(f'data-media-start="{num(ms)}"')
    if fi: attrs.append(f'data-fade-in="{num(fi)}"')
    if fo: attrs.append(f'data-fade-out="{num(fo)}"')
    if lp:
        fx = '{"version":1,"nodes":[{"type":"lowpass","id":"lp","label":"abafado","params":{"frequency":%d}}]}' % lp
        attrs.append(f'data-fx-chain="{html.escape(fx, quote=True)}"')
    audios.append(f'      <audio {" ".join(attrs)}></audio> <!-- {nota} -->')

pagina = f'''<!doctype html>
<html lang="pt-BR">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=1920, height=1080" />
    <script src="assets/lib/gsap.min.js"></script>
    <script src="assets/lib/three.min.js"></script>
    <script src="assets/rig/elenco.js"></script>
    <script src="assets/rig/pos.js"></script>
    <script src="assets/rig/cena.js"></script>
    <script src="assets/cenarios/quarto.js"></script>
    <script src="assets/cenarios/sala.js"></script>
    <script src="assets/cenarios/cozinha.js"></script>
    <script src="assets/cenarios/frente.js"></script>
    <script src="assets/cenarios/rua.js"></script>
    <style>
      * {{ margin: 0; padding: 0; box-sizing: border-box; }}
      html, body {{ margin: 0; width: 1920px; height: 1080px; overflow: hidden; background: #000; }}
      #root {{ width: 100%; height: 100%; position: relative; }}
      /* episódio montado: os rótulos de revisão de cada cena não aparecem */
      [id$="-rotulo"] {{ visibility: hidden !important; }}
      /* contraste: o subtítulo do selo da abertura sobre o globo claro (abertura.html aprovada fica igual) */
      #ab-selo small {{ color: #e4e9f0 !important; }}
    </style>
  </head>
  <body>
    <!-- EP1 montado na ordem do roteiro (episodios/ep01-protagonista.md). Gerado por montar_ep1.py — editar lá. -->
    <div id="root" data-composition-id="main" data-start="0" data-duration="{num(TOTAL)}" data-width="1920" data-height="1080">
{chr(10).join(linhas)}
      <!-- efeitos sonoros (assets/sfx, créditos em assets/sfx/CREDITOS.md) -->
{chr(10).join(audios)}
    </div>
    <script>
      window.__timelines = window.__timelines || {{}};
      window.__timelines["main"] = gsap.timeline({{ paused: true }});
    </script>
  </body>
</html>
'''
open("index.html", "w", encoding="utf-8").write(pagina)
print("total", TOTAL, "s ·", len(CENAS), "cenas ·", len(SFX), "efeitos")
for cid, dur, planos in CENAS:
    print(f"  {INICIO[cid]:7.2f}  {cid:10s} planos {planos}")
