# Regras do canal — semvisão 3D (para um agente sem supervisão)

Gerado a partir de `briefing/minimundo.md`, `briefing/serie-biblia.md`, `briefing/linguagem-visual.md`,
`episodios/_modelo.md` e do que já foi produzido e aprovado no EP1. **Fontes somente leitura** — em caso de
dúvida, elas mandam, não este arquivo. O que aqui é proposta minha e não vem literalmente das fontes está
marcado **[Proposta]**.

---

## 1. Identidade

**Tom:** thriller social de colapso gradual. **Não é comédia.** Sem herói salvador, sem resolução limpa; o
desconforto é o produto (`serie-biblia.md`).

**Logline:** apagão global (17 de novembro, 3h30) solta uma onda de energia; pessoas cegam aos poucos (2–3
por dia, nunca todas de uma vez — é a regra única que move a série). Quem enxerga trata os cegos como doentes
e os isola à força.

**Personagens fixos (EP1) — cores EXATAS do rig** (`producao/ep1/assets/rig/elenco.js`, `FICHAS`; a tabela de
`linguagem-visual.md` é só proposta inicial — o rig manda):

| Personagem | Pele | Cabelo | Roupa | Calça | Outros |
|---|---|---|---|---|---|
| Gabi (protagonista, cego) | `#c68e62` | `#241c17` (próprio) | moletom `#aed0ec` c/ capuz | `#454551` | fone `#24242a` |
| Mãe | `#f0cfb4` | `#7a5236` (rabo) | `#c9835b` | `#5d6d8c` | blush `#f0aaa6` |
| Pai | `#6e4630` | `#16110e` (crespo) | `#6f7f5a` | `#8a7a5e` | barba |
| Duda (vizinha, vai cegar na série) | `#f3d6c2` | `#e0bd72` (loira, longo) | `#f2c4d0` | `#8fa3c4` | blush `#f3aeb2` |
| Repórter (TV) | `#d9a77f` | `#1a1412` (chanel) | blazer `#7a2e3a` | `#2b2b33` | batom `#a3333f`, voz feminina |
| Agente de quarentena | `#d9b08c` | — | macacão `#e4e8eb` (EPI, sem rosto) | `#e4e8eb` | faixa `#e8b923` |

Olho cego (Gabi): nublado cinza-escuro fosco (`#6a6a71`), brilho apagado — nunca "olhos brancos" lisos (o
roteiro antigo dizia branco; o briefing e o model-sheet dizem nublado — **seguimos o briefing**; já avisado
ao usuário uma vez, não perguntar de novo).

**Estilo 3D:** low-poly cel-shaded (mesma técnica do canal de referência "E Se?", nunca copiar frase/cena/
imagem dele — só o método). Cabeça ~32% da altura (vs ~40% da referência). Contorno escuro em casca BackSide
em toda forma (`OUT = 0x1b1b20`).

**Legendas:** a série **não usa** legenda de fala/narração (decisão do usuário em 2026-11-24, já atualizada em
`linguagem-visual.md`). Nunca adicionar texto de diálogo na tela.

**Áreas seguras:** render em 1920×1080; texto de leitura (selo "DIA X", títulos) nunca abaixo de ~28 px (regra
de `check` do HyperFrames, achado real no EP1: `text_below_floor`).

---

## 2. Formato

- **Resolução/proporção:** 1920×1080, horizontal (16:9), 30 fps.
- **Faixa etária:** 14+.
- **Duração-alvo por episódio:** 8–10 min (o EP1 ficou em 4:54 — **abaixo da meta**; isso é uma dívida
  conhecida, não decisão nova a tomar sozinho).
- **Estrutura:** abertura idêntica nos eps 1 e 2 (São Paulo de cima → apaga luzes → flash/boom → câmera sobe
  até o globo todo escuro), depois POV alternado por episódio (Gabi cego no ep ímpar / Duda vidente no par).
  Episódios **montados por blocos** (ver `episodios/MONTAGEM_EP1.md` como modelo) — um mapa de blocos aprovado
  pelo usuário ANTES de produzir cena por cena.
- **Cadência de publicação:** a cada 4–5 dias, alternando POV.
- **Overlay de hora/dia:** selo fixo de canto com local + hora; na abertura o relógio acelera de 23:30 até
  3:30 (a explosão).
- **Plano de câmera:** majoritariamente fixo; câmera na mão só em pânico; corte seco, sem dissolve (fusão só
  para passagem de tempo entre dias/cenas).
- **Vinheta "olho se fechando" (modo cego):** sombra esfumaçada nas bordas, avança no pânico, recua na calma
  — nunca um oval sólido duro.
- **Narrador: CÂNONE, confirmado (2026-11-24: "narrador continua").** `linguagem-visual.md` já foi atualizado
  — a série tem narrador em 3ª pessoa, tom de thriller, frases curtas, que nunca fala por cima de um diálogo.
  Mantém-se no EP2 e nos episódios seguintes; não é mais uma decisão em aberto.

