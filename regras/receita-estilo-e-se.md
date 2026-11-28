# Receita de estilo — o método "E se?" aplicado ao semvisão 3D

Uma receita para seguir passo a passo ao fazer um episódio. Ela junta três coisas:

1. **O método** medido quadro a quadro no vídeo de referência "E se você acordasse todo dia com um poder DIFERENTE?". Os dados estão em `analise_referencia/poder_diferente/relatorio.md`.
2. **As regras do EP1 (Gabi, modo cego)**, aprovado em 2026-11-24.
3. **As regras do EP2 (Duda, modo vidente)**, combinadas para a produção.

**O que vale em caso de dúvida.** Este arquivo é um resumo. As fontes da verdade são, nesta ordem: `briefing/minimundo.md`, `briefing/serie-biblia.md`, `briefing/linguagem-visual.md`, `producao/ep1/assets/rig/elenco.js` (`FICHAS`), `personagens/*.md` e `aprendizado/padrao-de-qualidade.md`. Se este arquivo e a fonte divergirem, vale a fonte.

**A regra de ouro da série.** Herdamos o **método** da referência, ou seja, a gramática de câmera, de corte, de grafismo e de som. Nunca herdamos o **conteúdo**: nenhuma frase, ordem de cena, personagem ou imagem vem de lá (`serie-biblia.md`). E o tom é outro: **thriller social, não comédia**. Onde a referência usa uma piada, nós usamos medo, vergonha ou silêncio.

Legenda das marcas:
- **[Cânone]** já é regra da série.
- **[Método]** vem da medição da referência e não contraria o cânone.
- **[Decidido 2026-11-25]** a referência e o cânone discordavam, e o usuário decidiu. Já está registrado em `briefing/linguagem-visual.md`. A lista completa está na seção 6.

---

## 0. Antes de começar (sempre)

1. Ler inteiros `briefing/minimundo.md`, `serie-biblia.md` e `linguagem-visual.md`. Eles nunca entram no "não precisa reler".
2. Ler `personagens/*.md`: quem está cego, em que dia, o que já foi revelado.
3. Ler a entrada mais recente de `aprendizado/registro.md`.
4. Fazer o **mapa de montagem por blocos**, no modelo de `episodios/MONTAGEM_EP1.md`, e mostrar ao usuário **antes** de produzir cena por cena. **[Cânone]**

---

## 1. A fórmula do roteiro

### 1.1 A espinha (o que a referência faz, traduzido para nós)

| Peça | Na referência (método) | No semvisão |
|---|---|---|
| **Regra única** | Uma pergunta "E se…?" que gera um evento novo por dia | **A cegueira é gradual: 2 a 3 pessoas por dia, nunca todas de uma vez.** É o motor de tudo. **[Cânone]** |
| **Unidade de capítulo** | O **dia** (segunda, terça…), cada um aberto da mesma forma | O **dia** da série (Dia 1, Dia 2…), com o selo "DIA X · N cegos". **[Cânone]** |
| **Gancho inicial** | A pergunta e o título em **7 s** | A abertura padrão (cidade → apaga → flash/boom → globo) e o **truque da câmera** (tela preta → virada → cego ou vidente), fechando **antes de 0:40**. **[Cânone]** |
| **Narrador** | 3ª pessoa, calmo, **explica a regra** de cada evento com uma frase de lógica | 3ª pessoa, tom de thriller, frases curtas, **nunca por cima de diálogo**. **[Cânone]** Pode explicar uma regra do mundo em uma frase, mas **só regra já registrada no cânone**. Se faltar fonte, parar e perguntar. **[Método]** |
| **Ameaça crescente em paralelo** | Um antagonista que junta pistas a cada dia | A **quarentena e a TV** apertando: a notícia vira "vírus", depois vira ordem, depois a van. **[Cânone]** |
| **Plantar → pagar** | O objeto ou personagem do começo volta no fim (callback) | Plantar e pagar sempre, e registrar em `episodios/_modelo.md` ("Setups plantados / payoffs pagos"). Exemplos já no cânone: a **voz da Duda no portão** (EP1 planta, EP2 paga), o **fone** do Gabi, o **plano-espelho** da levada (plano 68). **[Cânone]** |

### 1.2 Como abre (primeiros 40 s)

