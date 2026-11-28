"""Monta producao/ep1/ep2.html — o EP2 "VIDENTE" na ordem do mapa (episodios/MONTAGEM_EP2.md).

As cenas (compositions/duda-*.html) não têm áudio: as falas saem de assets/ep2/falas.js (tempo LOCAL de cada cena) e
os efeitos, o ambiente e a música entram aqui no tempo global. O index.html do EP1 não é tocado.
Rodar em producao/ep1:  python montar_ep2.py      Render:  npx hyperframes@0.9.80 render -c ep2.html
"""
import html
import json
import re

CENAS = [  # id, duração (s), planos do mapa
    ("abertura", 15, "1"), ("duda-acorda", 20, "2-5"), ("duda-quarto", 23, "6-10"), ("duda-banheiro", 12, "11-14"),
    ("duda-cafe", 30, "15-22"), ("duda-tv", 25.5, "23-26"), ("duda-despedida", 29.5, "27-33"),
    ("duda-almoco", 17, "34-37"), ("duda-vizinho", 33, "38-45"), ("duda-tarefa", 10, "46-47"),
    ("duda-caminho", 15, "48-50"), ("duda-portao", 25, "51-57"), ("duda-volta", 15, "58-61"),
    ("duda-sirene", 24, "62-67"), ("duda-levam", 23, "68-74"), ("duda-fim", 4, "75"), ("duda-van", 8, "76-77"),
]
INICIO, t = {}, 0.0
for cid, dur, _ in CENAS:
    INICIO[cid] = round(t, 3); t += dur
FIM_EP = round(t, 3)                    # 5:29 — o corte seco da van
PRETO_FINAL, TELA_FINAL = 1.0, 10.0     # ~1 s de preto → "INSCREVA-SE" + ~10 s para as telas finais do YouTube
TOTAL = round(FIM_EP + PRETO_FINAL + TELA_FINAL, 3)
DURC = dict((c, d) for c, d, _ in CENAS)

DUR_ARQ = {"lencol": 4.38, "passarinhos": 2.72, "despertador": 1.0, "agua-pia": 11.71, "tecido": 8.0, "louca": 2.25,
           "troca-canal": 2.13, "cadeira": 4.37, "chave-porta": 4.2, "porta-fecha": 1.68, "microondas": 0.33, "talher": 0.78,
           "janela-abre": 1.4, "lapis": 1.07, "caderno": 2.45, "portaozinho": 1.58, "passos-correndo": 8.4,
           "motor-desliga": 3.75, "travas-van": 1.11, "respiracao": 4.27, "cortina": 4.22, "passos-casa": 24.54,
           "interruptor": 0.36, "tv-liga": 9.17, "sirene": 13.26, "motor": 38.02, "passos-pesados": 2.73, "porta-carro": 0.31,
           "baque": 2.04, "radio-chiado": 6.75, "portao-batida": 3.83, "porta-quarto": 3.0, "passos-tenis": 3.49,
           "grilos": 15.58, "cidade-noite": 67.72, "batimento": 11.76, "ambiente-casa": 135.1, "zumbido-grave": 28.0,
           "boom": 7.49, "energia-cai": 4.39, "vento-alto": 7.68}
# início útil (silêncio no começo do arquivo; silencedetect -45 dB)
INICIO_ARQ = {"lencol": 0.47, "agua-pia": 0.71, "tecido": 1.6, "cadeira": 1.19, "tv-liga": 1.13, "sirene": 0.32,
              "cidade-noite": 0.34, "boom": 0.12, "portao-batida": 0.12, "interruptor": 0.13, "travas-van": 0.15}
VAZA_LIVRE = {"sirene", "batimento", "boom", "motor"}   # podem passar do fim da cena (o resto corta 0,5 s depois)

