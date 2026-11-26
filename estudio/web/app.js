// Interface do Estúdio (sem dependências). Tudo vem da API local; nada de segredos aqui.
"use strict";

const STATUS = {
  na_fila: "Na fila", executando: "Executando", pausando: "Pausando…", cancelando: "Cancelando…",
  aguardando_humano: "Aguardando você", pausado: "Pausado", erro: "Parou com erro", cancelado: "Cancelado",
  pronto: "Pronto para postar", publicado: "Publicado",
};
const MODOS = { humano: "Humano", subagente: "Subagente (aprova sozinho)", subagente_humano: "Subagente + decisão humana" };
const PORTOES = { roteiro: "Roteiro", previa: "Prévia", final: "Final" };
const PRIORIDADES = { 1: "1 · urgente", 2: "2 · alta", 3: "3 · normal", 4: "4 · baixa", 5: "5 · quando der" };
const ICONES = { concluida: "✅", pulada: "♻️", executando: "⏳", aguardando: "🟡", falhou: "⚠️", pendente: "·" };

const $ = (s, r = document) => r.querySelector(s);
const h = (v) => String(v ?? "").replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[c]);
const dataHora = (iso) => (iso ? new Date(iso).toLocaleString("pt-BR", { dateStyle: "short", timeStyle: "short" }) : "—");
const pilula = (s) => `<span class="pilula st-${h(s)}">${h(STATUS[s] || s)}</span>`;

let estado = null;
let atualizarAgora = () => {};

async function api(caminho, opcoes = {}) {
  const r = await fetch(caminho, { ...opcoes, headers: { "Content-Type": "application/json", "X-Estudio": "1", ...(opcoes.headers || {}) } });
  const tipo = r.headers.get("content-type") || "";
  const corpo = tipo.includes("json") ? await r.json() : await r.text();
  if (!r.ok) throw new Error(corpo?.erro || corpo || `Erro ${r.status}`);
  return corpo;
}
const enviar = (caminho, metodo, dados) => api(caminho, { method: metodo, body: JSON.stringify(dados || {}) });

function aviso(texto) {
  const a = $("#aviso");
  a.textContent = texto;
  a.classList.add("visivel");
  clearTimeout(aviso.t);
  aviso.t = setTimeout(() => a.classList.remove("visivel"), 3500);
}
async function tentar(fn, ok) {
  try { await fn(); if (ok) aviso(ok); atualizarAgora(); } catch (e) { aviso(e.message); }
}

// ------------------------------------------------------------- topo
async function lerEstado() {
  try {
    estado = await api("/api/estado");
    const e = estado.executor;
    const el = $("#executor");
    const at = estado.atividade ? ` · ${estado.atividade.texto}` : "";
    el.className = `pilula ${e.vivo ? "st-vivo" : "st-parado"}`;
    el.textContent = e.vivo ? (e.suspenso ? "Executor ativo (fila suspensa)" : e.producao ? `Executor: produção #${e.producao}${at}`.slice(0, 90) : "Executor ativo, fila livre") : "Executor parado";
  } catch {
    $("#executor").className = "pilula st-parado";
    $("#executor").textContent = "Interface sem conexão";
  }
}

// ------------------------------------------------------------- fila
async function telaFila(app, filtro = sessionStorage.getItem("filtro") || "ativos") {
  const lista = await api("/api/producoes");
  const grupos = {
    ativos: (p) => !["pronto", "publicado", "cancelado"].includes(p.status),
    prontos: (p) => p.status === "pronto",
    publicados: (p) => p.status === "publicado",
    todos: () => true,
  };
  const visiveis = lista.filter(grupos[filtro]).sort((a, b) => a.prioridade - b.prioridade || String(a.data_postagem || "9").localeCompare(String(b.data_postagem || "9")) || a.id - b.id);
  const aguardando = lista.filter((p) => p.status === "aguardando_humano").length;
  app.innerHTML = `
    <div class="linha entre"><h1>Fila de produção</h1>
      <div class="linha">${Object.keys(grupos).map((g) => `<button class="btn mini ${g === filtro ? "primario" : ""}" data-filtro="${g}">${g[0].toUpperCase() + g.slice(1)} (${lista.filter(grupos[g]).length})</button>`).join("")}</div></div>
    ${aguardando ? `<div class="motivo revisao">🟡 ${aguardando} produção(ões) esperando uma decisão sua.</div>` : ""}
    <div class="painel">${visiveis.length ? `
      <table class="fila"><thead><tr><th>#</th><th>Conteúdo</th><th>Status</th><th>Etapa</th><th>Prioridade</th><th>Postagem planejada</th></tr></thead><tbody>
      ${visiveis.map((p) => `<tr>
        <td class="suave">${p.id}</td>
        <td class="titulo"><a href="#/p/${p.id}">${h(p.titulo)}</a><div class="pequeno suave">${p.perfil.toUpperCase()}${p.teste ? " · teste" : ""}${p.titulo_publicacao ? ` · “${h(p.titulo_publicacao)}”` : ""}</div></td>
        <td>${pilula(p.status)}${p.motivo && p.status !== "na_fila" ? `<div class="pequeno suave" title="${h(p.motivo)}">${h(p.motivo.split("\n")[0]).slice(0, 80)}</div>` : ""}</td>
        <td><div class="pequeno">${h(p.etapa_rotulo)}</div><div class="barra"><div style="width:${p.progresso}%"></div></div></td>
        <td><select data-prio="${p.id}">${Object.entries(PRIORIDADES).map(([v, t]) => `<option value="${v}" ${Number(v) === p.prioridade ? "selected" : ""}>${t}</option>`).join("")}</select></td>
        <td><input type="datetime-local" data-data="${p.id}" value="${h(p.data_postagem || "")}" /></td>
      </tr>`).join("")}</tbody></table>` : `<p class="vazio">Nada aqui. <a href="#/nova">Cadastre uma ideia, briefing ou roteiro.</a></p>`}
    </div>`;
  app.querySelectorAll("[data-filtro]").forEach((b) => (b.onclick = () => { sessionStorage.setItem("filtro", b.dataset.filtro); telaFila(app, b.dataset.filtro); }));
  app.querySelectorAll("[data-prio]").forEach((s) => (s.onchange = () => tentar(() => enviar(`/api/producoes/${s.dataset.prio}`, "PATCH", { prioridade: Number(s.value) }), "Prioridade salva.")));
  app.querySelectorAll("[data-data]").forEach((i) => (i.onchange = () => tentar(() => enviar(`/api/producoes/${i.dataset.data}`, "PATCH", { data_postagem: i.value }), "Data planejada salva.")));
}