1. **Abertura padrão, idêntica nos EPs 1 e 2** (cerca de 15 s): São Paulo 23:30, as luzes apagam, o relógio acelera até 03:30, **FLASH** com silêncio absoluto, **BOOM**, e a câmera sobe até o globo escuro. Narrador n01/n02. **[Cânone]**
2. **Tela preta como isca** (cerca de 20 s), só com a respiração. **[Cânone]**
3. **A virada da câmera revela o POV:**
   - EP ímpar: o Gabi, com os olhos **nublados** (cinza fosco `#6a6a71`, nunca brancos lisos);
   - EP par: a Duda, **enxergando**, e a imagem "explode" em cor. **[Cânone]**
4. Logo depois, a primeira frase do narrador situando quem é e o que mudou (como o n03 do EP1). **[Cânone]**

### 1.3 O que se repete dentro de cada episódio

O esqueleto que a referência repete a cada dia, adaptado ao nosso tom. **[Método]**

1. **Despertar.** O dia começa no mesmo lugar (a cama, o despertador apagado) e vira ritual.
2. **Descoberta.** O que mudou hoje: quem cegou, o que a TV diz.
3. **A regra em uma frase**, dita pelo narrador **numa pausa sem diálogo**.
4. **Problema em casa.** O corpo e a casa viram obstáculo; o afeto da família aparece.
5. **Problema no bairro.** O minimundo reage: vizinho, TV vazando, sirene.
6. **Um pequeno domínio ou esperança frágil** ("a gente aprende junto"), um respiro **antes do próximo golpe**. **[Cânone]** (`minimundo.md`, "Esperança frágil")
7. **O golpe.** A quarentena, a perda, a separação.
8. **A virada do dia.** Passagem de tempo com **fusão + selo de hora**, a única fusão permitida. **[Cânone]**

**Variação obrigatória.** Repetir o esqueleto **com uma quebra** no último dia ou no último bloco. A referência faz isso com um dia "em branco", sem o evento, e é ali que fica a emoção maior. Para nós a quebra serve à emoção, nunca ao alívio: **sem resolução limpa**. **[Método + Cânone]**

### 1.4 Como termina

1. **Desfecho emocional sem solução.** O golpe acontece e ninguém salva ninguém. **[Cânone]**
2. **Rima visual** com uma cena anterior, no mesmo enquadramento e com o sentido invertido. A referência rima um abraço "congelado" com um abraço "de verdade". Nós já temos o **plano-espelho** (EP2 = plano 68 do EP1 visto pela Duda). **[Método + Cânone]**
3. **Frase final do narrador**, curta e com peso ("E esse... foi só o primeiro dia."; no EP2, "Naquela noite, a Duda viu tudo... Por enquanto."). **[Cânone]**
4. **Gancho.** Uma imagem que abre a pergunta do próximo episódio. A referência termina num **lugar desconhecido**, com o personagem sozinho e a câmera se afastando. Para nós, o mistério da causa é a fonte: **"conta-gotas, nunca rápido"**. **[Método + Cânone]**

### 1.5 O pedido de comentário

**Na referência:** no fim, sobre um card, o narrador faz **2 ou 3 perguntas diretas** ao público, e cada pergunta tem uma imagem do próprio episódio que acende quando é citada. Depois vem a etiqueta "ESCREVE NOS COMENTÁRIOS", e por fim a tela final com cerca de **10 s parados** para as telas finais do YouTube. **[Método]**

**No semvisão [Decidido 2026-11-25]:**
- **Depois do final** (a frase do narrador e o gancho), entra o texto **"INSCREVA-SE"**. Ele segue o estilo dos textos (4.1): branco e destaque `#e8b923`, sobre caixa escura arredondada, entrando em cerca de 0,1 s com o "assentar". Se o narrador disser algo junto, o texto entra 2 quadros antes da palavra "inscreva".
- **Tela final de cerca de 10 s** logo depois, sobre um plano do próprio episódio (o último quadro do gancho, escurecido). Deixar espaço livre para as telas finais do YouTube ("outro episódio", "inscreva-se"), com o "INSCREVA-SE" na tela. Música baixando, sem fala nova.
- **Sem perguntas ao público por enquanto.** O combustível de comentário continua sendo o que o cânone já prevê, dentro da história:
  - o mistério da causa ("teorias");
  - o **easter egg sonoro** (voltar ao EP1 para reouvir a voz da Duda). **[Cânone]**
