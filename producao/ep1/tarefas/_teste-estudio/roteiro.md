# Roteiro falado: EP2 "VIDENTE" (aprovado · r11 com as decisões 1–4)

Fonte: [brief do ep 2](../../../../episodios/ep02-vizinha.md) · [roteiro falado EP1](../../../../episodios/ROTEIRO_FALADO_EP1.md) ·
[narrador EP1](../../../../episodios/NARRADOR_EP1.md) · [minimundo](../../../../briefing/minimundo.md) ·
[Duda](../../../../personagens/vizinha.md) · [Gabi](../../../../personagens/protagonista.md) ·
[pais](../../../../personagens/pais-do-gabi.md) · **o seu texto da história do ep 2** (fonte principal dos beats).

**Decisões já tomadas (2026-11-24 e 2026-11-26):** episódio completo, **~5:27**, **confirmado por você
em 2026-11-26** (decisão 6, fechada: fica acima dos ~10 s do pedido da etapa, dentro do brief do ep 2 e
abaixo dos 8–10 min da regra da série, por escolha sua) · PT-BR ·
mesmo Dia 1 do EP1, pelo ponto de vista da Duda · **com narrador**, igual ao EP1: 3ª pessoa, tom de
thriller, frases curtas, nunca por cima de fala · sem legenda · overlay só **"DIA 1"** · distância
entre as casas = a de `compositions/rua.html` (**do outro lado da rua, na diagonal**) · plano-espelho =
**plano 68** do EP1 (cena `levam`) · ~~final = "Naquela noite, a Duda viu tudo... Por enquanto."~~
**final novo (2026-11-27): corte seco na van aberta com o Gabi dentro, sem narrador** (cena `duda-van`) ·
piscar/respirar **só nas cenas `duda-*`** · produção dentro de `producao/ep1` · **mãe da Duda no
cânone aprovada por você em 2026-11-26** (decisão 5, fechada: a ficha entra no pós-publicação).

**Decisões 1–4 respondidas em 2026-11-27** (a trava de vozes e quadros caiu):
1. **B: o vizinho é levado depois do almoço.** O EP1 mudou para bater: o selo da cena `vizinho` virou
   **"+5 HORAS"** (07:40 + 5 h = ~12:40) e o narrador `n06` virou **"Horas depois, eles chegaram à rua do
   Gabi."** (o `.wav` precisa ser regravado; o EP1 precisa ser renderizado de novo, só com a sua ordem).
2. **Casa térrea**, como está.
3. **As 11 falas novas aprovadas, com a opcional `ep2-duda-07`.** A voz da mãe da Duda é o perfil
   `mae_duda` do VoiceStudio.
4. **Fim novo:** depois que a tela dela apaga, corte seco para a porta da van se abrindo com o Gabi
   dentro; ele vira o rosto para o barulho e os olhos nublados terminam apontados para quem assiste,
   sem ver; corte seco, acaba. **Sem narrador no fim** (o `ep2-narrador-n04` saiu).

**Como ler**
- **ID** = `ep2-personagem-número` nas falas novas. As falas **reaproveitadas** mantêm o ID e o `.wav`
  do EP1 (todos conferidos em `producao/ep1/voz/audio/`). Na cena nova só muda o tratamento na pós.
- ✅ = texto **já aprovado**, palavras intocadas (cânone do EP1, ou aprovado por você em 2026-11-24).
- 💡 = **proposta**, precisa do seu ok. As falas 💡 de personagem saem **do seu texto**; só ajustei
  a ortografia e o jeito de falar. Nenhuma tem voz gerada.
- **Direção** = como a fala deve soar (não é falada). **Na tela** = o que aparece.
- ⚡ = pico de tensão **sem voz**. [SFX] = efeito sonoro. **Função** = o que o beat faz na história.
- Respiração, engolir em seco e passos **não** são voz gerada: são gravados ou de biblioteca CC0,
  como no EP1.

**Regras que valem em todo o episódio** (combinados do fechamento do EP1)
- **Respirar e piscar (só nas cenas `duda-*`):** todo personagem em quadro tem o peito subindo e
  descendo e pisca (~0,12 s) a cada 3–5 s, com ritmo **próprio por personagem** e **determinístico**
  (sem `Math.random`). A respiração muda com a emoção: curta no medo, suspensa na tensão, funda no
  alívio. Vale para a Duda, a mãe dela, a família do Gabi e os figurantes. Nos agentes de máscara,
  só o peito. No rig (`assets/rig/elenco.js`), isso é o **`Elenco.vida(g, t, { ritmo, fase })`**,
  chamado **só pelas cenas `duda-*`** (ritmo `calmo`, `medo`, `tensao` ou `alivio` conforme o beat;
  `fase` diferente por personagem para ninguém piscar junto). As cenas do EP1 não chamam e
  continuam idênticas.
- **Boca:** só mexe **durante a própria fala**, sincronizada com o `.wav`, e **nunca fica escondida**.
  Pesa em três lugares: no **banheiro** (a escova e as mãos nunca tapam a boca com o rosto em quadro),
  no **choque da TV** e no **clímax** (a Duda **não** leva a mão à boca; o choque vai para o corpo
  travado, a mão na grade e a respiração).
- **Modo VIDENTE:** imagem nítida, cores vivas, **sem vinheta** "olho se fechando" e sem
  dessaturação. A blusa rosa clara da Duda **ainda não** dessatura. Luma alvo ~110–125 de dia; a noite
  escurece, mas não chega ao breu do modo cego.
- **Câmera:** majoritariamente fixa; câmera na mão **só no clímax**. Corte seco; fusão só na passagem
  de tempo, com selo de hora, como no EP1. Ritmo ~12–15 cortes/min, plano mediano de 3,5–4,5 s.
- **Mapa de montagem por blocos** antes de produzir. Este roteiro já vem dividido nos 5 blocos
  (abaixo), com o tempo de cada beat. O mapa em si (planos, cortes e tempo de cada plano, bloco por
  bloco) é feito na próxima etapa, antes de qualquer cena `duda-*`. **Render só quando você mandar.**

> ⚠️ **Dois ajustes de continuidade** (ver "Decisões", itens 1 e 2):
> 1. **O vizinho é levado depois do almoço** (decisão 1 = B, 2026-11-27), como no seu texto. Para bater,
>    o EP1 mudou: o relógio de parede da sala do Gabi marca **07:40** (`sala.html`) e a cena `vizinho.html`
>    agora tem o selo **"+5 HORAS"** (era "+1 HORA"), ou seja, ~**12:40**. A Duda arruma o quarto,
>    almoça e lava **a louça do almoço** antes da sirene; a tarefa vem **depois** do vizinho.
> 2. **A casa da Duda é térrea** (`rua.html`: "casa térrea", muro baixo com portãozinho de grade, a
>    janela da frente com cortina rosa). Por isso, onde o seu texto diz "desce" e "sobe", aqui está
>    "vai até a cozinha" e "volta pro quarto". Nenhuma fala usa "descer" ou "subir".

