# Regras do canal 2D — curiosidades históricas absurdas

Resumo operacional. **Fontes da verdade** (leia quando a etapa pedir):
`curso-animacao-lab-2d/identidade-visual/biblia-visual.md`, `curso-animacao-lab-2d/docs/escopo.md`
e o episódio de referência `producao/ep001-guerra-dos-emus/` (roteiro, briefing, plano de cenas,
publicação e o projeto `video/`). Se este resumo e a fonte divergirem, vale a fonte.

## Proposta e público

- "A história que ninguém te contou na escola, em menos de um minuto e animada."
- Público 16–34 anos, Brasil, assiste no celular e muitas vezes **sem som** (legenda carrega o vídeo).
- Séries: **Guerras absurdas**, **Deu muito errado**, **Leis e costumes estranhos**.
- Fora do escopo: tragédias recentes, política atual, conteúdo com rosto, vídeos longos.

## Roteiro

- Gancho nos **2 primeiros segundos**; estrutura gancho → contexto → escalada → virada cômica →
  desfecho que **emenda no gancho (loop)**.
- Até **150 palavras** para 55–60 s (≈ 2,4 palavras por segundo do alvo da produção; a voz do
  Gemini faz pausas: no EP001, 145 palavras viraram 76 s. Prefira ficar abaixo do limite).
- Cada fato confirmado em **2 fontes**, com links na seção Fontes do `roteiro.md`. Número
  contestado leva a atribuição ("segundo o próprio major"). Relato contestado é avisado no texto.
- Tom: narrador **sério, quase documental**; a piada está no visual e no contraste.
- Nunca zombar de vítimas ou de grupos (no EP001: nunca zombar dos fazendeiros).
- `narracao.txt` é a fonte única do texto falado: só o que será dito, sem marcações.

## Visual (bíblia)

- 2D cut-out, contorno grosso, textura de papel envelhecido; personagens em 12 fps ("twos").
- **Sem violência gráfica**: nada de sangue; impacto vira nuvem de penas, poeira ou estrelinhas.
- Paleta: ocre `#D9A441`, azul desbotado `#A8C5D1`, verde-oliva `#5B6236`, cinza-azulado
  `#6E7A86`, vermelho de ênfase `#C0392B` (pouco), creme `#F2E6CF`, quase preto `#1E1B18`.
- Tipografia: títulos em Bebas Neue (caixa alta); legendas Montserrat ExtraBold branca com
  contorno preto, palavra-chave em amarelo `#FFD23F`.
- Legendas palavra a palavra, **no máximo 3 palavras** na tela.
- Áreas seguras (1080×1920): textos e legendas entre y 384 e 1344 px; livres o topo (0–288),
  a base (1440–1920) e 120 px à direita.
- **Emu-mascote** aparece em todos os episódios (olhos grandes e inexpressivos, pescoço longo;
  piscar lento, encarar a câmera, acenar). Narrador só voz, nunca aparece.
- Nenhum quadro principal parado por mais de 2,5 s; efeitos sonoros sincronizados com a ação.

## Áudio

- Voz ~-14 LUFS integrado no final (o `tools/master.mjs` masteriza); efeitos abaixo da voz.
- Só trilhas/efeitos com licença registrada em `publicacao.md`. Os efeitos de `tools/sfx.py` são
  originais (sintetizados) e podem ser usados livremente.

## Técnica (kit do EP001, copiado em cada episódio)

- 1080×1920, 30 fps, MP4 H.264, AAC 48 kHz. Projeto HyperFrames em `video/`.
- `cenas.json`: cada cena começa numa frase da narração; batidas e sons também são frases.
- `tools/build.mjs` gera `index.html`, `compositions/legendas.html` e `assets/js/timing.js`:
  **não edite esses três à mão**. As cenas ficam em `compositions/sN-*.html` e leem `window.EP_T`.
- `assets/js/rig.js` traz emu (perfil e de cima), soldado, major, fazendeiro, metralhadora,
  caminhão, mapa, trigo e utilitários (`window.EP`). Reaproveite e estenda na cópia do episódio.

## Metadados

- Título curto e curioso (≤ 60 caracteres), sem caça-clique falso. Texto da postagem em 1–2
  frases + chamada da série. 4–8 hashtags (#historia #curiosidades #shorts + específicas).
- Comentário fixado com pergunta que puxe o próximo tema da série.