# (cena, tempo local, arquivo, trecho ou None = arquivo todo, volume, fade-in, fade-out, abafado (Hz) ou None, nota)
SFX = [
    # bloco 1 — a abertura é a do EP1, com os mesmos sons
    ("abertura", 0.0, "cidade-noite", 8.3, 0.35, 0.8, 0.25, None, "cidade à noite"),
    ("abertura", 4.5, "zumbido-grave", 3.5, 0.5, 2.0, 0.05, None, "zumbido grave subliminar; some no FLASH"),
    ("abertura", 8.3, "boom", 6.0, 0.6, 0, 2.0, None, "BOOM — a onda"),
    ("abertura", 8.6, "energia-cai", None, 0.3, 0, 0.8, None, "energia sugada"),
    ("abertura", 11.0, "vento-alto", 4.0, 0.3, 1.0, 1.0, None, "vento de altitude"),
    ("duda-acorda", 0.4, "respiracao", 4.2, 0.18, 0.8, 0.6, 3000, "preto: respiração pouco marcada (2)"),
    ("duda-acorda", 2.6, "lencol", 2.2, 0.35, 0.2, 0.6, None, "lençol no preto (2)"),
    ("duda-acorda", 5.6, "passarinhos", None, 0.4, 0.1, 0.4, None, "a virada: passarinho, manhã (3)"),
    ("duda-acorda", 10.4, "passarinhos", None, 0.25, 0.2, 0.4, None, "passarinho lá fora (4)"),
    ("duda-acorda", 12.3, "lencol", 2.5, 0.45, 0.1, 0.6, None, "senta na cama (5)"),
    ("duda-acorda", 16.2, "passarinhos", None, 0.2, 0.2, 0.4, None, "passarinho (5)"),
    ("duda-quarto", 0.3, "despertador", 0.5, 0.22, 0, 0.1, None, "bipe fraco do despertador 00:00 (6)"),
    ("duda-quarto", 1.5, "despertador", 0.5, 0.22, 0, 0.1, None, "bipe"),
    ("duda-quarto", 2.7, "despertador", 0.5, 0.22, 0, 0.1, None, "bipe"),
    ("duda-quarto", 9.6, "cortina", 2.6, 0.5, 0, 0.6, None, "abre a cortina rosa (8)"),
    ("duda-quarto", 12.6, "passarinhos", None, 0.35, 0.2, 0.4, None, "rua de manhã (9)"),
    ("duda-quarto", 15.8, "passarinhos", None, 0.25, 0.2, 0.4, None, "rua de manhã (9)"),
    ("duda-banheiro", 1.2, "agua-pia", 7.8, 0.4, 0.15, 0.8, None, "a torneira aberta: escova, enxágue, mãos (11-13)"),
    ("duda-banheiro", 9.3, "tecido", 2.4, 0.5, 0.1, 0.5, None, "a toalha no rosto (14)"),
    # bloco 2
    ("duda-cafe", 3.3, "passos-casa", 2.2, 0.45, 0.2, 0.4, None, "a Duda chega na cozinha (16)"),
    ("duda-cafe", 4.4, "louca", None, 0.3, 0, 0.4, None, "louça na mesa (16)"),
    ("duda-cafe", 5.8, "cadeira", 1.3, 0.3, 0, 0.4, None, "senta (16)"),
    ("duda-cafe", 22.2, "troca-canal", 0.5, 0.5, 0, 0.1, None, "clique do controle (21)"),
    ("duda-cafe", 22.4, "tv-liga", 0.8, 0.3, 0, 0.3, None, "chiado da TV ligando"),
    ("duda-cafe", 23.6, "troca-canal", 0.5, 0.5, 0, 0.1, None, "segundo clique: troca de canal"),
    ("duda-cafe", 23.8, "tv-liga", 0.6, 0.25, 0, 0.3, None, "chiado de canal"),
    ("duda-tv", 21.6, "batimento", 4.0, 0.25, 0.8, 0.8, None, "o choque, ~4 s sem fala (26)"),
    ("duda-despedida", 4.6, "cadeira", 1.6, 0.35, 0, 0.4, None, "a mãe levanta (28)"),
    ("duda-despedida", 18.6, "passos-casa", 2.8, 0.45, 0.2, 0.4, None, "a mãe vai até a porta (31)"),
    ("duda-despedida", 21.8, "porta-fecha", None, 0.6, 0, 0.3, None, "a porta da frente fecha (32)"),
    ("duda-despedida", 22.8, "chave-porta", 1.6, 0.35, 0, 0.4, 2000, "a chave do lado de fora (32)"),
    # bloco 3
    ("duda-almoco", 0.4, "lencol", 3.0, 0.45, 0.1, 0.6, None, "arruma a cama (34)"),
    ("duda-almoco", 5.0, "microondas", None, 0.45, 0, 0, None, "micro-ondas apita (35)"),
    ("duda-almoco", 5.4, "microondas", None, 0.45, 0, 0, None, "apita"),
    ("duda-almoco", 5.8, "microondas", None, 0.45, 0, 0, None, "apita"),
    ("duda-almoco", 9.8, "talher", 0.65, 0.35, 0, 0.1, None, "talher no prato (36)"),
    ("duda-almoco", 11.3, "talher", 0.65, 0.3, 0, 0.1, None, "talher"),
    ("duda-almoco", 12.6, "talher", 0.65, 0.3, 0, 0.1, None, "talher"),
    ("duda-almoco", 13.7, "agua-pia", 3.3, 0.35, 0.2, 0.4, None, "lava a louça (37)"),
    ("duda-almoco", 14.6, "louca", None, 0.3, 0, 0.4, None, "louça (37)"),
    ("duda-vizinho", 0.0, "agua-pia", 1.2, 0.35, 0, 0.5, None, "fecha a torneira (38)"),
    ("duda-vizinho", 0.6, "sirene", None, 0.35, 2.0, 2.0, 2500, "a sirene chegando (38)"),
    ("duda-vizinho", 3.3, "cortina", 1.6, 0.45, 0, 0.4, None, "abre a cortina (39)"),
    ("duda-vizinho", 4.8, "janela-abre", None, 0.5, 0, 0.2, None, "abre a janela (39)"),
    ("duda-vizinho", 6.5, "motor", 6.5, 0.3, 0.5, 0.5, 1500, "a van parada (40)"),
    ("duda-vizinho", 7.6, "passos-pesados", None, 0.3, 0.1, 0.4, 1400, "agentes levando o vizinho (40)"),
    ("duda-vizinho", 8.4, "radio-chiado", 4.0, 0.12, 0.3, 0.5, 1800, "chiado por baixo do rádio (40)"),
    ("duda-vizinho", 12.2, "porta-carro", None, 0.5, 0, 0, 1600, "portas da van batem, de longe (40)"),
    ("duda-vizinho", 12.2, "baque", 1.0, 0.3, 0, 0.4, 1600, "corpo da batida"),
    ("duda-vizinho", 17.0, "motor", 3.2, 0.3, 0.2, 1.6, 1200, "a van vai embora (42)"),
    ("duda-vizinho", 17.2, "sirene", 6.0, 0.25, 0.3, 3.0, 1500, "sirene se afastando (42)"),
    ("duda-vizinho", 20.9, "respiracao", 1.6, 0.3, 0.3, 0.4, None, "respiro: a respiração curta voltando (43)"),
    ("duda-tarefa", 0.8, "lapis", None, 0.45, 0, 0.1, None, "lápis no caderno (46)"),
    ("duda-tarefa", 2.2, "lapis", None, 0.4, 0, 0.1, None, "lápis"),
    ("duda-tarefa", 3.6, "lapis", None, 0.4, 0, 0.1, None, "lápis"),
    ("duda-tarefa", 5.8, "caderno", None, 0.5, 0, 0.3, None, "fecha o caderno (47)"),
    # bloco 4
    ("duda-caminho", 0.8, "portaozinho", None, 0.5, 0, 0.2, None, "o portãozinho dela (48)"),
    ("duda-caminho", 1.6, "passos-tenis", 3.3, 0.35, 0.2, 0.4, None, "passos (48-49)"),
    ("duda-caminho", 5.0, "passos-tenis", 3.0, 0.3, 0.2, 0.6, None, "passos, continua (49)"),
    ("duda-portao", 4.4, "portao-batida", 1.3, 0.6, 0, 0.2, None, "bate no portão de ferro (52)"),
    ("duda-portao", 11.6, "porta-quarto", 1.5, 0.35, 0, 0.4, 2500, "a porta abre uma fresta (54)"),
    ("duda-volta", 0.4, "passos-tenis", 3.4, 0.28, 0.3, 0.6, None, "passos se afastando, devagar (58)"),
    ("duda-volta", 13.0, "portaozinho", None, 0.5, 0, 0.2, None, "fecha o portãozinho dela (61)"),
    # bloco 5
    ("duda-sirene", 8.0, "sirene", None, 0.45, 0.8, 2.0, 2500, "a sirene; luz azul e vermelha (63)"),
    ("duda-sirene", 11.0, "motor", 4.0, 0.3, 0.4, 0.4, 1500, "a van para (64)"),
    ("duda-sirene", 13.2, "porta-carro", None, 0.45, 0, 0, 1600, "os agentes descem (64)"),
    ("duda-sirene", 13.5, "passos-pesados", None, 0.3, 0, 0.4, 1400, "passos dos agentes (64)"),
    ("duda-sirene", 15.9, "baque", 0.9, 0.6, 0, 0.3, 1000, "TUM, de longe (65)"),
    ("duda-sirene", 16.3, "baque", 0.9, 0.6, 0, 0.3, 1000, "TUM"),
    ("duda-sirene", 16.7, "baque", 1.2, 0.6, 0, 0.4, 1000, "TUM"),
    ("duda-sirene", 17.0, "respiracao", 1.3, 0.25, 0.1, 0.4, None, "respiração suspensa (66)"),
    ("duda-levam", 0.0, "motor", 3.5, 0.25, 0.2, 0.4, 1500, "a van na frente da casa do Gabi (68)"),
    ("duda-levam", 3.6, "respiracao", 0.9, 0.5, 0, 0.3, None, "puxa o ar, curto (69)"),
    ("duda-levam", 7.0, "passos-correndo", 4.0, 0.6, 0, 0.3, None, "ela sai correndo (70)"),
    ("duda-levam", 8.9, "porta-quarto", 0.8, 0.4, 0, 0.3, None, "a porta da frente (70)"),
    ("duda-levam", 11.5, "porta-carro", None, 0.9, 0, 0, None, "o clangor da porta da van (71)"),
    ("duda-levam", 11.5, "baque", 1.6, 0.7, 0, 0.6, None, "clangor metálico"),
    ("duda-levam", 14.0, "motor", 3.5, 0.5, 0.2, 1.5, None, "a van arranca (72)"),
    ("duda-levam", 14.0, "sirene", 6.0, 0.4, 0.3, 3.0, None, "passa na frente dela e some (72)"),
    ("duda-van", 0.0, "motor-desliga", None, 0.5, 0, 0.2, None, "motor desligando (76)"),
    ("duda-van", 1.4, "travas-van", None, 0.7, 0, 0, None, "travas (76)"),
    ("duda-van", 2.0, "porta-carro", None, 0.9, 0, 0, None, "as portas se abrem de uma vez (77)"),
    ("duda-van", 2.0, "baque", 1.4, 0.6, 0, 0.5, None, "clangor"),
    ("duda-van", 3.0, "respiracao", 4.2, 0.4, 0.4, 0.6, None, "a respiração dele (77)"),
]

