# EP2 — correções do usuário (2026-11-28, depois de ver `renders/EP2_completo.mp4`)

Lista ditada pelo usuário ao assistir o primeiro render. Cada item aponta a cena (`compositions/duda-*.html`) e o
plano do mapa (`episodios/MONTAGEM_EP2.md`). Marcar `[x]` ao corrigir. **Não renderizar sem ordem** — conferir por
snapshot e mostrar.

## Regras que valem para o episódio inteiro (e para os próximos)

- [ ] **ERRO CRÍTICO — antebraço cruzado.** Tudo o que a Duda faz sai com os antebraços cruzados na frente do corpo
      (lavar louça, tarefa, andar, café). Isso não existe "em lugar nenhum, nem em desenho". Corrigir no rig
      (`assets/rig/ep2.js` / poses do `Elenco`): cada mão alcança o objeto **do seu lado**, cotovelo para fora, nunca
      um braço passando por cima do outro. Andar = cabeça baixa e **braços em posição natural** (soltos, balançando).
- [ ] **Mão nunca entra nas coisas** (colchão, mesa, pia…) e **corpo nunca entra em móvel** (a mãe dentro da mesa no
      café). Mesma regra de [sem atravessar], agora também para objetos.
- [ ] **Toda ação acontece inteira e em tempo real:** quem passa por porta ou portão **abre** com a mão (nada abre
      sozinho); porta de casa **abre para dentro**; a pessoa primeiro abre, depois sai, depois fala.
- [ ] **Rua:** ninguém para no meio da rua — atravessa e para **na calçada**. Poste fica **na calçada**, não no asfalto.
- [ ] **Trecho sem fala = narrador.** Onde a cena fica só em imagem e silêncio, o narrador conta o que está
      acontecendo (textos novos abaixo — mostrar ao usuário antes de gerar a voz).
- [ ] **Boca bate com a frase:** o movimento da boca tem que acompanhar o ritmo da fala (a da mãe do Gabi está rápida
      demais).
- [ ] **Sem câmera tremida.** O usuário não gostou da câmera na mão do plano 68 — tirar o tremor.

## Por plano

### Bloco 1 — acorda, quarto, banheiro (0:15 → 1:10)

- [ ] **Plano 5 (duda-acorda, 0:27–0:35) — levantar da cama.** Deitada → levanta o tronco com as pernas ainda na
      cama → gira o corpo → fica sentada na beira com os pés no chão. Hoje o rig troca de "deitada" para "sentada" de
      uma vez (`duda-acorda.html`, `deitado = t < 12`). Referência: o "poder DIFERENTE" tem Gui acordando e sentando
      (`leitura.md` 02:38 q9494 e 05:10 q18624) e levantando (00:16 q975, 02:45 q9904) — usar como modelo do tempo.
- [ ] **Planos 6–7 (duda-quarto, 0:35–0:43,5).** Depois de pegar o relógio ela **continua na cama** e diz a fala
      dela ali (`ep2-duda-01`).
- [ ] **Banheiro (planos 11–14, 0:58–1:10)** — ações de verdade:
      - escovar os dentes (a escova na boca, mexendo);
      - lavar as mãos **debaixo da água** da torneira;
      - secar o rosto: a toalha **passa pelo rosto e cobre**, como na vida real (hoje fica na testa com os olhos
        apertados). Pedido explícito do usuário: aqui a toalha pode cobrir a boca por um instante (exceção a
        [boca sempre visível]).

### Bloco 2 — café, TV, despedida (1:10 → 2:35)

- [ ] **Café (planos 16–17):** a mãe está com o corpo **dentro da mesa** — afastar a cadeira/corpo.
- [ ] **Planos 20–21 — o controle:** mostrar a mãe com o controle na mão apontando e ligando a TV.
- [ ] **TV ligando:** primeiro um canal de **bichos** (documentário de animais) e depois troca de canal até o
      plantão (os cliques e o chiado já existem — falta a imagem do canal de bichos).
- [ ] **Plano 22 → 23 — a repórter muda sem falar:** o primeiro plano dela aparece calado e só no corte seguinte ela
      fala. A repórter tem que **falar já no primeiro plano** em que aparece.
- [ ] **Depois da reportagem (planos 26–27):** hoje as duas cruzam os braços e só se olham. Fazer: a mãe pegando a
      **xícara**, a Duda pegando um **pedaço de pão**.
- [ ] **Plano 29 — a mãe falando da comida:** ela **olha para a Duda**; pode pôr a mão no **ombro** dela.
- [ ] **Planos 31–32 — a mãe sai:** ela **abre a porta** com a mão (hoje a porta abre sozinha).
- [ ] **Plano 33 em diante — a Duda sozinha:** silêncio → entra o **narrador** (texto novo).

### Bloco 3 — almoço, vizinho, tarefa (2:35 → 3:35)

- [ ] **Plano 34 (duda-almoco, 2:35–2:39) — "por que o braço está para trás, olhando a parede?"** Era para ser "ela
      arruma a cama": o corpo dela ficou virado para a parede e só o braço vai para trás, até o edredom. Fazer: ela
      **de frente para a cama**, inclinada sobre ela, **as duas mãos** esticando o edredom.
