"""Monta producao/ep1/index.html como o EPISÓDIO na ordem do roteiro, com os efeitos sonoros no tempo global.
As cenas (compositions/*.html) não mudam. Rodar em producao/ep1: python montar_ep1.py
"""
import html

CENAS = [  # id, duração (s), planos — NOVA ORDEM do usuário (episodios/MONTAGEM_EP1.md)
    ("abertura", 15, "1-11"), ("despertar", 9.5, "12-16"), ("quarto", 14, "14-17"), ("queda", 19, "18-24 + pra-sala"),
    ("tv", 23.8, "32-37"), ("deitar", 17, "dor-cabeca + deitar"), ("bairro", 9, "bairro de cima"), ("vizinho", 12, "38-41"), ("acorda", 7, "acorda de novo"), ("revolta", 10, "25-31"),
    ("deixa", 10.2, "42"), ("cozinha", 8, "43"), ("chama", 5.4, "44"), ("faixa", 12.5, "47-48"), ("esperanca", 15.5, "52-56"),
    ("quintal", 8, "49-51"), ("corredor", 8, "45-46"), ("portao", 18.3, "57-60"), ("ouviu", 13, "61"),
    ("buscar", 20.3, "62-65"), ("levam", 11, "66-67"), ("rua", 8, "68"), ("van", 8, "69"), ("fim", 12, "70-71"),
]
INICIO, t = {}, 0.0
for cid, dur, _ in CENAS:
    INICIO[cid] = round(t, 3); t += dur
TOTAL = round(t, 3)

DUR_ARQ = {"baque": 2.04, "batidas-porta": 3.6, "batimento": 11.75, "boom": 7.49, "cidade-noite": 67.7, "cortina": 4.22,
           "energia-cai": 4.39, "gas": 5.94, "grilos": 15.58, "interruptor": 0.36, "mesa-cai": 2.48, "motor": 38.0,
           "passos-pesados": 2.73, "passos-saindo": 5.8, "porta-arrombada": 1.05, "porta-carro": 0.31, "portao-batida": 3.83,
           "queda-corpo": 0.35, "radio-chiado": 6.75, "respiracao": 4.27, "sirene": 13.26, "tv-liga": 9.17, "vento-alto": 7.68,
           "vidro": 3.69, "zumbido-grave": 28.0, "zumbido-ouvido": 10.0,
           "ambiente-casa": 135.1, "passos-casa": 24.54, "passos-tenis": 3.49, "porta-quarto": 3.0, "agua-copo": 10.0,
           "caixa": 1.9, "esparadrapo": 0.45, "choro-homem": 6.2, "choro-mulher": 8.06}

# início útil de cada arquivo (silêncio no começo; medido com silencedetect -45 dB)
INICIO_ARQ = {"tv-liga": 1.13, "passos-saindo": 0.55, "interruptor": 0.13, "portao-batida": 0.12, "boom": 0.12, "cidade-noite": 0.34, "sirene": 0.32}