# ambiente contínuo (nunca fica mudo): a casa por dentro e a rua por fora. Lê o arquivo a partir do tempo global.
AMB_CASA = ["duda-acorda", "duda-quarto", "duda-banheiro", "duda-cafe", "duda-tv", "duda-despedida", "duda-almoco",
            "duda-vizinho", "duda-tarefa", "duda-sirene"]
AMB_RUA = ["duda-caminho", "duda-portao", "duda-volta"]
AMB_NOITE = [("duda-sirene", 0.0, 24), ("duda-levam", 0.0, 23), ("duda-fim", 0.0, 2.0)]   # grilos no anoitecer

# efeito de cada fala (campo "fx" do falas.js): volume, filtros e fades
def chain(*nos):
    return {"version": 1, "nodes": [dict(n, id=f"n{i}") for i, n in enumerate(nos)]}
HP = lambda f: {"type": "highpass", "params": {"frequency": f}}
LP = lambda f: {"type": "lowpass", "params": {"frequency": f}}
FX_FALA = {
    None:          (1.0,  None, 0, 0),
    "tv":          (0.85, chain(HP(300), LP(3400)), 0, 0),
    "radio-longe": (0.6,  chain(HP(450), LP(2400)), 0, 0),
    "longe":       (0.6,  chain(LP(1800)), 0, 0),
    "distancia":   (0.8,  chain(LP(3500)), 0, 0),
    "mais-longe":  (0.4,  chain(LP(1200)), 0, 0),
    "fade":        (0.35, chain(LP(1200)), 0, 1.8),
}

