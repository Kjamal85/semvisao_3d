# Créditos e licenças — EP1

O que entra no vídeo e não foi feito do zero neste repositório, com origem, versão e licença.
Atualizar a cada item novo (sobretudo SFX de biblioteca, que ainda faltam).

## Bibliotecas (vendadas em `assets/lib/`)

| Item | Versão | Origem | Licença | SHA-256 |
|---|---|---|---|---|
| GSAP (`gsap.min.js`) | 3.15.1 | https://gsap.com | Licença padrão da GreenSock ("no charge"), uso gratuito inclusive comercial — termos em https://gsap.com/standard-license | `3d1bea37…a0a190c1b` |
| Three.js (`three.min.js`) | r155 | https://threejs.org | MIT, © 2010-2023 Three.js Authors | `ec0a8437…5f18fab7e` |

- O `three.min.js` é o build antigo (deprecado desde r150; o `check` avisa). Funciona; trocar por
  módulo ES só se der problema.

## Ferramentas (não vão dentro do vídeo)

- **HyperFrames CLI** `hyperframes@0.9.80` (versão fixa no `package.json`): montagem e render.
- **FFmpeg**: codificação no render local.
- **Python 3** (só biblioteca padrão): `voz/gerar_voz.py`.

## Vozes

Todas geradas por **Google Gemini TTS**, modelo `gemini-3.8-flash-tts`, em 2026-11-22, com
`voz/gerar_voz.py`. Arquivos em `voz/audio/<ID>.wav` (IDs do roteiro).

| Personagem | Voz do Gemini |
|---|---|
| Gabi | Enceladus |
| Mãe | Sola |
| Pai | Charon |
| Duda | Achernar |
| Repórter | Lumi |
| Agente | Achird |
| Rádio da equipe | Algenib |

- Termos: Termos Adicionais da API Gemini (https://ai.google.dev/gemini-api/terms). Pelos termos,
  o Google não reivindica posse do conteúdo gerado.
- ⚠️ Foram gerados no **plano gratuito**: nele o Google pode usar os pedidos e respostas para
  melhorar os produtos. Os textos são falas do roteiro, nada pessoal; ainda assim, vale saber.
- Ao publicar: o YouTube pede para marcar conteúdo realista alterado ou sintético. Animação com
  voz sintética provavelmente não se enquadra, mas confira na hora do upload.

## Música e efeitos

| Arquivo | Origem | Licença |
|---|---|---|
| `audio/ambiente_triste_ep1` (.wav/.mp3) | Sintetizado neste projeto (rascunho) | Própria |
| `audio/sfx_boom` | Sintetizado neste projeto (rascunho) | Própria |
| `audio/sfx_zunido_cegueira` | Sintetizado neste projeto (rascunho) | Própria |
| `audio/sfx_batimento` | Sintetizado neste projeto (rascunho) | Própria |

**Faltam (CC0, ver `briefing/efeitos-e-audio-ep1.md`):** vidro quebrando, chiado de TV, portão de
ferro, sirene, passos, rádio, batidas na porta, porta da van, respiração. Para cada um, anotar
aqui: nome do arquivo, link da página, autor e licença (CC0).

## Personagens, cenários e roteiro

Criação própria. O canal "E Se?" é estudado só pelo método (ritmo, cortes, medição); nenhuma
frase, cena ou imagem é copiada.