# (cena, tempo local, arquivo, duração do trecho ou None = arquivo todo, volume, fade-in, fade-out, abafado(Hz) ou None, nota)
SFX = [
    ("abertura", 0.0, "cidade-noite", 8.3, 0.35, 0.8, 0.25, None, "cidade à noite (planos 1-5)"),
    ("abertura", 4.5, "zumbido-grave", 3.5, 0.5, 2.0, 0.05, None, "zumbido grave subliminar (5); some no FLASH"),
    ("abertura", 8.3, "boom", 6.0, 0.6, 0, 2.0, None, "BOOM — a onda (7)"),
    ("abertura", 8.6, "energia-cai", None, 0.3, 0, 0.8, None, "energia sugada (8)"),
    ("abertura", 11.0, "vento-alto", 4.0, 0.3, 1.0, 1.0, None, "vento de altitude (9-11)"),
    ("despertar", 0.0, "respiracao", None, 0.35, 0.5, 0.3, None, "respiração no preto (12-14) — até 0:20"),
    ("despertar", 3.6, "respiracao", None, 0.45, 0.3, 0.3, None, "respiração acelera ao acordar"),
    ("despertar", 6.6, "zumbido-ouvido", 2.9, 0.25, 0.3, 0.3, None, "zunido ao revelar os olhos (15-16)"),
    ("quarto", 0.0, "zumbido-ouvido", 4.5, 0.3, 0.1, 1.2, None, "zunido sentado na cama"),
    ("quarto", 0.0, "respiracao", None, 0.5, 0.2, 0.3, None, "ofegante antes de \"pai? mãe?\""),
    ("quarto", 5.5, "respiracao", None, 0.22, 0.6, 1.0, None, "respiração tateando (17)"),
    ("queda", 1.55, "queda-corpo", None, 0.9, 0, 0, None, "cai (20)"),
    ("queda", 1.75, "vidro", None, 0.6, 0, 0.5, None, "o abajur quebra (20)"),
    ("queda", 2.45, "batimento", 8.3, 0.4, 0.5, 1.5, None, "coração batendo até o pai falar (21)"),
    ("queda", 3.3, "porta-quarto", 1.2, 0.5, 0, 0.3, None, "a porta do quarto abre"),
    ("queda", 3.4, "passos-casa", 1.3, 0.8, 0, 0.2, None, "a mãe entra correndo"),
    ("queda", 4.6, "passos-casa", 1.4, 0.6, 0, 0.3, None, "o pai chega atrás"),
    ("queda", 15.6, "passos-casa", 3.4, 0.6, 0.2, 0.4, None, "saem do quarto, os três juntos"),
    ("deitar", 8.6, "passos-casa", 2.6, 0.6, 0.2, 0.4, None, "a mãe leva o Gabi pro quarto"),
    ("bairro", 0.0, "sirene", None, 0.35, 1.0, 1.5, 2500, "sirenes pelo bairro, ao longe"),
    ("bairro", 3.2, "sirene", 5.8, 0.22, 1.0, 1.5, 1800, "outra sirene, mais longe"),
    ("acorda", 0.2, "respiracao", None, 0.35, 0.5, 0.3, None, "respira — acordou de novo"),
    ("acorda", 4.4, "respiracao", None, 0.5, 0.2, 0.3, None, "respiração pesada: a raiva"),
    ("revolta", 0.0, "batimento", 2.2, 0.35, 0.2, 0.6, None, "batimento sobe (25)"),
    ("revolta", 0.55, "mesa-cai", None, 0.8, 0, 0.3, None, "varre a mesa (26)"),
    ("revolta", 1.15, "vidro", 1.6, 0.45, 0, 0.5, None, "o vaso na parede (27)"),
    ("revolta", 1.45, "baque", 1.0, 0.7, 0, 0.3, None, "chuta a cadeira (27)"),
    ("tv", 0.2, "passos-casa", 4.4, 0.7, 0.2, 0.4, None, "os três andando até o sofá"),
    ("tv", 6.05, "interruptor", None, 0.6, 0, 0, None, "clique do controle (33)"),
    ("tv", 6.1, "tv-liga", 0.8, 0.3, 0, 0.3, None, "chiado da TV ligando (33)"),
    ("tv", 20.9, "cortina", 2.5, 0.6, 0, 0.6, None, "o pai fecha a cortina (37)"),
    ("vizinho", 3.8, "passos-pesados", None, 0.35, 0.2, 0.4, 1400, "passos na rua, abafados (39)"),
    ("vizinho", 4.1, "radio-chiado", 4.0, 0.12, 0.3, 0.5, 1800, "chiado do rádio por baixo da voz (39)"),
    ("vizinho", 7.3, "porta-carro", None, 0.6, 0, 0, 1600, "portas da van batem, abafado (39)"),
    ("vizinho", 7.3, "baque", 1.0, 0.3, 0, 0.4, 1600, "corpo da batida"),
    ("chama", 0.0, "gas", 1.4, 0.5, 0.15, 0, None, "chiado do gás → corte seco (44)"),
    ("deixa", 0.4, "passos-casa", 2.0, 0.4, 0.3, 0.4, None, "a mãe chega devagar na cozinha"),
    ("chama", 1.4, "gas", 2.0, 0.35, 0, 0.1, None, "o gás no close da chama"),
    ("chama", 3.4, "respiracao", 1.6, 0.8, 0, 0.6, None, "puxa o ar: queimou (grito de dor sem fala)"),
    ("chama", 3.4, "baque", 0.6, 0.35, 0, 0.3, None, "esbarra na bancada ao puxar a mão"),
    ("faixa", 0.1, "caixa", None, 0.6, 0, 0.3, None, "a caixa de primeiros socorros"),
    ("faixa", 6.3, "esparadrapo", None, 0.8, 0, 0, None, "rasga o esparadrapo"),
    ("faixa", 7.4, "esparadrapo", None, 0.6, 0, 0, None, "mais um pedaço"),
    ("cozinha", 0.0, "agua-copo", 7.6, 0.45, 0.3, 0.6, None, "a torneira aberta enchendo o copo (43)"),
    ("esperanca", 5.5, "vidro", None, 0.8, 0, 0.5, None, "o copo quebra no chão (55)"),
    ("esperanca", 6.6, "baque", 0.8, 0.6, 0, 0.3, None, "soco na mesa: raiva de si mesmo"),
    ("corredor", 4.0, "baque", 1.2, 0.8, 0, 0.4, None, "bate o ombro na quina (45)"),
    ("quintal", 0.0, "grilos", 8.0, 0.35, 0.6, 0.6, None, "grilos (49-51)"),
    ("portao", 4.95, "portao-batida", 1.2, 0.6, 0, 0.2, 1500, "batida no portão de ferro, de fora (57)"),
    ("portao", 17.3, "passos-saindo", 1.0, 0.3, 0, 0.4, 1200, "passos se afastando (60)"),
    ("quintal", 1.2, "choro-homem", None, 0.45, 0.6, 1.0, None, "o pai chorando sozinho no quintal (49-51)"),
    ("corredor", 0.2, "passos-casa", 3.6, 0.5, 0.2, 0.3, None, "passos no corredor (45)"),
    ("ouviu", 6.0, "choro-mulher", None, 0.4, 0.8, 1.2, None, "a mãe chora abraçada (61)"),
    ("buscar", 0.0, "sirene", None, 0.4, 2.5, 2.0, 1200, "sirene abafada se aproximando (62)"),
    ("buscar", 3.5, "motor", 3.5, 0.45, 0.4, 0.3, None, "a van chega (63)"),
    ("buscar", 5.4, "radio-chiado", 1.4, 0.3, 0.05, 0.3, None, "rádio da equipe, só chiado (63)"),
    ("buscar", 5.6, "passos-pesados", 1.4, 0.4, 0, 0.3, None, "figuras descem (63)"),
    ("buscar", 7.35, "baque", 0.9, 0.85, 0, 0.3, None, "TUM (64)"),
    ("buscar", 7.7, "baque", 0.9, 0.85, 0, 0.3, None, "TUM"),
    ("buscar", 8.05, "baque", 1.2, 0.85, 0, 0.4, None, "TUM"),
    ("buscar", 14.3, "baque", 1.0, 0.7, 0, 0.4, None, "mais uma batida enquanto o agente fala (65)"),
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

# NARRADOR (voz trazida pelo usuário, voz/audio/ep1/narrador-nNN.wav normalizado -18 LUFS): conta a história e
# NUNCA fala por cima dos personagens. (cena, tempo local, id, duração)
NARRADOR = [("abertura", 0.8, "n01", 4.99), ("abertura", 7.7, "n02", 7.24), ("quarto", 6.0, "n03", 7.63),
            ("tv", 0.3, "n04", 4.28), ("bairro", 0.8, "n05", 5.96), ("vizinho", 0.3, "n06", 3.63), ("acorda", 0.3, "n07", 7.08), ("deixa", 0.3, "n08", 4.05), ("faixa", 6.5, "n09", 5.88), ("quintal", 0.6, "n10", 6.69), ("corredor", 0.3, "n11", 4.83), ("portao", 0.3, "n12", 3.79), ("buscar", 0.3, "n13", 6.53), ("fim", 6.9, "n14", 4.44)]
for j, (cid, tl, nid, d) in enumerate(NARRADOR):
    audios.append(f'      <audio id="narr-{nid}" class="clip" src="voz/audio/ep1/narrador-{nid}.wav" data-start="{num(INICIO[cid] + tl)}" '
                  f'data-duration="{num(d)}" data-track-index="{120 + j}" data-volume="1"></audio> <!-- narrador {nid} -->')

# a música do fone (esperança): assets/musica/musica-fone.mp3 (escolhida pelo usuário), um pouco abafada — o que ele ouve
FX_FONE = '{"version":1,"nodes":[{"type":"lowpass","id":"lp","label":"fone","params":{"frequency":3500}}]}'
audios.append(f'      <audio id="musica-fone" class="clip" src="assets/musica/musica-fone.mp3" data-start="{num(INICIO["esperanca"] + 9.6)}" '
              f'data-duration="5.9" data-track-index="98" data-volume="0.6" data-fade-in="1.2" data-fade-out="1.0" '
              f'data-fx-chain="{html.escape(FX_FONE, quote=True)}"></audio> <!-- a música no fone -->')

# fundo ambiente contínuo (room tone) em todas as cenas dentro de casa: nunca fica mudo.
# cada cena lê o arquivo a partir do seu tempo global (o arquivo tem 135 s: dá a volta), então o fundo não "reinicia" a cada corte.
CASA = ["despertar", "quarto", "queda", "revolta", "tv", "deitar", "vizinho", "acorda", "deixa", "cozinha", "chama", "corredor", "faixa",
        "esperanca", "portao", "ouviu", "buscar", "levam"]
DURC = dict((c, du) for c, du, _ in CENAS)
for j, cid in enumerate(c for c in CASA if c in INICIO):
    audios.append(f'      <audio id="amb-{j:02d}" class="clip" src="assets/sfx/ambiente-casa.mp3" data-start="{num(INICIO[cid])}" '
                  f'data-duration="{num(DURC[cid])}" data-track-index="{80 + j}" data-volume="0.6" data-media-start="{num(INICIO[cid] % (135.1 - DURC[cid] - 0.5))}" '
                  f'data-fade-in="0.3" data-fade-out="0.3"></audio> <!-- ambiente da casa: {cid} -->')

# música de fundo (assets/musica, escolhida pelo usuário): bem baixa por baixo do episódio inteiro
audios.append(f'      <audio id="musica" class="clip" src="assets/musica/musica-fundo.mp3" data-start="0" data-duration="{num(TOTAL)}" '
              f'data-track-index="99" data-volume="0.12" data-fade-in="3" data-fade-out="4"></audio> <!-- música de fundo -->')

# transições suaves: em cada emenda de cena, uma fusão rápida pelo preto (sai 0,3 s · volta 0,4 s)
SEM_TRANS = {"despertar"}   # o despertar já começa no preto
trans = [f"      tl.to(\"#transicao\", {{ opacity: 1, duration: 0.3, ease: \"power1.in\" }}, {num(INICIO[c] - 0.3)});\n"
         f"      tl.to(\"#transicao\", {{ opacity: 0, duration: 0.4, ease: \"power1.out\" }}, {num(INICIO[c])});"
         for c, _, _ in CENAS[1:] if c not in SEM_TRANS]
CORTES_INTERNOS = [("quarto", 5.5), ("deitar", 11.0)]   # cortes dentro de uma cena que também ficam suaves (close -> plano aberto)
trans += [f"      tl.to(\"#transicao\", {{ opacity: 0.85, duration: 0.25 }}, {num(INICIO[c] + tl - 0.25)});\n"
          f"      tl.to(\"#transicao\", {{ opacity: 0, duration: 0.35 }}, {num(INICIO[c] + tl)});" for c, tl in CORTES_INTERNOS]

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
      #transicao {{ position: absolute; inset: 0; background: #000; z-index: 50; pointer-events: none; opacity: 0; }}
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
      <div id="transicao" class="clip" data-start="0" data-duration="{num(TOTAL)}" data-track-index="9"></div>
    </div>
    <script>
      window.__timelines = window.__timelines || {{}};
      const tl = gsap.timeline({{ paused: true }});
      gsap.set("#transicao", {{ opacity: 0 }});
{chr(10).join(trans)}
      window.__timelines["main"] = tl;
    </script>
  </body>
</html>
'''
open("index.html", "w", encoding="utf-8").write(pagina)
print("total", TOTAL, "s ·", len(CENAS), "cenas ·", len(SFX), "efeitos")
for cid, dur, planos in CENAS:
    print(f"  {INICIO[cid]:7.2f}  {cid:10s} planos {planos}")