def num(x):
    return ("%.3f" % x).rstrip("0").rstrip(".")

def attr_fx(fx):
    return f' data-fx-chain="{html.escape(json.dumps(fx, separators=(",", ":")), quote=True)}"' if fx else ""

# ---------------------------------------------------------------- cenas
linhas = []
for i, (cid, dur, planos) in enumerate(CENAS):
    linhas.append(f'      <!-- planos {planos} -->\n'
                  f'      <div id="{cid}" data-composition-id="{cid}" data-composition-src="compositions/{cid}.html"\n'
                  f'        data-start="{num(INICIO[cid])}" data-duration="{num(dur)}" data-track-index="{i % 2}" data-track-kind="graphics" data-width="1920" data-height="1080"></div>')

# ---------------------------------------------------------------- falas (assets/ep2/falas.js)
src = open("assets/ep2/falas.js", encoding="utf-8").read()
FALAS = json.loads(src[src.index("{"): src.rindex("}") + 1])
audios = []
for j, (fid, f) in enumerate(FALAS.items()):
    vol, fx, fi, fo = FX_FALA[f.get("fx")]
    if f.get("fora"):                     # fora de quadro, de outro cômodo
        vol, fx = 0.75, chain(LP(2500))
    a = [f'id="fala-{fid}"', 'class="clip"', f'src="voz/audio/{f["arq"]}"', f'data-start="{num(INICIO[f["cena"]] + f["t"])}"',
         f'data-duration="{num(f["dur"])}"', f'data-track-index="{200 + j}"', f'data-volume="{num(vol)}"']
    if fi: a.append(f'data-fade-in="{num(fi)}"')
    if fo: a.append(f'data-fade-out="{num(fo)}"')
    audios.append(f'      <audio {" ".join(a)}{attr_fx(fx)}></audio> <!-- {f["quem"]} · {f["cena"]} -->')

