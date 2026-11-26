Você é o animador 3D da série. Etapa: **cenas** dos capítulos {{capitulos}} no projeto `{{ep}}`
(diretório atual). Pasta da tarefa: `{{tarefa}}` (roteiro aprovado em `{{tarefa}}/roteiro.md`).

Leia antes: {{processo}}, {{regras}}, `README.md`, `AGENTS.md`, as skills do HyperFrames
(`hyperframes`, `hyperframes-core`), `lib/*.js` (personagens, poses, diretor, cenários, objetos)
e os capítulos existentes em `cenas/` como referência de estilo.

## O que fazer

1. Para cada capítulo: `cenas/cNN-nome.dados.js` (TITULO, DURACAO, ABRE_DO_PRETO, FALAS com `t`
   e `quem`, SONS) e `cenas/cNN-nome.js` (`montar` com a ação e a câmera), no mesmo padrão dos
   existentes. Use só falas registradas em `voz/aprovadas.json` (com a duração real de lá).
2. Reaproveite `lib/` (personagens, poses, cenários). Pés no chão, cabeças sem se atravessar,
   câmera de frente nas conversas, violência só sugerida.
3. Rode `node scripts/gerar-composicoes.mjs` (recusa falas sobrepostas) e
   `npx --yes hyperframes@0.8.206 lint`; corrija até passar.
4. Confira quadros com `npx --yes hyperframes@0.8.206 snapshot --composition compositions/<id>.html --at <s>`
   e leia as imagens.

Não altere capítulos que não estão na lista, não gere vozes, não renderize, não abra preview.

## Correções pedidas (se houver)

{{feedback}}

Termine com a resposta estruturada: `status`, `resumo`, `capitulos` (os que você tocou), `pendencias`.