// --------------------------------------------------------- cronograma
let mesVisto = null;
async function telaCronograma(app) {
  const lista = await api("/api/producoes");
  const hoje = new Date();
  mesVisto ??= new Date(hoje.getFullYear(), hoje.getMonth(), 1);
  const ano = mesVisto.getFullYear(), mes = mesVisto.getMonth();
  const inicio = new Date(ano, mes, 1 - ((new Date(ano, mes, 1).getDay() + 6) % 7)); // semana começa na segunda
  const porDia = {};
  for (const p of lista) if (p.data_postagem && p.status !== "cancelado") (porDia[p.data_postagem.slice(0, 10)] ||= []).push(p);
  const chave = (d) => `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
  const dias = [];
  for (let i = 0; i < 42; i++) {
    const d = new Date(inicio.getFullYear(), inicio.getMonth(), inicio.getDate() + i);
    const k = chave(d);
    dias.push(`<div class="dia ${d.getMonth() !== mes ? "fora" : ""} ${k === chave(hoje) ? "hoje" : ""}"><div class="suave">${d.getDate()}</div>
      ${(porDia[k] || []).sort((a, b) => a.data_postagem.localeCompare(b.data_postagem)).map((p) => `<a class="item st-${p.status}" href="#/p/${p.id}" title="${h(p.titulo)} — ${h(STATUS[p.status])}">${h(p.data_postagem.slice(11, 16))} ${h(p.titulo)}</a>`).join("")}</div>`);
  }
  const semData = lista.filter((p) => !p.data_postagem && !["cancelado", "publicado"].includes(p.status));
  const atrasados = lista.filter((p) => p.data_postagem && new Date(p.data_postagem) < hoje && !["publicado", "cancelado"].includes(p.status));
  app.innerHTML = `
    <div class="linha entre"><h1>Cronograma</h1>
      <div class="linha"><button class="btn mini" id="ant">◀</button><strong>${mesVisto.toLocaleDateString("pt-BR", { month: "long", year: "numeric" })}</strong><button class="btn mini" id="prox">▶</button><button class="btn mini" id="hoje">Hoje</button></div></div>
    <p class="suave pequeno">É o seu planejamento de postagem. O Estúdio não publica nada sozinho: quando postar, marque como publicado no conteúdo.</p>
    ${atrasados.length ? `<div class="motivo erro">Passaram da data planejada sem publicação: ${atrasados.map((p) => `<a href="#/p/${p.id}">${h(p.titulo)}</a>`).join(", ")}</div>` : ""}
    <div class="painel"><div class="calendario">${["seg", "ter", "qua", "qui", "sex", "sáb", "dom"].map((d) => `<div class="cab">${d}</div>`).join("")}${dias.join("")}</div></div>
    <div class="painel"><h2>Sem data planejada</h2>${semData.length ? `<ul class="lista-simples">${semData.map((p) => `<li class="linha entre"><a href="#/p/${p.id}">${h(p.titulo)}</a><span class="linha">${pilula(p.status)}<input type="datetime-local" data-data="${p.id}" /></span></li>`).join("")}</ul>` : `<p class="suave">Tudo com data.</p>`}</div>`;
  $("#ant").onclick = () => { mesVisto = new Date(ano, mes - 1, 1); telaCronograma(app); };
  $("#prox").onclick = () => { mesVisto = new Date(ano, mes + 1, 1); telaCronograma(app); };
  $("#hoje").onclick = () => { mesVisto = null; telaCronograma(app); };
  app.querySelectorAll("[data-data]").forEach((i) => (i.onchange = () => tentar(() => enviar(`/api/producoes/${i.dataset.data}`, "PATCH", { data_postagem: i.value }), "Data planejada salva.")));
}

// ------------------------------------------------------------- nova
function telaNova(app) {
  const perfis = estado?.perfis || {};
  const padrao = estado?.revisao_padrao || {};
  const sel = (nome, valor) => `<select name="${nome}">${Object.entries(MODOS).map(([k, t]) => `<option value="${k}" ${k === valor ? "selected" : ""}>${t}</option>`).join("")}</select>`;
  app.innerHTML = `<h1>Nova produção</h1>
  <form class="painel" id="form-nova">
    <div class="campos">
      <div><label>Projeto</label><select name="perfil">${Object.entries(perfis).map(([k, p]) => `<option value="${k}">${h(p.nome)}</option>`).join("")}</select></div>
      <div><label>O que você tem</label><select name="tipo_entrada"><option value="ideia">Ideia (o agente pesquisa e escreve o roteiro)</option><option value="briefing">Briefing (o agente escreve a partir dele)</option><option value="roteiro">Roteiro pronto (só formata; não reescreve)</option></select></div>
    </div>
    <label>Título provisório</label><input name="titulo" required maxlength="120" style="width:100%" placeholder="Ex.: A Guerra do Balde" />
    <label>Texto <span class="suave">— a ideia, o briefing ou o roteiro completo</span></label><textarea name="entrada" required style="min-height:180px"></textarea>
    <div class="campos">
      <div id="campo-serie"><label>Série <span class="suave">(2D)</span></label><select name="serie"><option value="">Deixar o agente escolher</option>${(perfis["2d"]?.series || []).map((s) => `<option>${h(s)}</option>`).join("")}</select></div>
      <div><label>Duração alvo (s)</label><input type="number" name="duracao_alvo_s" min="10" max="900" placeholder="${perfis["2d"]?.duracao_alvo_s || 58}" /></div>
      <div><label>Prioridade</label><select name="prioridade">${Object.entries(PRIORIDADES).map(([v, t]) => `<option value="${v}" ${v === "3" ? "selected" : ""}>${t}</option>`).join("")}</select></div>
      <div><label>Postagem planejada</label><input type="datetime-local" name="data_postagem" /></div>
    </div>
    <h3 style="margin-top:18px">Modo de revisão</h3>
    <p class="suave pequeno">Humano: a tarefa pausa e mostra o material para você decidir. Subagente: outro agente, só com leitura, dá o parecer pelos critérios do canal e aprova ou pede correção sozinho. Subagente + humano: o parecer fica registrado e a decisão é sua.</p>
    <div class="campos">
      <div><label>Roteiro</label>${sel("modo_roteiro", padrao.roteiro)}</div>
      <div><label>Prévia</label>${sel("modo_previa", padrao.previa)}</div>
      <div><label>Final</label>${sel("modo_final", padrao.final)}</div>
    </div>
    <div class="interruptor"><input type="checkbox" name="teste" id="teste" /><label for="teste" style="margin:0;font-weight:400">Conteúdo de teste (pasta <code>_teste-estudio</code>, não consome número de episódio)</label></div>
    <div class="interruptor"><input type="checkbox" name="iniciar" id="iniciar" checked /><label for="iniciar" style="margin:0;font-weight:400">Colocar na fila agora (desmarcado: fica pausado até você retomar)</label></div>
    <div class="linha" style="margin-top:14px"><button class="btn primario">Cadastrar</button></div>
  </form>`;
  $("#form-nova").onsubmit = (ev) => {
    ev.preventDefault();
    const f = new FormData(ev.target);
    const dados = {
      perfil: f.get("perfil"), tipo_entrada: f.get("tipo_entrada"), titulo: f.get("titulo"), entrada: f.get("entrada"),
      serie: f.get("serie") || null, duracao_alvo_s: f.get("duracao_alvo_s") || null, prioridade: Number(f.get("prioridade")),
      data_postagem: f.get("data_postagem") || null, teste: f.get("teste") === "on", iniciar: f.get("iniciar") === "on",
      modos_revisao: { roteiro: f.get("modo_roteiro"), previa: f.get("modo_previa"), final: f.get("modo_final") },
    };
    tentar(async () => { const r = await enviar("/api/producoes", "POST", dados); location.hash = `#/p/${r.id}`; }, "Produção cadastrada.");
  };
}

