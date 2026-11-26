# Estúdio — fila, cronograma e produção automatizada

Conduz cada vídeo da ideia até o arquivo pronto para você conferir e postar, reaproveitando os
scripts dos dois projetos. Não publica nada nas redes: o cronograma é o seu planejamento.

```
ideia / briefing / roteiro
  → Preparar pasta → Roteiro (agente) → [Revisão do roteiro]
  → Voz (script) → Cenas (agente) → Montagem e checagem (script) → Prévia (render rascunho)
  → [Revisão da prévia] ──correção──→ Correção (agente) → Voz → Montagem → Prévia → …
  → Render final (script + masterização) → Título/descrição/tags (agente)
  → [Aprovação final] → Entrega (pasta pronta) → você posta → "Marcar como publicado"
```

## Abrir

```powershell
cd [PASTA_DOS_PROJETOS]\estudio
node src/iniciar.mjs --abrir      # interface + executor em segundo plano, abre http://127.0.0.1:4380
```

Fechar o navegador não para nada. Fila, etapas, pareceres e horários ficam em `dados/estudio.db`
(SQLite) e sobrevivem a reinícios. Para parar o executor: **Configurações → Parar executor**.

## Como funciona

| Peça | Arquivo | O que faz |
|---|---|---|
| Interface | `src/servidor.mjs`, `web/` | Fila, cronograma, cadastro, decisões, players, metadados, arquivos, histórico. Só escuta em 127.0.0.1. |
| Executor | `src/executor.mjs` | **Uma produção e uma etapa por vez.** Batimento no banco; recuperação após queda. |
| Fluxo | `src/pipeline.mjs` | Etapas, portões de revisão, correções, tentativas e limites. |
| Perfil 2D | `src/perfis/perfil-2d.mjs` | Cria `producao/epNNN-nome/` a partir do `_modelo-episodio` + kit do EP001 e usa `tools/voz.mjs`, `build.mjs`, `master.mjs`, `sfx.py`. |
| Perfil 3D | `src/perfis/perfil-3d.mjs` | Tarefas sobre o `ep1` (`ep1/tarefas/<nome>/`) com `gerar-vozes.mjs`, `gerar-composicoes.mjs`, `render-partes.sh`, `juntar.sh`, `montar-indice.mjs`. |
| Agente | `src/agente.mjs` | `claude.exe -p` (modo headless oficial do Claude Code). |
| Regras | `regras/` | `processo.md` (vale para todo agente), `canal-2d.md`, `serie-3d.md`, `criterios.json` (critérios de cada portão). |
| Prompts | `prompts/` | Um por etapa de agente e um para o revisor. |
| Config | `config/estudio.json` | Limites, modelos, modos de revisão padrão, caminhos. Sem segredos. |

### Agente: autenticação, limites e custos

- O executor chama o `claude.exe` (o que vem com a extensão do VS Code; acha a versão mais
  nova sozinho, ou use a variável `CLAUDE_EXE`) com `-p`, prompt pelo stdin, resposta em JSON
  validado por esquema. **A conversa aberta no VS Code não é usada**: cada etapa é um processo
  independente.
- Autenticação: o login salvo da sua **assinatura Pro** (`claude auth status`). O executor remove
  `ANTHROPIC_API_KEY` do ambiente, então nunca cobra por API sem você saber. Os logs mostram
  `origem da chave: none` em cada sessão.
- Custo: sem cobrança extra. O "custo estimado" nas execuções é o equivalente em preço de API,
  só para comparar etapas (o Short de teste de 18 s deu ≈ US$ 7,8 equivalentes, sendo ≈ US$ 4,4 na etapa Cenas).
- Limites: as janelas de 5 h e o teto semanal da assinatura são **divididos com o seu uso no VS
  Code**. Ao bater o limite, a tarefa pausa com o motivo ("Limite de uso do Claude atingido").
- Modelos por etapa em `config/estudio.json` (`opus` para roteiro/cenas/correção, `sonnet` para
  revisões e metadados). Trocar `cenas` para `sonnet` economiza limite, com risco na qualidade.
- Permissões do agente: lista fechada por etapa (ler/escrever na pasta do conteúdo, `node
  tools/build.mjs`, `npx hyperframes check/snapshot`, `python tools/sfx.py`, `ffprobe`). Voz,
  render, preview, git e leitura de `.env` são negados (`config/agente-settings.json`).

### Revisão: humana × subagente

Cada conteúdo escolhe, por portão (roteiro, prévia, final):

- **Humano**: a tarefa pausa ("Aguardando você") e mostra o material e os botões Aprovar / Pedir correção.
- **Subagente**: outro `claude -p`, só com leitura, avalia pelos critérios de `regras/criterios.json`
  e decide. Aprovou → segue ("aprovação automática"); pediu correção → volta para Correção.
  Um critério **bloqueante** não atendido nunca vira aprovação automática.
- **Subagente + humano**: o parecer fica registrado e a decisão é sua.