# ---------------------------------------------------------------- efeitos
for j, (cid, tl, arq, trecho, vol, fi, fo, lp, nota) in enumerate(SFX):
    ms = INICIO_ARQ.get(arq, 0)
    d = min(trecho if trecho else DUR_ARQ[arq] - ms, DUR_ARQ[arq] - ms)
    ini = INICIO[cid] + tl
    if arq not in VAZA_LIVRE:
        d = min(d, max(0.1, INICIO[cid] + DURC[cid] + 0.5 - ini))
    if cid == "duda-van":                 # corte seco no fim: depois dele, silêncio
        d = min(d, FIM_EP - ini)
    a = [f'id="sfx-{j:02d}"', 'class="clip"', f'src="assets/sfx/{arq}.mp3"', f'data-start="{num(ini)}"',
         f'data-duration="{num(d)}"', f'data-track-index="{10 + j}"', f'data-volume="{num(vol)}"']
    if ms: a.append(f'data-media-start="{num(ms)}"')
    if fi: a.append(f'data-fade-in="{num(fi)}"')
    if fo: a.append(f'data-fade-out="{num(min(fo, d))}"')
    audios.append(f'      <audio {" ".join(a)}{attr_fx(chain(LP(lp)) if lp else None)}></audio> <!-- {nota} -->')

for j, cid in enumerate(AMB_CASA):
    audios.append(f'      <audio id="amb-casa-{j:02d}" class="clip" src="assets/sfx/ambiente-casa.mp3" data-start="{num(INICIO[cid])}" '
                  f'data-duration="{num(DURC[cid])}" data-track-index="{120 + j}" data-volume="0.6" '
                  f'data-media-start="{num(INICIO[cid] % (135.1 - DURC[cid] - 0.5))}" data-fade-in="0.3" data-fade-out="0.3"></audio> <!-- ambiente da casa: {cid} -->')
for j, cid in enumerate(AMB_RUA):
    audios.append(f'      <audio id="amb-rua-{j:02d}" class="clip" src="assets/sfx/cidade-noite.mp3" data-start="{num(INICIO[cid])}" '
                  f'data-duration="{num(DURC[cid])}" data-track-index="{140 + j}" data-volume="0.18" '
                  f'data-media-start="{num(0.34 + INICIO[cid] % (67.7 - DURC[cid] - 1))}" data-fade-in="0.3" data-fade-out="0.3"></audio> <!-- a rua, fim de tarde: {cid} -->')
