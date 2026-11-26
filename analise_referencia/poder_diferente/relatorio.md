# Relatório quadro a quadro — "E se você acordasse todo dia com um poder DIFERENTE?"

14:34.56 · 1920×1080 · 60 fps · 52.473 quadros. A leitura completa, segundo a segundo, está em `leitura.md`. Os números vêm de `dados/`.

## 1. Folhas
| Folhas | Onde | O que mostram |
|---|---|---|
| 6 quadros/s (história) | `folhas_6fps/` — 88 folhas de 10 s | Miniaturas com rótulo de câmera, cortes marcados, espectrograma, palavras no tempo e volume em dB por segundo. |
| Todos os quadros (momentos) | `folhas_todos/` — 18 folhas | 12 quadros por linha (0,2 s), nos momentos listados na seção 5. |

## 2. Câmera, medida quadro a quadro
A medição usa fluxo óptico com RANSAC entre quadros vizinhos (`dados/camera_quadro.csv`, com velocidade, zoom e giro por quadro).

| | Valor |
|---|---|
| Planos | **500**, separados por 499 cortes e transições, ou seja, **34 cortes por minuto** |
| Duração do plano | mediana **1,45 s** · 25% abaixo de 0,98 s · 90% abaixo de 2,95 s · só 9 planos acima de 5 s |
| Câmera parada (por tempo de tela) | 17% |
| Aproximando (zoom/dolly in) | **cerca de 70%** do tempo, com mediana de 2–4% de escala por segundo |
| Afastando | cerca de 12% |
| Pan/tilt perceptível (>1% da largura por segundo) | cerca de 35%, quase sempre **somado** à aproximação |
| Giro leve (roll) | presente em boa parte dos planos, com amplitude pequena (balanço de câmera "na mão") |
| Planos com mais de um movimento | 379 de 500, porque o movimento muda dentro do plano |

**Por bloco:**

| Bloco | Duração | Cortes/min | Plano médio | Parada | Aproxima |
|---|---|---|---|---|---|
| Abertura | 12 s | 35 | 1,7 s | 2% | 79% |
| Dia 1 Ouro | 148 s | 38 | 1,6 s | 8% | 72% |
| Dia 2 Fantasma | 160 s | 38 | 1,6 s | 12% | 61% |
| Dia 3 Portal | 100 s | 38 | 1,6 s | 12% | 76% |
| Consequências (TV) | 44 s | 33 | 1,8 s | 6% | 84% |
| Dia 4 Tempo | 130 s | 38 | 1,6 s | 14% | 70% |
| Dia 5 Sábado (desfecho) | 202 s | 35 | 1,7 s | **29%** | 52% |
| Gancho + fim | 52 s | 12 | 5,2 s | 17% | 21% |
| Anúncios (2) | 12 s + 16 s | ~4 | 12–16 s | até 96% | — |

**Regras de câmera que saem da medição:**
1. **Nenhum plano de cena fica totalmente parado.** O padrão é uma aproximação lenta e contínua (cerca de 3% de escala por segundo) com leve balanço e giro. Isso dá "vida" mesmo com o personagem parado.
2. **Quando a câmera para, é para dar peso:**
   - quando há um número na tela ("23 t", parada por 0,3 s);
   - quando há uma fala importante ("Eu só quero um menino");
   - em infográficos (o chão que empurra, parado por cerca de 4 s);
   - no desfecho emocional, em que o Dia 5 tem 29% de câmera parada.
3. **O afastamento (zoom−) é reservado para revelar:**
   - a parede de ouro inteira;
   - o bairro alinhado;
   - a sala com as telas do viral;
   - o Gui sozinho no deserto (grua para trás e para cima).
4. **Os gráficos chapados (cartões, anúncios, tela final) ficam com câmera parada.**
5. **O ritmo de corte é constante** (cerca de 38 por minuto) nas cenas de poder, cai um pouco no desfecho (35) e despenca no gancho final (12).