- **Sem anúncio no meio do episódio.** A referência tem 2 anúncios de 12 a 16 s embutidos na ficção ("a TV vai para o intervalo"). Não temos produto para anunciar. Se um dia houver, o método é: **entrar pela ficção e voltar no mesmo enquadramento**. **[Método, não usar por enquanto]**

---

## 2. A câmera

### 2.1 Os números

| Medida | Referência (14:35, 60 fps) | Nossa régua **[Cânone]** |
|---|---|---|
| Duração mediana do plano | **1,45 s** (90% abaixo de 3 s) | **EP1 (cego): 4–5 s.** **EP2 (vidente): 3,5–4,5 s** |
| Cortes por minuto | **34** | **EP1: 10–15. EP2: 12–15** |
| Câmera totalmente parada | 17% do tempo | "Maioria **fixa**; o movimento vem do corte" |
| Aproximação lenta contínua (push-in) | **cerca de 70% do tempo**, 2–4% de escala por segundo, com balanço e giro leves | — |
| Câmera na mão | balanço leve em quase tudo | **Só no pânico** |
| Corte | seco; transição só em cartões e efeitos | **Seco, sem dissolve; fusão só na passagem de tempo** |

**Achado que muda a leitura da régua antiga.** A análise anterior dos 3 vídeos de referência dizia "54% de câmera fixa". A medição quadro a quadro mostra que, na referência, quase todo plano "fixo" tem uma **aproximação lenta quase imperceptível**, de 2 a 4% por segundo. Ou seja, o "fixo" da referência **respira**.

**[Decidido 2026-11-25] Push-in lento nos planos "fixos":**
- **1–1,5% de escala por segundo**, sem balanço, com *ease* no início e no fim. É mais lento que a referência, para combinar com o thriller.
- Vale **só nas cenas novas**: o EP1 aprovado não muda.
- Continua sendo "maioria fixa", porque não há pan nem trilho.
- **Exceções, em que a câmera fica parada de verdade:** cartões, grafismos, a tela final e os momentos de ênfase (2.2).
- **Na prática:** a escala da câmera, ou o FOV, vai de 1,00 a cerca de 1,05 num plano de 4 s.

**[Decidido 2026-11-25] Ritmo de corte: fica a nossa régua** (4–5 s no cego, 3,5–4,5 s no vidente). A referência corta 2 a 3 vezes mais rápido. A régua é uma **hipótese** (`registro.md`) e só muda com a medição de um episódio nosso publicado.

### 2.2 Quando a câmera fica parada [Método, combina com o cânone]

A parada é **ênfase**. A referência para a câmera em quatro situações:
- **Quando uma informação precisa ser lida:** um número, um selo, uma tela de TV. Ela para cerca de 0,3 s antes e segura até o texto ser lido.
- **Na fala que decide a cena:** a câmera para no instante do pedido ou da ameaça.
- **No desfecho emocional:** o bloco final da referência tem **29% de câmera parada**, contra 8–14% no resto.
- **Nos cartões e grafismos chapados:** sempre parada.

Para nós, isso coincide com o `minimundo.md`: a câmera **"fica parada e paciente na ternura"**.

### 2.3 Quando e como ela se move [Método + Cânone]

| Movimento | Quando usar | Como |
|---|---|---|
| **Afastar (zoom-out / grua para trás e para cima)** | Para **revelar**: o tamanho de algo, a solidão de alguém, o bairro inteiro. A referência guarda o afastamento para revelações (cerca de 12% do tempo) | Lento, com *ease* no início e no fim. A abertura padrão (sobe até o globo) já é isso. **[Cânone]** |
| **Aproximar** | Tensão crescente, rosto em decisão | Lento e constante. Nunca um zoom rápido de "susto" |
| **Pan ou tilt** | Acompanhar quem anda (entrada pela porta, travessia da rua) | Sempre somado à ação, nunca "passear" |
| **Na mão (tremor)** | **Só pânico:** a queda, a revolta, a levada | **[Cânone]** |
| **Ease** | Todo movimento | Sem tranco no início ou no fim (`padrao-de-qualidade.md` §1). **[Cânone]** |

### 2.4 Quando cortar [Método]