**Correções da revisão r0, aplicadas (2026-11-24).** Nenhuma fala mudou de texto.
1. **`duda-fim` e decisão 4:** ficou registrado que o fim sem vinheta não contraria `vizinha.md`.
   As bordas dela escurecendo são da cegueira futura, e o brief do ep 2 diz que elas **ainda não**
   escurecem neste episódio.
2. **`duda-vizinho` / `ep2-duda-04`:** conferi o "Não vi movimento na casa dele" contra o EP1
   (`vizinho.html`). A fala continua igual. A imagem foi ajustada para não criar fato novo (ver a
   nota de continuidade no beat).
3. **Decisões antes de voz e quadros:** nenhuma voz nova nem quadro de aprovação antes de você
   responder às decisões 1–6 (ver "Decisões que precisam do seu ok").

**Correções da revisão r1, aplicadas (2026-11-24).** Nenhuma fala mudou de texto.
1. **Duração:** o pedido da etapa fala em "alvo ~10 s", mas o brief do ep 2 pede 4:30–5:30 e este
   roteiro segue a decisão de episódio completo (~5:27). A divergência virou a **decisão 6**: você
   confirma, e nada é produzido antes disso.
2. **`duda-tv`, a pausa do choque:** ficou escrito no beat que, depois do `ep2-reporter-03`, há
   **~4 s sem nenhuma fala** (nem da mãe nem da Duda), só a TV baixinha e a respiração. Só depois
   entra a despedida da mãe. O tempo da pausa entra no mapa de montagem do bloco 2.
3. **Fatos do EP1, conferidos nos arquivos:** planos 37–41 (cortina, fresta, vizinho), 59–60 (portão,
   a olhada para a janela) e 68–69 (exterior com "ao fundo, a janela da Duda"; a porta da van bate)
   batem com `episodios/ep01-protagonista.md`. O `c05-radio-01` bate com `ROTEIRO_FALADO_EP1.md` e
   `compositions/vizinho.html`, e o `narrador-n13` com `NARRADOR_EP1.md`.

**Correções da revisão r2, aplicadas (2026-11-26).** Nenhuma fala mudou de texto.
1. **`duda-sirene`, respiro antes do agente:** ficou escrito no beat que, depois do **TUM-TUM-TUM**,
   há **~1–2 s sem nenhuma fala** (só a sirene, a luz varrendo o quarto e a respiração suspensa da
   Duda) antes do `c10-agente-01`. Cabe dentro do tempo do beat (4:30–4:52); nada mais se move.
2. **Selo "DIA 1", conferido:** o brief do ep 2 fala em "DIA 1 · N cegos", mas a receita do episódio
   (`regras/receita-estilo-e-se.md`, §4.1) registra que **o EP2 combinou só "DIA 1"** (decisão de
   2026-11-24) e que o cartão de dia em tela cheia (decisão de 2026-11-25) só aparece **na virada de
   um dia**. O EP2 inteiro é o Dia 1, então **não há cartão** e o selo continua só **"DIA 1"**.
   Nada mudou no roteiro.
3. **Respirar e piscar:** a regra agora nomeia a função que já existe no rig, `Elenco.vida`, como pede
   `estudio/regras/serie-3d.md` para as cenas novas. O combinado não mudou.

**Correções da revisão r3, aplicadas (2026-11-26).** Nenhuma fala mudou de texto.
1. **`duda-fim`, respiro antes do narrador:** ficou escrito no beat que, depois que o último "Gabi!"
   some no preto, há **~1 s de silêncio** (só o preto e o "DIA 1") antes do `ep2-narrador-n04`. Não
   mais que isso, para o preto não ficar vazio. Cabe no tempo do beat (5:17–5:27).
2. **Decisão 6 (duração) e decisões 1–5:** continuam **abertas**. São escolhas suas, não correção de
   texto: o "aplique as correções" não responde a elas, então eu não decidi por você. A trava segue
   valendo (nenhuma voz nem quadro antes das respostas).

**Correções da revisão r4, aplicadas (2026-11-26).** Nenhuma fala mudou de texto.
1. **Duração, as três medidas separadas:** a decisão 6, o topo e o resumo agora dizem a mesma coisa.
   O **brief do ep 2** pede **4:30–5:30**, a **regra da série** (`serie-3d.md`) pede **8–10 min** e o
   pedido desta etapa fala em **~10 s**. Este roteiro tem **~5:27**: cabe no brief e fica abaixo da
   regra da série. O topo dizia "~5:20" e foi corrigido para ~5:27, como no resto do texto. A escolha
   continua sendo sua (decisão 6).
2. **`duda-fim`, o selo "DIA 1" no preto:** ficou escrito no beat que o selo é **só texto de leitura**
   (não é legenda, fala nem narração) e tem **no mínimo ~28px em 1920×1080**, como pede `serie-3d.md`.

**Correções da revisão r5, aplicadas (2026-11-26).** Nenhuma fala mudou de texto.
1. **Duração, decisão 6 fechada:** você confirmou **~5:27** ("pode ficar acima dos [~10 s], 5:27 está
   ok"). O topo, o resumo e a decisão 6 agora dizem isso. O episódio fica abaixo dos 8–10 min da regra
   da série **por escolha sua**; o tamanho não muda nada no texto. A trava continua só para as
   decisões **1–5**.
2. **`duda-vizinho`, respiro antes de ela falar:** ficou escrito no beat que, depois que a van some, há
   **~1 s sem nenhuma fala** (só a sirene se afastando e a respiração dela) antes do `ep2-duda-04`,
   como nos outros sustos. Cabe no tempo do beat (2:35–3:12).
3. **Pós-publicação (`vizinha.md`, `protagonista.md`, ficha da mãe da Duda):** continua só como
   proposta (ver "Proposta de inclusão no cânone"). Nenhum arquivo de personagem foi tocado; o ajuste
   espera as decisões 3 e 5 e a publicação.

**Correções da revisão r6, aplicadas (2026-11-26).** Nenhuma fala mudou de texto.
1. **`duda-levam`, respiração curta entre os dois gritos:** ficou escrito no beat que, entre o
   `c10-mae-04` e o `c10-gabi-05`, há **~0,5 s sem nenhuma fala**: só a Duda puxando o ar, curto
   (`ritmo: "medo"`), perto da câmera. No EP1 (`levam.html`) os dois `.wav` quase se encostam (mãe
   5,6–8,31 s, Gabi a partir de 8,2 s). Aqui a mixagem é outra, do lado da Duda: os `.wav` não mudam,
   só o espaço entre eles. Cabe no tempo do beat (4:52–5:17).
2. **Pós-publicação (`vizinha.md`, ficha da mãe da Duda):** continua **só como proposta** (ver
   "Proposta de inclusão no cânone"). Os arquivos de `personagens/` são fonte, não destino desta
   etapa, e o ajuste depende das decisões 3 e 5 e da publicação. Nenhum arquivo foi tocado.

**Correções da revisão r7, aplicadas (2026-11-26).** Nenhuma fala mudou de texto.
1. **`duda-volta` / `ep2-duda-07`, a boca na fala opcional:** o beat pedia "cabisbaixa, braços
   cruzados" e uma fala com a boca mexendo pouco. Cabeça baixa é o mesmo risco do EP1 (o queixo
   do Gabi sumiu no capuz na `sala`). Ficou escrito no beat: **enquanto ela fala, o rosto está em
   quadro**, de frente ou três-quartos (não de costas). A cabeça baixa **só um pouco**, pelo pivô do
   pescoço (`Elenco.cabeca`), e **o queixo nunca afunda** na blusa. Os braços ficam cruzados **abaixo
   do peito**, e nenhuma mão nem cabelo passa na frente da boca. **Sem legenda.** Cabisbaixa de
   verdade só **antes e depois** da fala. A conferência entrou na pendência da próxima etapa: na hora
   da voz (o `.wav` tem que ter boca suficiente para o sync) e no snapshot ampliado da cena.