// ----------------------------------------------------------- detalhe
const sujo = new Set(); // formulários com edição em andamento (não são redesenhados)

function blocoDecisao(d, p) {
  if (!d.decisao) return "";
  const portao = d.decisao.portao;
  const ultimo = d.revisoes.find((r) => r.portao === portao && r.revisor === "subagente" && r.rodada === p.rodada_correcao);
  const material = d.arquivos.filter((a) => (portao === "roteiro" ? ["Roteiro", "Narração (texto)", "Briefing", "Roteiro da tarefa"].includes(a.rotulo) : a.tipo === "video" || a.tipo === "imagem"));
  if (!portao) {
    return `<div class="painel decisao"><h2>🟡 Precisa de você: ${h(d.decisao.rotulo)}</h2><div class="motivo ${h(p.motivo_tipo)}">${h(p.motivo)}</div>
      <label>Sua resposta <span class="suave">(vira instrução para o agente refazer esta etapa)</span></label>
      <textarea id="comentario"></textarea>
      <div class="linha" style="margin-top:10px"><button class="btn primario" id="responder">Responder e continuar</button>
      <span class="suave pequeno">Se o problema é externo (ex.: commit pendente), resolva e use <strong>Tentar novamente</strong>.</span></div></div>`;
  }
  return `<div class="painel decisao">
    <h2>🟡 Sua decisão: ${h(d.decisao.rotulo)}</h2>
    <div class="motivo revisao">${h(d.decisao.motivo || "")}</div>
    ${ultimo ? `<h3>Parecer do subagente (rodada ${ultimo.rodada})</h3>${blocoParecer(ultimo)}` : ""}
    ${material.length ? `<h3>Material</h3><ul class="lista-simples">${material.map((a) => `<li><a href="${a.url}" target="_blank">${h(a.rotulo)}</a></li>`).join("")}</ul>` : ""}
    ${portao === "final" ? `<p class="pequeno">Confira também <strong>título, descrição e tags</strong> abaixo — você pode editá-los antes ou depois de aprovar.</p>` : ""}
    <label>Comentário <span class="suave">(obrigatório para pedir correção; diga o que mudar e onde)</span></label>
    <textarea id="comentario" data-sujo="decisao"></textarea>
    <div class="linha" style="margin-top:10px">
      <button class="btn primario" id="aprovar">Aprovar</button>
      <button class="btn" id="corrigir">Pedir correção</button>
    </div></div>`;
}

