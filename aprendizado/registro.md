# Registro de aprendizado — semvisão 3D

O que a série já sabe. **Uma entrada por episódio medido.** A entrada mais recente é a
que o próximo roteiro deve respeitar. É aqui que a pipeline "fica mais esperta".

Como usar: ao fim de cada episódio, medir com a análise quadro-a-quadro, comparar com
a entrada anterior e os benchmarks, e escrever uma entrada nova no topo.

---

## Episódio 0 — Benchmarks (dos vídeos de referência)

Régua de partida, extraída da análise dos 3 vídeos do canal "E Se?"
(relatório completo: [analise_referencia/index.html](../analise_referencia/index.html)).
São o *método*, não o conteúdo — nosso tom é próprio.

**O vídeo mais visto da referência (1,78 M) ensinou:**
- Ritmo acelerado: **16,2 cortes/min**, duração mediana de plano **3,2 s**.
- Câmera **parada** (54% fixo) — o movimento vem do corte, não do travelling.
- **Mais locações** (20) que os vídeos menos vistos.
- Legenda de dado fixa no **topo-esquerda**; legenda de fala no baixo/centro.
- Narração ~120 palavras/min; corte seco, sem dissolves.

**Nossa régua adaptada ao thriller (ponto de partida — validar com dados reais):**
| Métrica | Referência | Nossa meta inicial |
|---|---|---|
| Duração mediana de plano | 3,2–4,0 s | **4–5 s** (horror respira) |
| Cortes/min | 11–16 | **10–15** |
| Luma mediana | 108–135 | **85–95** (mais escuro) |
| Saturação | 33–45% | **mais baixa** (mundo esvaziando de cor) |
| Câmera fixa | 54% (mais visto) | **manter alta**; mão só em pânico |

> Estas metas são **hipóteses**. A partir do ep 1 medido, substituímos achismo por
> evidência: se cortar mais rápido retiver melhor, a régua muda — e fica registrado aqui.

---

<!-- Modelo de entrada nova (copiar para o topo a cada episódio):

## Episódio N — [título] — medido em [data]
- **Resultado:** views 7d/30d, retenção, ponto de queda.
- **Métricas:** cortes/min __, plano mediano __ s, luma __.
- **O que funcionou:**
- **O que ajustar no próximo:**
- **Virou regra?** (sim → qual; atualizar briefing/linguagem-visual.md se for permanente)

-->