# grilos (arquivo de 15,6 s): pedaços de 14 s encadeados com 0,6 s de fusão, do anoitecer até o fim da duda-fim
g_ini, g_fim, j = INICIO[AMB_NOITE[0][0]], INICIO[AMB_NOITE[-1][0]] + AMB_NOITE[-1][2], 0
while g_ini < g_fim - 0.2:
    d = min(14.0, g_fim - g_ini)
    audios.append(f'      <audio id="amb-noite-{j:02d}" class="clip" src="assets/sfx/grilos.mp3" data-start="{num(g_ini)}" '
                  f'data-duration="{num(d)}" data-track-index="{150 + j}" data-volume="0.2" data-media-start="0.5" '
                  f'data-fade-in="0.6" data-fade-out="{num(min(1.5 if g_ini + d >= g_fim else 0.6, d))}"></audio> <!-- grilos, anoitecer -->')
    if g_ini + d >= g_fim:
        break
    g_ini += d - 0.6; j += 1

# música de fundo do EP1, bem baixa; sai antes da van (no corte, silêncio) e volta na tela final
audios.append(f'      <audio id="musica" class="clip" src="assets/musica/musica-fundo.mp3" data-start="0" data-duration="{num(INICIO["duda-van"])}" '
              f'data-track-index="99" data-volume="0.12" data-fade-in="3" data-fade-out="3"></audio> <!-- música de fundo -->')
audios.append(f'      <audio id="musica-final" class="clip" src="assets/musica/musica-fundo.mp3" data-start="{num(FIM_EP + PRETO_FINAL)}" '
              f'data-duration="{num(TELA_FINAL)}" data-track-index="98" data-volume="0.15" data-media-start="20" data-fade-in="1.5" data-fade-out="2"></audio> <!-- música da tela final -->')

# ---------------------------------------------------------------- selos e fusões
DIA1 = INICIO["duda-cafe"] + 26.0            # plano 22: entra junto com o plantão e fica até o fim
SELOS = [("selo-4h", "+4 HORAS", INICIO["duda-almoco"] + 4.0), ("selo-2h", "+2 HORAS", INICIO["duda-tarefa"] + 0.2)]
FUSOES = [INICIO["duda-almoco"], INICIO["duda-almoco"] + 4.0, INICIO["duda-tarefa"], INICIO["duda-sirene"]]   # passagens de tempo

anim = [f'      tl.fromTo("#selo-dia", {{ opacity: 0 }}, {{ opacity: 1, duration: 0.4 }}, {num(DIA1)});']
for sid, _, t0 in SELOS:
    anim.append(f'      tl.fromTo("#{sid}", {{ opacity: 0 }}, {{ opacity: 1, duration: 0.4 }}, {num(t0)});\n'
                f'      tl.to("#{sid}", {{ opacity: 0, duration: 0.5 }}, {num(t0 + 3.4)});')
for t0 in FUSOES:   # fusão pelo preto: 0,5 s descendo, 0,6 s voltando
    anim.append(f'      tl.to("#transicao", {{ opacity: 1, duration: 0.5, ease: "power1.in" }}, {num(t0 - 0.5)});\n'
                f'      tl.to("#transicao", {{ opacity: 0, duration: 0.6, ease: "power1.out" }}, {num(t0)});')
FINAL = FIM_EP + PRETO_FINAL
anim.append(f'      tl.fromTo("#tela-final", {{ opacity: 0 }}, {{ opacity: 1, duration: 0.8 }}, {num(FINAL)});\n'
            f'      tl.fromTo("#tf-fundo", {{ scale: 1.0 }}, {{ scale: 1.06, duration: {num(TELA_FINAL)}, ease: "none" }}, {num(FINAL)});\n'
            f'      tl.fromTo("#tf-texto", {{ opacity: 0, y: 24 }}, {{ opacity: 1, y: 0, duration: 0.7, ease: "power2.out" }}, {num(FINAL + 0.6)});')