function blocoParecer(r) {
  const efeitos = { aprovacao_automatica: ["auto", "aprovação automática"], aprovacao_humana: ["humana", "aprovação humana"], correcao_pedida: ["corr", "correção pedida"], aguardando_humano: ["", "aguardando decisão humana"] };
  const [cls, txt] = efeitos[r.efeito] || ["", r.efeito || r.decisao];
  return `<div class="linha"><span class="etiqueta">${r.revisor === "humano" ? "👤 você" : `🤖 subagente${r.modelo ? ` · ${h(r.modelo)}` : ""}`}</span><span class="etiqueta ${cls}">${h(txt)}</span><span class="suave pequeno">${h(PORTOES[r.portao])} · rodada ${r.rodada} · ${dataHora(r.criado_em)}</span></div>
    <p>${h(r.parecer)}</p>
    ${r.criterios?.length ? `<ul class="criterios">${r.criterios.map((c) => `<li>${c.atendido ? "✅" : "❌"} <strong>${h(c.id)}</strong> — ${h(c.observacao)}</li>`).join("")}</ul>` : ""}
    ${r.correcoes?.length ? `<div class="pequeno"><strong>Correções:</strong><ul>${r.correcoes.map((c) => `<li>${h(c)}</li>`).join("")}</ul></div>` : ""}
    ${r.arquivo ? `<div class="pequeno suave mono">${h(r.arquivo)}</div>` : ""}`;
}

function botoesAcao(p) {
  const b = [];
  const s = p.status;
  if (["na_fila", "executando", "erro", "aguardando_humano"].includes(s)) b.push(["pausar", "Pausar", ""]);
  if (s === "pausado") b.push(["retomar", "Retomar", "primario"]);
  if (["erro", "pausado", "aguardando_humano", "cancelado"].includes(s)) b.push(["tentar_novamente", "Tentar novamente", ""]);
  if (s === "pronto") b.push(["publicado", "Marcar como publicado", "primario"]);
  if (s === "publicado") b.push(["desfazer_publicado", "Desfazer “publicado”", ""]);
  if (!["cancelado", "publicado"].includes(s)) b.push(["cancelar", "Cancelar", "perigo"]);
  if (s === "cancelado") b.push(["excluir", "Excluir da fila", "perigo"]);
  return b.map(([a, t, c]) => `<button class="btn ${c}" data-acao="${a}">${t}</button>`).join("");
}

