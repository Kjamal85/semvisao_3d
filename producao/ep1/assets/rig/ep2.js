// Biblioteca das cenas do EP2 ("VIDENTE"). Tudo em função do tempo da timeline (seek-safe, determinístico).
//   const W = EP2.mundo({ hora, dentro, van })  -> cena com a rua do EP1 + a casa da Duda por dentro
//   EP2.camera(cam, plano, t)                   -> plano { t0, t1, pos, alvo, fov, push, mao } com push-in lento
//   EP2.boca(g, t, ["ep2-duda-01", ...], cena)  -> a boca mexe só dentro da janela da própria fala
//   EP2.anda(g, t, liga) · EP2.senta(g, cad, alt, casa, scene) · EP2.tv(renderer) · EP2.render(...)
(function () {
  const S = (u) => { u = Math.min(1, Math.max(0, u)); return u * u * (3 - 2 * u); };
  const V = (x, y, z) => new THREE.Vector3(x, y, z);
  // modo VIDENTE: sem vinheta, sem dessaturação, grão baixo (como o EP1)
  const LOOK = { grao: Pos.GRAO.baixo, fumaca: 0, dessat: 0 };

  // ---------------- o mundo: a rua do EP1 + a casa da Duda por dentro ----------------
  // op.hora: "manha" | "meiodia" | "tarde" | "anoitecer" | "noite"
  // op.dentro: true = interior da Duda montado (fachada dela e da vizinha viram só muro)
  // op.van: false (sem van) | { x, z, ry } (onde parar) — a van de rua.js, com giroflex
  function mundo(op) {
    op = op || {};
    const scene = new THREE.Scene();
    const ruaG = new THREE.Group(); scene.add(ruaG);
    const R = Cenarios.rua(ruaG, { semCasaDuda: !!op.dentro, portaAberta: false, portaoAberto: false });
    if (!op.van) R.van.visible = false;
    else { R.van.position.set(op.van.x, 0, op.van.z); R.van.rotation.y = op.van.ry || 0; }
    const casa = new THREE.Group(); casa.position.set(-6.4, 0, R.FZ2); casa.rotation.y = Math.PI; scene.add(casa);
    let Q = null, C = null, B = null;
    if (op.dentro) { Q = Cenarios.quartoDuda(casa, { cortina: 1 }); C = Cenarios.cozinhaDuda(casa); B = Cenarios.banheiroDuda(casa); }
    const L = luz(scene, ruaG, R, op.hora || "manha", casa);
    const M = (x, y, z) => casa.localToWorld(V(x, y, z));
    return { scene, ruaG, R, casa, Q, C, B, L, M };
  }

  // luz de cada hora (cenário toon, personagem PBR): o sol entra pela janela da Duda (a fachada dela olha -z)
  function luz(scene, ruaG, R, hora, casa) {
    const lamp = (on) => ruaG.traverse((o) => { if (o.isPointLight && o.userData.poste !== false && o.distance === 12) o.intensity = on ? 6 : 0; });
    const out = {};
    if (hora === "anoitecer" || hora === "noite") {
      R.ambiente(scene);                                                        // o céu e a lua da rua aprovada
      scene.add(new THREE.HemisphereLight(0x9aa6d0, 0x4a4038, hora === "noite" ? 1.8 : 2.4));
      lamp(true);
      // dentro de casa: a lâmpada do teto do quarto e a da cozinha, quentes
      const q = new THREE.PointLight(0xffd7a0, 2.2, 7, 1.4); q.position.copy(casa.localToWorld(V(-1.5, 3.3, -2.2))); scene.add(q);
      const c = new THREE.PointLight(0xffd7a0, 2.0, 7, 1.4); c.position.copy(casa.localToWorld(V(2.6, 3.2, -2.0))); scene.add(c);
      out.lampadas = [q, c];
      return out;
    }
    lamp(false);
    const P = {
      manha:   { bg: 0xbcd3e8, fog: 0xc9d6e2, hc: 0xe6edf5, hg: 0x6e5e4c, hi: 1.9, sc: 0xfff0d8, si: 2.4, sp: V(-1.0, 11, -2.0) },
      meiodia: { bg: 0xb0cde9, fog: 0xc4d4e3, hc: 0xeef3f8, hg: 0x6e5e4c, hi: 2.1, sc: 0xfff6e8, si: 2.6, sp: V(-4.0, 16, 4.0) },
      tarde:   { bg: 0xe8b98e, fog: 0xd8b393, hc: 0xf3d8b8, hg: 0x5a4a3c, hi: 1.5, sc: 0xffb070, si: 2.4, sp: V(-16, 5.5, -5.0) },
    }[hora];
    scene.background = new THREE.Color(P.bg);
    scene.fog = new THREE.Fog(P.fog, 18, 60);
    scene.add(new THREE.HemisphereLight(P.hc, P.hg, P.hi));
    const sol = new THREE.DirectionalLight(P.sc, P.si);
    sol.position.copy(P.sp); sol.target.position.set(-4.8, 0.8, 11.2); scene.add(sol.target);
    sol.castShadow = true; sol.shadow.mapSize.set(2048, 2048); sol.shadow.bias = -0.0006;
    Object.assign(sol.shadow.camera, { left: -16, right: 16, top: 16, bottom: -16, near: 1, far: 50 });
    scene.add(sol);
    const reb = new THREE.PointLight(0xfff3e6, 1.0, 9, 1.6); reb.position.copy(casa.localToWorld(V(-1.5, 3.2, -2.2))); scene.add(reb);
    const reb2 = new THREE.PointLight(0xfff3e6, 0.9, 9, 1.6); reb2.position.copy(casa.localToWorld(V(2.6, 3.2, -2.0))); scene.add(reb2);
    out.sol = sol;
    return out;
  }

  // ---------------- câmera: plano fixo que respira (push-in 1-1,5%/s) ou na mão (só no clímax) ----------------
  function plano(lista, t) { for (const p of lista) if (t < p.t1) return p; return lista[lista.length - 1]; }
  function camera(cam, p, t) {
    const u = Math.max(0, t - p.t0);
    const pos = typeof p.pos === "function" ? p.pos(t) : p.pos, alvo = typeof p.alvo === "function" ? p.alvo(t) : p.alvo;
    cam.position.copy(pos);
    cam.up.copy(p.up || V(0, 1, 0));                // plano de cima (alguém deitado): 'up' aponta para a cabeça
    if (p.mao) {                                    // câmera na mão: balanço de quem corre/respira, sem tremedeira de terremoto
      cam.position.x += 0.035 * Elenco.fbm(t * 1.7, 3) + 0.01 * Elenco.ruido(t * 9, 7);
      cam.position.y += 0.03 * Elenco.fbm(t * 1.3, 5) + 0.01 * Elenco.ruido(t * 11, 8);
    }
    cam.lookAt(alvo);
    if (p.mao) { cam.rotation.z += 0.012 * Elenco.fbm(t * 1.1, 9); }
    cam.fov = (p.fov || 40) / (1 + (p.push === undefined ? 0.012 : p.push) * u);
    cam.updateProjectionMatrix();
  }

  // ---------------- boca: só na janela da própria fala (regra da série) ----------------
  function falando(t, ids, cena) {
    const F = window.EP2_FALAS || {};
    for (const id of ids) { const f = F[id]; if (f && f.cena === cena && t >= f.t && t <= f.t + f.dur) return true; }
    return false;
  }
  function boca(g, t, ids, cena) {
    const bm = g.userData.rosto.bocas, fala = falando(t, ids, cena) && Math.sin(t * 15) + Math.sin(t * 6.1) > 0.2;
    const base = Elenco.EXPR[g.userData.rig.ficha.expr].boca;
    for (const n in bm) bm[n].visible = n === (fala ? "o" : base);
  }
  function expr(g, nome) { if (g.userData.rig.ficha.expr !== nome) Elenco.expressao(g, nome); }

  // ---------------- corpo: andar, sentar ----------------
  // anda: pernas e braços em fase (passo ~1,6 Hz); liga 0..1 (para e começa suave)
  function anda(g, t, liga, vel) {
    const r = g.userData.rig, ph = t * 2 * Math.PI * (vel || 1.6), a = 0.42 * (liga || 0);
    r.pL.hip.rotation.x = Math.sin(ph) * a; r.pR.hip.rotation.x = -Math.sin(ph) * a;
    r.pL.knee.rotation.x = Math.max(0, -Math.sin(ph)) * a * 1.6; r.pR.knee.rotation.x = Math.max(0, Math.sin(ph)) * a * 1.6;
    r.aL.sh.rotation.x = -Math.sin(ph) * a * 0.55; r.aR.sh.rotation.x = Math.sin(ph) * a * 0.55;
  }
  // senta numa cadeira de Cenarios.cozinhaDuda (cad = { pos local, ry })
  function senta(g, cad, alt, casa) {
    const w = casa.localToWorld(cad.pos.clone().add(V(Math.sin(cad.ry) * 0.08, 0, Math.cos(cad.ry) * 0.08)));
    g.position.set(w.x, 0.75 + 0.1 - 1.075 * alt, w.z); g.rotation.y = Math.PI + cad.ry;
  }
  // caminho por pontos de passagem (mundo), velocidade constante: { pos, ry } em u = 0..1. Regra da série:
  // ninguém atravessa ninguém — os pontos contornam pessoas e móveis com folga (~0,5 do centro de cada um).
  function caminho(pts, u) {
    const seg = []; let total = 0;
    for (let i = 1; i < pts.length; i++) { const d = pts[i].distanceTo(pts[i - 1]); seg.push(d); total += d; }
    let alvo = Math.min(1, Math.max(0, u)) * total;
    for (let i = 0; i < seg.length; i++) {
      if (alvo <= seg[i] || i === seg.length - 1) {
        const f = seg[i] ? Math.min(1, alvo / seg[i]) : 1, a = pts[i], b = pts[i + 1];
        return { pos: a.clone().lerp(b, f), ry: Math.atan2(b.x - a.x, b.z - a.z) };
      }
      alvo -= seg[i];
    }
    return { pos: pts[pts.length - 1].clone(), ry: 0 };
  }
  // a rotação (y) para o personagem olhar do ponto a para o ponto b (o rig olha +z)
  const olhaPara = (a, b) => Math.atan2(b.x - a.x, b.z - a.z);

  // ---------------- a TV: o plantão (a mesma repórter e as tarjas do EP1) e as imagens de rua ----------------
  function tv(renderer) {
    const TVW = 768, TVH = 432;
    const alvo = new THREE.WebGLRenderTarget(TVW, TVH, { samples: 4 });
    // estúdio (cópia do tv.html)
    const estudio = new THREE.Scene();
    estudio.background = new THREE.Color(0x2a4a7e);
    estudio.add(new THREE.HemisphereLight(0xdfe8ff, 0x30384a, 3.0));
    const kE = new THREE.DirectionalLight(0xffffff, 1.6); kE.position.set(2, 4, 5); estudio.add(kE);
    const kE2 = Cena.kit(estudio, 7);
    for (let i = 0; i < 7; i++) kE2.box(0.5, 4, 0.05, i % 2 ? 0x31528c : 0x284676, -2.6 + i * 0.75, 2, -2, { contorno: false });
    kE2.cil(0.9, 0.9, 0.04, 0x2c4c86, 1.25, 2.55, -1.9, { r: [Math.PI / 2, 0, 0], seg: 40, contorno: false });
    const reporter = Elenco.build("reporter", { expr: "firme" });
    reporter.position.set(-0.45, 0, 0); reporter.rotation.y = 0.12; estudio.add(reporter);
    kE2.box(2.6, 0.9, 0.9, 0x1b2a44, -0.3, 1.25, 0.65);
    const camE = new THREE.PerspectiveCamera(26, TVW / TVH, 0.1, 30);
    camE.position.set(0.25, 2.05, 4.0); camE.lookAt(0.25, 1.85, 0);
    // imagens de rua (câmera de cinegrafista): agentes levando gente de olhos nublados até uma van, em outro bairro
    const rua = new THREE.Scene();
    rua.background = new THREE.Color(0xa9b8c8);
    rua.add(new THREE.HemisphereLight(0xe8eef5, 0x5a5044, 2.4));
    const kR = Cena.kit(rua, 11);
    kR.box(30, 0.05, 12, 0x3a3c42, 0, -0.03, 0, { contorno: false, sombra: false });
    for (let i = 0; i < 5; i++) kR.box(4.2, 3.2 + (i % 2) * 0.6, 3, [0xd9c7a3, 0xa9c2b5, 0xe2d6b8, 0xc98f7a, 0xb8b9c9][i], -9 + i * 4.6, 1.7, -5, { contorno: true });
    const vanR = new THREE.Group(); vanR.position.set(3.0, 0, -1.2); rua.add(vanR);
    kR.box(5.0, 2.1, 2.1, 0xe4e8eb, 0, 1.45, 0, { pai: vanR }); kR.box(1.3, 1.5, 2.05, 0xe4e8eb, 3.05, 1.15, 0, { pai: vanR });
    for (let i = 0; i < 10; i++) kR.box(0.5, 0.25, 0.02, i % 2 ? 0x1b1b20 : 0xe8b923, -2.25 + i * 0.5, 0.75, 1.06, { pai: vanR, contorno: false, r: [0, 0, 0.5] });
    const gente = [];
    for (let i = 0; i < 2; i++) {
      const cego = Elenco.build(i ? "mae" : "pai", { blind: true, expr: "medo" });
      const a1 = Elenco.build("agente"), a2 = Elenco.build("agente");
      for (const p of [cego, a1, a2]) rua.add(p);
      gente.push({ cego, a1, a2, x0: -6 + i * 2.6, atraso: i * 1.6 });
    }
    const camR = new THREE.PerspectiveCamera(34, TVW / TVH, 0.1, 60);
    // tarjas
    const tex = (c) => { const t = new THREE.CanvasTexture(c); t.colorSpace = THREE.SRGBColorSpace; return t; };
    const cv = document.createElement("canvas"); cv.width = TVW; cv.height = TVH; const g2 = cv.getContext("2d");
    g2.fillStyle = "#c8102e"; g2.fillRect(24, 22, 168, 40);
    g2.fillStyle = "#fff"; g2.font = "bold 26px sans-serif"; g2.fillText("PLANTÃO", 38, 52);
    g2.fillStyle = "rgba(0,0,0,0.55)"; g2.fillRect(TVW - 160, 22, 136, 40);
    g2.fillStyle = "#ff3b3b"; g2.beginPath(); g2.arc(TVW - 140, 42, 9, 0, Math.PI * 2); g2.fill();
    g2.fillStyle = "#fff"; g2.font = "bold 22px sans-serif"; g2.fillText("AO VIVO", TVW - 124, 50);
    const cv2 = document.createElement("canvas"); cv2.width = TVW; cv2.height = TVH; const g3 = cv2.getContext("2d");
    g3.fillStyle = "#b00d26"; g3.fillRect(0, TVH - 118, TVW, 62);
    g3.fillStyle = "#fff"; g3.font = "bold 40px sans-serif"; g3.fillText("CEGUEIRA: VÍRUS?", 28, TVH - 72);
    g3.fillStyle = "#f2f2f2"; g3.fillRect(0, TVH - 56, TVW, 40);
    g3.fillStyle = "#1a1a1a"; g3.font = "bold 26px sans-serif"; g3.fillText("casos dobram a cada dia · isolamento recomendado", 28, TVH - 27);
    const cv3 = document.createElement("canvas"); cv3.width = TVW; cv3.height = TVH; const g4 = cv3.getContext("2d");
    g4.fillStyle = "#b00d26"; g4.fillRect(0, TVH - 118, TVW, 62);
    g4.fillStyle = "#fff"; g4.font = "bold 36px sans-serif"; g4.fillText("QUARENTENA: LOCAL NÃO REVELADO", 28, TVH - 72);
    g4.fillStyle = "#f2f2f2"; g4.fillRect(0, TVH - 56, TVW, 40);
    g4.fillStyle = "#1a1a1a"; g4.font = "bold 26px sans-serif"; g4.fillText("equipes recolhem afetados em vários bairros", 28, TVH - 27);
    // compõe a tela: o 3D no alvo + as tarjas por cima, num segundo alvo (a TV mostra uma textura só)
    const final = new THREE.WebGLRenderTarget(TVW, TVH, { samples: 4 });
    const comp = new THREE.Scene(), camC = new THREE.OrthographicCamera(-1, 1, 1, -1, 0.1, 3); camC.position.set(0, 0, 1);
    const q = (map) => { const m = new THREE.Mesh(new THREE.PlaneGeometry(2, 2), new THREE.MeshBasicMaterial({ map, transparent: true, toneMapped: false, depthTest: false })); comp.add(m); return m; };
    const fundo = q(alvo.texture), tTopo = q(tex(cv)), tVirus = q(tex(cv2)), tQuar = q(tex(cv3));
    fundo.renderOrder = 0; tTopo.renderOrder = tVirus.renderOrder = tQuar.renderOrder = 1;
    const material = new THREE.MeshBasicMaterial({ map: final.texture, toneMapped: false });
    // modo: "desligada" | "chiado" | "estudio" | "rua"; tarja: null | "virus" | "quarentena"; falaRep: a boca da repórter
    function desenha(t, modo, tarja, falaRep) {
      const r = renderer.base || renderer;
      if (modo === "desligada") { material.map = null; material.color.setHex(0x0b0c10); material.needsUpdate = true; return; }
      material.map = final.texture; material.color.setHex(0xffffff); material.needsUpdate = true;
      if (modo === "chiado") { estudio.background.setHex(0x000000); }
      if (modo === "estudio") {
        estudio.background.setHex(0x2a4a7e);
        const bm = reporter.userData.rosto.bocas, f = falaRep && Math.sin(t * 15) + Math.sin(t * 6.1) > 0.2;
        for (const n in bm) bm[n].visible = n === (f ? "o" : "linha");
        reporter.userData.rig.head.rotation.set(Math.sin(t * 1.3) * 0.04, Math.sin(t * 0.8) * 0.06, 0);
      }
      r.setRenderTarget(alvo);
      if (modo === "rua") {
        // a marcha até a van, em loop curto; câmera de cinegrafista tremida
        for (const p of gente) {
          const u = ((t + p.atraso) % 5) / 5, x = p.x0 + 6.0 * u;
          p.cego.position.set(x, 0, 1.4); p.cego.rotation.y = Math.PI / 2;
          p.a1.position.set(x - 0.2, 0, 2.1); p.a1.rotation.y = Math.PI / 2;
          p.a2.position.set(x - 0.4, 0, 0.7); p.a2.rotation.y = Math.PI / 2;
          for (const g of [p.cego, p.a1, p.a2]) anda(g, t + p.atraso, 1, 1.4);
        }
        camR.position.set(-1.0 + 0.08 * Elenco.fbm(t * 2.3, 1), 1.75 + 0.06 * Elenco.fbm(t * 2.9, 2), 9 + 0.05 * Elenco.ruido(t * 7, 3));
        camR.lookAt(0.6 + 0.3 * Elenco.fbm(t * 0.8, 4), 1.4, 0);
        r.render(rua, camR);
      } else if (modo === "chiado") {
        estudio.background.setHex(((t * 37) % 1) > 0.5 ? 0x2b2b2e : 0x111113); r.render(estudio, camE);
      } else r.render(estudio, camE);
      tTopo.visible = modo !== "chiado"; tVirus.visible = tarja === "virus"; tQuar.visible = tarja === "quarentena";
      fundo.visible = true;
      r.setRenderTarget(final); r.render(comp, camC); r.setRenderTarget(null);
    }
    return { material, desenha, reporter };
  }

  // geografia da rua (rua.js): portões, porta e janela do Gabi, portão da Duda. Coordenadas do mundo.
  //   portaoGabi(u) / portaoDuda(u): 0 fechado · 1 aberto · portaGabi(u): 0 fechada · 1 fresta (0,45 rad)
  function geo(W) {
    const R = W.R;
    const achaPortao = (casa) => casa.children.find((o) => o.isGroup && o.children.length >= 8 && o.position.y === 0 && Math.abs(o.position.z) > 2);
    const pg = achaPortao(R.gabiCasa), pd = achaPortao(R.dudaCasa);
    // a porta do Gabi numa dobradiça própria, na frente da porta do modelo; atrás, o escuro da casa
    const k = Cena.kit(W.scene, 41);
    const escuro = k.box(0.86, 2.0, 0.02, 0x14110e, -1.2, 1.02, R.FZ + 0.075, { contorno: false });
    const dob = new THREE.Group(); dob.position.set(-1.2 - 0.47, 0, R.FZ + 0.1); W.scene.add(dob);
    k.box(0.95, 2.1, 0.06, 0x5a3d2c, 0.475, 1.05, 0, { pai: dob });
    return {
      gabiPortao: V(-1.2, 0, R.MURO), gabiPorta: V(-1.2, 0, R.FZ), gabiJanela: V(1.3, 1.75, R.FZ),
      dudaPortao: V(-6.6, 0, R.MURO2), dudaPorta: V(-6.6, 0, R.FZ2),
      portaoGabi: (u) => { if (pg) pg.rotation.y = -1.2 * u; },
      portaoDuda: (u) => { if (pd) pd.rotation.y = 1.2 * u; },
      portaGabi: (u) => { dob.rotation.y = -0.45 * u; escuro.visible = true; },
    };
  }

  // monta o palco de uma cena: renderer + pós; render(scene, cam, t)
  function palco(id) {
    const renderer = Cena.renderer(id);
    const pos = Pos.criar(renderer, 1920, 1080);
    return { renderer, pos, render: (scene, cam, t, look) => pos.render(scene, cam, t, Object.assign({}, LOOK, look || {})) };
  }

  window.EP2 = { S, V, LOOK, mundo, luz, plano, camera, falando, boca, expr, anda, senta, olhaPara, caminho, geo, tv, palco };
})();