2. **Decisões 1–5 e pós-publicação:** continuam **abertas**. São escolhas suas; o "aplique as
   correções" não responde a elas, então eu não decidi por você. `vizinha.md`, `protagonista.md` e a
   ficha da mãe da Duda continuam **só como proposta**: `personagens/` é fonte, não destino desta
   etapa. Nenhum arquivo foi tocado.

**Correções da revisão r8, aplicadas (2026-11-26).** Nenhuma fala mudou de texto.
1. **Parecer do subagente:** aprovado, sem bloqueio. As duas correções que ele deixou são
   **opcionais** e dependem de você: (a) atualizar `vizinha.md` e `protagonista.md` e criar a ficha da
   mãe da Duda **se** a decisão 5 for aprovada, e só depois da publicação; (b) responder às decisões
   1–5 antes de qualquer voz ou quadro. Nenhuma das duas é correção de texto, então eu não decidi por
   você. `personagens/` continua intocado e a trava continua valendo.
2. **Mapa de montagem, uma incoerência corrigida:** a regra dizia que o mapa estava "abaixo, bloco por
   bloco", e a pendência dizia que ele vem depois. Agora as duas dizem o mesmo: o roteiro já vem nos 5
   blocos, com o tempo de cada beat; o mapa (planos, cortes e tempo de cada plano) é feito na próxima
   etapa, antes de qualquer cena `duda-*`.

**Correções da revisão r9, aplicadas (2026-11-26).** Nenhuma fala mudou de texto.
1. **Decisão 5 aprovada:** a mãe da Duda entra no cânone **depois da publicação**, com o que está na
   proposta (ver "Mãe da Duda: aprovada para o cânone"). Mesmo assim, `personagens/` continua
   intocado nesta etapa, porque é fonte e não destino. As falas dela (decisão 3), a voz e a
   aparência continuam abertas. A trava agora vale só para as decisões **1–4**.
2. **"Qual é a decisão 1?"** Reescrevi a decisão 1 em linguagem simples, com as duas opções lado a
   lado (ver "Decisões que precisam do seu ok").
3. **Um erro meu, corrigido:** o roteiro dizia que "a TV da sala do Gabi marca 07:40". Conferi em
   `sala.html` e quem marca 07:40 é o **relógio de parede** da sala. A conta não muda: 07:40 mais o
   selo "+1 HORA" de `vizinho.html` dá por volta das 08:40. *(Superado na r11: o selo virou "+5 HORAS".)*

**Correções da revisão r11, aplicadas (2026-11-27): as decisões 1–4 respondidas.**
1. **Decisão 1 = B.** O bloco 3 foi reordenado: `duda-almoco` (quarto → "+4 HORAS" → almoço → louça do
   almoço) → `duda-vizinho` (a sirene, ~12:40) → `duda-tarefa` ("+2 HORAS" → "Vou ver o Gabi"). As falas
   não mudaram. No EP1: selo "+5 HORAS" em `vizinho.html` e o `n06` reescrito ("Horas depois, ...") em
   `voz/falas_narrador.json`, `episodios/NARRADOR_EP1.md`/`.txt` e `episodios/MONTAGEM_EP1.md`. Falta
   regravar o `n06` e, só com a sua ordem, renderizar o EP1.
2. **Decisão 2:** térrea, sem mudança.
3. **Decisão 3:** todas as falas 💡 viraram ✅, inclusive a opcional `ep2-duda-07`.
4. **Decisão 4:** o fim virou `duda-fim` (o preto, sem narrador) + `duda-van` (o gancho no Gabi). O
   `ep2-narrador-n04` saiu do episódio. Duração ~5:29.

---

## Bloco 1: Ela enxerga (0:00 → ~1:10)

### abertura (0:00–0:15) · reaproveitada do EP1, sem mudança
**Na tela:** São Paulo 23:30 → janelas apagando → relógio até 03:30 → FLASH → BOOM → globo apagando.
Idêntica ao EP1, **de propósito** (ritual da série).

| ID | Personagem | Direção | Fala |
|---|---|---|---|
| `narrador-n01` ✅ | Narrador | O mesmo áudio do EP1. | "São Paulo. Dezessete de novembro. Três e meia da manhã." |
| `narrador-n02` ✅ | Narrador | O mesmo áudio do EP1. | "Uma luz atravessou o planeta. E na manhã seguinte... as pessoas começaram a acordar cegas." |

[SFX] cidade, zumbido, boom, energia, vento (os mesmos do EP1).
**Função:** o público reconhece a abertura e espera o Gabi. A quebra vem no próximo beat.

### duda-acorda (0:15–0:35)
**Na tela:** **tela preta**, só respiração (feminina, mas pouco marcada: o público ainda deve achar
que é mais um cego acordando) e o lençol mexendo. ~5 s de preto, como no despertar do EP1.

⚡ **Truque de câmera invertido (~0:21):** a câmera vira e a imagem **explode em nitidez e cor**: luz
da manhã no quarto, a blusa rosa, o cabelo loiro no travesseiro. Os olhos dela **abertos, focando**.
Ela pisca, normal, com a claridade.

| ID | Personagem | Direção | Fala |
|---|---|---|---|
| `ep2-narrador-n01` ✅ | Narrador | O mesmo narrador do EP1, calmo e grave; pausa antes do "e viu". Entra **depois** da virada, nunca no preto. | "A Duda tinha dezesseis anos. Naquela manhã, ela abriu os olhos... e viu." |

**Na tela:** ela senta na cama e espreguiça. Peito em ritmo calmo.
[SFX] respiração, lençol, passarinho e a rua de manhã ao longe.
**Função:** inverte o EP1 (ela **enxerga**). O truque fecha **antes de 0:40**, a meta de retenção do brief.