## 3. Como as coisas entram na tela
| Peça | Como entra | Duração da entrada | Detalhe medido |
|---|---|---|---|
| **Título "E SE…?"** (0:07) | Crossfade do plano do relógio para o cartão, com o texto um pouco maior que se acomoda (zoom−). Um "piscar" escuro de cerca de 5 quadros em 0:07.33 | 4 q fade + cerca de 0,4 s acomodando | Entra ao mesmo tempo que o som grave sobe |
| **Cartão "DIA N / PODER / DIA DA SEMANA"** | **Clarão branco de 3 quadros**, depois speed lines brancas sobre fundo azul-marinho que somem em cerca de 0,3 s. Depois fica parado. Etiqueta amarela "DIA N" inclinada e cantoneiras douradas | 9 q de transição + cerca de 1,9 s na tela | Há **cerca de 0,2 s de silêncio (−56 dB)** logo antes do efeito do poder |
| Efeito do poder sobre o cartão | Dia 1: onda de ouro líquido varre da esquerda para a direita (0,5 s) e deixa a palavra dourada com brilhos. Dia 2: o Gui fantasma cai **atravessando** o cartão. Dia 3: um portal se abre no meio da palavra e o cartão gira para fora. Dia 4: um ponteiro de relógio gira e o cartão fica cinza. **Dia 5: três barras vazias, sem efeito, em SILÊNCIO TOTAL por 2,7 s** | 0,5–1 s | O cartão é o **teaser do poder** |
| **Número/dado** ("23 t", "90 g → 1,8 kg", "≈ 2 DIAS DE TODAS AS MINAS") | Fade e escala de maior para menor em cerca de 6 quadros, no canto superior direito, amarelo-ouro com contorno escuro. Fica preso à tela **atravessando cortes** e sai com o fim da frase | 0,1 s | Entra **cerca de 3 quadros ANTES** da palavra do narrador ("23" em 36.20, o texto em 36.13) |
| Infográfico (força do chão, pulmões) | Caixa escura, ícone e texto. Pisca ou muda de cor conforme o estado (EMPURRA/DESLIGADA; pulmão azul → vermelho; contador 1, 2, 3) | Pop-in | É uma barra de estado, como em jogo |
| Ouro se espalhando | Mancha dourada com borda orgânica que cresce a partir da mão. Brilhos (✦) aparecem depois | Parede: cerca de 0,9 s. Objetos: cerca de 0,3–0,5 s | Sempre num plano aberto, com a câmera aproximando |
| Fantasma materializa | Cai do teto translúcido (0,3 s) e, ao tocar, aparece um **anel/cúpula de luz** em volta (cerca de 0,25 s). Corte logo depois | 0,6 s | O mesmo anel se repete toda vez que ele volta a ficar sólido (assinatura visual) |
| Portal | Anel azul-claro com partículas, que cresce do tamanho de uma moeda até o tamanho de uma pessoa ao longo do dia | — | Fecha num redemoinho e numa estrela de brilho |
| Tempo para | **O som corta 5 quadros ANTES do corte de imagem** (J-cut ao contrário). A imagem dessatura e as gotas ficam paradas no ar. A câmera continua aproximando devagar | Instantâneo | Silêncio de cerca de 14 s na primeira vez |
| Estrela de impacto (HQ) | Estrela amarela de 1 a 3 quadros com marca do corpo na parede | 0,2 s | Gags de pancada |
| Telas/vídeo viral | As telas aparecem uma a uma (pop) e o contador de visualizações acelera | cerca de 2 s | Sem fala |
| Telejornal | TV na parede, ou tela cheia com "● AO VIVO", tarja "URGENTE \| …" e gráfico de linha que **se desenha** e despenca na palavra "despenca" | — | Paródia de TV com vinheta "INTERVALO" que leva ao anúncio |
| Anúncios e encerramento | **Cada elemento entra exatamente na palavra que o nomeia**: "APRENDA A", depois "CRIAR ANIMAÇÕES", "assim, do zero", logo, QR, URL, "LINK NA DESCRIÇÃO ↓", botão GOSTEI, INSCREVA-SE (fica cinza como se fosse clicado) | Pop de cerca de 0,1 s | Câmera parada |
| Cartas do encerramento | 4 cartas (OURO/FANTASMA/PORTAL/TEMPO) começam apagadas e **acendem uma a uma** (cerca de 0,5 s cada) enquanto o narrador fala "qual desses poderes" | 2 s | Repetem o visual dos cartões de dia |
| Tela final | Cortina preta varre a tela (8 q) e revela o deserto, o círculo do avatar, "INSCREVA-SE" e "OUTRO EPISÓDIO DO E SE?" com 2 molduras vazias | — | **cerca de 10 s** parados para as telas finais do YouTube |