- [ ] **Planos 35–36 — micro-ondas e almoço:** só imagem fica sem graça → **narrador**. Na mesa ela **come** (o garfo
      vai do prato à boca), não fica parada olhando a janela o tempo todo.
- [ ] **Plano 37 — lavar a louça:** hoje sai com as mãos cruzadas (ver a regra crítica). Mãos na louça debaixo
      da água, cada uma do seu lado.
- [ ] **Planos 38–43 — o vizinho:** **narrar**. Ideia do usuário: a Duda escuta a sirene, abre a janela e vê o vizinho
      sendo levado.
- [ ] **Tarefa (planos 46–47):** braço cruzado também. **Narrador** no começo, e a fala da Duda passa a ser:
      **"Terminei a tarefa. Vou ver o Gabi, estou preocupada com eles."** (o usuário escreveu "preocupado"; a Duda é
      menina → "preocupada". Confirmar.) Substitui `ep2-duda-06` ("Vou ver o Gabi.").

### Bloco 4 — o portão (3:35 → 4:30)

- [ ] **Plano 49 (duda-caminho) — ERRO GRAVE:** ela sai de casa e **para no meio da rua**. Atravessar direto e
      parar na calçada.
- [ ] **Planos 51–53 (duda-portao, 3:50) — ERRO GRAVE:** com o zoom aberto ela aparece **de costas para a casa do
      Gabi**. Falta a ação: ela **abre o portão**, vai até a porta e **bate na porta**. Ela tem que estar de frente
      para a casa quando fala com a mãe do Gabi (hoje fala de costas).
- [ ] **Planos 54–55 — a mãe do Gabi:** a porta abre **para dentro**; **depois** ela sai e responde à Duda. Tudo no
      tempo real de uma pessoa fazendo isso.
- [ ] **Plano 55 — boca da mãe do Gabi rápida demais:** sincronizar com a fala `c09-mae-03`.
- [ ] **Planos 56–57:** a Duda **continua de costas** — virar para a câmera ou para a casa (de frente ou 3/4).
- [ ] **Plano 58 (duda-volta, 4:17) — o andar:** sem braços cruzados: **cabeça baixa e braços naturais** (isto troca o
      "braços cruzados abaixo do peito" do mapa). O **poste** está na rua → passar para a calçada. Ela **para no meio
      da rua de novo** → atravessa e para na calçada.

### Bloco 5 — eles vêm (4:30 → 5:29) e o fim

- [ ] **Plano 62 (duda-sirene, 4:34):** a mão dela está **dentro do colchão**.
- [ ] **Plano 62 — narrador:** trocar "quem cegasse seria isolado" por **"quem estiver cego será isolado."**
      Atenção: o `narrador-n13` é a **mesma gravação do EP1**. Fazer uma fala nova só do EP2 (`ep2-narrador-n0X`)
      para não mexer no EP1 — salvo ordem contrária.
- [ ] **Depois disso o narrador continua contando a história** pelos planos sem fala (ver a regra geral).
- [ ] **Plano 68 (duda-levam):** a câmera treme → **câmera firme**.
- [ ] **Plano 70 — ela sai correndo:** mostrar ela **abrindo a porta** (hoje passa sem abrir).
- [ ] **Novo final (planos 75–77 e a tela final):**
      1. a tela preta do fim fica **~10 s em preto** (hoje ~1 s);
      2. a van entra com **fade do preto** (hoje é corte seco); a van é **branca** — ela tem que aparecer branca;
      3. depois do plano do Gabi, **corte seco para o preto** e a tela final "INSCREVA-SE".
      O episódio fica ~9 s mais longo (≈5:49 com a tela final): reajustar `FIM_EP`/`TOTAL` em `montar_ep2.py`.

## Vozes novas a gerar (depois de o usuário aprovar os textos)

| id | quem | onde | texto |
|---|---|---|---|
| ep2-narrador-n04 | narrador | plano 33 (Duda sozinha na cozinha) | *a escrever* |
| ep2-narrador-n05 | narrador | planos 35–36 (micro-ondas, almoço) | *a escrever* |
| ep2-narrador-n06 | narrador | planos 38–43 (sirene, janela, o vizinho levado) | *a escrever* |
| ep2-narrador-n07 | narrador | plano 46 (a tarefa) | *a escrever* |
| ep2-narrador-n08 | narrador | plano 62 (substitui n13 no EP2) | "Ao anoitecer, a notícia já tinha virado ordem: quem estiver cego será isolado." |
| ep2-duda-06 (refazer) | Duda | plano 47 | "Terminei a tarefa. Vou ver o Gabi, estou preocupada com eles." |

Gerar com `scripts/melhor-take.mjs` e conferir no gráfico ([voz natural, sem edição]). Cada fala nova muda tempos no
mapa: atualizar `MONTAGEM_EP2.md`, `assets/ep2/falas.js` e `montar_ep2.py`.