### duda-quarto (0:35–0:58)
**Na tela:** no criado-mudo, **um despertador igual ao do Gabi** (o mesmo modelo de `quarto.html`),
piscando **00:00**. Ela pega o relógio e franze a testa.

| ID | Personagem | Direção | Fala |
|---|---|---|---|
| `ep2-duda-01` ✅ | Duda | A mesma voz do portão (Achernar). Sonolenta, mais curiosa que assustada; fala sozinha. Boca em sync. | "Ué... o que aconteceu? Tá com a hora errada." |

**Na tela:** ela vai até **a janela do quarto, que dá para a rua** (o quarto do Gabi não tem essa
vista). Abre a cortina rosa. Lá fora, **parece tudo normal**: sol, a rua quieta, a casa do Gabi
na diagonal, do outro lado.

| ID | Personagem | Direção | Fala |
|---|---|---|---|
| `ep2-narrador-n02` ✅ | Narrador | Seco, sem drama. Entra com ela já calada, olhando a rua. | "Lá fora, o bairro já sabia que alguma coisa tinha mudado." |

> A imagem diz "normal" e o narrador desmente. É a ironia de thriller: o perigo está **dentro** das
> casas, onde as pessoas estão acordando cegas.

[SFX] bipe fraco do relógio piscando, cortina, rua calma.
**Função:** planta o apagão pelo objeto (a mesma pista do quarto do Gabi) e mostra que, para quem
enxerga, a manhã ainda parece comum.

### duda-banheiro (0:58–1:10) · sem voz
**Na tela:** detalhe da escova com pasta na pia (**sem o rosto**). Depois, no espelho, ela **já
enxaguando**: o rosto e a boca à mostra. Lava o rosto: as mãos com água em plano fechado, sem o
rosto; corta para o rosto pingando, a toalha secando a **testa e os olhos**, nunca a boca.

[SFX] torneira, escova, água.
**Função:** rotina de manhã comum. Ela não sabe de nada ainda, e o público sabe.
**Regra:** com o rosto em quadro, nada tapa a boca. A escovação aparece só pelo detalhe da pia.

---

## Bloco 2: A notícia (~1:10 → ~2:35)

### duda-cafe (1:10–1:40)
**Na tela:** ainda no banheiro, ela ouve a mãe chamando de outro cômodo.

| ID | Personagem | Direção | Fala |
|---|---|---|---|
| `ep2-maeduda-01` ✅ | Mãe da Duda | Mulher adulta, PT-BR. Chamando de longe, rotina de manhã, leve pressa. **Fora de quadro.** | "Duda, tá pronta? Vem tomar café!" |

**Na tela:** ela vai até **a cozinha** (casa térrea). A mesa posta; a mãe dela já sentada. Na bancada,
um **rádio-relógio piscando 00:00**. Na parede, uma **TV pequena**, desligada.

| ID | Personagem | Direção | Fala |
|---|---|---|---|
| `ep2-maeduda-02` ✅ | Mãe da Duda | Tranquila, comentário de café da manhã. Boca em sync. | "Acho que acabou a luz de noite. O rádio-relógio tava com a hora errada." |
| `ep2-duda-02` ✅ | Duda | Leve, concordando, a xícara já na mesa (nada na frente da boca). Boca em sync. | "O do meu quarto também." |
| `ep2-maeduda-03` ✅ | Mãe da Duda | Já pegando o controle. Boca em sync. | "Vou ligar a TV pra saber o que aconteceu." |

**Na tela:** a mãe liga a TV e troca de canal (dois cliques, chiado de canal) até cair no plantão.
[SFX] louça, café, rádio-relógio, troca de canal.
**Função:** apresenta a mãe da Duda e a casa delas, e mostra que o apagão chegou às duas casas pelo
mesmo detalhe (o relógio zerado).

### duda-tv (1:40–2:18)
**Na tela:** na TV da cozinha, **a mesma repórter** e o mesmo letreiro do EP1. Overlay **"DIA 1"**.

| ID | Personagem | Direção | Fala |
|---|---|---|---|
| `c04-reporter-01` ✅ | Repórter | O mesmo `.wav` do EP1, com filtro de TV. | "Plantão urgente. Um apagão global atingiu o planeta nesta madrugada. Em várias cidades, pessoas acordaram sem enxergar." |
| `c04-reporter-02` ✅ | Repórter | O mesmo `.wav` do EP1, com filtro de TV. | "Investiga-se se a cegueira é transmissível. Recomenda-se isolar os afetados." |

**Na tela (o que a família do Gabi não viu):** a TV corta para **imagens de rua**: figuras de **roupa
de quarentena** (as mesmas da van do EP1) conduzindo pessoas de olhos nublados até vans, em outro
bairro. Câmera de cinegrafista, tremida.

| ID | Personagem | Direção | Fala |
|---|---|---|---|
| `ep2-reporter-03` ✅ | Repórter | A mesma voz (Lumi), firme, um tom abaixo; ênfase em "quarentena" e em "não revelada". Filtro de TV. | "Equipes já estão recolhendo os afetados. Os cegos serão levados para uma área de quarentena ainda não revelada." |

⚡ **O choque (~4 s, sem nenhuma fala):** silêncio. As duas paradas, a xícara no ar, a respiração
suspensa. A mãe procura a mão da filha **na mesa**. As bocas ficam à mostra, paradas. A Duda olha da TV
para a janela. Nesses ~4 s depois do `ep2-reporter-03` **ninguém fala**, nem a mãe nem a Duda: só a TV
baixinha e a respiração. A primeira fala depois do choque é o `ep2-maeduda-04`, já no beat seguinte.

[SFX] filtro de TV, o letreiro, a TV continuando baixinho.
**Função:** o mesmo dado do EP1 (vírus, isolar) e **um passo além**: para onde levam os cegos ninguém
sabe. Prepara o medo do clímax.
**Continuidade:** cabe no cânone. O EP1 já mostra equipes "recolhendo" de manhã (`c05-radio-01`), e o
`narrador-n13` diz que só **ao anoitecer** isso "virou ordem". A repórter noticia o recolhimento; a
ordem formal vem depois.

### duda-despedida (2:18–2:35)
**Na tela:** só **depois da pausa do choque**, a mãe olha o relógio de pulso, levanta e pega a bolsa.

| ID | Personagem | Direção | Fala |
|---|---|---|---|
| `ep2-maeduda-04` ✅ | Mãe da Duda | Tentando soar normal, com pressa e preocupação por baixo. Boca em sync. | "Filha, eu tenho que sair pra trabalhar. Tem comida na geladeira pro seu almoço, é só esquentar no micro-ondas." |
| `ep2-duda-03` ✅ | Duda | Pequeno, carinhoso, ainda abalada. Boca em sync. | "Tá bom, mãe. Bom trabalho." |

