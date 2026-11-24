// Handlers simulados: nenhuma chamada real (nem Claude, nem HyperFrames, nem TTS).
// Servem para testar o fluxo inteiro (transições, pausa, erro, retomada) sem gastar
// limite de uso nem renderizar nada. Trocar por handlers reais é a próxima etapa.
export const handlersSimulados = {
  mecanica(etapaId, producao) {
    return { ok: true, nota: `[simulado] etapa "${etapaId}" executada sem ação real` };
  },
  subagente(etapaId, producao) {
    return {
      aprovado: true,
      criterios: [{ id: "simulado", texto: "aprovação simulada para teste", bloqueante: false }],
      nota: `[simulado] parecer automático de teste para "${etapaId}"`,
    };
  },
};