- **No fim da ação ou da frase**, não no meio. O corte da referência cai logo depois de a fala terminar ou de o efeito completar (por exemplo, o efeito termina e o corte vem 1 quadro depois).
- **Um plano por fala** em diálogo curto: plano e contraplano alternando.
- **Reação intercalada.** Depois de uma fala forte, cortar para **quem ouve**. A referência sempre mostra a reação de 1 ou 2 personagens secundários. Para nós, a mãe, o pai, a Duda ou um vizinho na janela.
- **Cada coisa citada pelo narrador ganha o seu plano**, com o corte na palavra. Se o narrador diz "as sirenes tomaram as ruas", o corte para as sirenes vem **na palavra**.
- **Montagem de lista** (vários objetos ou pessoas em sequência): cortes de 0,5 a 1 s, **só** em bloco de conflito ou de pânico (o nosso "burst" de 0,1 a 0,5 s). **[Cânone]**
- **Match cut de lugar:** o mesmo enquadramento em lugares diferentes, para mostrar alcance (por exemplo, a mesma janela em várias casas apagando). **[Método]**
- **Plano longo e silencioso depois do golpe:** segurar 1 a 2 s a mais depois da emoção. "Corte cedo demais e ela morre." **[Cânone]**

---

## 3. O visual

### 3.1 O personagem [Cânone]

- **Low-poly com cel-shading**, o mesmo método da referência. **Cabeça com cerca de 32% da altura** (a referência usa cerca de 40%). **Contorno preto puro** (`OUT = 0x000000`) em casca BackSide em toda forma.
- **Do EP2 em diante, personagem em PBR e cenário em toon** **[Decidido 2026-11-25]**:
  - o personagem usa `Elenco.build(id, { refinado: true, material: "pbr" })`, com geometria lisa e pivôs de cintura e peito;
  - depois das luzes, chamar `Elenco.ambiente(renderer, scene)`, porque o reflexo nasce delas (senão o boneco parece colado);
  - o cenário continua com o toon de 3 faixas;
  - o EP1 continua todo em toon.
- **No `render()`:** posar primeiro, depois `Elenco.vida(g, t, { ritmo })`. Movimento com peso usa `Elenco.mola()`, nunca lerp quadro a quadro.
- **Rosto simples, mas expressivo:** olhos, sobrancelhas e boca rigados para medo, vergonha e choro contido. Uma troca de expressão passa por um "take" (antecipação → nova cara → assentamento).
- **A imagem conta a frase:** cada fala ou narração tem na tela a ação (ou a imagem parada) que ela diz — quem assiste tem que ver o que estamos contando. Se a ação pede cobrir a boca (toalha no rosto, mão na boca de susto, escova de dentes), cobre. Enquanto o personagem fala, a boca mexe junto com a voz. *(A antiga regra "boca sempre visível" foi abolida pelo usuário em 2026-11-28.)*
- **A boca só mexe durante a fala**, em sincronia com a voz. Fora da fala, fica na forma da expressão.
- **Personagens vivos:** **piscar** (cerca de 0,12 s a cada 3–5 s, com fase diferente para cada um; o olho cego também pisca) e **respirar no tronco** (peito e ombros, mais rápido no medo e no choro), **com irregularidade**, nunca uma senoide de metrônomo. É a função central `Elenco.vida()`, que entra **nas cenas novas do EP2** sem mexer no EP1 aprovado.
- **Proporções e corpo** só por `Elenco.build` e pelas `FICHAS`. Pescoço, juntas e cotovelo para fora do corpo, como em `padrao-de-qualidade.md` §5.
- **Cores exatas** (as do rig mandam):

| Personagem | Pele | Cabelo | Roupa | Calça | Detalhe |
|---|---|---|---|---|---|
| Gabi (cego) | `#c68e62` | `#241c17` | moletom `#aed0ec` com capuz | `#454551` | fone `#24242a`; olho nublado `#6a6a71` |
| Duda (vidente) | `#f3d6c2` | `#e0bd72` (loira, longo) | `#f2c4d0` | `#8fa3c4` | blush `#f3aeb2` |
| Mãe | `#f0cfb4` | `#7a5236` (rabo de cavalo) | `#c9835b` | `#5d6d8c` | blush `#f0aaa6` |
| Pai | `#6e4630` | `#16110e` (crespo) | `#6f7f5a` | `#8a7a5e` | barba |
| Repórter | `#d9a77f` | `#1a1412` (chanel) | blazer `#7a2e3a` | `#2b2b33` | batom `#a3333f` |
| Agente de quarentena | `#d9b08c` | — | macacão `#e4e8eb` (sem rosto) | `#e4e8eb` | faixa `#e8b923` |