**Na tela:** beijo na cabeça, a porta da frente fecha. A Duda sozinha na cozinha, com a TV baixinha.
[SFX] chave, porta, a TV.
**Função:** deixa a Duda **sozinha em casa** pelo resto do dia, como em `vizinha.md`.

---

## Bloco 3: A tarde e o vizinho (~2:35 → ~3:35)

### duda-almoco (2:35–2:52) · sem voz
**Na tela (montagem com fusões, igual ao EP1):** ela arruma o quarto (cama, roupas no lugar) → selo
**"+4 HORAS"** → esquenta a comida no **micro-ondas** e almoça sozinha na cozinha, olhando a rua pela
janela → lava **a louça do almoço**.
[SFX] lençol, gaveta, micro-ondas (o bipe), talher, louça, torneira.
**Função:** a manhã passa; ela segue a rotina sozinha, como a mãe pediu.
**Continuidade (decisão 1 = B):** a mãe sai por volta das 08:00, depois da TV (no EP1, o relógio da sala
marca 07:40). "+4 HORAS" leva ao almoço (~12:00), e a sirene chega ~12:40, a mesma hora do selo
"+5 HORAS" de `vizinho.html` no EP1.

### duda-vizinho (2:52–3:25)
**Na tela:** ela fecha a torneira, as mãos ainda molhadas. ⚡ **Sirene**, chegando perto.

**Na tela:** ela vai à janela do quarto, abre a cortina e **abre a janela**. Lá fora, **nítido e de
longe**: a van de quarentena leva **o vizinho** à força. É o mesmo acontecimento que o pai do Gabi viu
pela fresta no EP1 (planos 38–39), agora do outro lado da rua.

| ID | Personagem | Direção | Fala |
|---|---|---|---|
| `c05-radio-01` ✅ | Rádio da equipe | O mesmo `.wav` do EP1, mais distante e com mais chiado. | "Unidade três, mais um afetado confirmado. Recolhendo." |

⚡ Ela em choque, a mão apertando o batente. Enquanto a van está na rua, o olhar dela fica **na van**:
a casa do Gabi não entra nesse plano. A van vai embora. Só então ela olha para **a casa do Gabi**:
porta fechada, **a cortina bege da sala fechada e parada**, ninguém no quintal.

⚡ **Respiro (~1 s, sem nenhuma fala):** a sirene vai sumindo na rua. Ela continua na janela, a mão
ainda no batente, a respiração **curta** (`ritmo: "medo"`) começando a voltar. A boca fica à mostra,
parada. Só então entra o `ep2-duda-04`.

| ID | Personagem | Direção | Fala |
|---|---|---|---|
| `ep2-duda-04` ✅ | Duda | Baixo, pensando alto, preocupada. Boca em sync. | "Será que o Gabi e a família dele tão bem? Não vi movimento na casa dele..." |
| `ep2-duda-05` ✅ | Duda | Decidindo, com um suspiro, para se convencer. Boca em sync. | "Depois vou lá ver. Antes tenho que fazer a tarefa da escola." |

[SFX] torneira, sirene, motor, portas batendo, rádio.
**Função:** ela **vê** o que acontece com quem cega, e o Gabi entra no pensamento dela pela primeira vez.
**Continuidade (conferida no EP1):** em `vizinho.html`, o pai do Gabi espia por uma **fresta** da
cortina da sala, que ele tinha fechado no plano 37. A fresta fica aberta **enquanto a van está na
rua** e se fecha quando ele solta a cortina, logo depois que o vizinho é posto na van. Por isso, neste beat, a casa do Gabi
**não aparece** enquanto a van está lá. Quando ela olha, a cortina já está fechada e parada. Ninguém da
casa do Gabi sai até o portão, no fim da tarde. "Não vi movimento" é a **impressão dela** (casa
fechada, ninguém na rua), coerente com o EP1. Não é um fato novo. **Não pode:** mostrar a fresta
abrindo no fundo de um plano dela, porque isso desmentiria a fala.

### duda-tarefa (3:25–3:35)
**Na tela:** na escrivaninha do quarto, caderno e livro: selo **"+2 HORAS"** (fusão) sobre a tarefa
da escola. A luz vira fim de tarde. Ela fecha o caderno.

| ID | Personagem | Direção | Fala |
|---|---|---|---|
| `ep2-duda-06` ✅ | Duda | Decidida, com um fio de nervoso. Boca em sync. | "Vou ver o Gabi." |

[SFX] lápis, página virando, caderno fechando.
**Função:** passa o tempo até o fim de tarde, a hora do portão no EP1 (`portao.html`: "fim de tarde").

---

## Bloco 4: O portão (~3:35 → ~4:30)

### duda-caminho (3:35–3:50)
**Na tela:** ela sai pelo **portãozinho de grade** dela, anda pela calçada e **atravessa a rua** na
diagonal (a geografia de `rua.html`). Para no meio do caminho, mexe no cabelo, ajeita a blusa e continua.

| ID | Personagem | Direção | Fala |
|---|---|---|---|
| `ep2-narrador-n03` ✅ | Narrador | Baixo, quase íntimo. Sobre o plano da janela do Gabi. | "Na casa do Gabi, a janela do quarto continuava fechada." |

[SFX] passos (`audio/passos.mp3`), rua.

### duda-portao (3:50–4:15) · **o payoff**
**Na tela:** diante do **portão de ferro** do Gabi (como no EP1: ela bate no portão, não na porta). A
mão sobe, hesita, desce. Sobe de novo e **bate**. Desta vez **o rosto dela está em quadro**, nítido.

| ID | Personagem | Direção | Fala |
|---|---|---|---|
| `c09-duda-01` ✅ | Duda | O mesmo `.wav` do EP1, agora **limpo, sem o abafado** (ela está do lado de cá). Boca em sync. | "Oi... o Gabi tá? É a Duda." |

⚡ Pausa. A cortina da sala mexe. A porta abre só uma **fresta**: a mãe do Gabi, com sorriso forçado,
bloqueia a fresta com o corpo.

| ID | Personagem | Direção | Fala |
|---|---|---|---|
| `c09-mae-03` ✅ | Mãe (do Gabi) | O mesmo `.wav` do EP1, com leve distância (porta → portão). Boca em sync. | "Oi, querida... hoje não dá. Ele não tá querendo ver ninguém." |

**Na tela:** a Duda faz que sim, com um sorriso pequeno. Antes de ir, **olha para a janela do quarto
dele**: é a mesma olhada do plano 60 do EP1, agora de frente.

[SFX] batida no portão de ferro, a porta (os mesmos do EP1).
**Função:** **recontextualiza o EP1** ("a voz era ela!") e paga o easter egg sonoro. O público sabe
que ele estava a poucos metros e não quis ser visto cego. Ela não sabe.

