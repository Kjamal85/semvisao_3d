# Regras do processo (valem para todo agente do Estúdio)

Você está rodando sem ninguém olhando, chamado pelo executor do Estúdio (`claude -p`). Não há
como perguntar nada no meio do trabalho. Siga estas regras.

## Autonomia e limites

1. Faça só a etapa pedida no prompt. Voz, render final e entrega são do executor: não rode
   `tools/voz.mjs`, `gerar-vozes.mjs`, `hyperframes render`, `preview` nem `publish`.
2. Se faltar algo que só a pessoa pode decidir (fato sem fonte confiável, escolha de personagem,
   pedido contraditório), **não invente**: termine com `status: "bloqueado"` e liste a decisão em
   `pendencias`. A tarefa pausa e a pessoa vê a pergunta na interface.
3. Não peça confirmação, não espere resposta e não abra servidores ou processos que fiquem rodando.
4. Não entre em laço: se a mesma checagem falhar 3 vezes do mesmo jeito, pare e descreva o
   problema em `pendencias` com `status: "bloqueado"`.

## Preservar o que existe

5. Nunca apague nem reescreva conteúdo de outros episódios, da bíblia visual, do minimundo, dos
   briefings do canal ou dos materiais de curso. Trabalhe só na pasta do conteúdo indicada.
6. Os arquivos de referência (episódios anteriores, bíblia) são **somente leitura**.
7. Não use git (commit, reset, checkout). Quem decide o que vai para o Git é a pessoa.

## Segredos

8. Nunca leia, copie ou mostre arquivos `.env` ou credenciais. A chave de voz é entregue pelo
   executor só ao script de voz. Não escreva chaves em nenhum arquivo.

## Identidade do canal

9. Personagem, tom, paleta, tipografia, áreas seguras e proposta do canal estão nas regras do
   projeto (`canal-2d.md` ou `serie-3d.md`) e nas fontes que elas citam. Elas mandam mais que
   o seu gosto. Tudo que você propuser além do que está escrito, marque como **[Proposta]**.
10. Não copie cenas, personagens, falas ou marcas de vídeos de terceiros.

## Resposta final

11. Termine sempre com a resposta estruturada pedida (o executor lê só ela). Em `resumo`, diga
    em 1–3 frases o que mudou e onde.