---

## 3. O que NUNCA fazer sozinho

### Limites de conteúdo e estilo
- Nada de comédia, deboche ou tom leve — quebra o tom de thriller.
- Nada de resolução limpa/heroica para o colapso — a série não promete conforto.
- Nunca copiar frase, ordem de cena ou imagem do canal de referência "E Se?" — só o método (régua de cortes,
  ritmo, medição).
- Nunca expressão facial/pose nova sem olhos que leem a emoção pedida (medo, vergonha, choro contido) — o
  rosto é simples mas tem que ser legível; ver `aprendizado/padrao-de-qualidade.md`.

### Decisões criativas que exigem o usuário (não são do agente)
- **Qualquer cena nova ou mudança de pose/câmera/expressão** é trabalho criativo — propor e mostrar quadros
  (snapshot), nunca aprovar a si mesmo.
- **Gerar voz (TTS)** — cada fala é cota paga e precisa ser OUVIDA e aprovada por quem pediu; nunca gerar em
  lote sem supervisão (já estourou cota em produção real).
- **Decidir se tem narrador ou não** — ver seção 2; é uma contradição aberta entre o briefing e uma decisão
  pontual do usuário, só ele resolve.
- **Trocar paleta, proporção de cabeça ou olho do Gabi cego** — são decisões de cânone (`briefing/`), mudam
  "raramente e por decisão deliberada".

### Gatilhos de aprovação (vêm de feedback real do usuário em produção)
- **Nunca renderizar** (episódio inteiro ou trecho) sem ordem explícita no momento — nem para "provar" uma
  correção.
- **Nunca dizer "pronto"/"conferido"** sem (a) ter aberto e olhado visualmente cada imagem/render antes, e
  (b) ter cruzado roteiro × vídeo fala por fala, SFX por SFX, música e duração.
- **A boca do personagem tem que SEMPRE estar visível** (nunca escondida por mão/capuz) e **se mexer só
  durante a fala**, sincronizada com a voz — duas regras distintas, as duas obrigatórias em toda cena com
  personagem de rosto.
- **Nunca commitar/dar push sozinho** sem ter sido pedido — e mesmo quando pedido, nunca commitar arquivos
  que pareçam segredo (`.env`, chaves).
- Ao retomar uma sessão: ir direto ao que falta, mas **os 3 arquivos do cânone (minimundo.md, serie-biblia.md,
  linguagem-visual.md) sempre se leem**, nunca entram no "não precisa reler".

---

## 4. Fatos

A série não lida com fatos do mundo real a checar (é ficção original), mas tem **continuidade interna** que
funciona como "fato" e precisa de fonte:
- Estado de cada personagem (cego ou não, que dia, o que já foi revelado) vem só de `personagens/*.md` —
  nunca inventar continuidade nova sem atualizar esses arquivos ao fim do episódio.
- Medidas técnicas (luma-alvo ~85–95, duração de plano mediana 4–5 s, etc.) vêm só de
  `aprendizado/padrao-de-qualidade.md` e `linguagem-visual.md` — nunca de memória solta.
- Se uma cena pedir um fato que não está em nenhuma fonte listada abaixo (ex.: uma regra de física do apagão
  nunca definida), **parar e perguntar** em vez de inventar cânone novo.

---

## 5. Fontes que mandam em caso de dúvida (somente leitura)

1. `briefing/minimundo.md` — a alma: mundo vivo, personagens que respiram (piscar, peito, micro-movimentos).
2. `briefing/serie-biblia.md` — premissa, mundo, arco, estratégia, formato.
3. `briefing/linguagem-visual.md` — estilo 3D, vinheta, câmera, paleta-proposta, régua técnica.
4. `producao/ep1/assets/rig/elenco.js` (`FICHAS`) — cores EXATAS dos personagens (manda sobre a paleta em
   prosa do item 3).
5. `personagens/*.md` — estado e continuidade de cada personagem.
6. `aprendizado/padrao-de-qualidade.md` e `aprendizado/registro.md` — régua de qualidade e o que a série já
   aprendeu.
7. `episodios/_modelo.md` — modelo de roteiro; `episodios/MONTAGEM_EP1.md` — modelo de mapa de montagem por
   blocos.
8. `PIPELINE.md` — o loop e o checklist por episódio (passo 1 cita as 3 fontes do item 1–3 acima).

---

## Pendências que este mapeamento encontrou (não resolvidas aqui, de propósito)

- **Duração-alvo:** EP1 ficou em 4:54, meta é 8–10 min.
- Regras de produção hoje só na memória de sessão do agente (não no repo) foram trazidas pra cá pela primeira
  vez na seção 3 — revisar se bate com o que o usuário realmente quer antes de confiar nisso para automação.