### duda-volta (4:15–4:30)
**Na tela:** ela volta pela calçada **bem devagar**, cabisbaixa, braços cruzados. Olha para trás uma
vez. Sem entender.

| ID | Personagem | Direção | Fala |
|---|---|---|---|
| `ep2-duda-07` ✅ *(opcional, aprovada)* | Duda | Quase sem voz, para si; a boca mexe pouco, mas mexe, em sync com o `.wav`. Rosto em quadro (frente ou três-quartos), cabeça só um pouco baixa, queixo fora da blusa, nada na frente da boca. | "O que será que eu fiz pra ele?" |

> No seu texto ela só **pensa** isso. Se preferir sem fala, o beat fica só no corpo e na respiração,
> e o público entende igual.

**Regra da boca neste beat (se a fala ficar):** "cabisbaixa" vale **antes e depois** da fala. Durante a
fala, a cabeça baixa só um pouco, pelo pivô do pescoço (`Elenco.cabeca`), e **o queixo nunca afunda**
na blusa (o erro da `sala` no EP1). Os braços cruzados ficam **abaixo do peito**; mão e cabelo nunca
passam na frente da boca. O plano da fala é de frente ou três-quartos, nunca de costas. **Sem
legenda**: a fala é só voz. Se a fala sair, nada disso muda o resto do beat.

[SFX] passos se afastando (os mesmos do EP1), portãozinho dela fechando.
**Função:** o mal-entendido. Ela acha que a culpa é dela; o público sabe que é vergonha dele.
**Estado:** paga o setup `[ ]` "a cena do portão, revelada pelo lado dela" de `vizinha.md`. O
sentimento **continua não assumido** pelos dois.

---

## Bloco 5: Eles vêm (~4:30 → ~5:29)

### duda-sirene (4:30–4:52)
**Na tela:** fusão para o anoitecer. Ela no quarto, sentada na cama, sem fazer nada.

| ID | Personagem | Direção | Fala |
|---|---|---|---|
| `narrador-n13` ✅ | Narrador | O mesmo áudio do EP1, no mesmo ponto da linha do tempo (espelho de propósito). | "Ao anoitecer, a notícia já tinha virado ordem: quem cegasse seria isolado." |

**Na tela:** luz **azul e vermelha** varre o quarto **dela**. Sirene. Ela vai até a janela: a van para
na frente da casa do Gabi e as figuras de roupa de quarentena descem. ⚡ **TUM-TUM-TUM**, de longe.

⚡ **Respiro (~1–2 s, sem nenhuma fala):** depois da última batida, ninguém fala. Só a sirene, a luz
azul e vermelha no rosto dela e a respiração dela **suspensa** (`ritmo: "tensao"`). A mão aperta o
peitoril. A boca fica à mostra, parada. Só então entra o `c10-agente-01`.

| ID | Personagem | Direção | Fala |
|---|---|---|---|
| `c10-agente-01` ✅ | Agente | O mesmo `.wav`, **longe e abafado** (do outro lado da rua). Quase não se entende. | "Ordem de isolamento. Há um afetado aqui." |
| `c10-pai-01` ✅ | Pai | O mesmo `.wav`, longe. | "É meu filho. Ele fica." |

**Na tela:** a respiração dela fica suspensa.
**Função:** sincroniza os dois episódios: é o mesmo momento da cena `buscar` do EP1.

### duda-levam (4:52–5:17) · **o clímax compartilhado**
**Na tela (câmera na mão, a única do episódio):** da janela dela, o **plano-espelho do plano 68**: o
Gabi **forçado** até a van, os pais contidos na porta. Moletom azul claro, **as mãos agarrando o moletom no peito** (sem o fone, como no EP1: decisão de 2026-11-22),
olhos nublados.

| ID | Personagem | Direção | Fala |
|---|---|---|---|
| `c10-mae-04` ✅ | Mãe (do Gabi) | O mesmo `.wav`, longe. | "Não! Solta ele!" |

⚡ **Respiração curta (~0,5 s, sem nenhuma fala):** o grito da mãe acaba e, antes do Gabi, só se ouve a
Duda puxando o ar, curto (`ritmo: "medo"`), perto da câmera. O peito dela sobe rápido; a boca fica à
mostra, entreaberta, parada. Respiração gravada ou CC0, não voz gerada.

| ID | Personagem | Direção | Fala |
|---|---|---|---|
| `c10-gabi-05` ✅ | Gabi | O mesmo `.wav`, longe, quebrando. Entra **~0,5 s depois** que o `c10-mae-04` termina. | "Mãe! Pai!" |

⚡ **Ela sai correndo:** do quarto, pela casa, pela porta da frente, pelo quintal, e **para no
portãozinho dela** (o muro baixo de `rua.html`). A mão na grade. Ela **não atravessa**.

> **Continuidade com o EP1:** no plano 68, "ao fundo, a janela da Duda": ela ainda está na janela.
> Só sai correndo **depois** que o Gabi entra na van, e chega ao portão quando a porta bate (plano 69).

⚡ [SFX] o **clangor da porta da van** (o mesmo do EP1). A van arranca com a sirene e passa pela
frente dela; a luz azul e vermelha varre o rosto dela e some.

**Na tela:** do outro lado da rua, a mãe do Gabi se solta, corre até o portão da casa e chama, sem
parar, para a rua vazia. A Duda olha para ela, parada no portão: corpo travado, boca entreaberta e
**visível**, sem fala, nunca tapada.

| ID | Personagem | Direção | Fala |
|---|---|---|---|
| `c10-mae-05` ✅ | Mãe (do Gabi) | O mesmo `.wav` do EP1, **repetido 2–3 vezes**, cada vez mais longe e mais fraco. Boca em sync enquanto ela está em quadro. | "Gabi!... Gabi!" |

**Função:** o clímax dos dois episódios, pela impotência de quem **vê**. No EP1 o público só ouvia.
Aqui ele vê tudo, e ela está a uma rua de distância sem poder fazer nada.
**Estado:** o Gabi é **levado à quarentena** (já é cânone em `protagonista.md`). Os pais **ficam**,
enxergando. A Duda **continua vidente**.

### duda-fim (5:17–5:21) · sem voz
**Na tela:** **apaga tudo, como no fim do EP1**: no mesmo tempo, o último "Gabi!" continua no preto e
some em fade. A diferença: a imagem escurece **por igual**, sem a vinheta de olho, porque ela enxerga
e o brief não deixa as bordas dela escurecerem neste episódio. Overlay **"DIA 1"** no preto.

**Selo "DIA 1":** é **só texto de leitura**, não é legenda (nenhuma fala nem narração vira texto).
Tamanho **no mínimo ~28px em 1920×1080** (`serie-3d.md`), o mesmo selo do EP1.

