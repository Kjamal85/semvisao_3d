# Linguagem visual — semvisão 3D

A assinatura da série. Dois modos de imagem + um truque de câmera que vira marca.

---

## Estilo 3D e design dos personagens

- **Técnica:** **low-poly com cel-shading** (sombreamento chapado, não realista) — o
  **mesmo estilo do canal de referência "E Se?"**. Cenários de formas simples, cores
  sólidas/gradientes, uma luz direcional com sombra limpa.
- **Personagens em PBR, cenário em toon** (decisão do usuário, 2026-11-25, a partir do EP2):
  - os personagens usam o rig refinado com material PBR:
    `Elenco.build(id, { refinado: true, material: "pbr" })`;
  - os cenários continuam cel-shaded (toon em 3 faixas);
  - o contorno preto continua nos dois;
  - para o boneco não parecer colado, o reflexo do PBR **nasce das luzes da cena**: chamar
    `Elenco.ambiente(renderer, scene)` depois de pôr as luzes;
  - o EP1 aprovado continua todo em toon e não muda.

  Testado no portão (fim de tarde) e no quarto (noite): a luminosidade ficou na meta e o rosto
  ficou mais legível no escuro que o toon.
- **Proporção da cabeça:** **~20% menor** que a da referência (lá a cabeça é ~40% da
  altura; nosso alvo ~32%). Deixa o personagem um pouco menos "fofo/cartum" e um pouco
  mais adolescente e humano — combina com o tom de thriller.
- **Rosto simples, porém EXPRESSIVO (chave do projeto).** Mantemos o rosto minimalista
  do estilo, mas **rigado para emoção**: olhos que abrem/estreitam/fecham,
  sobrancelhas, formas de boca. O "E Se?" já emociona com rosto simples — nós
  garantimos que esse rig dê conta das emoções mais pesadas do thriller (medo,
  vergonha, choro contido). **Não é outro estilo de arte — é o mesmo visual, com o
  rosto capaz de sentir.**
- **O sentimento não vem só do rosto.** Rosto legível **+ corpo + respiração + câmera
  + vinheta + som + timing/silêncio** (ver [minimundo.md](minimundo.md)). O rosto é uma
  peça; o corpo e o som fazem a maior parte.
- **Caso especial — Gabi cego:** os **olhos nublados** (cinza-escuro fosco com brilho
  apagado) tiram dele a ferramenta do olhar.
  A emoção dele passa a vir ainda mais do corpo, da respiração e da vinheta. A ausência
  de olhar é uma força dramática, não um problema — ela dói.

---

## Abertura padrão (idêntica nos eps 1 e 2)

1. São Paulo vista de cima, 23h30.
2. A cidade apaga as luzes aos poucos — prédios, janelas, ruas.
3. Flash. Boom.
4. A câmera **sobe**: São Paulo apagada → Brasil apagado → globo terrestre todo escuro.

Repetir a abertura idêntica nos dois primeiros episódios cria ritual e reforça que é
o **mesmo evento** visto por pessoas diferentes.

---

## Dois modos de imagem

### Modo CEGO (episódios do protagonista)
- **Vinheta "olho se fechando" (assinatura).** Não é uma máscara preta dura e redonda.
  É uma **sombra esfumaçada** que invade a tela pelas quatro bordas, com a forma de uma
  **pálpebra/olho se fechando** — como se o olho do próprio espectador fechasse junto
  com o Gabi. Bordas suaves, orgânicas, levemente em movimento (como fumaça).
- **Dinâmica:** a sombra **avança** no medo/pânico (chega a quase fechar o quadro) e
  **recua** um pouco quando ele se acalma ou se concentra num som. Ela respira com ele.
- **Cores dessaturadas** dentro do que ainda resta visível.
- Objetivo: o espectador **sente a cegueira junto com ele**.
- Apoiar no som: tato, tropeços, respiração, sirenes fora de quadro.
- _Técnica: overlay de vinheta com máscara de ruído/fumaça animada, não um oval sólido.
  Fechar/abrir por keyframe conforme a emoção da cena._

### Modo VIDENTE (episódios da vizinha)
- **Imagem limpa, cores vivas, qualidade total.**
- **Gatilho de tensão:** quando as bordas *dela* começam a escurecer = ela vai cegar.
- O espectador **percebe antes dela**. Essa antecipação é a emoção do modo vidente.
- A cor-assinatura dela **dessatura** conforme a cegueira se aproxima — a imagem
  perde vida à medida que ela perde a visão.

---

## O truque da câmera (assinatura da série)

Mesmo recurso, resultado oposto. Vira marca registrada.

- **Ep 1:** tela preta → parece a visão dele abrindo os olhos → a câmera vira → ele
  tem **olhos brancos**. É cego. O espectador foi enganado.
