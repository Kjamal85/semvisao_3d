import http from "node:http";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { abrirBanco } from "./db.js";
import {
  criarProducao,
  listarProducoes,
  buscarProducao,
  historicoDaProducao,
  avancar,
  aprovarHumano,
  pausar,
  retomar,
  cancelar,
  tentarDeNovo,
} from "./executor.js";
import { handlersSimulados } from "./handlers.simulado.js";

const AQUI = path.dirname(fileURLToPath(import.meta.url));
const PORTA = process.env.ESTUDIO_PORTA || 4000;
const db = abrirBanco();

// Etapa B/C ainda usam handlers simulados (nenhuma ação real, nenhum gasto de
// limite de uso). Trocar por handlers reais é uma etapa futura, com aprovação
// explícita antes de ligar.
const handlers = handlersSimulados;

function json(res, status, corpo) {
  res.writeHead(status, { "Content-Type": "application/json; charset=utf-8" });
  res.end(JSON.stringify(corpo));
}

function lerCorpo(req) {
  return new Promise((resolve, reject) => {
    let dados = "";
    req.on("data", (c) => (dados += c));
    req.on("end", () => {
      try {
        resolve(dados ? JSON.parse(dados) : {});
      } catch (e) {
        reject(e);
      }
    });
    req.on("error", reject);
  });
}

const MIME = { ".html": "text/html; charset=utf-8", ".js": "text/javascript; charset=utf-8", ".css": "text/css; charset=utf-8" };

function servirArquivo(res, caminho) {
  const ext = path.extname(caminho);
  fs.readFile(caminho, (erro, dados) => {
    if (erro) return json(res, 404, { erro: "não encontrado" });
    res.writeHead(200, { "Content-Type": MIME[ext] || "application/octet-stream" });
    res.end(dados);
  });
}

const server = http.createServer(async (req, res) => {
  const url = new URL(req.url, `http://${req.headers.host}`);

  try {
    if (req.method === "GET" && url.pathname === "/") {
      return servirArquivo(res, path.join(AQUI, "..", "public", "index.html"));
    }

    if (req.method === "GET" && url.pathname === "/api/producoes") {
      return json(res, 200, listarProducoes(db));
    }

    if (req.method === "GET" && url.pathname.match(/^\/api\/producoes\/\d+$/)) {
      const id = Number(url.pathname.split("/").pop());
      const producao = buscarProducao(db, id);
      if (!producao) return json(res, 404, { erro: "produção não existe" });
      return json(res, 200, { ...producao, historico: historicoDaProducao(db, id) });
    }

    if (req.method === "POST" && url.pathname === "/api/producoes") {
      const corpo = await lerCorpo(req);
      if (!corpo.titulo) return json(res, 400, { erro: "titulo é obrigatório" });
      const id = criarProducao(db, corpo);
      return json(res, 201, buscarProducao(db, id));
    }

    const match = url.pathname.match(/^\/api\/producoes\/(\d+)\/(avancar|aprovar|pausar|retomar|cancelar|tentar_de_novo)$/);
    if (req.method === "POST" && match) {
      const id = Number(match[1]);
      const acao = match[2];
      const acoes = {
        avancar: () => avancar(db, id, handlers),
        aprovar: () => aprovarHumano(db, id),
        pausar: () => pausar(db, id),
        retomar: () => retomar(db, id),
        cancelar: () => cancelar(db, id),
        tentar_de_novo: () => tentarDeNovo(db, id),
      };
      const resultado = acoes[acao]();
      return json(res, 200, resultado);
    }

    return json(res, 404, { erro: "rota não encontrada" });
  } catch (erro) {
    return json(res, 400, { erro: String(erro.message || erro) });
  }
});

server.listen(PORTA, () => {
  console.log(`Estúdio (modo simulado) em http://localhost:${PORTA}`);
});