⚡ **Respiro (~1 s, sem nenhuma fala):** o último "Gabi!" some em fade. Fica **~1 s** só de preto e
"DIA 1", sem voz nem SFX novo. **Sem narrador** (decisão 4, 2026-11-27: o `ep2-narrador-n04` saiu). Do
preto, **corte seco** para a `duda-van`.

**Função:** fecha o lado da Duda. Ela viu tudo, e agora o episódio mostra o que ela **não** pode ver.
**Nota de cânone (vinheta):** `vizinha.md` diz que, ao longo da série, "as bordas da imagem dela
começam a escurecer antes que ela perceba". O fim sem vinheta **não contraria** isso. O escurecimento
das bordas é o sinal da cegueira **chegando**, e o brief do ep 2 diz que as bordas dela "**ainda não**
escurecem neste episódio". O setup `[ ]` "o primeiro sinal de escurecimento das bordas dela" continua
em aberto em `vizinha.md`. Por isso, no fim, nenhuma borda escurece antes do resto, nem como piscadela:
a imagem escurece por igual.

### duda-van (5:21–5:29) · **o gancho**, sem voz (decisão 4, 2026-11-27)
**Na tela:** do preto, **corte seco** para a **traseira da van**, de fora, a câmera parada na altura das
portas fechadas. ⚡ As travas estalam e **as portas se abrem de uma vez**, para os lados da câmera: chegaram
a algum lugar. Uma luz fria e branca, vinda de trás da câmera (holofote), entra e bate no **Gabi**,
sentado no banco lateral: moletom azul claro, **as mãos agarrando o moletom no peito**, sem o fone (o mesmo gesto do plano 69 do
EP1), olhos nublados. **Nada do lado de fora aparece**: o local da quarentena continua não revelado.

**O "olhar" (regra do cego, `briefing/linguagem-visual.md`):** ele **não olha**. Ele **vira o rosto para o
barulho** das portas, devagar e com um tranco de susto (`Elenco.vida` com `ouvir`, a chave no tempo do
estrondo). Como o som vem de onde está a câmera, os olhos nublados terminam **apontados para quem
assiste, sem ver**. Fica assim **~1,5 s**, a respiração curta (`ritmo: "medo"`), a boca à mostra,
entreaberta, parada. ⚡ **Corte seco** para o preto. Acaba o episódio.

**Modo:** a câmera está **fora** dele, então **sem vinheta** de olho; imagem nítida, fria, dessaturada
pela luz (não pelo filtro). Personagem no rig refinado PBR, como toda cena nova; corpo com `vida` (é uma
cena `duda-*`, a regra do piscar e respirar vale).
[SFX] motor desligando, travas, o **clangor da porta da van** (o mesmo do EP1, agora abrindo), a
respiração dele. No corte final: **silêncio total**.
**Função:** gancho para o EP3. "Ela viu tudo; ele não viu nada." A primeira imagem do destino dos cegos,
sem revelar onde. O público fica com o rosto dele virado para si.
**Depois do corte:** a tela final da régua da série ("INSCREVA-SE" + ~10 s para as telas finais do
YouTube) entra **depois** de ~1 s de preto, para não roubar o corte seco. O plano de fundo dela fica para
o mapa de montagem.

---

## Resumo

### Falas
| Personagem | Reaproveitadas (`.wav` existe) | Novas ✅ | Voz | Voz estimada |
|---|---|---|---|---|
| Duda | 1 (`c09-duda-01`) | 6 + 1 opcional aprovada (`ep2-duda-01`…`07`) | Achernar (a do EP1) | ~28 s |
| Mãe da Duda | 0 | 4 (`ep2-maeduda-01`…`04`) | perfil `mae_duda` do VoiceStudio | ~20 s |
| Mãe (do Gabi) | 3 (`c09-mae-03`, `c10-mae-04`, `c10-mae-05`) | 0 | Sola | ~13 s |
| Pai | 1 (`c10-pai-01`) | 0 | Charon | ~3 s |
| Gabi | 1 (`c10-gabi-05`) | 0 | Enceladus | ~2 s |
| Repórter | 2 (`c04-reporter-01`, `-02`) | 1 (`ep2-reporter-03`) | Lumi | ~21 s |
| Agente | 1 (`c10-agente-01`) | 0 | Achird | ~3 s |
| Rádio | 1 (`c05-radio-01`) | 0 | Algenib | ~3 s |
| Narrador | 3 (`n01`, `n02`, `n13`) | 3 aprovadas ✅ (`ep2-narrador-n01`…`n03`), áudio ainda não existe; o `n04` saiu (decisão 4) | o do EP1 | ~24 s |

- **Voz nova a gerar (liberada em 2026-11-27):** 11 falas de personagem + a opcional e as 3 do
  narrador. E, no EP1, o `n06` regravado ("Horas depois, ..."). **Ainda não gerei nenhuma voz e não
  rodei render.**
- Tempo de voz: ~2:00 num episódio de ~5:29 (estimativa de ~2 palavras/s; o tempo real sai das
  vozes geradas). O ritmo vem da imagem.
- **Duração: ~5:29** (era ~5:27, confirmada em 2026-11-26; o fim novo soma ~2 s). Fica perto do teto
  dos 4:30–5:30 do brief do ep 2 e abaixo dos 8–10 min da regra da série, por escolha sua.
- O narrador nunca fala por cima de personagem. Os 6 pontos dele caem em trechos sem fala: abertura
  (2), depois da virada, a rua pela janela, a travessia e o anoitecer. O fim é sem narrador.

### Picos de tensão sem voz
a virada de câmera (ela enxerga) · o despertador piscando · o choque da TV (~4 s sem fala) · a sirene depois da louça do almoço ·
o respiro depois que a van some (~1 s) ·
a mão que hesita no portão · a olhada pra janela dele · a luz da sirene no quarto · o respiro depois
do TUM-TUM-TUM (~1–2 s) · a respiração curta entre o grito da mãe e o do Gabi (~0,5 s) · a corrida até o
portão · a porta da van · o preto (respiro de ~1 s) · as portas da van se abrindo e o rosto do Gabi virado
para nós · o corte seco final.

### Tratamento na pós
Repórter: filtro de TV · Rádio: mais distante que no EP1 · Duda: **limpa** (no EP1 era abafada) ·
Mãe da Duda: limpa; fora de quadro no `ep2-maeduda-01` · Mãe do Gabi no portão: leve distância ·
Agente, pai, mãe e Gabi no clímax: longe, do outro lado da rua · `c10-mae-05`: repetido, em fade.

### Mudança de estado dos personagens
| Personagem | Antes do ep 2 | Depois do ep 2 |
|---|---|---|
| Duda | vidente; só voz no EP1 | vidente; **rosto revelado**; mora com a mãe, sozinha em casa no Dia 1; viu o vizinho e o Gabi serem levados |
| Mãe da Duda ✅ (decisão 5) | não existia | aparece; enxerga; sai para trabalhar no Dia 1 |
| Gabi | cego; levado (EP1) | **chega a algum lugar**: a van se abre (o lugar não aparece); só é **visto de fora** |
| Mãe / Pai do Gabi | enxergam; ficam | igual |
| Revelado ao público | — | a voz do portão era a Duda; ela gosta dele (só subtexto); os cegos vão para uma quarentena em local não revelado |