async function telaDetalhe(app, id) {
  const d = await api(`/api/producoes/${id}`);
  const p = d.producao;
  const videos = d.arquivos.filter((a) => a.tipo === "video");
  const videoSel = sessionStorage.getItem(`video-${id}`);
  const atual = videos.find((v) => v.caminho === videoSel) || videos.find((v) => v.papel === "entrega") || videos.find((v) => v.papel === "final") || videos[0];
  const m = p.metadados || {};
  const quadros = d.arquivos.filter((a) => a.tipo === "imagem");
  const tocando = $("#player") && !$("#player").paused;

  const html = `
    <div class="linha entre"><div><a href="#/fila" class="pequeno">← fila</a><h1>${h(p.titulo)}</h1>
      <div class="linha">${pilula(p.status)}<span class="etiqueta">${p.perfil.toUpperCase()}</span><span class="etiqueta">entrada: ${h(p.tipo_entrada)}</span>${p.teste ? `<span class="etiqueta">teste</span>` : ""}<span class="suave pequeno">#${p.id} · criado ${dataHora(p.criado_em)}</span></div></div>
      <div class="linha">${botoesAcao(p)}</div></div>
    ${p.motivo && p.status !== "aguardando_humano" ? `<div class="motivo ${p.status === "pronto" ? "pronto" : h(p.motivo_tipo)}">${h(p.motivo)}</div>` : ""}
    <div class="grade">
      <div>
        ${blocoDecisao(d, p)}
        <div class="painel" id="bloco-video">
          <div class="linha entre"><h2>Assistir</h2>${videos.length > 1 ? `<select id="escolha-video">${videos.map((v) => `<option value="${h(v.caminho)}" ${v === atual ? "selected" : ""}>${h(v.rotulo)}</option>`).join("")}</select>` : ""}</div>
          ${atual ? `<video id="player" controls preload="metadata" src="${atual.url}"></video><div class="linha pequeno" style="margin-top:6px"><a href="${atual.baixar}">Baixar</a><a href="#" data-abrir="${h(atual.caminho)}">Mostrar na pasta</a></div>` : `<p class="suave">A prévia aparece aqui quando a etapa Prévia terminar.</p>`}
          ${quadros.length ? `<h3 style="margin-top:14px">Quadros</h3><div class="quadros">${quadros.map((q) => `<a href="${q.url}" target="_blank" title="${h(q.rotulo)}"><img src="${q.url}" alt="${h(q.rotulo)}" loading="lazy" /></a>`).join("")}</div>` : ""}
        </div>
        <form class="painel" id="form-meta" data-sujo="meta">
          <div class="linha entre"><h2>Título, descrição e tags</h2><span class="suave pequeno">${p.metadados_editados_em ? `editado por você em ${dataHora(p.metadados_editados_em)}` : p.metadados ? "sugerido pelo agente" : "gerado na etapa de metadados"}</span></div>
          <label>Título</label><input name="titulo" style="width:100%" value="${h(m.titulo || "")}" maxlength="100" />
          <label>Títulos alternativos <span class="suave">(um por linha)</span></label><textarea name="titulos_alternativos" style="min-height:60px">${h((m.titulos_alternativos || []).join("\n"))}</textarea>
          <label>Descrição / texto da postagem</label><textarea name="descricao">${h(m.descricao || "")}</textarea>
          <div class="campos"><div><label>Hashtags <span class="suave">(vírgula)</span></label><input name="hashtags" style="width:100%" value="${h((m.hashtags || []).join(", "))}" /></div>
          <div><label>Tags <span class="suave">(vírgula)</span></label><input name="tags" style="width:100%" value="${h((m.tags || []).join(", "))}" /></div></div>
          <label>Comentário fixado</label><input name="comentario_fixado" style="width:100%" value="${h(m.comentario_fixado || "")}" />
          <div class="linha" style="margin-top:10px"><button class="btn primario">Salvar</button><span class="suave pequeno">Também atualiza o publicacao.md do conteúdo e da entrega.</span></div>
        </form>
        <div class="painel"><h2>Pareceres e aprovações</h2>${d.revisoes.length ? d.revisoes.map((r) => `<div style="border-bottom:1px solid var(--borda);padding:8px 0">${blocoParecer(r)}</div>`).join("") : `<p class="suave">Nenhum ainda.</p>`}</div>
      </div>
      <div>
        <div class="painel"><h2>Etapas</h2><div class="barra" style="margin-bottom:10px"><div style="width:${p.progresso}%"></div></div>
          <ul class="etapas">${d.etapas.filter((e) => e.etapa !== "correcao" || e.status !== "pendente" || p.etapa_atual === "correcao").map((e) => `<li class="${e.etapa === p.etapa_atual ? "atual" : ""}" title="${h(e.resumo_saida || e.ultimo_erro || "")}">
            <span class="icone">${e.etapa === p.etapa_atual && p.status === "executando" ? "⏳" : ICONES[e.status] || "·"}</span>
            <div><div>${h(e.rotulo)} ${e.aprovacao === "automatica" ? `<span class="etiqueta auto">aprovação automática</span>` : e.aprovacao === "humana" ? `<span class="etiqueta humana">aprovação humana</span>` : ""}${e.status === "pulada" ? ` <span class="etiqueta">reaproveitada</span>` : ""}</div>
            ${e.portao ? `<div class="pequeno suave">modo: ${h(MODOS[p.modos_revisao[e.portao]] || "")}</div>` : ""}
            ${e.tentativas ? `<div class="pequeno suave">${e.tentativas} tentativa(s) com falha</div>` : ""}</div></li>`).join("")}</ul></div>
        <div class="painel"><h2>Planejamento</h2>
          <label>Prioridade</label><select id="prio">${Object.entries(PRIORIDADES).map(([v, t]) => `<option value="${v}" ${Number(v) === p.prioridade ? "selected" : ""}>${t}</option>`).join("")}</select>
          <label>Postagem planejada</label><input type="datetime-local" id="data" value="${h(p.data_postagem || "")}" />
          <h3 style="margin-top:14px">Modo de revisão</h3>
          ${Object.entries(PORTOES).map(([k, t]) => `<label>${t}</label><select data-modo="${k}">${Object.entries(MODOS).map(([v, tt]) => `<option value="${v}" ${p.modos_revisao[k] === v ? "selected" : ""}>${tt}</option>`).join("")}</select>`).join("")}
          ${p.status === "publicado" ? `<p class="pequeno">Publicado em ${dataHora(p.publicado_em)}${p.link_publicacao ? ` · <a href="${h(p.link_publicacao)}" target="_blank" rel="noopener">link</a>` : ""}</p>` : ""}
        </div>
        <div class="painel"><h2>Arquivos</h2>
          <div class="linha" style="margin-bottom:8px"><button class="btn mini" data-abrir-alvo="pasta" ${p.pasta ? "" : "disabled"}>Abrir pasta do conteúdo</button><button class="btn mini" data-abrir-alvo="entrega" ${p.entrega ? "" : "disabled"}>Abrir pasta de entrega</button></div>
          ${d.arquivos.length ? `<ul class="lista-simples">${d.arquivos.map((a) => `<li class="linha entre"><span>${h(a.rotulo)}<div class="pequeno suave">${h(a.nome)}</div></span><span class="linha"><a class="btn mini" href="${a.url}" target="_blank">Abrir</a><a class="btn mini" href="${a.baixar}">Baixar</a></span></li>`).join("")}</ul>` : `<p class="suave">Ainda nenhum.</p>`}
          ${p.pasta ? `<p class="pequeno suave mono">${h(p.pasta)}</p>` : ""}
        </div>
        <div class="painel"><h2>Entrada</h2><div class="mono" style="max-height:220px;overflow:auto">${h(p.entrada)}</div>${p.feedback ? `<h3 style="margin-top:12px">Correção pendente</h3><div class="mono">${h(p.feedback)}</div>` : ""}</div>
        <div class="painel"><h2>Execuções e erros</h2><p class="pequeno suave">${p.execucoes_agente} execução(ões) de agente nesta produção (limite ${estado?.limites?.execucoes_de_agente_por_producao ?? "?"}).</p>
          <ul class="lista-simples">${d.execucoes.slice(0, 40).map((x) => `<li><div class="linha entre"><span><strong>${h(x.rotulo)}</strong> · t${x.tentativa} · <span class="etiqueta ${x.resultado === "ok" ? "humana" : x.resultado === "pulada" ? "" : x.resultado ? "corr" : "auto"}">${h(x.resultado || "em andamento")}</span></span>${x.tem_log ? `<button class="btn mini" data-log="${x.id}">Log</button>` : ""}</div>
            <div class="pequeno suave">${dataHora(x.inicio)}${x.fim ? ` → ${dataHora(x.fim)}` : ""}${x.custo_usd ? ` · custo estimado US$ ${x.custo_usd.toFixed(2)} (incluso na assinatura)` : ""}</div>${x.resumo ? `<div class="pequeno mono">${h(x.resumo).slice(0, 500)}</div>` : ""}</li>`).join("")}</ul></div>
        <div class="painel"><h2>Histórico</h2><ul class="lista-simples">${d.historico.map((x) => `<li class="pequeno"><span class="suave">${dataHora(x.em)}</span> ${h(x.mensagem)}</li>`).join("")}</ul></div>
      </div>
    </div>`;

  // Preserva o que está sendo digitado e o vídeo tocando.
  const comentario = $("#comentario")?.value;
  const metaAntes = sujo.has("meta") ? new FormData($("#form-meta")) : null;
  const tempoVideo = $("#player")?.currentTime;
  if (tocando && app.dataset.id === String(id)) {
    // não redesenha a tela inteira enquanto o vídeo toca; só o topo é atualizado no próximo ciclo
    return;
  }
  app.dataset.id = id;
  app.innerHTML = html;
  if (comentario) $("#comentario").value = comentario;
  if (metaAntes) for (const [k, v] of metaAntes) { const el = $(`#form-meta [name="${k}"]`); if (el) el.value = v; }
  if (tempoVideo && $("#player")) $("#player").currentTime = tempoVideo;

  $("#form-meta").oninput = () => sujo.add("meta");
  $("#form-meta").onsubmit = (ev) => {
    ev.preventDefault();
    const f = new FormData(ev.target);
    const dados = Object.fromEntries(f);
    dados.titulos_alternativos = String(dados.titulos_alternativos || "").split("\n");
    tentar(async () => { await enviar(`/api/producoes/${id}/metadados`, "PUT", dados); sujo.delete("meta"); }, "Metadados salvos.");
  };
  app.querySelectorAll("[data-acao]").forEach((b) => (b.onclick = () => {
    const acao = b.dataset.acao;
    if (acao === "cancelar" && !confirm("Cancelar esta produção? Os arquivos já gerados ficam no disco.")) return;
    if (acao === "excluir" && !confirm("Excluir da fila? O histórico some do Estúdio; os arquivos ficam no disco.")) return;
    let link;
    if (acao === "publicado") { link = prompt("Link da publicação (opcional):", "") ?? undefined; if (link === undefined) return; }
    tentar(async () => { const r = await enviar(`/api/producoes/${id}/acao`, "POST", { acao, link }); if (r.excluida) location.hash = "#/fila"; }, "Feito.");
  }));
  $("#aprovar")?.addEventListener("click", () => tentar(() => enviar(`/api/producoes/${id}/decisao`, "POST", { decisao: "aprovar", comentario: $("#comentario").value }), "Aprovado. A produção voltou para a fila."));
  $("#corrigir")?.addEventListener("click", () => tentar(() => enviar(`/api/producoes/${id}/decisao`, "POST", { decisao: "corrigir", comentario: $("#comentario").value }), "Correção pedida."));
  $("#responder")?.addEventListener("click", () => tentar(() => enviar(`/api/producoes/${id}/decisao`, "POST", { decisao: "responder", comentario: $("#comentario").value }), "Resposta enviada. A etapa volta para a fila."));
  $("#prio").onchange =(ev) => tentar(() => enviar(`/api/producoes/${id}`, "PATCH", { prioridade: Number(ev.target.value) }), "Prioridade salva.");
  $("#data").onchange = (ev) => tentar(() => enviar(`/api/producoes/${id}`, "PATCH", { data_postagem: ev.target.value }), "Data planejada salva.");
  app.querySelectorAll("[data-modo]").forEach((s) => (s.onchange = () => tentar(() => enviar(`/api/producoes/${id}`, "PATCH", { modos_revisao: { [s.dataset.modo]: s.value } }), "Modo de revisão salvo.")));
  $("#escolha-video")?.addEventListener("change", (ev) => { sessionStorage.setItem(`video-${id}`, ev.target.value); telaDetalhe(app, id); });
  app.querySelectorAll("[data-abrir]").forEach((a) => (a.onclick = (ev) => { ev.preventDefault(); tentar(() => enviar(`/api/producoes/${id}/abrir`, "POST", { f: a.dataset.abrir })); }));
  app.querySelectorAll("[data-abrir-alvo]").forEach((b) => (b.onclick = () => tentar(() => enviar(`/api/producoes/${id}/abrir`, "POST", { alvo: b.dataset.abrirAlvo }))));
  app.querySelectorAll("[data-log]").forEach((b) => (b.onclick = async () => {
    const t = await api(`/api/execucoes/${b.dataset.log}/log`);
    $("#janela-corpo").innerHTML = `<h2>Log</h2><div class="mono" style="max-height:70vh;overflow:auto">${h(t)}</div>`;
    $("#janela").showModal();
  }));
}