## 4. Textos na tela (todos)
| Tempo | Texto |
|---|---|
| 0:07.1 | E SE…? / VOCÊ GANHASSE UM / **PODER NOVO** / TODO DIA? |
| 0:12.1 | DIA 1 / **OURO** / SEGUNDA-FEIRA |
| 0:36.1 | **23 t** |
| 0:39.2 | ≈ 2 DIAS DE TODAS AS MINAS DO MUNDO |
| 0:45.7 | 90 g → **1,8 kg** |
| 1:01 | NOVEMBRO (calendário na cozinha, faz parte do cenário) |
| 2:23 | GAROTO DE PIJAMA TRANSFORMA TUDO EM OURO · ▶ 16 mil → 4,4 mi |
| 2:39.6 | DIA 2 / **FANTASMA** / TERÇA-FEIRA |
| 3:11.7 | 214 (número da casa) |
| 3:18.8 | FORÇA DO CHÃO / EMPURRA PARA CIMA ⇄ DESLIGADA |
| 3:25.8 | LIÇÃO: pág. 15 / TRAZER CANETA AZUL (quadro da sala) |
| 4:05 | 3ºB · FEIRA de ciências · GRÊMIO (cenário) |
| 5:19.6 | DIA 3 / **PORTAL** / QUARTA-FEIRA |
| 5:28 | SUCO (caixinhas) · 213 (casa do vizinho) |
| 5:58 | NÃO ESTACIONE |
| 6:46 | ● AO VIVO · ▶ VÍDEO DE MORADOR · BAIRRO \| O GAROTO DO PORTAL \| 21:04 |
| 6:59.2 | INTERVALO |
| 7:00.4–7:11 | APRENDA A / CRIAR ANIMAÇÕES / mesmo sem experiência / do zero / ESTÚDIO ANIMADO / animação de verdade, do zero / estudioanimado.tech / APONTE A CÂMERA / LINK NA DESCRIÇÃO ↓ |
| 7:12.7 | ● AO VIVO · URGENTE \| O PREÇO DO OURO DESPENCA · OURO (gráfico) |
| 7:16.8 | Economy / GOLD CRASHES (jornal girando) |
| 7:21.7 | **23 t** (callback dentro do flashback) |
| 7:55.3 | DIA 4 / **TEMPO** / QUINTA-FEIRA |
| 8:10 | E.E. DO BAIRRO |
| 8:35.8 | ícone de pulmões (depois 1 / 2 / 3 em 9:05–9:16) |
| 8:49.5 | FUI AO MERCADO. BEIJO, MÃE (bilhete) |
| 9:09 | BOA NOITE / AQUI É DO HOSPITAL (bilhete do golpe) |
| 10:04.9–10:20 | PAUSA RÁPIDA / ★ LANÇAMENTO / NOSSO JOGO NO ROBLOX / **DOUBLE IT!** / JOGUE NO ROBLOX / link na descrição ↓ / 👍 GOSTEI / 🔔 INSCREVA-SE / o vídeo continua já |
| 10:23.6 | DIA 5 / ▬ ▬ ▬ / SÁBADO |
| 14:03.7 | DIA 5 ▬▬▬ ? · (deserto) ? |
| 14:08.3 | DIA 1 OURO · DIA 2 FANTASMA · DIA 3 PORTAL · DIA 4 TEMPO |
| 14:12.3 | ESCREVE NOS COMENTÁRIOS ↓ |
| 14:14–14:22 | APRENDA A / CRIAR ANIMAÇÕES / assim, do zero / ESTÚDIO ANIMADO / estudioanimado.tech / LINK NA DESCRIÇÃO ↓ / DOUBLE IT! / JOGUE NO ROBLOX |
| 14:24 | OUTRO EPISÓDIO **DO E SE?** · INSCREVA-SE |

**Estilo dos textos:** fonte condensada pesada, toda em maiúsculas (estilo Bebas/Anton). Branco com o destaque em **amarelo-ouro**, sobre caixas escuras arredondadas ou fundo azul-marinho com diagonais. O itálico serifado só aparece no anúncio ("mesmo sem experiência", "assim, do zero"). **Não há legenda da fala**: o único texto é o grafismo.

