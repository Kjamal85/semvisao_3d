"""Gera falas com o Gemini TTS usando só a biblioteca padrão do Python.

A chave vem de producao/ep1/.env (GEMINI_API_KEY) e nunca é impressa.

Uso:
  python voz/gerar_voz.py modelos
  python voz/gerar_voz.py falar --modelo NOME --lote voz/amostras_gabi.json [--so ID]
  python voz/gerar_voz.py limpar voz/audio/ARQUIVO.wav [...]   (sem gastar cota)

Toda fala gerada passa por limpar(): corta estalo no início e ruído colado
no fim (defeito do TTS); o original fica em voz/audio/bruto/.

Um pedido por fala, em sequência (nunca em paralelo).
"""
import argparse
import base64
import json
import math
import re
import shutil
import struct
import sys
import urllib.error
import urllib.request
import wave
from pathlib import Path

sys.stdout.reconfigure(encoding="utf-8")

PROJETO = Path(__file__).resolve().parent.parent  # producao/ep1
API = "https://generativelanguage.googleapis.com/v1beta"


def chave():
    env = PROJETO / ".env"
    if not env.exists():
        sys.exit(f"ERRO: não achei {env}")
    for linha in env.read_text(encoding="utf-8").splitlines():
        linha = linha.strip()
        if linha.startswith("GEMINI_API_KEY="):
            valor = linha.split("=", 1)[1].strip().strip('"').strip("'")
            if valor:
                return valor
    sys.exit("ERRO: GEMINI_API_KEY vazia ou ausente no .env")


def pedir(metodo, caminho, corpo=None):
    req = urllib.request.Request(
        f"{API}/{caminho}",
        method=metodo,
        headers={"x-goog-api-key": chave(), "Content-Type": "application/json"},
        data=json.dumps(corpo).encode("utf-8") if corpo is not None else None,
    )
    try:
        with urllib.request.urlopen(req, timeout=180) as r:
            return json.load(r)
    except urllib.error.HTTPError as e:
        msg = e.read().decode("utf-8", "replace")
        try:
            msg = json.loads(msg)["error"]["message"]
        except Exception:
            pass
        sys.exit(f"ERRO HTTP {e.code}: {msg}")
    except urllib.error.URLError as e:
        sys.exit(f"ERRO de rede: {e.reason}")


def modelos():
    token = ""
    while True:
        dados = pedir("GET", f"models?pageSize=100{'&pageToken=' + token if token else ''}")
        for m in dados.get("models", []):
            nome = m["name"].removeprefix("models/")
            if "tts" in nome.lower():
                print(nome)
        token = dados.get("nextPageToken")
        if not token:
            break


def _db(amostras):
    if not amostras:
        return -120.0
    rms = math.sqrt(sum(x * x for x in amostras) / len(amostras))
    return 20 * math.log10(rms / 32768 + 1e-9)


