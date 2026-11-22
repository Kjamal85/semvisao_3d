"""Gera falas com o Gemini TTS usando só a biblioteca padrão do Python.

A chave vem de producao/ep1/.env (GEMINI_API_KEY) e nunca é impressa.

Uso:
  python voz/gerar_voz.py modelos
  python voz/gerar_voz.py falar --modelo NOME --lote voz/amostras_gabi.json [--so ID]

Um pedido por fala, em sequência (nunca em paralelo).
"""
import argparse
import base64
import json
import re
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


def falar(modelo, lote, so=None):
    itens = json.loads(Path(lote).read_text(encoding="utf-8"))
    if so:
        itens = [i for i in itens if i["id"] == so]
        if not itens:
            sys.exit(f"ERRO: id {so} não está em {lote}")
    saida_dir = Path(lote).resolve().parent / "audio"
    saida_dir.mkdir(parents=True, exist_ok=True)
    for item in itens:
        # Formato do guia de prompts do Gemini TTS: as notas de direção ficam num
        # bloco separado e só o bloco TRANSCRIPT é falado.
        prompt = (
            "### DIRECTOR'S NOTES\n"
            f"Idioma: português do Brasil. Atuação: {item['estilo']}.\n\n"
            "#### TRANSCRIPT\n"
            f"{item['texto']}"
        )
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
        if dur > palavras * 0.9 + 3:
            print(f"   ALERTA: {dur:.1f} s é longo demais para {palavras} palavras; "
                  "a voz pode ter lido as instruções. Ouça antes de seguir.")


if __name__ == "__main__":
    p = argparse.ArgumentParser()
    sub = p.add_subparsers(dest="cmd", required=True)
    sub.add_parser("modelos")
    f = sub.add_parser("falar")
    f.add_argument("--modelo", required=True)
    f.add_argument("--lote", required=True)
    f.add_argument("--so")
    a = p.parse_args()
    if a.cmd == "modelos":
        modelos()
    else:
        falar(a.modelo, a.lote, a.so)
