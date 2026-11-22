# Efeitos & áudio — Ep 1

Receita dos **efeitos visuais** (feitos no software de animação) e catálogo dos
**efeitos sonoros + música** (arquivos em [`../audio/`](../audio/)).

---

## Efeitos visuais (VFX) — receitas

- **Vinheta "olho se fechando" (assinatura, modo cego):** overlay de **fumaça/sombra
  animada** invadindo as 4 bordas, com forma de pálpebra. Máscara de ruído animado (não
  um oval sólido). **Keyframes de emoção:** avança quase fechando no pânico, recua na
  calma. É o termômetro emocional do episódio.
- **Abertura em time-lapse:** luzes das janelas apagando aceleradas; o **relógio-overlay
  acelera 23:30 → 03:30**. No instante do boom: **FLASH** branco (1–2 frames de
  super-exposição) → **onda de energia** (anel que expande do horizonte) → **zoom-out**
  São Paulo → Brasil → globo apagando.
- **Relógio / local (overlay fixo):** selo no canto (local + hora) o episódio todo.
- **Reveal dos olhos brancos:** corte seco da tela preta pra 3ª pessoa; olhos
  **nublados** (cinza fosco + brilho apagado — ver model-sheet).
- **Dessaturação (modo cego):** grade de cor puxando saturação pra baixo; mundo
  esvaziando de cor.
- **Sirene varrendo a cortina:** luz azul/vermelha pulsando sobre a cortina fechada.
- **Overlays de dado:** "DIA 1 · N cegos" (topo-esquerda) e chyron da TV
  ("CEGUEIRA: VÍRUS? — casos dobram a cada dia").

---

## Efeitos sonoros (SFX)

**[gerado]** = arquivo pronto em `audio/` (rascunho sintetizado) · **[CC0]** = pegar em
biblioteca livre (ex.: Freesound, como a referência) · **[gravar/TTS]** = voz, a definir.

| Cena | Som | Fonte |
|---|---|---|
| Abertura (3h30) | zumbido grave subliminar | [CC0] |
| Boom / onda de energia | impacto grave + sweep + decay | **[gerado]** `sfx_boom.wav` |
| Despertar cego | respiração, lençol | [gravar/CC0] |
| Reveal / desorientação | zunido agudo + abafamento (tinnitus) | **[gerado]** `sfx_zunido_cegueira.wav` |
| Queda | **vidro quebrando** (abajur) | [CC0] |
| Pânico / revolta | **batimento cardíaco** | **[gerado]** `sfx_batimento.wav` |
| TV | repórter (**voz feminina**) + chiado de TV | [TTS/gravar] + [CC0] |
| Portão | batida em portão de ferro + voz da **Duda** | [CC0] + [gravar] |
| Final | sirene, passos pesados, rádio chiando, batidas na porta, clangor da van | [CC0] |

> Realistas (vidro, sirene, multidão, TV) **não** foram sintetizados — soam melhor de
> biblioteca CC0. Os sintetizados são base/temporários.

---

## Música

- **`audio/ambiente_triste_ep1.wav`** (e `.mp3`) — rascunho de **ambiente melancólico**:
  progressão Am–F–C–G, pad com leve detune (respiração), piano esparso descendente,
  drone grave e um ar de ruído. ~56 s, encorpa e **loopa**.
- **Onde usar:** cenas tristes/íntimas — adaptação pelo tato, pós-revolta, o pai
  chorando, a esperança frágil, a saída da Duda do portão.
- **Onde NÃO usar (silêncio é emoção):** o FLASH (silêncio absoluto), e o **silêncio
  estratégico** antes do sequestro final.
- ⚠️ **Rascunho** — não foi possível auditar o som aqui; é base pra você ouvir, aprovar
  ou pedir ajuste (andamento, instrumento, mais escuro/menos, etc.).