### 3.2 O cenário [Cânone]

- **O minimundo:** um bairro de casas térreas com muro e portão baixos. A Duda mora do lado oposto da rua, cerca de 3 casas à esquerda do Gabi, com **linha de visão diagonal** da janela dela até o portão dele (`briefing/cenarios.md`). Medidas reais em `compositions/rua.html`.
- **Cenários-base:** quarto do Gabi, sala com TV, cozinha, portão/calçada/rua, quarto e janela da Duda, e depois o ginásio de quarentena.
- **Sinais de vida que se repetem:**
  - o cão que late sempre no mesmo horário;
  - o varal;
  - um brinquedo na calçada;
  - a TV do vizinho vazando;
  - figurantes que **aumentam** conforme a série avança;
  - telhados de cores variadas.

  A referência faz o mesmo: o vizinho, o cachorro e o café **voltam** em vários dias e pagam no final. **[Método]**
- **Luz:** uma fonte principal **motivada** (janela, TV, poste); cel em 3 faixas; preenchimento fraco no rosto de quem é o foco; contraluz sempre com preenchimento.
- **Profundidade:** primeiro plano, plano médio e fundo em toda composição. Névoa e poeira discretas.
- **Objetos que contam a história:** despertador apagado, abajur e copo que vão cair, fone na mesinha.

### 3.3 As cores [Cânone]

| Modo | Imagem | Pós (`assets/rig/pos.js`) | Luma alvo |
|---|---|---|---|
| **Abertura (antes do evento)** | Limpa | grão 0 · fumaça 0 · dessat 0 | — |
| **Cego (Gabi)** | Dessaturada, vinheta de **fumaça em forma de pálpebra** que avança no medo e recua na calma | **grão baixo · fumaça 0,15 · dessat 0,2**. No pico de impacto, **só o grão sobe** (+0,1). Nunca escurecer a fumaça no fim do plano | 85–95 (noite ~65–80, nunca abaixo de ~55) |
| **Vidente (Duda)** | **Nítida, cor viva, qualidade total** | Sem filtro. O escurecimento das bordas dela é **outro efeito, a criar**, e **ainda não aparece no EP2** | ~110–125 |
| Equipe de quarentena | Azul-ardósia, frio | — | — |
| Ambiente geral | Cinza-azulado, esvaziando de cor ao longo da série | — | — |

Medir com `python producao/ep1/ferramentas/medir_luma.py <quadro.png>`.

### 3.4 Como cada peça é apresentada [Método, adaptado]

| Peça | Como entra |
|---|---|
| **Personagem novo na cena** | Pela **porta ao fundo** ou pela **borda do quadro em primeiro plano**. Nunca "aparece" parado no meio. A primeira imagem dele vem **antes** da primeira fala |
| **Personagem novo na série** | Primeiro **plantado de passagem** (ao fundo, uma linha, um objeto); depois ganha cena. A referência planta um figurante na fila que se revela o vilão 10 min depois. A Duda do EP1 (só voz) é o nosso caso |
| **Objeto importante** | Um **insert** (close de detalhe) de 0,5 a 1,5 s **antes** de ele ser usado, e de novo quando paga (como o bilhete "fui ao mercado", que volta com outro peso). Para nós: o fone, o copo, o despertador apagado |
| **Mudança de estado** (alguém cega, a luz acaba, a notícia muda) | Mostrada **num plano aberto**, com a câmera parada ou num push-in lento, e **com tempo** (a referência leva 0,75 s só para o ouro cobrir uma parede). Depois, o **close da reação** |
| **Efeito-assinatura** | Um efeito visual que se **repete igual** toda vez que o estado muda, e vira marca. A referência usa um anel de luz ao "voltar ao normal". O nosso é a **vinheta de fumaça** (modo cego) e, a criar, o **escurecimento das bordas** da Duda |
| **Revelação** | Pelo **afastamento da câmera** (zoom-out) ou pela **virada da câmera** (o truque de POV). **[Cânone]** |
| **Ameaça** | Pelo **fundo do corredor ou da rua, em contraluz**, vindo na direção da câmera: a van e os agentes |
| **Passagem de tempo** | **Fusão + selo de hora.** **[Cânone]** A referência também usa a **luz mudando dentro do mesmo plano** (noite → dia sem corte). É compatível com o cânone e pode ser usado. **[Método]** |