def limpar(arq, recem_gerado=False):
    """Corta as sobras que o TTS cola nas pontas do áudio.

    Sempre parte do original guardado em audio/bruto/ (na primeira vez copia
    para lá), então rodar de novo depois de melhorar a regra é seguro.
    1. Estalo no início: até 30 ms de som seguido de silêncio.
    2. Ruído no fim: depois da última pausa >= 100 ms vem um trecho curto que
       termina alto (o arquivo acaba no meio de um ruído).
    3. Sopro solto no fim: depois de uma pausa >= 30 ms, um trecho curto e
       baixo (pico < -30 dB) -- respiração/chiado, não fala.
    4. Rabo do sopro: corta onde o nível cai abaixo de -40 dB de vez, com
       fade de 30 ms (um "s" final fica, ele é mais alto que isso).
    Depois põe 80 ms de silêncio digital em cada ponta.
    Devolve a lista do que foi feito.
    """
    arq = Path(arq)
    bruto = arq.parent / "bruto" / arq.name
    bruto.parent.mkdir(exist_ok=True)
    if recem_gerado or not bruto.exists():
        shutil.copy2(arq, bruto)
    with wave.open(str(bruto), "rb") as w:
        taxa, n = w.getframerate(), w.getnframes()
        s = list(struct.unpack(f"<{n}h", w.readframes(n)))
    jan = taxa // 100  # janelas de 10 ms
    dbs = [_db(s[i:i + jan]) for i in range(0, n, jan)]
    silencio = [d < -55 for d in dbs]
    feito = []

    def ultima_pausa(ate, minimo):
        """(início da pausa, fim da pausa) da última pausa >= minimo antes de ate."""
        k, corrida = ate, 0
        while k > 0:
            corrida = corrida + 1 if silencio[k - 1] else 0
            k -= 1
            if corrida >= minimo:
                fim_p = k + corrida
                while k > 0 and silencio[k - 1]:
                    k -= 1
                return k, fim_p
        return None

    ini, fim = 0, len(dbs)  # em janelas
    # 1. estalo no início
    k = 0
    while k < len(dbs) and not silencio[k]:
        k += 1
    if 0 < k <= 3 and all(silencio[k:k + 5]):
        ini = k
        feito.append(f"estalo de {k * 10} ms no início")
    # 2. ruído alto no fim (pode ter buracos de silêncio digital no meio)
    if any(d > -30 for d in dbs[-3:]):
        p = ultima_pausa(fim, 10)
        if p and fim - p[1] <= 40:
            feito.append(f"ruído de {(fim - p[1]) * 10} ms no fim")
            fim = p[0]

    def aparar():
        nonlocal ini, fim
        while ini < fim and silencio[ini]:
            ini += 1
        while fim > ini and silencio[fim - 1]:
            fim -= 1

    aparar()
    # 3. sopros soltos no fim
    while fim > ini:
        p = ultima_pausa(fim, 3)
        if not p or p[0] <= ini or fim - p[1] > 30 or max(dbs[p[1]:fim]) >= -30:
            break
        feito.append(f"sopro de {(fim - p[1]) * 10} ms no fim")
        fim = p[0]
        aparar()
    if fim <= ini:
        return ["ERRO: não sobrou fala; arquivo não mexido"]
    # 4. rabo que se arrasta abaixo de -40 dB
    k = fim
    while k > ini and dbs[k - 1] < -40:
        k -= 1
    if fim - k > 3:
        feito.append(f"rabo de {(fim - k - 3) * 10} ms no fim")
        fim = k + 3

    corpo = s[ini * jan:min(n, fim * jan)]
    for i in range(min(jan, len(corpo))):  # fade de entrada 10 ms
        corpo[i] = int(corpo[i] * i / jan)
    f = min(3 * jan, len(corpo))  # fade de saída 30 ms
    for i in range(f):
        corpo[-1 - i] = int(corpo[-1 - i] * i / f)
    folga = [0] * (taxa * 8 // 100)
    saida = folga + corpo + folga
    with wave.open(str(arq), "wb") as w:
        w.setnchannels(1)
        w.setsampwidth(2)
        w.setframerate(taxa)
        w.writeframes(struct.pack(f"<{len(saida)}h", *saida))
    feito.append(f"{n / taxa:.2f} s -> {len(saida) / taxa:.2f} s")
    return feito


def falar(modelo, lote, so=None):
    itens = json.loads(Path(lote).read_text(encoding="utf-8"))
    if so:
        itens = [i for i in itens if i["id"] == so]
        if not itens:
            sys.exit(f"ERRO: id {so} não está em {lote}")
    saida_dir = Path(lote).resolve().parent / "audio"
    saida_dir.mkdir(parents=True, exist_ok=True)
    for item in itens:
        # Forma curta do exemplo oficial ("Say cheerfully: Have a wonderful day!").
        # O bloco DIRECTOR'S NOTES/TRANSCRIPT funcionou numa fala e na outra a
        # voz leu as notas em voz alta (17 s para 7 palavras), então: estilo
        # curto, dois-pontos, a fala.
        prompt = f"Diga em português do Brasil, {item['estilo']}: {item['texto']}"
        corpo = {
            "contents": [{"parts": [{"text": prompt}]}],
            "generationConfig": {
                "responseModalities": ["AUDIO"],
                "speechConfig": {
                    "voiceConfig": {"prebuiltVoiceConfig": {"voiceName": item["voz"]}}
                },
            },
        }
        dados = pedir("POST", f"models/{modelo}:generateContent", corpo)
        try:
            parte = dados["candidates"][0]["content"]["parts"][0]["inlineData"]
        except (KeyError, IndexError):
            sys.exit(f"ERRO: {item['id']} veio sem áudio: {json.dumps(dados)[:300]}")
        mime = parte.get("mimeType", "")
        taxa = int(m.group(1)) if (m := re.search(r"rate=(\d+)", mime)) else 24000
        pcm = base64.b64decode(parte["data"])
        arq = saida_dir / f"{item['id']}.wav"
        with wave.open(str(arq), "wb") as w:
            w.setnchannels(1)
            w.setsampwidth(2)
            w.setframerate(taxa)
            w.writeframes(pcm)
        dur = len(pcm) / (2 * taxa)
        palavras = len(item["texto"].split())
        print(f"OK {item['id']}: {dur:.1f} s -> {arq}")
        for nota in limpar(arq, recem_gerado=True):
            print(f"   limpeza: {nota}")
        # fala normal ~0,35 s/palavra; 9 s para 7 palavras já foi leitura da instrução
        if dur > palavras * 0.5 + 1.5:
            print(f"   ALERTA: {dur:.1f} s é longo demais para {palavras} palavras; "
                  "a voz pode ter lido as instruções. Ouça antes de seguir.")
            print(f"   {recortar(arq, palavras)}")


def recortar(arq, palavras, em=None):
    """Quando a voz lê a instrução, o padrão é: instrução, pausa (o dois-pontos)
    e a fala. Procura as pausas (>= 150 ms abaixo de -45 dB) depois das quais
    sobra uma duração plausível para a fala (0,15 a 0,8 s por palavra, + folga)
    e corta na mais longa delas. A maior pausa sozinha não serve: numa fala
    com "pausa entre as frases" ela fica no meio da fala.
    Com em=SEGUNDOS corta 130 ms antes do som que começa depois desse ponto.
    Grava ID-recorte.wav (não mexe no limpo). Precisa ser ouvido."""
    arq = Path(arq)
    with wave.open(str(arq), "rb") as w:
        taxa, n = w.getframerate(), w.getnframes()
        s = list(struct.unpack(f"<{n}h", w.readframes(n)))
    jan = taxa // 100
    alto = [_db(s[i:i + jan]) > -45 for i in range(0, n, jan)]
    total = len(alto) / 100
    minimo, maximo = 0.15 * palavras + 0.3, 0.8 * palavras + 1.0
    pausas, ini, visto_som = [], None, False  # (tamanho, janela onde volta o som)
    for i, a in enumerate(alto):
        if a:
            if ini is not None and visto_som and i - ini >= 15:
                pausas.append((i - ini, i))
            ini, visto_som = None, True
        elif ini is None:
            ini = i
    boas = [pz for pz in pausas if minimo <= total - pz[1] / 100 <= maximo]
    if em is not None:
        depois = [pz for pz in pausas if pz[1] / 100 >= em]
        if not depois:
            return f"recorte: nenhuma pausa depois de {em} s; não recortei"
        boas = [min(depois, key=lambda pz: pz[1])]
    if not boas:
        return (f"recorte: nenhuma pausa deixa {minimo:.1f}-{maximo:.1f} s de fala; "
                "não recortei")
    tam, volta = max(boas)
    outras = sorted(pz[1] / 100 for pz in boas if pz[1] != volta)
    corte = max(0, volta - 13) * jan  # 130 ms antes da fala
    x = s[corte:]
    for i in range(min(jan, len(x))):
        x[i] = int(x[i] * i / jan)
    destino = arq.with_name(arq.stem + "-recorte.wav")
    with wave.open(str(destino), "wb") as w:
        w.setnchannels(1)
        w.setsampwidth(2)
        w.setframerate(taxa)
        w.writeframes(struct.pack(f"<{len(x)}h", *x))
    return (f"recorte: pausa de {tam * 10} ms, cortei em {corte / taxa:.2f} s "
            f"-> {destino.name} ({len(x) / taxa:.2f} s). Ouça."
            + (f" Outros começos possíveis: {', '.join(f'{o:.2f} s' for o in outras)}"
               " (use recortar --em)." if outras else ""))


if __name__ == "__main__":
    p = argparse.ArgumentParser()
    sub = p.add_subparsers(dest="cmd", required=True)
    sub.add_parser("modelos")
    f = sub.add_parser("falar")
    f.add_argument("--modelo", required=True)
    f.add_argument("--lote", required=True)
    f.add_argument("--so")
    lp = sub.add_parser("limpar", help="limpa .wav já gerados, sem gastar cota")
    lp.add_argument("arquivos", nargs="+")
    rp = sub.add_parser("recortar", help="tira a instrução lida do começo (sem cota)")
    rp.add_argument("--palavras", type=int, required=True, help="nº de palavras da fala")
    rp.add_argument("--em", type=float, help="força o corte na 1ª fala depois de SEGUNDOS")
    rp.add_argument("arquivos", nargs="+")
    a = p.parse_args()
    if a.cmd == "modelos":
        modelos()
    elif a.cmd == "limpar":
        for arq in a.arquivos:
            notas = limpar(arq) or ["nada a limpar"]
            print(f"{Path(arq).name}: " + "; ".join(notas))
    elif a.cmd == "recortar":
        for arq in a.arquivos:
            print(f"{Path(arq).name}: {recortar(arq, a.palavras, a.em)}")
    else:
        falar(a.modelo, a.lote, a.so)
