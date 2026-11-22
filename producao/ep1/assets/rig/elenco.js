// Elenco do EP1: um construtor só para todos os personagens (Three.js r155, global THREE).
// Mesmas proporções do Gabi aprovado (commit baa3c95): formas simples, contorno escuro em
// casca BackSide, cabeça ~0,31 da altura. Cada personagem é uma ficha de parâmetros.
(function () {
  const OUT = 0x1b1b20;
  const EYE = { white: 0xffffff, pupil: 0x24242a, blind: 0x6a6a71, glintB: 0xecebe4, glint: 0xffffff };
  const outlineMat = new THREE.MeshBasicMaterial({ color: OUT, side: THREE.BackSide });
  const cache = {};
  const mat = (c) => cache[c] || (cache[c] = new THREE.MeshToonMaterial({ color: c }));

  // Fichas. alt = escala da altura (Gabi = 1); larg = largura do corpo.
  const FICHAS = {
    gabi: { nome: "Gabi", alt: 1.0, larg: 1.0, pele: 0xc68e62, cabelo: 0x241c17, cabeloEstilo: "gabi",
            roupa: 0xaed0ec, calca: 0x454551, sapato: 0x2d2d36, capuz: true, fone: 0x24242a },
    mae:  { nome: "Mãe", alt: 0.96, larg: 0.95, pele: 0xf0cfb4, cabelo: 0x7a5236, cabeloEstilo: "rabo", blush: 0xf0aaa6,
            roupa: 0xc9835b, calca: 0x5d6d8c, sapato: 0x6b4b3a },
    pai:  { nome: "Pai", alt: 1.07, larg: 1.12, pele: 0x6e4630, cabelo: 0x16110e, cabeloEstilo: "crespo",
            barba: true, roupa: 0x6f7f5a, calca: 0x8a7a5e, sapato: 0x3a2e26 },
    duda: { nome: "Duda", alt: 0.92, larg: 0.86, pele: 0xf3d6c2, cabelo: 0xe0bd72, cabeloEstilo: "longo", blush: 0xf3aeb2, sobrancelha: 0x9a7038,
            roupa: 0xf2c4d0, calca: 0x8fa3c4, sapato: 0xe9e4dc },
    agente: { nome: "Agente", alt: 1.05, larg: 1.1, pele: 0xd9b08c, roupa: 0xe4e8eb, calca: 0xe4e8eb,
              sapato: 0x24242a, mao: 0x2d3038, epi: true, faixa: 0xe8b923 },
  };

  function build(id, opts) {
    const P = Object.assign({}, FICHAS[id], opts || {});
    const w = P.larg;
    const g = new THREE.Group();
    // add(geo, cor, x, y, z, pai, {s:[sx,sy,sz], r:[rx,ry,rz]}): escala e rotação valem
    // também para a casca do contorno (senão ela fica no formato original e vira mancha preta)
    const add = (geo, c, x, y, z, parent, tf) => {
      const p = parent || g;
      const s = (tf && tf.s) || [1, 1, 1], r = (tf && tf.r) || [0, 0, 0];
      if (!(tf && tf.semContorno)) {
        const o = new THREE.Mesh(geo, outlineMat); o.position.set(x, y, z);
        o.scale.set(s[0] * 1.07, s[1] * 1.07, s[2] * 1.07); o.rotation.set(r[0], r[1], r[2]); p.add(o);
      }
      const m = new THREE.Mesh(geo, mat(c)); m.position.set(x, y, z);
      m.scale.set(s[0], s[1], s[2]); m.rotation.set(r[0], r[1], r[2]); p.add(m);
      return m;
    };
    const sphere = (r, a, b) => new THREE.SphereGeometry(r, a || 16, b || 12);

    // pernas com quadril e joelho (para sentar, tropeçar e cair); em pé fica igual à
    // perna inteiriça aprovada: coxa 0,53 + canela 0,52, do chão (0,025) ao quadril (1,075)
    function leg(side) {
      const hip = new THREE.Group(); hip.position.set(side * 0.14 * w, 1.075, 0); g.add(hip);
      add(new THREE.CylinderGeometry(0.12 * w, 0.12 * w, 0.55, 16), P.calca, 0, -0.265, 0, hip);
      const knee = new THREE.Group(); knee.position.set(0, -0.53, 0); hip.add(knee);
      add(new THREE.SphereGeometry(0.12 * w, 14, 10), P.calca, 0, 0, 0, knee); // joelho sem fresta ao dobrar
      add(new THREE.CylinderGeometry(0.12 * w, 0.115 * w, 0.52, 16), P.calca, 0, -0.26, 0, knee);
      add(new THREE.BoxGeometry(0.22 * w, 0.12, 0.34), P.sapato, 0, -0.485, 0.06, knee);
      return { hip, knee };
    }
    const pL = leg(-1), pR = leg(1);
    // tronco
    add(new THREE.CylinderGeometry(0.30 * w, 0.26 * w, 0.82, 20), P.roupa, 0, 1.5, 0);
    if (P.capuz) { // moletom do Gabi: capuz caído + bolso
      add(sphere(0.26, 18, 14), P.roupa, 0, 1.92, -0.14, g, { s: [1.15, 0.7, 0.85] });
      add(new THREE.BoxGeometry(0.34, 0.16, 0.06), P.roupa, 0, 1.2, 0.27);
    }
    if (P.fone) { // objeto-assinatura do Gabi: fone no pescoço
      add(new THREE.TorusGeometry(0.24, 0.05, 10, 24), P.fone, 0, 1.93, 0.02, g, { r: [Math.PI / 2, 0, 0] });
      add(sphere(0.075, 12, 12), P.fone, -0.24, 1.93, 0.02);
      add(sphere(0.075, 12, 12), P.fone, 0.24, 1.93, 0.02);
    }
    if (P.faixa) { // EPI: faixa refletiva no peito
      add(new THREE.CylinderGeometry(0.297 * w, 0.29 * w, 0.09, 20), P.faixa, 0, 1.62, 0);
    }
    // braços (ombro -> cotovelo, com juntas para posar)
    function arm(side) {
      const sh = new THREE.Group(); sh.position.set(side * 0.30 * w, 1.85, 0); g.add(sh);
      add(new THREE.CylinderGeometry(0.09 * w, 0.085 * w, 0.46, 14), P.roupa, 0, -0.23, 0, sh);
      if (P.faixa) add(new THREE.CylinderGeometry(0.092 * w, 0.09 * w, 0.07, 14), P.faixa, 0, -0.16, 0, sh);
      const el = new THREE.Group(); el.position.set(0, -0.46, 0); sh.add(el);
      add(new THREE.CylinderGeometry(0.08 * w, 0.075 * w, 0.44, 14), P.roupa, 0, -0.22, 0, el);
      add(sphere(0.10, 14, 12), P.mao || P.pele, 0, -0.46, 0, el);
      return { sh, el };
    }
    const aL = arm(-1), aR = arm(1);

    // cabeça
    const head = new THREE.Group(); head.position.set(0, 2.2, 0); g.add(head);
    if (P.epi) {
      // capuz do macacão, óculos escuros e respirador: sem rosto visível
      add(sphere(0.43, 28, 22), P.roupa, 0, 0, 0, head);
      add(new THREE.BoxGeometry(0.52, 0.15, 0.12), 0x2b3440, 0, 0.0, 0.37, head);
      add(sphere(0.022, 8, 8), EYE.glintB, -0.14, 0.03, 0.44, head);
      add(sphere(0.022, 8, 8), EYE.glintB, 0.10, 0.03, 0.44, head);
      add(new THREE.CylinderGeometry(0.11, 0.14, 0.16, 16), 0x4a4d55, 0, -0.2, 0.38, head, { r: [Math.PI / 2, 0, 0] });
      for (const s of [-1, 1]) {
        add(new THREE.CylinderGeometry(0.07, 0.07, 0.08, 14), 0x3a3d44, s * 0.17, -0.24, 0.33, head, { r: [Math.PI / 2, 0, s * 0.5] });
      }
    } else {
      add(sphere(0.40, 28, 22), P.pele, 0, 0, 0, head);
      hair(P, head, add, sphere);
      // rosto montado em grupos (olho, sobrancelha, boca) para as expressões mexerem
      // no grupo inteiro: peça e contorno juntos
      const grupo = (x, y, z, r) => {
        const o = new THREE.Group(); o.position.set(x, y, z);
        if (r) o.rotation.set(r[0], r[1], r[2]);
        head.add(o); o.userData.base = { y, r: r ? r.slice() : [0, 0, 0] }; return o;
      };
      const rosto = { olhos: [], pupilas: [], sobr: [], bocas: {} };
      for (const side of [-1, 1]) {
        const olho = grupo(side * 0.15, -0.05, 0.315); // centro a ~0,35 do centro da cabeça
        if (P.blind) {
          // olho nublado (briefing): globo cinza-escuro fosco do mesmo tamanho do olho que
          // enxerga, sem pupila, e um brilho off-white largo e apagado
          add(sphere(0.084), EYE.blind, 0, 0, 0.004, olho);
          add(sphere(0.03, 10, 8), EYE.glintB, -0.026, 0.024, 0.07, olho, { s: [1, 0.8, 0.5], semContorno: true });
        } else {
          add(sphere(0.082), EYE.white, 0, 0, 0, olho);
          const pu = new THREE.Group(); pu.position.set(0, 0, 0.045); olho.add(pu);
          add(sphere(0.042, 12, 12), EYE.pupil, 0, 0, 0, pu);
          add(sphere(0.015, 8, 8), EYE.glint, -0.022, 0.022, 0.035, pu);
          rosto.pupilas.push(pu);
        }
        rosto.olhos.push(olho);
        const sb = grupo(side * 0.15, 0.11, 0.345, [-0.3, side * 0.4, 0]); sb.userData.side = side;
        add(new THREE.BoxGeometry(0.13, 0.028, 0.05), P.sobrancelha || P.cabelo, 0, 0, 0, sb);
        rosto.sobr.push(sb);
      }
      if (P.blush) {
        // maçãs do rosto: discos achatados rentes à pele, sem contorno
        for (const side of [-1, 1]) {
          add(sphere(0.07, 14, 10), P.blush, side * 0.215, -0.14, 0.305, head,
              { s: [1.15, 0.62, 0.3], r: [0.32, side * 0.62, 0], semContorno: true });
        }
      }
      if (P.barba) add(sphere(0.2, 20, 14), P.cabelo, 0, -0.3, 0.17, head, { s: [1.2, 0.5, 0.95] });
      // bocas: uma de cada tipo, só uma visível por vez
      const by = P.barba ? -0.17 : -0.21, bz = P.barba ? 0.36 : 0.335;
      const boca = (nome, fn) => { const o = grupo(0, by, bz, [0.5, 0, 0]); fn(o); o.visible = false; rosto.bocas[nome] = o; };
      const ESC = 0x3a2226;
      boca("linha", (o) => add(new THREE.BoxGeometry(0.13, 0.03, 0.04), EYE.pupil, 0, 0, 0, o));
      boca("sorriso", (o) => add(new THREE.TorusGeometry(0.065, 0.016, 6, 18, Math.PI), EYE.pupil, 0, 0.035, 0, o, { r: [0, 0, Math.PI] }));
      boca("triste", (o) => add(new THREE.TorusGeometry(0.06, 0.016, 6, 18, Math.PI), EYE.pupil, 0, -0.04, 0, o));
      boca("o", (o) => add(sphere(0.042, 14, 10), ESC, 0, 0, 0, o, { s: [0.9, 1.2, 0.45] }));
      boca("aberta", (o) => {
        add(sphere(0.085, 16, 12), ESC, 0, -0.02, 0, o, { s: [1.15, 1.0, 0.4] });
        add(new THREE.BoxGeometry(0.12, 0.025, 0.02), 0xf4f1ea, 0, 0.045, 0.02, o, { semContorno: true });
      });
      boca("dentes", (o) => add(new THREE.BoxGeometry(0.15, 0.05, 0.03), 0xf4f1ea, 0, 0, 0, o));
      g.userData.rosto = rosto;
    }

    if (P.pose === "sentado_cama") {
      // sentado na cama com as pernas esticadas sob o lençol; braços tateando o ar à frente
      for (const l of [pL, pR]) { l.hip.rotation.x = -Math.PI / 2; }
      aL.sh.rotation.set(-1.05, 0, 0.12); aL.el.rotation.x = -0.35;
      aR.sh.rotation.set(-0.8, 0, -0.1); aR.el.rotation.x = -0.55;
    } else if (P.pose === "hands_to_face") {
      aL.sh.rotation.x = -2.25; aL.sh.rotation.z = 0.35; aL.el.rotation.x = -1.7;
      aR.sh.rotation.x = -2.25; aR.sh.rotation.z = -0.35; aR.el.rotation.x = -1.7;
      head.rotation.x = 0.22;
    } else {
      // repouso: braços levemente abertos, sem simetria perfeita
      aL.sh.rotation.z = -0.06; aR.sh.rotation.z = 0.09;
      aL.el.rotation.x = -0.08; aR.el.rotation.x = -0.14;
    }
    g.traverse((o) => { if (o.isMesh && o.material !== outlineMat) { o.castShadow = true; o.receiveShadow = true; } });
    g.scale.setScalar(P.alt);
    g.userData.rig = { head, aL, aR, pL, pR, ficha: P };
    if (g.userData.rosto) expressao(g, P.expr || "neutro");
    return g;
  }

  // Expressões: sobrancelha (altura, inclinação: + = interna sobe/tristeza, - = raiva),
  // abertura do olho, tamanho da pupila, boca e inclinação da cabeça.
  const EXPR = {
    neutro:  { sy: 0,     sa: 0,     olho: 1,    pupila: 1,    boca: "linha",   cab: 0 },
    medo:    { sy: 0.05,  sa: 0.35,  olho: 1.15, pupila: 0.7,  boca: "o",       cab: -0.05 },
    triste:  { sy: 0.0,   sa: 0.45,  olho: 0.72, pupila: 1,    boca: "triste",  cab: 0.18 },
    raiva:   { sy: -0.035, sa: -0.45, olho: 0.75, pupila: 0.9, boca: "dentes",  cab: 0.05 },
    grito:   { sy: 0.06,  sa: 0.25,  olho: 1.1,  pupila: 0.75, boca: "aberta",  cab: -0.12 },
    ternura: { sy: 0.02,  sa: 0.15,  olho: 0.8,  pupila: 1.05, boca: "sorriso", cab: 0.1 },
    firme:   { sy: -0.02, sa: -0.2,  olho: 0.9,  pupila: 1,    boca: "linha",   cab: 0 },
    choro:   { sy: 0.02,  sa: 0.55,  olho: 0.45, pupila: 1,    boca: "triste",  cab: 0.22 },
  };

  function expressao(g, nome) {
    const r = g.userData.rosto, e = EXPR[nome] || EXPR.neutro;
    if (!r) return;
    for (const sb of r.sobr) {
      const b = sb.userData.base;
      sb.position.y = b.y + e.sy;
      sb.rotation.set(b.r[0], b.r[1], -sb.userData.side * e.sa);
    }
    for (const o of r.olhos) o.scale.set(1, e.olho, 1);
    // pupila menor precisa vir para a frente, senão afunda no branco do olho
    for (const pu of r.pupilas) { pu.scale.setScalar(e.pupila); pu.position.z = 0.082 - 0.037 * e.pupila; }
    for (const k in r.bocas) r.bocas[k].visible = (k === e.boca);
    g.userData.rig.head.rotation.x = (g.userData.rig.ficha.pose === "hands_to_face" ? 0.22 : 0) + e.cab;
  }

  function hair(P, head, add, sphere) {
    const c = P.cabelo;
    const cap = (r, frac) => new THREE.SphereGeometry(r, 24, 18, 0, Math.PI * 2, 0, Math.PI * frac);
    if (P.cabeloEstilo === "gabi") { // aprovado em baa3c95: não mexer
      add(cap(0.415, 0.62), c, 0, 0.02, -0.03, head);
      add(sphere(0.27, 18, 12), c, 0, 0.29, 0.2, head, { s: [1.0, 0.4, 0.66], r: [-0.35, 0, 0] });
      add(sphere(0.3, 18, 12), c, 0, -0.14, -0.2, head, { s: [1.05, 0.7, 0.75] }); // nuca
    } else if (P.cabeloEstilo === "rabo") {
      // rabo de cavalo: puxado para trás, franja de lado, elástico e rabo caindo na nuca
      add(cap(0.425, 0.55), c, 0, 0.03, -0.02, head, { r: [-0.62, 0, 0] }); // frente alta, nuca baixa
      add(sphere(0.2, 16, 12), c, -0.1, 0.3, 0.23, head, { s: [1.35, 0.4, 0.62], r: [-0.3, 0, 0.3] });
      add(new THREE.TorusGeometry(0.075, 0.03, 8, 16), 0x8e3b46, 0, 0.06, -0.42, head);
      add(sphere(0.15, 16, 12), c, 0, -0.2, -0.5, head, { s: [0.62, 1.7, 0.62], r: [0.28, 0, 0] });
    } else if (P.cabeloEstilo === "chanel") {
      // na altura do queixo, risca de lado: moldura do rosto que lê de frente
      add(cap(0.425, 0.56), c, 0, 0.03, -0.02, head, { r: [-0.22, 0, 0] });
      add(sphere(0.40, 20, 16), c, 0, -0.08, -0.12, head, { s: [1.1, 0.95, 0.75] });
      for (const s of [-1, 1]) add(sphere(0.16, 14, 12), c, s * 0.34, -0.12, 0.06, head, { s: [0.7, 1.35, 0.9] });
      add(sphere(0.2, 16, 12), c, -0.1, 0.29, 0.24, head, { s: [1.35, 0.42, 0.62], r: [0, 0, 0.3] });
    } else if (P.cabeloEstilo === "crespo") {
      // curto e rente, entradas altas: calota inclinada para trás deixa testa e sobrancelhas livres
      add(cap(0.43, 0.55), c, 0, 0.03, -0.03, head, { r: [-0.65, 0, 0] }); // frente alta, nuca baixa
    } else if (P.cabeloEstilo === "longo") {
      // solto até os ombros: calota, massa nas costas e duas mechas ao lado do rosto
      add(cap(0.42, 0.56), c, 0, 0.02, -0.02, head, { r: [-0.5, 0, 0] });
      add(sphere(0.40, 20, 16), c, 0, -0.24, -0.16, head, { s: [1.08, 1.25, 0.62] });
      for (const s of [-1, 1]) add(new THREE.CylinderGeometry(0.075, 0.06, 0.48, 12), c, s * 0.355, -0.16, 0.1, head);
      add(sphere(0.2, 16, 12), c, 0.06, 0.31, 0.23, head, { s: [1.45, 0.4, 0.62], r: [-0.3, 0, -0.18] });
    }
  }

  window.Elenco = { FICHAS, EXPR, build, expressao };
})();