### ✅ Mãe da Duda: aprovada para o cânone (decisão 5, 2026-11-26)
Você aprovou. Ela ainda não existe em `personagens/` e **eu não criei nem editei nenhum arquivo de
personagem**: isso fica para o pós-publicação (novo `personagens/mae-da-duda.md` ou uma seção em
`vizinha.md`), com **só** o que está no seu texto. Se a decisão 3 mudar alguma fala dela, a ficha
acompanha a fala aprovada.
- **Papel:** mãe da Duda. As duas **moram sozinhas** ("a Duda mora só com a mãe").
- **Estado (Dia 1):** enxerga. Toma café com a Duda, comenta o rádio-relógio, liga a TV e **sai para
  trabalhar**, deixando o almoço na geladeira.
- **Em aberto:** nome, idade, aparência, voz, profissão, se volta para casa antes do clímax (no seu
  texto ela não aparece à noite), pai da Duda.
- **Ajuste em `vizinha.md` (pós-publicação):** "Com quem está: sozinha em casa" vira "mora com a mãe;
  no Dia 1 fica sozinha depois que a mãe sai para trabalhar". E "a duas casas" vira "do outro lado
  da rua, na diagonal" (a mesma frase está em `protagonista.md`).

### Cenas (compositions) a criar
`duda-acorda`, `duda-quarto`, `duda-banheiro`, `duda-cafe`, `duda-tv`, `duda-despedida`, `duda-almoco`,
`duda-vizinho`, `duda-tarefa`, `duda-caminho`, `duda-portao`, `duda-volta`, `duda-sirene`, `duda-levam`,
`duda-fim`, `duda-van` (16 cenas).
- O prefixo `duda-` evita colisão com as cenas do EP1 no mesmo `compositions/`. A `abertura` é
  reaproveitada **sem alteração**. A única cena do EP1 alterada é a `vizinho` (só o selo, "+5 HORAS",
  decisão 1); `rua.html` e as outras ficam como estão.

### Cenários e objetos que este roteiro pede
- **Novos:** o interior da casa térrea da Duda (quarto com janela para a rua, banheiro, cozinha com
  TV na parede, porta da frente, quintal até o portãozinho) · despertador (mesmo modelo de
  `quarto.html`) · rádio-relógio · micro-ondas e geladeira · caderno e livro · o **conteúdo da TV**
  com agentes recolhendo pessoas.
- **Já existem no EP1 (base):** `rua.html` (as duas casas, o muro baixo e o portãozinho da Duda, a
  cortina rosa) · `portao.html` (o rig já monta a Duda do lado de fora) · a van e os agentes (`van`,
  `buscar`, `levam`, `vizinho`) · a repórter (`tv`) · o interior da van (`van.html`, base da `duda-van`;
  falta a traseira com as portas abrindo para fora e a luz do holofote).

---

## Decisões (todas respondidas)
> **Trava desfeita em 2026-11-27:** as decisões 1–6 estão respondidas. Vozes e quadros de aprovação
> estão liberados; o render continua só com a sua ordem.

1. ~~**A que horas o vizinho é levado?**~~ **Respondida em 2026-11-27: B, depois do almoço.** O EP1
   mudou: selo "+5 HORAS" em `vizinho.html` (07:40 + 5 h = ~12:40) e o narrador `n06` virou "Horas
   depois, eles chegaram à rua do Gabi." (regravar o `.wav`; renderizar o EP1 de novo com a sua ordem).
   O bloco 3 foi reordenado: `duda-almoco` → `duda-vizinho` → `duda-tarefa`.
2. ~~**Casa térrea**~~ **Respondida em 2026-11-27: ok, térrea.**
3. ~~**Falas 💡**~~ **Respondida em 2026-11-27: as 11 aprovadas, com a opcional `ep2-duda-07`.** A voz da
   mãe da Duda é o perfil `mae_duda` do VoiceStudio.
4. ~~**O fim**~~ **Respondida em 2026-11-27: fim novo.** Depois que a tela dela apaga, corte seco para a
   van se abrindo com o Gabi dentro; ele vira o rosto para o barulho e os olhos nublados terminam
   apontados para quem assiste (regra do cego: ele não olha, escuta); corte seco, acaba. **Sem
   narrador no fim** (o `ep2-narrador-n04` saiu). Ver `duda-fim` e `duda-van`.
5. ~~**Mãe da Duda no cânone**~~ **Aprovada em 2026-11-26:** a ficha entra no pós-publicação, com
   só o que está no seu texto. Nada em `personagens/` muda nesta etapa. As falas dela continuam na
   decisão 3, e a voz e a aparência continuam abertas.
6. ~~**Duração**~~ **Respondida em 2026-11-26:** episódio completo de **~5:27**. Você disse que pode
   ficar acima dos ~10 s do pedido da etapa e que 5:27 está ok. Fica dentro do brief do ep 2
   (4:30–5:30) e abaixo da regra da série (8–10 min), por escolha sua.

## Pendência da próxima etapa (esperado, não bloqueia este roteiro)
**Quadros de aprovação, antes de produzir qualquer cena `duda-*`** (no rig refinado + PBR, padrão das
cenas novas desde 2026-11-25):
- **Duda, primeira aparição do rosto:** rosto de frente e de perfil, **blusa rosa clara**, **cabelo
  loiro**, pele clara, um pouco mais baixa que o Gabi, magrinha. Ainda falta o "detalhe único" de
  `vizinha.md`. Precisa de quadros com expressões (neutra, medo, choque sem mão na boca) e um
  quadro de **piscar e respirar**.
- **Mãe da Duda:** aparência inteira em aberto (ver proposta). Precisa de quadro aprovado antes de
  `duda-cafe`.
- **Casa da Duda por dentro:** quarto (com a janela para a rua), banheiro e cozinha, coerentes com a
  fachada de `rua.html`.
- **`ep2-duda-07` (mantida):** na geração da voz, conferir que o `.wav` tem boca
  suficiente para o sync ("quase sem voz", mas não sussurro mudo). Na cena `duda-volta`, conferir no
  snapshot ampliado que, durante a fala, a boca aparece inteira: queixo fora da blusa, braços abaixo
  do peito, nenhuma legenda.
- **Gabi na van (`duda-van`):** um quadro do enquadramento final (portas abertas, luz do holofote,
  rosto virado para a câmera sem ver), conferindo a boca à mostra.
- Depois disso: o **mapa de montagem por blocos** (planos, cortes e tempo de cada plano, sobre os 5
  blocos deste roteiro) e, só com a sua ordem, o render.