---

## 4. Os textos na tela e o som

### 4.1 Textos [Cânone + Método]

- **Não há legenda de fala ou de narração.** Nunca escrever diálogo na tela. A referência também não usa legenda. **[Cânone]**
- **Textos permitidos:**
  1. **Selo de dado** "**DIA X · N cegos**", no topo à esquerda. **[Cânone]** (O EP2 combinou só "DIA 1".)
  2. **Relógio e local** fixo no canto ("São Paulo · 23:30"), acelerando de 23:30 até 03:30 na abertura. **[Cânone]**
  3. **Tarja da TV** (o chyron): "CEGUEIRA: VÍRUS? — casos dobram a cada dia". Na referência, a TV também tem "● AO VIVO", a tarja "URGENTE | …" e um gráfico que **se desenha** na palavra do repórter. **[Cânone + Método]**
  4. **Texto do cenário:** calendário de **novembro** na parede, número das casas, placas, bilhetes. Ajuda o minimundo e não conta como legenda.
- **Como o texto entra [Método]:**
  - em cerca de **0,1 s**, com um leve "assentar" (de um pouco maior para o tamanho final, e de transparente para opaco);
  - **2 quadros antes** (a 30 fps) da palavra do narrador que ele nomeia (a referência mede 3 a 5 quadros a 60 fps);
  - fica **preso à tela** atravessando os cortes e sai junto com o fim da frase.
- **Sincronia com a palavra.** Se o contador "N cegos" muda, o número **gira na palavra** em que o narrador ou a TV fala do número. **[Método]**
- **Estilo:** grotesca bold (referência: condensada pesada, em maiúsculas), **branco com o destaque em `#e8b923`** (o amarelo da faixa do agente, que liga o grafismo à ameaça), sobre caixa escura arredondada. **Nunca abaixo de ~28 px** em 1080p (falha `text_below_floor` do `check`). **[Cânone + Decidido 2026-11-25]**
- **Cartão de dia [Decidido 2026-11-25].** Na **virada de cada dia**, um cartão sóbrio em tela cheia **"DIA X · N cegos"**:
  - fundo escuro, sem speed lines e sem clarão;
  - "DIA X" em branco e "N cegos" em `#e8b923`;
  - cerca de 2 s na tela, com câmera parada;
  - cerca de 0,2 s de silêncio antes de ele entrar;
  - ele **não substitui** o selo fixo do canto.

  No EP2 o episódio inteiro é o Dia 1 e o selo combinado é só "DIA 1", então o cartão só aparece se houver uma virada de dia.

### 4.2 Som [Cânone + Método]

- **Nunca mudo.** Sempre há ambiente por baixo, porque gente faz barulho. **[Cânone]**
- **Vozes:**
  - cada personagem tem a **própria voz**;
  - a repórter da TV é **voz feminina**, a mesma em todos os episódios;
  - TTS (Gemini, as mesmas vozes do EP1: Mãe Sola, Pai Charon, Gabi Enceladus, Agente Achird) **sempre ouvido e aprovado** pelo usuário, nunca em lote. **[Cânone]**
- **Narrador:**
  - 3ª pessoa, thriller, frases curtas com respiro, **só onde ninguém fala**;
  - o texto é proposto numa tabela (nNN · onde entra · texto) e escrito também em `.txt` para o Bloco de Notas, com as expressões entre colchetes;
  - o usuário gera os áudios;
  - a normalização é feita em **−18 LUFS (.wav)**. **[Cânone]**
- **Diálogos curtos:** 2 a 6 palavras, um por plano. Depois de um susto, **dar tempo de reação** antes de responder. **[Método + Cânone]**
- **Música:**
  - o pad ou ambiente triste fica baixo, por baixo das cenas íntimas;
  - a música sobe só em perseguição ou em clímax;
  - fica **fora** do FLASH e do silêncio antes do sequestro. **[Cânone]**