// ------------------------------------------------------------ config
async function telaConfig(app) {
  await lerEstado();
  const e = estado.executor;
  let login = { encontrado: false };
  try { login = await api("/api/claude"); } catch {}
  app.innerHTML = `<h1>Configurações</h1>
  <div class="painel"><h2>Executor</h2>
    <p>${e.vivo ? `<span class="pilula st-vivo">ativo</span> PID ${h(e.pid)} · desde ${dataHora(e.desde)}${e.producao ? ` · trabalhando na produção <a href="#/p/${e.producao}">#${e.producao}</a>` : ""}` : `<span class="pilula st-parado">parado</span> As produções ficam paradas na fila até ele iniciar.`}</p>
    ${estado.atividade ? `<p class="pequeno mono">${h(estado.atividade.texto)}</p>` : ""}
    <div class="linha"><button class="btn ${e.vivo ? "" : "primario"}" id="ex-iniciar" ${e.vivo ? "disabled" : ""}>Iniciar executor</button><button class="btn" id="ex-parar" ${e.vivo ? "" : "disabled"}>Parar executor</button></div>
    <p class="pequeno suave">Parar encerra a etapa em andamento (ela fica “interrompida” e as etapas concluídas são preservadas). Uma produção por vez, para não sobrecarregar a máquina.</p>
    <div class="interruptor"><input type="checkbox" id="suspenso" ${e.suspenso ? "checked" : ""} /><label for="suspenso" style="margin:0;font-weight:400"><strong>Suspender a fila</strong> — o executor fica ligado, mas não começa novas etapas.</label></div>
  </div>
  <div class="painel"><h2>Retomada automática</h2>
    <div class="interruptor"><input type="checkbox" id="auto" ${estado.auto_retomar ? "checked" : ""} /><label for="auto" style="margin:0;font-weight:400"><strong>Autorizar o executor a retomar sozinho</strong> produções interrompidas (queda, PC reiniciado) e as pausadas por limite de uso/cota depois do horário de liberação (até ${estado.limites.retomadas_automaticas_por_limite} vezes por etapa).</label></div>
    <p class="pequeno suave">Desligado (padrão): depois de uma interrupção a produção fica <em>Pausada</em> e espera você clicar em Retomar. Isto é independente de iniciar com o Windows.</p>
  </div>
  <div class="painel"><h2>Iniciar com o Windows</h2>
    <div class="interruptor"><input type="checkbox" id="windows" ${estado.inicializacao_windows ? "checked" : ""} /><label for="windows" style="margin:0;font-weight:400"><strong>Abrir a interface e o executor após o meu login</strong> (atalho na pasta Inicializar do seu usuário; sem janela).</label></div>
    <p class="pequeno suave">Só inicia os programas. Retomar produções continua dependendo da opção acima. Também dá para ligar/desligar pelo terminal: <code>scripts\\inicializacao.ps1 -Acao ativar|desativar</code>.</p>
  </div>
  <div class="painel"><h2>Agente (Claude Code)</h2>
    ${login.encontrado ? `<p>${login.logado ? `<span class="pilula st-vivo">logado</span> método ${h(login.metodo)} · assinatura ${h(login.assinatura)}` : `<span class="pilula st-parado">sem login</span> Rode <code>claude auth login</code> num terminal.`}</p><p class="pequeno suave">Executável: ${h(login.executavel)}. O executor chama <code>claude -p</code> (modo headless) com a assinatura: sem custo extra por uso, mas dentro dos limites de 5 h e semanais da assinatura, divididos com o seu uso no VS Code. O “custo estimado” mostrado nas execuções é o equivalente em API, só para referência.</p>` : `<p class="pilula st-parado">claude.exe não encontrado</p>`}
    <button class="btn mini" id="login-atualizar">Verificar de novo</button>
  </div>
  <div class="painel"><h2>Limites atuais</h2><p class="pequeno suave">Edite em <code>estudio/config/estudio.json</code> e reinicie o executor.</p>
    <div class="mono">${h(JSON.stringify({ limites: estado.limites, modelos: estado.modelos, revisao_padrao: estado.revisao_padrao }, null, 2))}</div></div>`;
  $("#ex-iniciar").onclick = () => tentar(() => enviar("/api/executor", "POST", { acao: "iniciar" }), "Iniciando o executor…");
  $("#ex-parar").onclick = () => { if (confirm("Parar o executor? A etapa em andamento será interrompida.")) tentar(() => enviar("/api/executor", "POST", { acao: "parar" }), "Parando o executor…"); };
  $("#suspenso").onchange = (ev) => tentar(() => enviar("/api/ajustes", "POST", { executor_suspenso: ev.target.checked }), ev.target.checked ? "Fila suspensa." : "Fila liberada.");
  $("#auto").onchange = (ev) => tentar(() => enviar("/api/ajustes", "POST", { auto_retomar: ev.target.checked }), ev.target.checked ? "Retomada automática autorizada." : "Retomada automática desligada.");
  $("#windows").onchange = (ev) => tentar(async () => { const r = await enviar("/api/inicializacao", "POST", { ativar: ev.target.checked }); aviso(r.saida); });
  $("#login-atualizar").onclick = async () => { await api("/api/claude?atualizar=1"); telaConfig(app); };
}