- **Ep 2:** tela preta → parece mais um cego acordando → a câmera vira → é **ela**,
  enxergando. Expectativa invertida de novo.

Toda abertura de POV usa a tela preta como isca. O que a câmera revela ao virar é o
que define o episódio.

---

## Paleta (proposta inicial — ajustável)

Cores são decisão do criador; estes são os tokens de partida.

| Elemento | Cor de partida | Razão |
|---|---|---|
| Gabi (cego) | Moletom **azul bem claro** (capuz); pele morena, cabelo escuro | Calor humano, vulnerabilidade |
| Duda (vidente) | **Rosa claro** que **dessatura** rumo à cegueira; pele clara, loira | A cor drena junto com a visão |
| Equipe de quarentena | Azul-ardósia frio (macacão/hazmat, **mais escuro** que o azul do Gabi) | Desconfiança, institucional |
| Ambiente geral | Cinza-azulado dessaturado | Mundo esvaziando de cor |

## Vozes / narração

- **Narrador em 3ª pessoa** (decisão do usuário em 2026-11-23, aprovado no EP1 em
  2026-11-24 — "gostei, bom trabalho"; mantém-se no EP2 e daqui em diante). Tom de
  thriller, frases curtas, conta a história **só onde os personagens não estão
  falando** — nunca por cima de um diálogo. Cada personagem continua tendo a
  **própria voz**; o narrador é um terceiro elemento, não substitui o diálogo nem a
  condução por tato/respiração/som de ambiente.
- Isso reforça a imersão: no modo cego, o som (diálogo + narrador + ambiente) é quase
  um personagem.
- **TV / notícias:** uma **repórter (voz feminina)** dá a notícia do apagão e, depois,
  do medo de vírus/contágio. É a "voz do mundo lá fora" entrando na casa.

## Metas técnicas (régua da série)

Calibradas a partir da [análise de referência](../analise_referencia/index.html) e
adaptadas ao thriller:

- **Duração de plano:** mediana **4–5 s** (mais lento que a referência de ~3,3 s; o
  horror respira). **Burst de 0,1–0,5 s** só em conflito/pânico.
- **Luminância:** mais escura — alvo **~85–95** de luma (a referência mais sombria
  ficou em 108). Cenas de quarentena e noite podem ir abaixo.
- **Câmera:** maioria **fixa** (a referência mais vista usa 54% de plano fixo). O
  movimento vem do corte, não do travelling. Câmera na mão só em pânico.
  **Push-in lento** (decisão do usuário, 2026-11-25): o plano "fixo" respira com uma
  aproximação quase imperceptível de **1–1,5% de escala por segundo**, sem balanço, com
  ease — **só nas cenas novas** (o EP1 aprovado não muda). Sem pan/trilho: continua "fixo".
  A medição quadro a quadro mostrou que o "fixo" da referência também é assim (2–4%/s).
- **Corte:** seco. Sem dissolve. Fusão só para passagem de tempo entre dias.
- **Overlay/contador:** topo-esquerda, no lugar do "DIA X · FORÇA Y" da referência,
  usar **"DIA X · N cegos"**. Fonte bold grotesca, ~25–31 px em 720p.
- **Relógio / local (overlay fixo):** um selo no canto (local + hora) aparece o tempo
  todo. Na abertura, o tempo **acelera de 23:30 até 03:30** (a explosão) e depois o
  relógio segue marcando as horas. Device **próprio da série** — a referência usa selos
  de dado no canto (ex.: velocímetro/contador), mas não um relógio corrido acelerando.
- **Sem legenda de fala.** Decisão do usuário (2026-11-24): a série não usa legenda de
  diálogo/narração — a emoção passa por voz, som e imagem, não por texto na tela.
- **Cor de destaque dos textos** (decisão do usuário, 2026-11-25): **`#e8b923`** (o
  amarelo da faixa do agente de quarentena) — texto em branco, a palavra-chave nesta cor,
  sobre caixa escura arredondada.
- **Cartão de dia** (decisão do usuário, 2026-11-25): na **virada de cada dia**, um cartão
  sóbrio em tela cheia **"DIA X · N cegos"** — fundo escuro, sem speed lines nem clarão,
  ~2 s, com ~0,2 s de silêncio antes. Não substitui o selo fixo do canto.
- **Fim do episódio** (decisão do usuário, 2026-11-25): depois do final (frase do
  narrador + gancho), um texto **"INSCREVA-SE"** e uma **tela final de ~10 s** (espaço para
  as telas finais do YouTube), sobre um plano do próprio episódio. Sem perguntas ao público
  por enquanto.
- **Duração-alvo e ritmo de corte** continuam os da régua acima e da bíblia (decisão do
  usuário, 2026-11-25: manter até medir um episódio nosso publicado).
