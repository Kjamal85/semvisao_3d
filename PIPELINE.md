# Pipeline — semvisão 3D

Documento-mestre. Explica **como a série se produz sozinha e aprende** a cada episódio.
Quem (humano ou IA) for trabalhar num episódio começa lendo este arquivo.

---

## O loop que se autoalimenta

```
   ┌──────────────────────────────────────────────────────────┐
   │                                                          │
   ▼                                                          │
[1] BRIEFING          cânone estável da série                 │
   │  briefing/                                               │
   ▼                                                          │
[2] ROTEIRO           escrito a partir do briefing +          │
   │  episodios/      do banco de personagens (continuidade)  │
   ▼                                                          │
[3] PRODUÇÃO          animação 3D no estilo definido          │
   │                                                          │
   ▼                                                          │
[4] PUBLICAÇÃO        YouTube/TikTok, com estratégia de       │
   │                  postagem alternada                      │
   ▼                                                          │
[5] MEDIÇÃO           mesma análise quadro-a-quadro que       │
   │  aprendizado/    rodamos nos vídeos de referência        │
   ▼                                                          │
[6] APRENDIZADO       o que funcionou vira regra;             │
   │                  o banco de personagens é atualizado ────┘
   └──> volta pro [2] do próximo episódio, mais esperto
```

**O que é "estável" e o que "cresce":**

| Pasta | Papel | Muda? |
|---|---|---|
| `briefing/` | Cânone criativo (premissa, linguagem visual, assinatura de câmera) | Raramente — só por decisão deliberada |
| `personagens/` | Banco de contexto por personagem | **Cresce** — atualizado ao fim de cada episódio |
| `episodios/` | Roteiro + métricas reais de cada episódio | **Cresce** — um arquivo por episódio |
| `aprendizado/` | Benchmarks e registro do que a série aprendeu | **Cresce** — uma entrada por episódio medido |

---

## Como rodar UM episódio (checklist)

1. **Ler o cânone** — `briefing/serie-biblia.md` e `briefing/linguagem-visual.md`.
2. **Ler o estado dos personagens** — `personagens/*.md`. Quem está onde, cego ou vidente, no dia quantos, o que já foi revelado.
3. **Ler o último aprendizado** — `aprendizado/registro.md` (a entrada mais recente). Aplicar os ajustes que a série já descobriu.
4. **Escrever o roteiro** — copiar `episodios/_modelo.md`, preencher beats, metas de métrica e setups/payoffs.
5. **Produzir** no estilo de `briefing/linguagem-visual.md`.
6. **Publicar** segundo a estratégia da bíblia.
7. **Medir** — rodar a análise quadro-a-quadro (ver abaixo) e comparar com os benchmarks.
8. **Fechar o loop** — atualizar o banco do personagem (o que mudou de estado/foi revelado) e abrir nova entrada em `aprendizado/registro.md`.

---

## Como medir (reaproveitando a ferramenta de análise)

A mesma pipeline Python que analisou os 3 vídeos do canal de referência serve para
medir **os nossos** episódios. Fluxo: extração de métricas por quadro (cortes,
luminância, saturação, quente/frio, movimento de câmera) + OCR de legendas em 1 fps.

- **Relatório de referência (benchmark):** [analise_referencia/index.html](analise_referencia/index.html)
- **Metas numéricas:** `aprendizado/registro.md` → entrada "Episódio 0 — Benchmarks".

Medir cada episódio nosso com a **mesma régua** é o que faz a série "aprender":
em vez de achismo, a gente compara retenção e ritmo contra números.

---

## Índice

- [briefing/minimundo.md](briefing/minimundo.md) — **a alma: mundo vivo, personagens que sentem** (ler sempre)
- [briefing/serie-biblia.md](briefing/serie-biblia.md) — premissa, mundo, arco, estratégia
- [briefing/linguagem-visual.md](briefing/linguagem-visual.md) — cor, câmera, vinheta, vozes
- [personagens/](personagens/) — banco de contexto (continuidade)
- [episodios/](episodios/) — roteiros e métricas por episódio
- [aprendizado/registro.md](aprendizado/registro.md) — o que a série já sabe