// ------------------------------------------------------------- rotas
async function rotear() {
  const app = $("#app");
  const rota = location.hash.replace(/^#\/?/, "") || "fila";
  const aba = rota.split("/")[0] === "p" ? "fila" : rota.split("/")[0];
  document.querySelectorAll("#abas a").forEach((a) => a.classList.toggle("ativa", a.dataset.aba === aba));
  await lerEstado();
  try {
    if (rota.startsWith("p/")) {
      const id = Number(rota.split("/")[1]);
      atualizarAgora = () => telaDetalhe(app, id).catch(() => {});
      await telaDetalhe(app, id);
    } else if (rota === "cronograma") { atualizarAgora = () => telaCronograma(app); await telaCronograma(app); }
    else if (rota === "nova") { atualizarAgora = () => {}; telaNova(app); }
    else if (rota === "config") { atualizarAgora = () => telaConfig(app); await telaConfig(app); }
    else { atualizarAgora = () => telaFila(app); await telaFila(app); }
  } catch (e) {
    app.innerHTML = `<div class="motivo erro">${h(e.message)}</div>`;
  }
}

window.addEventListener("hashchange", () => { sujo.clear(); delete $("#app").dataset.id; rotear(); });
rotear();
// Atualização periódica: a fila e o detalhe acompanham o executor. Telas com formulário
// (nova, configurações) não são redesenhadas para não perder o que foi digitado.
setInterval(async () => {
  await lerEstado();
  const rota = location.hash.replace(/^#\/?/, "") || "fila";
  if (rota === "nova" || rota === "config") return;
  if (document.activeElement && ["INPUT", "TEXTAREA", "SELECT"].includes(document.activeElement.tagName)) return;
  atualizarAgora();
}, 4000);
