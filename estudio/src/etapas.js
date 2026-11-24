// Ordem fixa das etapas de uma produção, do roteiro ao MP4 entregue.
// Cada etapa tem um "tipo": humano (sempre pausa esperando aprovação),
// subagente (um parecer automático é registrado) ou mecanica (script, sem revisão).
export const ETAPAS = [
  { id: "roteiro", tipo: "mecanica", label: "Roteiro" },
  { id: "revisao_roteiro", tipo: "subagente", label: "Revisão do roteiro" },
  { id: "producao", tipo: "mecanica", label: "Produção (cenas e áudio)" },
  { id: "previa", tipo: "mecanica", label: "Prévia" },
  { id: "revisao_previa", tipo: "subagente", label: "Revisão da prévia" },
  { id: "correcoes", tipo: "mecanica", label: "Correções" },
  { id: "render_final", tipo: "humano", label: "Render final" },
  { id: "metadados", tipo: "mecanica", label: "Título, descrição e tags" },
  { id: "entrega", tipo: "humano", label: "Pronto para conferir e postar" },
];

export const STATUS = {
  FILA: "fila",
  EM_ANDAMENTO: "em_andamento",
  PAUSADO_HUMANO: "pausado_revisao_humana",
  PAUSADO_SUBAGENTE: "aguardando_subagente",
  PAUSADO_ERRO: "pausado_erro",
  CONCLUIDO: "concluido",
  CANCELADO: "cancelado",
}

export function proximaEtapa(etapaId) {
  const i = ETAPAS.findIndex((e) => e.id === etapaId);
  if (i === -1 || i === ETAPAS.length - 1) return null;
  return ETAPAS[i + 1].id;
}

export function etapaPorId(etapaId) {
  return ETAPAS.find((e) => e.id === etapaId) || null;
}