selos_html = "\n".join(f'      <div id="{sid}" class="clip selo selo-tempo" data-start="{num(t0)}" data-duration="4" data-track-index="{6 + i}">{txt}</div>'
                       for i, (sid, txt, t0) in enumerate(SELOS))

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
    <script src="assets/cenarios/casa-duda.js"></script>
    <script src="assets/cenarios/van.js"></script>
    <script src="assets/ep2/falas.js"></script>
    <script src="assets/rig/ep2.js"></script>
    <style>
      * {{ margin: 0; padding: 0; box-sizing: border-box; }}
      html, body {{ margin: 0; width: 1920px; height: 1080px; overflow: hidden; background: #000; }}
      #root {{ width: 100%; height: 100%; position: relative; }}
      [id$="-rotulo"] {{ visibility: hidden !important; }}
      #transicao {{ position: absolute; inset: 0; background: #000; z-index: 50; pointer-events: none; opacity: 0; }}
      #ab-selo small {{ color: #e4e9f0 !important; }}
      /* selos: os do EP1 (caixa escura arredondada, Arial Black) — "DIA 1" no topo-esquerda até o fim, o tempo logo abaixo */
      .selo {{ position: absolute; left: 60px; z-index: 40; padding: 10px 20px; background: rgba(8, 10, 16, 0.6); color: #f2f4f8;
        font-family: "Arial Black", Arial, sans-serif; font-weight: 900; border-radius: 6px; opacity: 0; }}
      #selo-dia {{ top: 50px; font-size: 34px; letter-spacing: .06em; }}
      .selo-tempo {{ top: 128px; font-size: 40px; letter-spacing: .06em; }}
      /* tela final: um plano do episódio, escurecido, e o "INSCREVA-SE" na cor de destaque da série */
      #tela-final {{ position: absolute; inset: 0; z-index: 60; background: #000; overflow: hidden; opacity: 0; }}
      #tf-fundo {{ position: absolute; inset: 0; width: 100%; height: 100%; object-fit: cover; filter: brightness(0.42); transform-origin: 50% 40%; }}
      #tf-texto {{ position: absolute; left: 50%; top: 120px; transform: translateX(-50%); padding: 18px 44px; border-radius: 10px;
        background: rgba(8, 10, 16, 0.72); font-family: "Arial Black", Arial, sans-serif; font-weight: 900; font-size: 72px;
        letter-spacing: .08em; color: #e8b923; white-space: nowrap; }}
    </style>
  </head>
  <body>
    <!-- EP2 "VIDENTE" montado na ordem de episodios/MONTAGEM_EP2.md. Gerado por montar_ep2.py — editar lá. -->
    <div id="root" data-composition-id="ep2" data-start="0" data-duration="{num(TOTAL)}" data-width="1920" data-height="1080">
{chr(10).join(linhas)}
      <!-- falas (assets/ep2/falas.js), efeitos (assets/sfx, créditos em assets/sfx/CREDITOS.md), ambiente e música -->
{chr(10).join(audios)}
      <div id="selo-dia" class="clip selo" data-start="{num(DIA1)}" data-duration="{num(FIM_EP - DIA1)}" data-track-index="5">DIA 1</div>
{selos_html}
      <div id="transicao" class="clip" data-start="0" data-duration="{num(TOTAL)}" data-track-index="9"></div>
      <div id="tela-final" class="clip" data-start="{num(FINAL)}" data-duration="{num(TELA_FINAL)}" data-track-index="8">
        <img id="tf-fundo" src="assets/ep2/tela-final.png" alt="" />
        <div id="tf-texto">INSCREVA-SE</div>
      </div>
    </div>
    <script>
      window.__timelines = window.__timelines || {{}};
      const tl = gsap.timeline({{ paused: true }});
      gsap.set(["#transicao", "#selo-dia", ".selo-tempo", "#tela-final"], {{ opacity: 0 }});
{chr(10).join(anim)}
      window.__timelines["ep2"] = tl;
    </script>
  </body>
</html>
'''
open("ep2.html", "w", encoding="utf-8").write(pagina)
print(f"total {TOTAL} s (episódio {FIM_EP} s + {PRETO_FINAL} s de preto + {TELA_FINAL} s de tela final) · "
      f"{len(CENAS)} cenas · {len(FALAS)} falas · {len(SFX)} efeitos")
for cid, dur, planos in CENAS:
    print(f"  {int(INICIO[cid] // 60)}:{INICIO[cid] % 60:05.2f}  {cid:15s} planos {planos}")
