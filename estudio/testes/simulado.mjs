// Teste simulado do fluxo inteiro: banco próprio (nunca a fila real), zero chamadas reais.
// Roda: npm test (dentro de estudio/)
import { DatabaseSync } from "node:sqlite";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { criarProducao, avancar, aprovarHumano, pausar, retomar, cancelar, tentarDeNovo, buscarProducao, historicoDaProducao } from "../src/executor.js";
import { handlersSimulados } from "../src/handlers.simulado.js";
import { STATUS, ETAPAS } from "../src/etapas.js";

const AQUI = path.dirname(fileURLToPath(import.meta.url));
const CAMINHO_DB = path.join(AQUI, "simulado.db");
if (fs.existsSync(CAMINHO_DB)) fs.unlinkSync(CAMINHO_DB);

const db = new DatabaseSync(CAMINHO_DB);
db.exec(fs.readFileSync(path.join(AQUI, "..", "src", "esquema.sql"), "utf8"));

let falhas = 0;
function check(nome, condicao) {
  if (condicao) {
    console.log(`PASS  ${nome}`);
  } else {
    console.log(`FAIL  ${nome}`);
    falhas++;
  }
}

// Avança enquanto a produção estiver "fila" — ou seja, inclui o passo que
// finalmente processa a etapa-alvo (uma etapa humana só pausa quando é
// de fato executada, não quando a produção apenas chega até ela).
function avancarTudoAte(db, id, etapaAlvo, maxPassos = 20) {
  let p = buscarProducao(db, id);
  for (let i = 0; i < maxPassos && p.status === STATUS.FILA; i++) {
    p = avancar(db, id, handlersSimulados);
  }
  return p;
}

// 1. criar produção e avançar etapas mecânicas/subagente até o portão humano do render final
const id = criarProducao(db, { titulo: "Teste simulado EP-X" });
check("produção criada na primeira etapa", buscarProducao(db, id).etapa === ETAPAS[0].id);

let p = avancarTudoAte(db, id, "render_final");
check("chegou ao render_final (etapa humana) sem erro", p.etapa === "render_final");
check("pausou esperando aprovação humana", p.status === STATUS.PAUSADO_HUMANO);

const historicoAteAqui = historicoDaProducao(db, id);
check("parecer de subagente foi registrado no histórico", historicoAteAqui.some((h) => h.ator === "subagente"));

// avançar sem aprovar não deve mudar nada
const antes = buscarProducao(db, id);
avancar(db, id, handlersSimulados);
const depois = buscarProducao(db, id);
check("etapa humana não avança sem aprovação explícita", antes.etapa === depois.etapa && depois.status === STATUS.PAUSADO_HUMANO);

// 2. aprovar o render final e seguir até o fim
p = aprovarHumano(db, id);
check("aprovação humana avança para a próxima etapa", p.etapa === "metadados");

p = avancarTudoAte(db, id, "entrega");
check("chegou à entrega (etapa humana final)", p.etapa === "entrega" && p.status === STATUS.PAUSADO_HUMANO);
p = aprovarHumano(db, id);
check("produção concluída ao aprovar a entrega", p.status === STATUS.CONCLUIDO);

// 3. pausar/retomar/cancelar numa produção nova
const id2 = criarProducao(db, { titulo: "Teste pausa/retomada" });
pausar(db, id2);
check("pausar manualmente funciona", buscarProducao(db, id2).status === STATUS.PAUSADO_HUMANO);
retomar(db, id2);
check("retomar volta para fila", buscarProducao(db, id2).status === STATUS.FILA);
cancelar(db, id2);
check("cancelar funciona", buscarProducao(db, id2).status === STATUS.CANCELADO);

// 4. falha repetida até o limite de tentativas (sem laço infinito)
const id3 = criarProducao(db, { titulo: "Teste de erro repetido" });
const handlersComFalha = {
  ...handlersSimulados,
  mecanica: () => ({ ok: false, nota: "falha proposital de teste" }),
};
avancar(db, id3, handlersComFalha); // 1ª tentativa, já falha
for (let i = 0; i < 5; i++) {
  try {
    tentarDeNovo(db, id3); // decisão humana explícita de tentar de novo
  } catch {
    break; // limite atingido — é o que o teste abaixo confirma
  }
  avancar(db, id3, handlersComFalha);
}
const p3 = buscarProducao(db, id3);
check("após falhas repetidas, fica pausado por erro (não trava em laço)", p3.status === STATUS.PAUSADO_ERRO);
check("motivo registra o limite de tentativas", p3.motivo_pausa.includes("limite"));
let lancouErro = false;
try {
  tentarDeNovo(db, id3);
} catch {
  lancouErro = true;
}
check("tentar de novo recusa além do limite", lancouErro);

// 5. retomada após "interrupção": reabrir o mesmo arquivo de banco e continuar de onde parou
db.close();
const db2 = new DatabaseSync(CAMINHO_DB);
const p1depois = buscarProducao(db2, id);
check("estado sobrevive a fechar e reabrir o banco (simula reinício)", p1depois.status === STATUS.CONCLUIDO);
db2.close();

console.log(`\n${falhas === 0 ? "TUDO PASSOU" : `${falhas} VERIFICAÇÃO(ÕES) FALHARAM`}`);
process.exit(falhas === 0 ? 0 : 1);