Os pareceres ficam no banco e em `<pasta do conteúdo>/revisoes/*.md|json` com os critérios usados.
A interface marca cada portão como **aprovação automática** ou **aprovação humana**.

Quando o agente não pode decidir sozinho (ex.: um fato do roteiro contradiz as fontes), a etapa
para com `bloqueado` e a interface mostra a pergunta com um campo **Responder e continuar**.

### Limites e proteção contra laços

| Limite | Padrão |
|---|---|
| Tentativas por etapa (erro comum ou tempo esgotado) | 3, com espera de 1 e 5 min; o mesmo erro duas vezes seguidas para antes |
| Rodadas de correção automática | 3; depois, decisão humana |
| Execuções de agente por produção | 30 (então pausa pedindo revisão) |
| Tempo máximo por etapa | de 5 min (preparar) a 90 min (render final) |
| Turnos do agente por etapa | 20 a 150 |
| Retomadas automáticas após limite de uso/cota | 3 por etapa |

Limite de uso do Claude, login pendente, cota de voz do Gemini ou decisão necessária **pausam** a
tarefa com o motivo visível. "Tentar novamente" zera os contadores daquela etapa.

### Não refazer voz e render

Cada etapa concluída guarda uma impressão digital das entradas. Voz só é refeita se o texto
falado ou a voz mudarem; prévia e render final só se cenas/assets mudarem. Depois de uma correção,
a etapa Cenas não é refeita (a correção ajusta as cenas existentes). Na interface aparece como
"reaproveitada".

### Queda, reinício e órfãos

O executor registra a árvore de processos de cada etapa (render, Chrome, ffmpeg, agente) com o
horário de criação. Se ele cair ou o PC reiniciar, ao voltar ele encerra os órfãos que ainda
existirem e a etapa interrompida volta como **Pausada (interrompida)**, preservando o que já foi
concluído.

## Duas autorizações separadas

| O quê | Padrão | Ligar | Desligar |
|---|---|---|---|
| **Iniciar interface + executor com o Windows** (após seu login) | desligado | Configurações → "Abrir a interface e o executor após o meu login", ou `powershell -ExecutionPolicy Bypass -File scripts\inicializacao.ps1 -Acao ativar` | desmarcar, ou `-Acao desativar` (apaga `Estudio-Video.vbs` da pasta Inicializar) |
| **Retomar produções sozinho** (interrompidas e pausadas por limite) | desligado | Configurações → "Autorizar o executor a retomar sozinho" | desmarcar |

Com a primeira ligada e a segunda desligada, o PC inicia o Estúdio, mas nada recomeça sem você
clicar em **Retomar**. Produções que você mesmo colocou na fila (status "Na fila") seguem
normalmente. Para impedir até isso: Configurações → **Suspender a fila**.

## Entrega

`entregas/<data>-<nome>/` (fora do Git) com `<nome>_final_vNN.mp4`, `publicacao.md`,
`metadados.json`, `capa-sugerida.jpg` e `LEIA-ME.txt` (checklist do episódio). O MP4 também é
copiado para `producao/<ep>/export/` (2D). Editar título/descrição/tags na interface atualiza o
`publicacao.md` do conteúdo e da entrega.

## Segredos

- Chaves ficam só nos `.env` dos projetos (ignorados pelo Git). O Estúdio lê esses arquivos para
  entregar a chave de voz **só** ao script de voz e para apagar qualquer valor delas dos logs.
- A interface, a API, os logs e o banco nunca mostram chaves (testado: 0 ocorrências em 118
  arquivos depois da produção de teste). `dados/` e `entregas/` estão no `.gitignore`.

## Testes

```powershell
node testes/simulado.mjs    # fluxo completo com etapas simuladas, num banco à parte (~2 min, sem custo)
```

Cobre: correção pedida pelo subagente, nova tentativa após falha, portão humano, pausa,
cancelamento, queda do executor com e sem retomada automática, órfão encerrado na recuperação,
voz não refeita, limite de tentativas, segurança da API, redação de chaves e persistência.

## Problemas comuns

| Sintoma | O que fazer |
|---|---|
| "Executor parado" | Configurações → Iniciar executor (ou `node src/iniciar.mjs`). Log: `dados/logs/executor.log`. |
| "Autenticação do Claude pendente" | Num terminal: `claude auth login` (ou abra o Claude Code no VS Code e faça login). Depois, Tentar novamente. |
| "Limite de uso do Claude atingido" | Espere a janela liberar e clique em Retomar (ou ligue a retomada automática). |
| "Cota da voz (Gemini) esgotada" | Plano gratuito: 3/min, 10/dia. Retome mais tarde; os lotes prontos não são refeitos. |
| 3D: "Há alterações não commitadas em ep1/" | Faça commit (ou descarte) e clique em Tentar novamente. O Estúdio não mistura o trabalho dele com o seu. |
| Agente atualizado e o Estúdio não acha o `claude.exe` | Defina `CLAUDE_EXE` ou `claude_exe` em `config/estudio.json`. |
