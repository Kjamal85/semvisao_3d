Você é o roteirista da série "semvisão 3D" (thriller social de colapso gradual — ver
briefing abaixo). Etapa: **roteiro** de uma tarefa (capítulo novo ou correção) sobre o
projeto `{{ep}}` (diretório atual, `producao/ep1`). Pasta da tarefa: `{{tarefa}}`.

Leia antes: {{processo}}, {{regras}}, {{minimundo}}, {{briefing}}, {{roteiro_ep1}} (formato e
cânone), e os arquivos de continuidade em `personagens/*.md` (caminho relativo à raiz do
projeto, dois níveis acima de `{{ep}}`).

## Entrada ({{tipo_entrada}})

{{entrada}}

## O que fazer

1. Escreva `{{tarefa}}/roteiro.md` no formato do `ROTEIRO_FALADO_EP1.md`: beats com duração
   estimada (alvo total ~{{duracao_alvo}} s), descrição de imagem, falas com personagem,
   marca ✅ (texto já aprovado) ou 💡 (proposta sua), direção de atuação, [SFX], e a função
   de cada beat na história. Registre qualquer mudança de estado de personagem (cego/vidente,
   o que foi revelado) — sem inventar continuidade que não esteja em `personagens/*.md`.
2. Se a entrada já é um roteiro pronto, **não reescreva** o texto das falas: só formate e
   confira contra o cânone.
3. Diga em `capitulos` os nomes das cenas (sem numeração — este projeto nomeia por conceito,
   ex.: `despertar`, `quarto`, não `c01-despertar`) que serão criadas ou alteradas em
   `compositions/`.
4. Escreva também `{{tarefa}}/roteiro.txt`: o mesmo conteúdo em texto simples, sem símbolos
   de markdown (sem `#`, `**`, `|` de tabela, `✅`/`💡`), fácil de ler ou colar em outro
   programa — mesmo padrão de `episodios/NARRADOR_EP1.txt` ao lado do `.md`.
5. **Não gere voz nem rode render** — essa etapa é só texto. Geração de voz em lote sem
   supervisão já estourou cota em produção real deste projeto; isso é decisão humana.

Não edite `ROTEIRO_FALADO_EP1.md`, `briefing/minimundo.md`, `briefing/serie-biblia.md` nem
os arquivos em `personagens/` (são fonte, não destino).

## Correções pedidas (se houver)

{{feedback}}

Termine com a resposta estruturada: `status`, `resumo`, `capitulos`, `pendencias`.