## 5. Momentos lidos com todos os quadros (`folhas_todos/`)
| Folha | Achado |
|---|---|
| m01 título | Crossfade de 4 quadros. O texto entra já grande e se acomoda (zoom−) em cerca de 0,25 s. Um piscar escuro de 5 quadros em 7.33 parece "flicker" de projetor. A câmera volta a aproximar a partir de 7.77 |
| m02 cartão Dia 1 | Clarão branco de 3 q, speed lines que somem em cerca de 0,3 s, cartão parado. **Silêncio de 0,2 s (−56 dB) em 12.50–12.68**, e então a onda dourada (12.77–13.25) entra com o som |
| m03 ouro na parede | A mancha nasce na mão em 22.92 e cobre a parede em 23.67 (cerca de 0,75 s). Os brilhos ✦ aparecem nos últimos 0,2 s. A câmera aproxima o tempo todo |
| m04 "23 t" | Entra em 36.12, maior e transparente, e assenta em 36.18. A palavra "23" é dita em 36.20: **o texto vem 3–5 quadros antes da voz** |
| m06 materializa | Fantasma translúcido cai do teto (41.78–42.08), toca o sofá, o anel de luz dura 42.12–42.35, e o corte vem em 42.37, logo que o efeito acaba |
| m11 tempo para | O som desliga em 21.40 e o corte de imagem vem em 21.48 (**o som lidera por 5 quadros**). A imagem congelada continua com aproximação lenta |
| m17 cartas | Cada carta acende em cerca de 3 quadros, com 0,5–0,6 s entre uma e outra. A 1ª acende em "E" (8.52), a 2ª entre "desses" e "poderes", a 3ª em 9.55 e a 4ª em "queria" (10.05) |
| outras (m05, m07–m10, m12–m16, m18) | Prontas na pasta para conferir: cartões dos dias 2 a 5, flash do despertador, estrela de impacto, pulmões, silêncio e aplauso, vinheta "INTERVALO", fade para branco e cortina da tela final |

## 6. O que se ouve
- **Narrador:** uma voz só, calma, em terceira pessoa. Ele **explica a regra física de cada poder** ("O chão só segura a gente porque empurra de volta", "Ouro vale porque é raro", "ar parado não entra no pulmão", "O que entra num portal sai com a mesma velocidade"). Também fecha cada dia com uma frase-moral.
- **Diálogos curtos** (2 a 6 palavras), quase sempre um por plano.
- **Música:** pad contínuo por baixo de quase tudo (de −15 a −25 dB). A música de perseguição e a épica sobem no Dia 2 e no clímax do portal.
- **O silêncio é ferramenta.** Os momentos medidos:
  - 0:06 → silêncio antes do alarme;
  - 0:12.5 → 0,2 s antes do efeito do cartão;
  - 3:00 → pausa cômica da mãe;
  - **6:34–6:36 → 2 s de silêncio digital total antes do aplauso**;
  - 8:21–8:35 → o tempo parado;
  - **10:24–10:26 → cartão do Dia 5 em silêncio total**;
  - 13:42–13:45 → fade para branco.
- **Efeitos:** tique-taque, alarme em rajadas, whoosh grave nas transições, brilhos, impacto de HQ, aplausos e chuva.

## 7. Estrutura (para reproduzir)
1. **Gancho em 7 s:** a pergunta "E se…?" e o título.
2. **Cada dia segue o mesmo esqueleto:** despertador → cartão do dia → descoberta → regra explicada pelo narrador → problema em casa ou com a mãe → problema no bairro → domínio do poder → o poder vai embora à meia-noite.
3. **Ameaça crescente em paralelo:** o patrão, o mural com fio vermelho e uma foto nova por dia.
4. **Intervalos embutidos na ficção:** a TV "vai para o intervalo" (7:00) e a "pausa rápida" (10:05). Cada um dura 12–16 s e **volta no mesmo enquadramento** em que parou.
5. **Desfecho sem poder (Dia 5):**
   - checklist "ouro, não / parede, não / portal, não / tempo, não";
   - resolução pela comunidade;
   - **callbacks** de cada objeto e personagem: café do seu Osvaldo, anel, bicicleta, cachorro;
   - rima do abraço (congelado → de verdade).
6. **Gancho final:** fade para branco, deserto desconhecido e perguntas ao público com as cartas dos poderes.

## 8. O que isso muda para o nosso pipeline (para discutir, não aplicado)
- Nosso EP1 tem planos bem mais longos. A referência corta a cada **cerca de 1,5 s** e **nunca deixa a câmera morta**: a aproximação é lenta e contínua (2–4% de escala por segundo), com balanço leve.
- Números e dados como grafismo preso à tela, **entrando 3–5 quadros antes da palavra**.
- Silêncio planejado como efeito (0,2 s antes de efeitos, 2 s antes de reações).
- **Cuidados com as nossas regras:** a referência cobre a boca em 2 momentos (almofada em 6:54 e mãos em 13:50). Pela nossa regra de boca sempre visível, **não copiar isso**.
