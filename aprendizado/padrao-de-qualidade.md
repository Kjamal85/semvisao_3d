# Padrão de qualidade — régua para toda cena (a partir dos prompts P-0405)

Os prompts de correção do curso (P-0405-01 a 05) viraram critério de **construção**: cada
cena já nasce cumprindo isto, e a revisão confere item a item antes de mostrar. Os exemplos
do curso (Dr. Copi) não entram — só o nível de exigência, aplicado ao nosso elenco.

## 1. Animação — fluidez e naturalidade
- Nada move em uníssono: cabeça lidera, braços seguem com atraso; amplitudes diferentes
  para cada lado do corpo.
- Personagem parado ainda vive: respiração (mais curta quando assustado), micro-movimento
  de cabeça. Tudo em função do tempo da timeline (render determinístico).
- Câmera com ease suave (sem tranco no início/fim do movimento).
- Troca de expressão passa por um "take" (antecipação → nova cara → assentamento), nunca
  pula de uma para outra.
- **Cenas novas (EP2 em diante) usam o rig refinado** (2026-11-25), sem mexer no EP1 aprovado,
  que continua usando `Elenco.build(id)` e sai pixel a pixel igual:
  - `Elenco.build(id, { refinado: true, material: "pbr" })` dá a geometria lisa, os pivôs de cintura
    e peito e o material PBR. **Personagem em PBR, cenário em toon** (decisão do usuário, 2026-11-25).
  - Depois de pôr as luzes, chamar `Elenco.ambiente(renderer, scene)`: o reflexo nasce delas. Com um
    céu fixo, o boneco fica mais claro que a cena e parece colado (teste do portão, 2026-11-25).
  - No `render()`, posar primeiro e **depois** chamar `Elenco.vida(g, t, { ritmo })`, que cuida de
    respirar, balançar, piscar, olhar e mexer os dedos. Os ritmos são calmo, medo, tensao, choro e alivio.
  - Movimento com peso usa `Elenco.mola(chaves, t, { freq, amort })`, nunca lerp quadro a quadro,
    porque o render é por seek. A cabeça pede uma mola mais lenta (~1,5 Hz) que o braço (~2 Hz).
  - Teste visual em `compositions/elenco-refinado.html`, que fica fora do episódio.

## 2. Elementos de cena — detalhe e variedade
- Objetos que contam a história, não enfeite: no quarto do Gabi, despertador apagado
  (apagão), abajur e copo (vão cair), fone na mesinha (objeto-assinatura), moletom de ontem
  na cadeira.
- Variedade com semente fixa (alturas/cores de livros etc.), nunca repetição idêntica.

## 3. Cenário — profundidade e ambientação
- Uma fonte de luz principal **motivada** (janela, TV, poste) e sombras projetadas; cel em
  3 faixas (luz, meio-tom, sombra) — nada de iluminação chapada.
- Preenchimento fraco no rosto de quem é o foco da cena, mesmo no escuro.
- Atmosfera: névoa de profundidade e partículas (poeira no feixe) discretas — se parecer
  neve, está grande demais.
- Primeiro plano, plano médio e fundo em toda composição.
- **Medir:** `python producao/ep1/ferramentas/medir_luma.py <quadro.png>`. Meta do episódio:
  luma mediana 85–95 (registro.md). Cena noturna/apagão pode ficar abaixo (~65–80), nunca
  pela metade: abaixo de ~55 vira tela preta no celular.

## 4. Roteiro — ritmo e clareza das falas
- Fala de quem acabou de levar um susto não vem colada na anterior: deixar um tempo de
  reação (respiração, olhar, silêncio) antes de responder.
- Falas já aprovadas não mudam de texto; o ritmo se ajusta no tempo entre elas.

## 5. Anatomia — proporção e consistência
- Proporções vêm só de `Elenco.build` (fichas fixas): ninguém muda de tamanho entre cenas.
- Nada atravessa nada: mão no corpo, pé no lençol, personagem em móvel. Conferir em todas
  as vistas usadas (frente, 3/4, costas).
- Rig com quadril e joelho para sentar, tropeçar e cair; poses novas entram como `pose`
  no rig, não ajustadas à mão em cada cena.
