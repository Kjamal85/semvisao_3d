# Regras da série — semvisão 3D

Resumo operacional. **Fontes da verdade** (somente leitura, mandam sobre este resumo):
`briefing/minimundo.md`, `briefing/serie-biblia.md`, `briefing/linguagem-visual.md`,
`producao/ep1/assets/rig/elenco.js` (FICHAS), `personagens/*.md`,
`aprendizado/padrao-de-qualidade.md`, `regras/canal-semvisao-3d.md`, `regras/receita-estilo-e-se.md`
(receita do episódio: roteiro, câmera, visual, textos e som), `episodios/_modelo.md`.
Se este resumo e a fonte divergirem, vale a fonte.

## Tom e proposta

Thriller social de colapso gradual. **Não é comédia.** Sem herói salvador, sem resolução
limpa — o desconforto é o produto. Apagão global (17 de novembro, 3h30) solta uma onda de
energia; pessoas cegam aos poucos (2–3 por dia, nunca todas de uma vez). Quem enxerga trata
os cegos como doentes e os isola à força.

## Minimundo (a regra mais importante — ver briefing/minimundo.md inteiro)

Mostrar, nunca explicar. O corpo fala antes da boca; o silêncio carrega; som íntimo
(respiração, engolir em seco); a câmera sente junto; subtexto, nunca "eu te amo" dito.
Personagens sempre respiram e têm micro-movimentos — ninguém fica totalmente imóvel.

## Personagens e continuidade

Estado de cada personagem (cego ou vidente, que dia, o que já foi revelado) vem só de
`personagens/*.md`. Nenhuma continuidade nova sem checar esses arquivos; se faltar fonte,
**pare e marque como pendência** — nunca invente cânone novo.

## Visual

- Low-poly cel-shaded, cabeça ~32% da altura. Contorno escuro em casca BackSide
  (`OUT = 0x000000` em `producao/ep1/assets/rig/elenco.js`).
- Cores EXATAS vêm do rig (`FICHAS` em elenco.js) — a paleta em prosa de
  `linguagem-visual.md` é só proposta inicial.
- A boca do personagem **sempre visível** (nunca escondida por mão/capuz) e **só se mexe
  durante a fala**, sincronizada com a voz — duas regras distintas, as duas obrigatórias.
- Vinheta "olho se fechando": sombra esfumaçada orgânica, avança no pânico, recua na calma
  — nunca um oval sólido duro.
- A série **não usa legenda** de fala/narração — nenhum texto de diálogo na tela. Texto de
  leitura (selo "DIA X", títulos) nunca abaixo de ~28px em 1920×1080.
- Câmera majoritariamente fixa; câmera na mão só em pânico; corte seco, sem dissolve
  (exceto passagem de tempo entre dias). Push-in lento 1–1,5%/s nos planos fixos, só nas
  cenas novas (decisão 2026-11-25).
- Cartão "DIA X · N cegos" na virada de cada dia; destaque dos textos em `#e8b923`; depois
  do final, texto "INSCREVA-SE" + tela final de ~10 s (decisões 2026-11-25).
- Personagens das cenas novas: `Elenco.build(id, { refinado: true, material: "pbr" })` +
  `Elenco.vida(g, t, { ritmo })` + `Elenco.ambiente(renderer, scene)` depois das luzes;
  cenário continua toon (decisão 2026-11-25). EP1 não muda.
- Narrador: cânone confirmado, 3ª pessoa, tom de thriller, frases curtas, nunca fala por
  cima de um diálogo.

## Técnica

- Formato: 1920×1080, 16:9, 30fps. Duração-alvo 8–10 min por episódio (dívida conhecida:
  EP1 ficou em 4:54 — não é decisão a tomar sozinho).
- Luma mediana do episódio entre 85–95 (`ferramentas/medir_luma.py`); cena noturna/apagão
  pode cair a ~65–80, nunca abaixo de ~55.
- Compositions ficam em `compositions/cNN-*.html`, feitas com a skill `hyperframes`
  (ver `hyperframes.json`, `authoringSkill: "hyperframes"`) — não existe script gerador
  separado neste projeto, diferente de outros projetos do curso.

## O que NUNCA fazer sozinho (regras vindas de feedback real em produção)

- **Nunca gerar voz (TTS) em lote sem supervisão** — cada fala é cota paga e precisa ser
  ouvida e aprovada por quem pediu; já estourou cota em produção real.
- **Nunca renderizar** (episódio inteiro ou trecho) fora da etapa explicitamente pedida no
  momento — nem para "provar" uma correção.
- Nunca commitar/dar push sozinho sem ter sido pedido — e mesmo quando pedido, nunca
  commitar arquivos que pareçam segredo (`.env`, chaves).
- Qualquer cena nova ou mudança de pose/câmera/expressão é trabalho criativo: propor e
  mostrar quadros, nunca aprovar a si mesmo.
- Trocar paleta, proporção de cabeça ou olho do Gabi cego são decisões de cânone — mudam
  raramente e só por decisão deliberada do usuário.
- Nunca copiar frase, ordem de cena ou imagem do canal de referência "E Se?" — só o método.

## Metadados

Título que vende o gancho do capítulo sem spoiler do final; descrição de 2–4 frases; tom
de thriller, nunca prometendo o que o vídeo não mostra.