- **O silêncio é ferramenta.** Os lugares medidos na referência **[Método]**:
  - cerca de **0,2 s de silêncio antes de um efeito ou revelação**;
  - **1 a 2 s de silêncio antes de uma reação coletiva** (a referência usa 2 s de silêncio digital total antes do aplauso);
  - **silêncio longo quando o mundo "para"**;
  - silêncio no **cartão ou momento "vazio"** que quebra o padrão.

  No nosso cânone, isso já existe no **FLASH** (silêncio absoluto) e no **silêncio estratégico antes do sequestro**.
- **O som lidera a imagem.** Quando o estado muda (o tempo para, ele cega, a luz apaga), o **som muda 2 a 3 quadros antes do corte de imagem** (J-cut). **[Método]**
- **Efeitos sonoros:** catálogo em `briefing/efeitos-e-audio-ep1.md`. Os sons realistas vêm de biblioteca CC0; os sintetizados são temporários.
- **Mixagem:**
  - o volume da fala sempre acima da música;
  - nenhum diálogo coberto por narrador ou por efeito;
  - conferir com o vídeo inteiro, não só por amostra.

---

## 5. Checklist do episódio (seguir na ordem)

1. **Ler** a seção 0 deste arquivo e as fontes.
2. **Roteiro:** copiar `episodios/_modelo.md` e preencher:
   - a espinha (1.1);
   - abertura e truque (1.2);
   - o esqueleto repetido com uma quebra (1.3);
   - fim, rima e gancho (1.4);
   - depois do final, "INSCREVA-SE" e a tela final de cerca de 10 s (1.5);
   - um cartão "DIA X · N cegos" em cada virada de dia (4.1);
   - setups e payoffs.
3. **Narrador:** a tabela nNN, só nos buracos sem diálogo, e o `.txt` para gerar.
4. **Mapa de montagem por blocos**, com cada plano: duração, câmera (fixa / afasta / na mão), corte (na palavra, reação, burst), texto na tela e som (fala, sfx, música, silêncio). **Mostrar e esperar aprovação.**
5. **Produzir cena por cena:**
   - rig com `Elenco.vida()` nas cenas novas;
   - push-in de 1–1,5%/s nos planos fixos das cenas novas (2.1);
   - boca visível e mexendo só na fala;
   - luz motivada;
   - pós conforme o modo (3.3).
6. **Revisar antes de mostrar** (`padrao-de-qualidade.md`):
   - `npm run check` passa;
   - snapshot dos momentos-chave **olhado** quadro a quadro;
   - luma medida;
   - os 5 itens de qualidade.
7. **Renderizar só quando o usuário mandar**, nem um trecho para "provar".
8. **Auditar roteiro × vídeo** antes de dizer "pronto":
   - cada fala;
   - cada sfx;
   - a música;
   - a duração.

   Apresentar como tabela, com as lacunas.
9. **Depois de publicar:**
   - medir com as ferramentas de `analise_referencia/ferramentas/`: `medir_quadros.py` → `bordas_cortes.py` → `planos_camera.py` → `folhas.py` (ver `analise_referencia/poder_diferente/ANDAMENTO.md`, "Como refazer");
   - comparar com a régua (2.1);
   - escrever a entrada em `aprendizado/registro.md`;
   - atualizar `personagens/*.md`.

---

## 6. Decisões do usuário (2026-11-25)

Todas já estão registradas no cânone (`briefing/linguagem-visual.md`).

| # | Tema | O que vale |
|---|---|---|
| 1 | Câmera nos planos "fixos" | Push-in de **1–1,5%/s**, sem balanço, com ease, **só nas cenas novas** |
| 2 | Ritmo de corte | **Fica a nossa régua:** 4–5 s no cego, 3,5–4,5 s no vidente, até medir um episódio nosso publicado |
| 3 | Fim do episódio | Depois do final, o texto **"INSCREVA-SE"**. **Sem perguntas ao público** por enquanto |
| 4 | Tela final | **Cerca de 10 s**, sobre um plano do próprio episódio, com espaço para as telas finais do YouTube |
| 5 | Virada de dia | Cartão sóbrio **"DIA X · N cegos"** em tela cheia, com cerca de 2 s e 0,2 s de silêncio antes |
| 6 | Cor de destaque dos textos | **`#e8b923`** (faixa do agente) |
| 7 | Duração do episódio | **Sem mudança:** a meta da bíblia é 8–10 min; o EP1 ficou em 4:54 e o EP2 está previsto para cerca de 4:30–5:30 (dívida conhecida) |