- Cabeça inclina pelo **pescoço** (`Elenco.cabeca(g, baixa, vira, lado)`), nunca pelo centro da
  cabeça — senão o queixo afunda no corpo (aconteceu na sala, 2026-11-22). Olho cego não fecha
  abaixo de 0,78 (achatado parece olho roxo).
- **A boca aparece sempre** (pedido do usuário): nada de queixo afundado nem mão/objeto na frente da boca.
- **Juntas aparentes** (pedido do usuário, 2026-11-22: "todo tem que ser assim"): ombro e cotovelo
  arredondados no rig, cotovelo visível e apontando para baixo quando a mão sobe ao peito/rosto.
  Se o `alcancar` levantar o ombro para trás (cotovelo do rig só dobra até -2,2), posar à mão.
- **Pescoço** (2026-11-22): tronco até 1,82, pescoço de pele, cabeça em `Elenco.CABECA_Y` (2,30).
  Nunca escrever 2.2 à mão para a cabeça; usar `Elenco.CABECA_Y` ou `Elenco.cabeca()`.
- **Corpo** (aprovado 2026-11-22): mãos com dedos na cor da pele (agente: luva branca), forma por cena com
  `Elenco.mao(g, lado, "aberta"|"segura"|"punho", u)`; cintura (`cintura` na ficha) e quadril na cor da calça.
  O fone NÃO fica no pescoço do Gabi (usuário: "deixa assim").
- **Cotovelo nunca dentro do corpo** (regra do usuário, 2026-11-22): mão no peito/fone/colo com o cotovelo
  para fora do tronco. Cenas novas: `Elenco.alcancar(g, lado, alvo, { foraDoCorpo: true })`
  (pune cotovelo/antebraço dentro do tronco). Desligado por padrão para NÃO mexer nas cenas já aprovadas (pedido do usuário).
- Mão que toca algo (copo, batente, ombro) usa `Elenco.alcancar(g, "esq"|"dir", alvo)` — não chutar ângulo.
- Personagem de frente para uma bancada/parede fica meio de lado (3/4) para a câmera ver o rosto.
- No rig, `aL` é o braço DIREITO da personagem (lado -x local); conferir o lado no snapshot.

## Look de pós (assets/rig/pos.js)
- Um passe só, por cima do 3D, controlado por números: `grao` (0–1; `Pos.GRAO.baixo/leve/medio/forte`),
  `fumaca` (0 = olho aberto, 1 = fechado) e `dessat` (0–1). Determinístico (tempo da timeline).
- **Modo cego (episódios do Gabi):** padrão **`grao baixo · fumaça 0,15 · dessat 0,2`** (escolha do usuário, 2026-11-22). Fumaça
  0,45+ e grão médio/forte só em picos (revelação dos olhos, queda, levada) — em 2026-11-22 o
  usuário achou 0,45 + médio "muito pesado". Comparação: briefing/look/niveis-*.png.
- **Pico de impacto** (batida, queda): **só o grão sobe** (+0,1); a fumaça fica no padrão 0,15. No corredor
  (2026-11-22) fumaça 0,45 no pico derrubou a luma para 64 ("muito escuro") e até +0,12 ficou "forte demais".
  Medir a luma também no quadro do pico.
- **Vinheta que "avança" no fim de um plano** (roteiro: "a vinheta fecha um pouco / avança rápido"): NÃO escurecer.
  Em 2026-11-23 (plano 67, levam.html) +0,3 de fumaça ficou "muito forte" e mesmo +0,12 ainda "muito escuro"
  → o plano fica no padrão 0,15 até o fim. O fechamento para o preto é só no plano 70 (o roteiro pede ali).
- **Contraluz** (câmera olhando para a janela/porta acesa): pôr preenchimento no rosto de quem é o foco; sem ele o
  quadro fica "escuro" mesmo com a luma média ok.
- **Antes do evento (abertura) e modo vidente:** sem filtro nenhum (grão 0, fumaça 0, dessat 0) — pedido do usuário 2026-11-22.
- **Modo vidente (Duda):** sem fumaça; o escurecimento das bordas dela é outro efeito, a criar.
- O `grain-overlay` do registro foi descartado: animação CSS em loop, não segue o quadro exato.

## Como revisar (antes de mostrar)
1. `npm run check` passa.
2. Snapshot nos momentos-chave e **olhar** cada quadro.
3. Medir luma.
4. Passar os 5 itens acima. O que falhar, corrigir antes de apresentar.
