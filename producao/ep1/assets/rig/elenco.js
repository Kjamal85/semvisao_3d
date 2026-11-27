// Elenco: um construtor só para todos os personagens (Three.js r155, global THREE).
// Mesmas proporções do Gabi aprovado (commit baa3c95): formas simples, contorno escuro em
// casca BackSide, cabeça ~0,31 da altura. Cada personagem é uma ficha de parâmetros.
//
// DOIS MODOS (o EP1 aprovado não muda):
//   Elenco.build(id)                       -> modelo do EP1, idêntico ao aprovado (padrão)
//   Elenco.build(id, { refinado: true })   -> modelo refinado para cenas NOVAS (EP2 em diante):
//       · geometria lisa: membros em cápsula afunilada (LatheGeometry) que encaixa nas juntas,
//         tronco com perfil em spline, mais segmentos em tudo que é curvo
//       · hierarquia com pivôs anatômicos: quadril -> tronco (cintura) -> peito (respira) ->
//         ombros/pescoço/cabeça; pernas presas na bacia (o corpo balança sem tirar o pé do chão)
//       · material: "toon" (padrão, cel em 3 faixas igual aos cenários — é o cânone da série)
//                   ou "pbr" (MeshStandard/Physical por tipo de superfície; pedir Elenco.ambiente)
//   Elenco.vida(g, t, op)  -> respiração, balanço, piscar, olhar, dedos: tudo em função do TEMPO
//   Elenco.mola(chaves, t)  -> inércia/amortecimento em forma fechada (determinística no seek)
//
// Regra do render: o HyperFrames pede quadros em qualquer ordem (seek). Nada aqui guarda
// estado entre quadros: o mesmo t dá sempre o mesmo corpo. Por isso não há lerp quadro a
// quadro — a "inércia" é a resposta de uma mola calculada direto do tempo (ver mola()).
(function () {
  const OUT = 0x000000;
  const EYE = { white: 0xffffff, pupil: 0x24242a, blind: 0x6a6a71, glintB: 0xecebe4, glint: 0xffffff };
  const outlineMat = new THREE.MeshBasicMaterial({ color: OUT, side: THREE.BackSide });
  const cache = {};
  const mat = (c) => cache[c] || (cache[c] = new THREE.MeshToonMaterial({ color: c }));

  // Fichas. alt = escala da altura (Gabi = 1); larg = largura do corpo.
  const FICHAS = {
    gabi: { nome: "Gabi", alt: 1.0, larg: 1.0, pele: 0xc68e62, cabelo: 0x241c17, cabeloEstilo: "gabi",
            roupa: 0xaed0ec, calca: 0x454551, sapato: 0x2d2d36, capuz: true, fone: 0x24242a, cintura: 0.93 },
    mae:  { nome: "Mãe", alt: 0.96, larg: 0.95, pele: 0xf0cfb4, cabelo: 0x7a5236, cabeloEstilo: "rabo", blush: 0xf0aaa6,
            roupa: 0xc9835b, calca: 0x5d6d8c, sapato: 0x6b4b3a, cintura: 0.8 },
    pai:  { nome: "Pai", alt: 1.07, larg: 1.12, pele: 0x6e4630, cabelo: 0x16110e, cabeloEstilo: "crespo",
            barba: true, roupa: 0x6f7f5a, calca: 0x8a7a5e, sapato: 0x3a2e26, cintura: 0.93 },
    duda: { nome: "Duda", alt: 0.92, larg: 0.86, pele: 0xf3d6c2, cabelo: 0xe0bd72, cabeloEstilo: "longo", blush: 0xf3aeb2, sobrancelha: 0x9a7038,
            roupa: 0xf2c4d0, calca: 0x8fa3c4, sapato: 0xe9e4dc, cintura: 0.78 },
    // adulta de TV: olhos menores, batom, brincos, blazer com lapela sobre blusa clara
    reporter: { nome: "Repórter", alt: 0.97, larg: 0.95, pele: 0xd9a77f, cabelo: 0x1a1412, cabeloEstilo: "chanel",
                blush: 0xd98c7e, roupa: 0x7a2e3a, calca: 0x2b2b33, sapato: 0x1b1b20,
                olho: 0.82, batom: 0xa3333f, brinco: 0xd9b44a, lapela: 0x5e1f2a, blusa: 0xf1ece4, cintura: 0.8 },
    agente: { nome: "Agente", alt: 1.05, larg: 1.1, pele: 0xd9b08c, roupa: 0xe4e8eb, calca: 0xe4e8eb,
              sapato: 0x24242a, mao: 0xf7f7f3, epi: true, faixa: 0xe8b923, cintura: 0.95 },   // luva branca
  };

  // a cabeça gira pela base do pescoço (PESCOCO); centro da cabeça em pé = CABECA_Y
  const PESCOCO = 1.82, R_CAB = 0.48, CABECA_Y = PESCOCO + R_CAB;

  // ───────────────────────── materiais do modo refinado ─────────────────────────
  // Toon em 3 faixas (luz, meio-tom, sombra levantada) — o mesmo gradiente de Cena.kit,
  // para personagem e cenário terem o mesmo traço de luz.
  let GRAD = null;
  function gradiente() {
    if (!GRAD) {
      GRAD = new THREE.DataTexture(new Uint8Array([100, 100, 100, 255, 170, 170, 170, 255, 255, 255, 255, 255]), 3, 1);
      GRAD.minFilter = GRAD.magFilter = THREE.NearestFilter; GRAD.needsUpdate = true;
    }
    return GRAD;
  }
  // PBR por tipo de superfície: a luz reage diferente em pele, pano, cabelo, olho, metal.
  // sheen = brilho aveludado de borda (tecido, cabelo, pele); clearcoat = verniz (olho, sapato, plástico).
  // env = quanto o reflexo do Elenco.ambiente entra em cada superfície. O céu dele nasce das MESMAS
  // luzes ambiente/hemisfério que já iluminam o boneco; em superfície fosca o reflexo vira luz difusa
  // somada outra vez (teste de 2026-11-27, rua à noite: moletom com luz 0,73 contra 0,55 no EP1; sem o
  // reflexo, 0,55). Então ele entra cheio só onde dá brilho (olho, sapato, plástico, metal, vidro).
  const PBR = {
    pele:     { phys: true, roughness: 0.55, metalness: 0, sheen: 0.25, sheenRoughness: 0.6, sheenCor: 0xffd9c4, env: 0.15 },
    tecido:   { phys: true, roughness: 0.92, metalness: 0, sheen: 0.5, sheenRoughness: 0.8, env: 0 },
    cabelo:   { phys: true, roughness: 0.6, metalness: 0, sheen: 0.6, sheenRoughness: 0.4, env: 0.3 },
    sapato:   { phys: true, roughness: 0.45, metalness: 0, clearcoat: 0.3, clearcoatRoughness: 0.4 },
    olho:     { phys: true, roughness: 0.15, metalness: 0, clearcoat: 1, clearcoatRoughness: 0.05 },
    olhoCego: { phys: false, roughness: 0.85, metalness: 0 },      // fosco: o briefing pede "brilho apagado"
    boca:     { phys: false, roughness: 0.5, metalness: 0 },
    metal:    { phys: false, roughness: 0.3, metalness: 1 },
    plastico: { phys: true, roughness: 0.35, metalness: 0, clearcoat: 0.6, clearcoatRoughness: 0.2 },
    vidro:    { phys: true, roughness: 0.05, metalness: 0.1, clearcoat: 1, clearcoatRoughness: 0 },
  };
  const cacheR = {};
  function matR(c, papel, modo) {
    const k = modo + ":" + papel + ":" + c;
    if (cacheR[k]) return cacheR[k];
    let m;
    if (modo === "pbr") {
      const d = PBR[papel] || PBR.tecido, o = { color: c, roughness: d.roughness, metalness: d.metalness,
                                                envMapIntensity: d.env === undefined ? 1 : d.env };
      if (d.phys) {
        if (d.sheen) { o.sheen = d.sheen; o.sheenRoughness = d.sheenRoughness; o.sheenColor = new THREE.Color(d.sheenCor || c); }
        if (d.clearcoat) { o.clearcoat = d.clearcoat; o.clearcoatRoughness = d.clearcoatRoughness; }
        m = new THREE.MeshPhysicalMaterial(o);
      } else m = new THREE.MeshStandardMaterial(o);
    } else {
      m = new THREE.MeshToonMaterial({ color: c, gradientMap: gradiente() });
    }
    return (cacheR[k] = m);
  }
  // tipo de superfície a partir da cor da ficha (as peças do rosto passam o papel explícito)
  function papelDe(P, c) {
    if (c === P.pele || c === P.blush) return "pele";
    if (c === P.mao) return P.epi ? "tecido" : "pele";   // agente: luva
    if (c === P.cabelo || c === P.sobrancelha) return "cabelo";
    if (c === P.sapato) return "sapato";
    if (c === P.fone) return "plastico";
    if (c === P.brinco) return "metal";
    return "tecido";
  }

  // Ambiente para o modo PBR: um céu em gradiente vira mapa de reflexo (PMREM). Sem isso o
  // MeshStandard fica "chapado" — ele precisa de algo para refletir. Chamar uma vez por cena,
  // DEPOIS de pôr as luzes na cena.
  // O céu NASCE DAS LUZES DA CENA (ambiente + hemisfério: cor × intensidade) e entra fraco
  // (op.forca, padrão 0,3): dá o brilho do material sem clarear o boneco. Teste de 2026-11-25:
  // com um céu claro fixo, o boneco PBR ficou mais claro que a sala de fim de tarde (recortado).
  // op.topo / op.meio / op.chao forçam cores à mão.
  function ambiente(renderer, scene, op) {
    const r = renderer.base || renderer, o = op || {}, forca = o.forca === undefined ? 0.3 : o.forca;
    const ceu = new THREE.Color(0, 0, 0), solo = new THREE.Color(0, 0, 0);
    let achou = false;
    scene.traverse((l) => {
      if (l.isHemisphereLight) { ceu.add(l.color.clone().multiplyScalar(l.intensity)); solo.add(l.groundColor.clone().multiplyScalar(l.intensity)); achou = true; }
      else if (l.isAmbientLight) { const c = l.color.clone().multiplyScalar(l.intensity); ceu.add(c); solo.add(c); achou = true; }
    });
    if (!achou) { ceu.set(0xdfe8f2); solo.set(0x5a5650); }
    const lim = (c) => { c.multiplyScalar(forca); c.r = Math.min(1, c.r); c.g = Math.min(1, c.g); c.b = Math.min(1, c.b); return c; };
    const topo = o.topo !== undefined ? new THREE.Color(o.topo) : lim(ceu.clone());
    const chao = o.chao !== undefined ? new THREE.Color(o.chao) : lim(solo.clone());
    const meio = o.meio !== undefined ? new THREE.Color(o.meio) : topo.clone().lerp(chao, 0.5);
    const geo = new THREE.SphereGeometry(10, 32, 16), pos = geo.attributes.position, cores = [];
    const c = new THREE.Color();
    for (let i = 0; i < pos.count; i++) {
      const y = pos.getY(i) / 10;
      if (y > 0) c.copy(meio).lerp(topo, Math.pow(y, 0.6)); else c.copy(meio).lerp(chao, Math.pow(-y, 0.5));
      cores.push(c.r, c.g, c.b);
    }
    geo.setAttribute("color", new THREE.Float32BufferAttribute(cores, 3));
    const env = new THREE.Scene();
    env.add(new THREE.Mesh(geo, new THREE.MeshBasicMaterial({ side: THREE.BackSide, vertexColors: true })));
    const pm = new THREE.PMREMGenerator(r), rt = pm.fromScene(env, 0.04);
    scene.environment = rt.texture; pm.dispose();
    return rt.texture;
  }

  // ───────────────────────── geometria do modo refinado ─────────────────────────
  // Cápsula afunilada: raio r0 em cima, r1 embaixo, L = distância entre os centros das pontas.
  // Os centros das pontas ficam EXATAMENTE nas juntas, então a ponta arredondada é a própria
  // junta: ao dobrar joelho/cotovelo não abre fresta nem aparece "cano" cortado.
  // Centrada na origem: o contorno (escala 1,07) cresce em volta do meio da peça.
  function capsula(r0, r1, L, seg) {
    const V = THREE.Vector2, pts = [], N = 10;
    for (let i = 0; i <= N; i++) { const a = -Math.PI / 2 + (i / N) * (Math.PI / 2); pts.push(new V(r1 * Math.cos(a), -L / 2 + r1 * Math.sin(a))); }
    for (let i = 1; i <= N; i++) { const a = (i / N) * (Math.PI / 2); pts.push(new V(r0 * Math.cos(a), L / 2 + r0 * Math.sin(a))); }
    pts[0].x = 0; pts[pts.length - 1].x = 0;
    return new THREE.LatheGeometry(pts, seg || 28);
  }
  // Pivô anatômico: um grupo na altura da junta (gira por ali) com um grupo interno
  // deslocado de volta — as peças continuam nas coordenadas absolutas do corpo.
  function pivo(pai, y) {
    const ext = new THREE.Group(); ext.position.y = y; pai.add(ext);
    const int = new THREE.Group(); int.position.y = -y; ext.add(int);
    return { ext, int };
  }

  function build(id, opts) {
    const P = Object.assign({}, FICHAS[id], opts || {});
    const R = !!P.refinado, MODO = P.material === "pbr" ? "pbr" : "toon";
    const w = P.larg;
    const g = new THREE.Group();
    // Hierarquia: no modo do EP1 tudo fica direto em g (como foi aprovado). No refinado:
    //   g ── bacia + pernas (quadril)
    //   └─ tronco (pivô na cintura, 1,12) ── braços, pescoço, cabeça
    //        └─ peito (pivô no esterno, 1,50) ── tronco torneado, capuz, lapela, faixa (respiram)
    let tronco = null, peito = null;
    if (R) { tronco = pivo(g, 1.12); peito = pivo(tronco.int, 1.5); }
    const CORPO = R ? tronco.int : g, PEITO = R ? peito.int : g;

    // add(geo, cor, x, y, z, pai, {s:[sx,sy,sz], r:[rx,ry,rz], semContorno, papel}): escala e rotação
    // valem também para a casca do contorno (senão ela fica no formato original e vira mancha preta)
    const add = (geo, c, x, y, z, parent, tf) => {
      const p = parent || g;
      const s = (tf && tf.s) || [1, 1, 1], r = (tf && tf.r) || [0, 0, 0];
      if (!(tf && tf.semContorno) && P.contorno !== false) {
        const o = new THREE.Mesh(geo, outlineMat); o.position.set(x, y, z);
        o.scale.set(s[0] * 1.07, s[1] * 1.07, s[2] * 1.07); o.rotation.set(r[0], r[1], r[2]); p.add(o);
      }
      const material = R ? matR(c, (tf && tf.papel) || papelDe(P, c), MODO) : mat(c);
      const m = new THREE.Mesh(geo, material); m.position.set(x, y, z);
      m.scale.set(s[0], s[1], s[2]); m.rotation.set(r[0], r[1], r[2]); p.add(m);
      return m;
    };
    // no refinado, o dobro de segmentos em toda forma curva (silhueta sem quinas)
    const SEG = R ? 2 : 1;
    const sphere = (r, a, b) => new THREE.SphereGeometry(r, (a || 16) * SEG, (b || 12) * SEG);

    // pernas com quadril e joelho (para sentar, tropeçar e cair); em pé fica igual à
    // perna inteiriça aprovada: coxa 0,53 + canela 0,52, do chão (0,025) ao quadril (1,075)
    function leg(side) {
      const hip = new THREE.Group(); hip.position.set(side * 0.14 * w, 1.075, 0); g.add(hip);
      const knee = new THREE.Group(); knee.position.set(0, -0.53, 0);
      if (R) {
        // coxa: pontas centradas no quadril e no joelho; canela: do joelho ao tornozelo (-0,44),
        // a ponta de baixo encosta no chão dentro do tênis
        add(capsula(0.12 * w, 0.115 * w, 0.53), P.calca, 0, -0.265, 0, hip);
        hip.add(knee);
        add(sphere(0.116 * w, 14, 10), P.calca, 0, 0, 0, knee, { semContorno: true });   // recheio da dobra
        add(capsula(0.115 * w, 0.104 * w, 0.44), P.calca, 0, -0.22, 0, knee);
        // tênis arredondado (elipsoide) no lugar da caixa: mesmo volume, sem quina
        add(sphere(1, 16, 12), P.sapato, 0, -0.47, 0.06, knee, { s: [0.125 * w, 0.075, 0.18] });
      } else {
        add(new THREE.CylinderGeometry(0.12 * w, 0.12 * w, 0.55, 16), P.calca, 0, -0.265, 0, hip);
        hip.add(knee);
        add(new THREE.SphereGeometry(0.12 * w, 14, 10), P.calca, 0, 0, 0, knee); // joelho sem fresta ao dobrar
        add(new THREE.CylinderGeometry(0.12 * w, 0.115 * w, 0.52, 16), P.calca, 0, -0.26, 0, knee);
        add(new THREE.BoxGeometry(0.22 * w, 0.12, 0.34), P.sapato, 0, -0.485, 0.06, knee);
      }
      return { hip, knee };
    }
    const pL = leg(-1), pR = leg(1);
    // tronco (topo em 1,82) + pescoço: a cabeça não fica enterrada no corpo
    // tronco torneado (ombro, peito, cintura, quadril) e bacia na cor da calça ligando as pernas
    const c = P.cintura || 0.88;
    let perfil = [[0, 1.84], [0.2, 1.83], [0.29, 1.8], [0.305, 1.72], [0.3, 1.58], [0.3 * c, 1.38], [0.285, 1.2], [0.28, 1.1], [0.2, 1.065], [0, 1.06]]
      .map(([r, y]) => new THREE.Vector2(r * w, y - 1.45)).reverse();   // de baixo p/ cima (normais para fora), centrado: o contorno escala em volta do tronco
    if (R) {
      // spline pelos mesmos pontos: ombro, peito e cintura viram curva contínua (sem anéis)
      perfil = new THREE.SplineCurve(perfil).getPoints(48).map((v) => new THREE.Vector2(Math.max(0, v.x), v.y));
      perfil[0].x = 0; perfil[perfil.length - 1].x = 0;
    }
    add(new THREE.LatheGeometry(perfil, 24 * SEG), P.roupa, 0, 1.45, 0, PEITO);
    add(sphere(0.27 * w, 20, 14), P.calca, 0, 1.02, 0, g, { s: [1, 0.5, 0.8] });
    if (R) add(capsula(0.1 * w, 0.115 * w, 0.2), P.epi ? P.roupa : P.pele, 0, 1.9, 0, CORPO);   // pescoço afunila e entra no tronco
    else add(new THREE.CylinderGeometry(0.105 * w, 0.115 * w, 0.26, 14), P.epi ? P.roupa : P.pele, 0, 1.9, 0);
    if (P.capuz) { // moletom (referência do usuário, 2026-11-22): capuz caído em gola, cordões, bolso canguru, ribanas
      const rib = new THREE.Color(P.roupa).multiplyScalar(0.86).getHex();
      const cordao = new THREE.Color(P.roupa).lerp(new THREE.Color(0xffffff), 0.45).getHex();
      add(sphere(0.26, 18, 14), P.roupa, 0, 1.84, -0.14, PEITO, { s: [1.15, 0.62, 0.8] });                          // volume do capuz nas costas
      add(new THREE.TorusGeometry(0.17 * w, 0.06, 12 * SEG, 28 * SEG), P.roupa, 0, 1.8, -0.02, PEITO, { r: [Math.PI / 2 - 0.3, 0, 0] });   // gola do capuz
      for (const s of [-1, 1]) {                                                                                   // dois cordões com ponteira
        add(new THREE.CylinderGeometry(0.014, 0.014, 0.32, 6 * SEG), cordao, s * 0.075, 1.6, 0.3, PEITO, { r: [-0.06, 0, s * 0.04] });
        add(new THREE.CylinderGeometry(0.018, 0.018, 0.05, 8 * SEG), 0x9a9aa2, s * 0.082, 1.42, 0.31, PEITO, { semContorno: true, papel: "metal" });
      }
      add(new THREE.BoxGeometry(0.4, 0.22, 0.05), P.roupa, 0, 1.25, 0.265, PEITO, { semContorno: true });          // bolso canguru: só costuras
      add(new THREE.BoxGeometry(0.26, 0.012, 0.012), rib, 0, 1.36, 0.292, PEITO, { semContorno: true });
      for (const s of [-1, 1]) add(new THREE.BoxGeometry(0.012, 0.2, 0.012), rib, s * 0.18, 1.26, 0.293, PEITO, { r: [0, 0, s * 0.35], semContorno: true });   // boca do bolso
      add(new THREE.CylinderGeometry(0.286 * w, 0.283 * w, 0.08, 20 * SEG), rib, 0, 1.12, 0, PEITO);                          // barra de ribana
    }
    if (P.fone && P.foneNoPescoco) {   // fone fora do pescoço por padrão (usuário não gostou do aro preto) // objeto-assinatura do Gabi: fone no pescoço
      // aro largo e solto, caído para a frente sobre o peito (não aperta o pescoço); conchas na clavícula
      add(new THREE.TorusGeometry(0.27, 0.04, 10, 28), P.fone, 0, 1.8, 0.06, PEITO, { r: [Math.PI / 2 + 0.55, 0, 0] });
      add(sphere(0.085, 12, 12), P.fone, -0.23, 1.74, 0.2, PEITO, { s: [0.7, 1, 1], r: [0, -0.4, 0] });
      add(sphere(0.085, 12, 12), P.fone, 0.23, 1.74, 0.2, PEITO, { s: [0.7, 1, 1], r: [0, 0.4, 0] });
    }
    if (P.lapela) { // blazer: blusa clara em V e duas lapelas
      // V da blusa entre as lapelas; cada lapela com o topo aberto para fora (rot z = -lado)
      add(new THREE.BoxGeometry(0.13, 0.34, 0.03), P.blusa, 0, 1.72, 0.275, PEITO, { r: [-0.1, 0, 0] });
      for (const s of [-1, 1]) add(new THREE.BoxGeometry(0.08, 0.44, 0.04), P.lapela, s * 0.1, 1.7, 0.285, PEITO, { r: [-0.1, 0, -s * 0.3] });
    }
    if (P.faixa) { // EPI: faixa refletiva no peito
      add(new THREE.CylinderGeometry(0.308 * w, 0.308 * w, 0.09, 20 * SEG), P.faixa, 0, 1.62, 0, PEITO);
    }
    // braços (ombro -> cotovelo, com juntas para posar)
    function arm(side) {
      const sh = new THREE.Group(); sh.position.set(side * 0.30 * w, 1.74, 0); CORPO.add(sh);
      add(sphere(0.105 * w, 14, 12), P.roupa, 0, -0.02, 0, sh);                          // ombro arredondado
      const el = new THREE.Group(); el.position.set(0, -0.46, 0);
      if (R) {
        // braço do ombro (-0,02) ao cotovelo (-0,46); antebraço do cotovelo ao punho (-0,37),
        // a ponta de baixo entra na palma (sem bolinha aparecendo no pulso)
        add(capsula(0.095 * w, 0.086 * w, 0.44), P.roupa, 0, -0.24, 0, sh);
        if (P.faixa) add(new THREE.CylinderGeometry(0.098 * w, 0.096 * w, 0.07, 28), P.faixa, 0, -0.16, 0, sh);
        sh.add(el);
        add(sphere(0.087 * w, 14, 10), P.roupa, 0, 0, 0, el, { semContorno: true });   // recheio da dobra
        add(capsula(0.083 * w, 0.073 * w, 0.37), P.roupa, 0, -0.185, 0, el);
      } else {
        add(new THREE.CylinderGeometry(0.09 * w, 0.085 * w, 0.46, 14), P.roupa, 0, -0.23, 0, sh);
        if (P.faixa) add(new THREE.CylinderGeometry(0.092 * w, 0.09 * w, 0.07, 14), P.faixa, 0, -0.16, 0, sh);
        sh.add(el);
        add(sphere(0.085 * w, 14, 10), P.roupa, 0, 0, 0, el);                              // cotovelo sem fresta ao dobrar
        add(new THREE.CylinderGeometry(0.08 * w, 0.075 * w, 0.44, 14), P.roupa, 0, -0.22, 0, el);
      }
      if (P.capuz) add(new THREE.CylinderGeometry(0.083 * w, 0.083 * w, 0.07, 14 * SEG), new THREE.Color(P.roupa).multiplyScalar(0.86).getHex(), 0, -0.41, 0, el);   // punho de ribana
      // mão (referência do usuário): palma achatada voltada para o corpo, 4 dedos e polegar à frente
      const cm = P.mao || P.pele, mao = new THREE.Group(); mao.position.set(0, -0.41, 0); mao.scale.setScalar(1.35); el.add(mao);
      add(sphere(0.07, 14, 12), cm, 0, -0.05, 0, mao, { s: [0.6, 1.0, 0.9] });
      const dedos = [];
      for (let i = 0; i < 4; i++) {
        const d = new THREE.Group(); d.position.set(0, -0.1, (i - 1.5) * 0.031); mao.add(d);
        add(new THREE.CapsuleGeometry(0.016, 0.055 - Math.abs(i - 1.2) * 0.01, 4 * SEG, 8 * SEG), cm, 0, -0.035, 0, d);
        dedos.push(d);
      }
      const pol = new THREE.Group(); pol.position.set(-side * 0.012, -0.045, 0.05); mao.add(pol);
      add(new THREE.CapsuleGeometry(0.018, 0.04, 4 * SEG, 8 * SEG), cm, 0, -0.03, 0, pol);
      const ret = { sh, el, mao: { g: mao, dedos, pol, side } };
      return ret;
    }
    const aL = arm(-1), aR = arm(1);

    // cabeça (no refinado ela é filha do tronco: acompanha o balanço do corpo)
    const head = new THREE.Group(); head.position.set(0, CABECA_Y, 0); CORPO.add(head);
    if (P.epi) {
      // capuz do macacão, óculos escuros e respirador: sem rosto visível
      add(sphere(0.43, 28, 22), P.roupa, 0, 0, 0, head);
      add(new THREE.BoxGeometry(0.52, 0.15, 0.12), 0x2b3440, 0, 0.0, 0.37, head, { papel: "vidro" });
      add(sphere(0.022, 8, 8), EYE.glintB, -0.14, 0.03, 0.44, head, { papel: "vidro" });
      add(sphere(0.022, 8, 8), EYE.glintB, 0.10, 0.03, 0.44, head, { papel: "vidro" });
      add(new THREE.CylinderGeometry(0.11, 0.14, 0.16, 16 * SEG), 0x4a4d55, 0, -0.2, 0.38, head, { r: [Math.PI / 2, 0, 0], papel: "plastico" });
      for (const s of [-1, 1]) {
        add(new THREE.CylinderGeometry(0.07, 0.07, 0.08, 14 * SEG), 0x3a3d44, s * 0.17, -0.24, 0.33, head, { r: [Math.PI / 2, 0, s * 0.5], papel: "plastico" });
      }
    } else {
      add(sphere(0.40, 28, 22), P.pele, 0, 0, 0, head);
      hair(P, head, add, sphere, SEG);
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
        if (P.olho) olho.userData.k = P.olho;
        if (P.blind) {
          // olho nublado (briefing): globo cinza-escuro fosco do mesmo tamanho do olho que
          // enxerga, sem pupila, e um brilho off-white largo e apagado
          add(sphere(0.084), EYE.blind, 0, 0, 0.004, olho, { papel: "olhoCego" });
          add(sphere(0.03, 10, 8), EYE.glintB, -0.026, 0.024, 0.07, olho, { s: [1, 0.8, 0.5], semContorno: true, papel: "olhoCego" });
        } else {
          add(sphere(0.082), EYE.white, 0, 0, 0, olho, { papel: "olho" });
          const pu = new THREE.Group(); pu.position.set(0, 0, 0.045); olho.add(pu);
          add(sphere(0.042, 12, 12), EYE.pupil, 0, 0, 0, pu, { papel: "olho" });
          add(sphere(0.015, 8, 8), EYE.glint, -0.022, 0.022, 0.035, pu, { papel: "olho" });
          rosto.pupilas.push(pu);
        }
        rosto.olhos.push(olho);
        const sb = grupo(side * 0.15, 0.11, 0.345, [-0.3, side * 0.4, 0]); sb.userData.side = side;
        // refinado: sobrancelha em cápsula deitada (pontas redondas) no lugar da caixa
        if (R) add(new THREE.CapsuleGeometry(0.015, 0.1, 4, 12), P.sobrancelha || P.cabelo, 0, 0, 0, sb, { r: [0, 0, Math.PI / 2], papel: "cabelo" });
        else add(new THREE.BoxGeometry(0.13, 0.028, 0.05), P.sobrancelha || P.cabelo, 0, 0, 0, sb);
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
      if (P.brinco) for (const s of [-1, 1]) add(sphere(0.035, 10, 8), P.brinco, s * 0.37, -0.2, 0.08, head);
      // bocas: uma de cada tipo, só uma visível por vez
      const by = P.barba ? -0.17 : -0.21, bz = P.barba ? 0.36 : 0.335;
      const boca = (nome, fn) => { const o = grupo(0, by, bz, [0.5, 0, 0]); fn(o); o.visible = false; rosto.bocas[nome] = o; };
      const ESC = 0x3a2226;
      const LAB = P.batom || EYE.pupil;
      const BOCA = { papel: "boca" };
      boca("linha", (o) => R
        ? add(new THREE.CapsuleGeometry(P.batom ? 0.02 : 0.015, 0.1, 4, 12), LAB, 0, 0, 0, o, { r: [0, 0, Math.PI / 2], papel: "boca" })
        : add(new THREE.BoxGeometry(0.13, P.batom ? 0.04 : 0.03, 0.04), LAB, 0, 0, 0, o));
      boca("sorriso", (o) => add(new THREE.TorusGeometry(0.065, 0.016, 6 * SEG, 18 * SEG, Math.PI), LAB, 0, 0.035, 0, o, { r: [0, 0, Math.PI], papel: "boca" }));
      boca("triste", (o) => add(new THREE.TorusGeometry(0.06, 0.016, 6 * SEG, 18 * SEG, Math.PI), LAB, 0, -0.04, 0, o, BOCA));
      boca("o", (o) => add(sphere(0.042, 14, 10), ESC, 0, 0, 0, o, { s: [0.9, 1.2, 0.45], papel: "boca" }));
      boca("aberta", (o) => {
        add(sphere(0.085, 16, 12), ESC, 0, -0.02, 0, o, { s: [1.15, 1.0, 0.4], papel: "boca" });
        add(new THREE.BoxGeometry(0.12, 0.025, 0.02), 0xf4f1ea, 0, 0.045, 0.02, o, { semContorno: true, papel: "olho" });
      });
      boca("dentes", (o) => add(new THREE.BoxGeometry(0.15, 0.05, 0.03), 0xf4f1ea, 0, 0, 0, o, { papel: "olho" }));
      g.userData.rosto = rosto;
    }

    if (P.pose === "sentado") {
      // sentado em sofá/cadeira, pés no chão: assento a 1,075 - 0,53 = 0,545 abaixo do quadril
      for (const l of [pL, pR]) { l.hip.rotation.x = -Math.PI / 2; l.knee.rotation.x = Math.PI / 2; }
      aL.sh.rotation.set(-0.35, 0, 0.1); aL.el.rotation.x = -0.9;
      aR.sh.rotation.set(-0.35, 0, -0.1); aR.el.rotation.x = -0.9;
    } else if (P.pose === "sentado_cama") {
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
    for (const b of [aL, aR]) { b.mao.dedos.forEach((d) => d.rotation.set(0, 0, -b.mao.side * 0.35)); b.mao.pol.rotation.set(-0.54, 0, -b.mao.side * 0.2); }
    g.traverse((o) => { if (o.isMesh && o.material !== outlineMat) { o.castShadow = true; o.receiveShadow = true; } });
    g.scale.setScalar(P.alt);
    g.userData.rig = { id, head, aL, aR, pL, pR, ficha: P, refinado: R,
                       tronco: tronco && tronco.ext, peito: peito && peito.ext };
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
    g.userData.rig.ficha.expr = nome;
    for (const sb of r.sobr) {
      const b = sb.userData.base;
      sb.position.y = b.y + e.sy;
      sb.rotation.set(b.r[0], b.r[1], -sb.userData.side * e.sa);
    }
    // olho cego não fecha demais: achatado, o globo nublado vira mancha e parece olho roxo
    const olho = g.userData.rig.ficha.blind ? Math.max(e.olho, 0.78) : e.olho;
    for (const o of r.olhos) { const k = o.userData.k || 1; o.scale.set(k, olho * k, k); }
    // pupila menor precisa vir para a frente, senão afunda no branco do olho
    for (const pu of r.pupilas) { pu.scale.setScalar(e.pupila); pu.position.z = 0.082 - 0.037 * e.pupila; }
    for (const k in r.bocas) r.bocas[k].visible = (k === e.boca);
    // inclinação da expressão também pelo pescoço (o queixo não afunda no corpo)
    cabeca(g, g.userData.rig.ficha.pose === "hands_to_face" ? 0.22 : 0, 0, 0);
  }

  function hair(P, head, add, sphere, SEG) {
    const c = P.cabelo, k = SEG || 1;
    const cap = (r, frac) => new THREE.SphereGeometry(r, 24 * k, 18 * k, 0, Math.PI * 2, 0, Math.PI * frac);
    if (P.cabeloEstilo === "gabi") { // aprovado em baa3c95: não mexer
      add(cap(0.415, 0.62), c, 0, 0.02, -0.03, head);
      add(sphere(0.27, 18, 12), c, 0, 0.29, 0.2, head, { s: [1.0, 0.4, 0.66], r: [-0.35, 0, 0] });
      add(sphere(0.3, 18, 12), c, 0, -0.14, -0.2, head, { s: [1.05, 0.7, 0.75] }); // nuca
    } else if (P.cabeloEstilo === "rabo") {
      // rabo de cavalo: puxado para trás, franja de lado, elástico e rabo caindo na nuca
      add(cap(0.425, 0.55), c, 0, 0.03, -0.02, head, { r: [-0.62, 0, 0] }); // frente alta, nuca baixa
      add(sphere(0.2, 16, 12), c, -0.1, 0.3, 0.23, head, { s: [1.35, 0.4, 0.62], r: [-0.3, 0, 0.3] });
      add(new THREE.TorusGeometry(0.075, 0.03, 8 * k, 16 * k), 0x8e3b46, 0, 0.06, -0.42, head, { papel: "plastico" });
      add(sphere(0.15, 16, 12), c, 0, -0.2, -0.5, head, { s: [0.62, 1.7, 0.62], r: [0.28, 0, 0] });
    } else if (P.cabeloEstilo === "chanel") {
      // na altura do queixo, risca de lado: moldura do rosto que lê de frente
      add(cap(0.425, 0.56), c, 0, 0.03, -0.02, head, { r: [-0.55, 0, 0] });                 // testa e sobrancelhas livres
      add(sphere(0.40, 20, 16), c, 0, -0.08, -0.12, head, { s: [1.1, 0.95, 0.75] });
      for (const s of [-1, 1]) add(sphere(0.16, 14, 12), c, s * 0.34, -0.12, 0.06, head, { s: [0.7, 1.35, 0.9] });
      add(sphere(0.2, 16, 12), c, -0.1, 0.31, 0.22, head, { s: [1.35, 0.4, 0.62], r: [-0.3, 0, 0.3] });
    } else if (P.cabeloEstilo === "crespo") {
      // curto e rente, entradas altas: calota inclinada para trás deixa testa e sobrancelhas livres
      add(cap(0.43, 0.55), c, 0, 0.03, -0.03, head, { r: [-0.65, 0, 0] }); // frente alta, nuca baixa
    } else if (P.cabeloEstilo === "longo") {
      // solto até os ombros: calota, massa nas costas e duas mechas ao lado do rosto
      add(cap(0.42, 0.56), c, 0, 0.02, -0.02, head, { r: [-0.5, 0, 0] });
      add(sphere(0.40, 20, 16), c, 0, -0.24, -0.16, head, { s: [1.08, 1.25, 0.62] });
      // refinado: mecha em cápsula afunilada (ponta redonda) no lugar do cilindro cortado
      for (const s of [-1, 1]) {
        if (SEG > 1) add(capsula(0.075, 0.055, 0.4), c, s * 0.355, -0.16, 0.1, head);
        else add(new THREE.CylinderGeometry(0.075, 0.06, 0.48, 12), c, s * 0.355, -0.16, 0.1, head);
      }
      add(sphere(0.2, 16, 12), c, 0.06, 0.31, 0.23, head, { s: [1.45, 0.4, 0.62], r: [-0.3, 0, -0.18] });
    }
  }

  // Inclina a cabeça a partir do PESCOÇO (não do centro da cabeça): baixar a cabeça leva
  // o rosto para a frente e o queixo não afunda no corpo. baixa (+ = olha para baixo),
  // vira (+ = vira para a esquerda da personagem), lado (inclina de lado), dy (respiração).
  function cabeca(g, baixa, vira, lado, dy) {
    const rig = g.userData.rig, P = rig.ficha;
    const a = (baixa || 0) + ((EXPR[P.expr] || EXPR.neutro).cab || 0);
    rig.head.position.set(0, PESCOCO + R_CAB * Math.cos(a) + (dy || 0), R_CAB * Math.sin(a));
    rig.head.rotation.set(a, vira || 0, lado || 0);
  }

  // Leva a mão até um ponto do mundo: procura os ângulos do ombro (x, z) e do cotovelo (x)
  // que deixam a mão mais perto do alvo. Busca em grade + refinamento: determinística.
  // lado: "esq" ou "dir" DA PERSONAGEM. Devolve a distância que sobrou (0 = encostou).
  const _v = new THREE.Vector3(), _w = new THREE.Vector3();
  function alcancar(g, lado, alvo, op) {
    const fora = !!(op && op.foraDoCorpo);   // regra do cotovelo: só nas cenas novas (as aprovadas ficam como estão)
    const rig = g.userData.rig, braco = lado === "esq" ? rig.aR : rig.aL;   // aR = esquerda da personagem
    const mao = new THREE.Object3D(); mao.position.set(0, -0.46, 0); braco.el.add(mao);
    // regra do usuário: cotovelo e antebraço NUNCA dentro do corpo — pontos de controle punidos se entram no tronco
    const cot = new THREE.Object3D(); braco.el.add(cot);
    const ante = new THREE.Object3D(); ante.position.set(0, -0.2, 0); braco.el.add(ante);
    let raiz = g; while (raiz.parent) raiz = raiz.parent;
    raiz.updateMatrixWorld(true);
    const inv = g.matrixWorld.clone().invert(), RMIN = 0.41 * (rig.ficha.larg || 1);
    const dentro = (o) => {
      o.getWorldPosition(_w); _w.applyMatrix4(inv);
      if (_w.y < 1.0 || _w.y > 1.95) return 0;
      return Math.max(0, RMIN - Math.hypot(_w.x, _w.z));
    };
    const custo = (sx, sz, ex) => {
      braco.sh.rotation.set(sx, 0, sz); braco.el.rotation.set(ex, 0, 0);
      raiz.updateMatrixWorld(true); mao.getWorldPosition(_v);
      return _v.distanceTo(alvo) + (fora ? 6 * (dentro(cot) + dentro(ante)) : 0);
    };
    const s = lado === "esq" ? 1 : -1;            // abrir o braço para fora: z + na esquerda, - na direita
    let best = [0, 0, 0], bc = Infinity;
    for (let sx = -2.6; sx <= 0.6; sx += 0.2) for (let sz = -0.4; sz <= 1.6; sz += 0.2) for (let ex = -2.2; ex <= 0; ex += 0.2) {
      const c = custo(sx, s * sz, ex); if (c < bc) { bc = c; best = [sx, s * sz, ex]; }
    }
    for (const passo of [0.06, 0.02]) {
      const b0 = best.slice();
      for (let a = -3; a <= 3; a++) for (let b = -3; b <= 3; b++) for (let c = -3; c <= 3; c++) {
        const ex = Math.min(0, b0[2] + c * passo);
        const v = custo(b0[0] + a * passo, b0[1] + b * passo, ex);
        if (v < bc) { bc = v; best = [b0[0] + a * passo, b0[1] + b * passo, ex]; }
      }
    }
    custo(best[0], best[1], best[2]); braco.el.remove(mao); braco.el.remove(cot); braco.el.remove(ante);
    return bc;
  }

  // Formas da mão: "relaxada" (padrão), "aberta" (tateando), "segura" (copo, fone), "punho". u mistura com a relaxada.
  const MAOS = { relaxada: [0.35, 0.2], aberta: [0.05, -0.1], segura: [1.1, 0.6], punho: [1.75, 1.1] };
  function mao(g, lado, forma, u) {
    const rig = g.userData.rig, m = (lado === "esq" ? rig.aR : rig.aL).mao;
    const A = MAOS.relaxada, B = MAOS[forma] || A, k = u === undefined ? 1 : u;
    const curl = A[0] + (B[0] - A[0]) * k, pol = A[1] + (B[1] - A[1]) * k;
    m.dedos.forEach((d, i) => { d.rotation.set(0, 0, -m.side * curl * (1 + i * 0.06)); });   // dobra para a palma
    m.pol.rotation.set(-0.6 + 0.3 * pol, 0, -m.side * pol);
  }

  // Lágrimas: gota escorrendo pela bochecha abaixo de cada olho + rastro molhado. u = intensidade (0..1),
  // t = tempo da timeline (determinístico). Ficam longe da boca (x ±0,17) e acima da barba.
  function lagrimas(g, u, t) {
    const rig = g.userData.rig; let L = rig.lagrimas;
    if (!L) {
      L = rig.lagrimas = [];
      const mg = new THREE.MeshBasicMaterial({ color: 0xc9ecff }), ml = new THREE.MeshBasicMaterial({ color: 0x8fc4ea });
      for (const side of [-1, 1]) {
        const gota = new THREE.Mesh(new THREE.SphereGeometry(0.026, 10, 8), mg);
        const trilha = new THREE.Mesh(new THREE.CapsuleGeometry(0.008, 0.1, 3, 6), ml);
        rig.head.add(gota); rig.head.add(trilha); L.push({ side, gota, trilha });
      }
    }
    const R = 0.404, sobre = (x, y) => Math.sqrt(Math.max(0, R * R - x * x - y * y));
    for (const l of L) {
      const vis = u > 0.03; l.gota.visible = l.trilha.visible = vis; if (!vis) continue;
      const x = l.side * 0.165, fase = (t * 0.75 + (l.side > 0 ? 0.45 : 0)) % 1, y = -0.135 - 0.11 * fase;
      const k = u * Math.min(1, (1 - fase) * 6);
      l.gota.position.set(x, y, sobre(x, y) + 0.004); l.gota.scale.set(0.8 * k, 1.35 * k, 0.6 * k);
      const ym = -0.18; l.trilha.position.set(x, ym, sobre(x, ym) + 0.002); l.trilha.rotation.set(0.5, 0, 0); l.trilha.scale.setScalar(u);
    }
  }

  // ═════════════════════════════ MOVIMENTO ORGÂNICO ═════════════════════════════
  // Ruído determinístico: mesma entrada, mesma saída, em qualquer ordem de quadro.
  // Ruído suave (value noise com smoothstep) + fBm de 3 oitavas com frequências que não se
  // alinham (1; 2,13; 4,7) — a soma nunca repete o mesmo ciclo, então não vira "metrônomo".
  const hash = (n) => { const s = Math.sin(n * 127.1 + 311.7) * 43758.5453; return s - Math.floor(s); };
  function ruido(t, sem) {
    const i = Math.floor(t), f = t - i, u = f * f * (3 - 2 * f), k = (sem || 0) * 57.31;
    return (hash(i + k) * (1 - u) + hash(i + 1 + k) * u) * 2 - 1;          // -1..1
  }
  const fbm = (t, sem) => 0.6 * ruido(t, sem) + 0.3 * ruido(t * 2.13, sem + 1.7) + 0.1 * ruido(t * 4.7, sem + 3.1);
  const suave = (u) => { u = Math.min(1, Math.max(0, u)); return u * u * (3 - 2 * u); };
  const semente = (s) => { let h = 7; for (let i = 0; i < s.length; i++) h = (h * 31 + s.charCodeAt(i)) % 9973; return h / 97; };

  // Inércia e amortecimento, em forma fechada (substitui o lerp/damping quadro a quadro, que
  // quebra no seek). chaves = [[t0, v0], [t1, v1], ...]: a cada chave o alvo muda, e o valor
  // responde como uma mola de 2ª ordem — arranca com peso, passa um pouco e assenta.
  //   op.freq: Hz da mola (padrão 2,2; menor = mais pesado/lento, ex. cabeça 1,6, mão 3)
  //   op.amort: amortecimento ζ (padrão 0,7; 1 = sem passar do alvo; 0,45 = balança mais)
  // Como o sistema é linear, a resposta a várias chaves é a SOMA das respostas a cada degrau.
  function mola(chaves, t, op) {
    const o = op || {}, w = 2 * Math.PI * (o.freq || 2.2), z = o.amort === undefined ? 0.7 : o.amort;
    const degrau = (tau) => {
      if (tau <= 0) return 0;
      if (z >= 1) return 1 - (1 + w * tau) * Math.exp(-w * tau);                          // crítico
      const wd = w * Math.sqrt(1 - z * z);
      return 1 - Math.exp(-z * w * tau) * (Math.cos(wd * tau) + (z / Math.sqrt(1 - z * z)) * Math.sin(wd * tau));
    };
    let v = chaves[0][1];
    for (let i = 1; i < chaves.length; i++) v += (chaves[i][1] - chaves[i - 1][1]) * degrau(t - chaves[i][0]);
    return v;
  }

  // Camada aditiva: a vida SOMA (ou multiplica) por cima da pose que a cena escreveu, sem
  // acumular entre quadros. Guarda a base e o valor escrito; se a cena reescreveu o campo,
  // o valor atual vira a nova base. Assim a cena pode posar uma vez só ou a cada quadro.
  const ACC = { px: ["position", "x"], py: ["position", "y"], pz: ["position", "z"],
                rx: ["rotation", "x"], ry: ["rotation", "y"], rz: ["rotation", "z"],
                sx: ["scale", "x"], sy: ["scale", "y"], sz: ["scale", "z"] };
  function camada(o, chave, f) {
    if (!o) return;
    const [a, c] = ACC[chave], d = o.userData.__vida || (o.userData.__vida = {}), m = d[chave], cur = o[a][c];
    const base = m && Math.abs(cur - m.escrito) < 1e-9 ? m.base : cur;
    const v = f(base); o[a][c] = v; d[chave] = { base, escrito: v };
  }

  // Respiração com forma de respiração (não seno): inspira mais rápido, segura um instante,
  // expira devagar e pausa. A fase anda com ruído, então nenhum ciclo é igual ao anterior.
  function folego(t, freq, sem) {
    const p = freq * t + 0.18 * fbm(t * 0.13, sem), f = p - Math.floor(p);
    if (f < 0.36) return suave(f / 0.36);                 // inspira
    if (f < 0.44) return 1;                              // segura
    if (f < 0.92) return 1 - suave((f - 0.44) / 0.48);   // expira
    return 0;                                            // pausa
  }
  // Piscadas em intervalos irregulares de 2,6 a 5,4 s (às vezes dupla). 0 = aberto, 1 = fechado.
  // Fecha em 0,05 s, fica 0,03 s e abre em 0,08 s — abrir é mais lento que fechar, como no olho real.
  function piscada(t, sem) {
    let t0 = 0.4 + 2 * hash(sem), k = 0;
    while (t0 + 2.6 + 2.8 * hash(sem + k + 1) <= t) { t0 += 2.6 + 2.8 * hash(sem + k + 1); k++; }
    const um = (dt) => dt < 0 ? 0 : dt < 0.05 ? suave(dt / 0.05) : dt < 0.08 ? 1 : dt < 0.16 ? 1 - suave((dt - 0.08) / 0.08) : 0;
    const dupla = hash(sem + k * 3.7) < 0.18 ? um(t - t0 - 0.26) : 0;
    return Math.max(um(t - t0), dupla);
  }
  // Olhar: o olho pula entre pontos (sacada) e fica parado, como olho de verdade — não desliza.
  function sacada(t, sem) {
    let t0 = 0, k = 0;
    while (t0 + 0.7 + 2.2 * hash(sem + 50 + k) <= t) { t0 += 0.7 + 2.2 * hash(sem + 50 + k); k++; }
    const alvo = (j) => [(hash(sem + 90 + j) * 2 - 1), (hash(sem + 130 + j) * 2 - 1) * 0.6];
    const a = alvo(k - 1), b = alvo(k), u = suave((t - t0) / 0.045);
    return [a[0] + (b[0] - a[0]) * u, a[1] + (b[1] - a[1]) * u];
  }

  // Ritmos prontos (Hz da respiração, amplitude, balanço do corpo, inquietação).
  const RITMOS = {
    calmo:  { freq: 0.24, amp: 1.0, balanco: 1.0, inquieto: 0.6 },
    alivio: { freq: 0.17, amp: 1.5, balanco: 0.8, inquieto: 0.4 },
    medo:   { freq: 0.62, amp: 0.65, balanco: 1.6, inquieto: 1.8 },    // curta e rápida
    tensao: { freq: 0.12, amp: 0.35, balanco: 0.3, inquieto: 0.3 },    // quase suspensa
    choro:  { freq: 0.36, amp: 1.25, balanco: 1.2, inquieto: 1.0, solucos: true },
  };

  // Elenco.vida(g, t, op): chamar no render() de toda cena NOVA, DEPOIS de posar o personagem.
  //   t  = tempo da timeline (o mesmo t dá sempre o mesmo corpo).
  //   op = { ritmo: "calmo"|"medo"|"tensao"|"choro"|"alivio" (ou objeto), fase: número para
  //          desencontrar dois personagens iguais, piscar: true, olhar: true, corpo: true,
  //          dedos: true, intensidade: 1,
  //          ouvir: [[t0, ang0], [t1, ang1], ...] — só cego: de onde vem o som (rad, relativo à frente
  //          do corpo; + = esquerda dele). A cabeça vira o OUVIDO para lá, devagar e com atraso. }
  // Funciona nos dois modelos; no refinado também move tronco e peito (no do EP1 eles não existem).
  // Agente (sem rosto) só respira. A boca NÃO é tocada aqui — ela mexe só na fala (regra da série).
  //
  // CEGO (build com blind:true, ou op.cego): liga sozinho. Quem enxerga estabiliza a cabeça para o
  // olhar ficar parado; o cego não — a cabeça vai junto com o corpo. Ele não "olha": orienta o
  // ouvido (cabeça meio virada e inclinada para o som), congela o corpo um instante quando um som
  // novo chega, fica com a cabeça um tico baixa e os dedos mais ativos (procurando referência).
  // O que é de cena (mão tateando a parede, passo curto e arrastado, braço à frente) fica na cena.
  function vida(g, t, op) {
    const o = op || {}, rig = g.userData.rig, P = rig.ficha;
    const RT = typeof o.ritmo === "object" ? o.ritmo : (RITMOS[o.ritmo] || RITMOS.calmo);
    let I = o.intensidade === undefined ? 1 : o.intensidade;
    const sem = semente(rig.id || P.nome || "x") + (o.fase || 0) * 13.1;
    const cego = o.cego === undefined ? !!P.blind : !!o.cego;
    // som novo -> o corpo congela (o balanço cai a 30%) e volta em ~1,5 s
    let congela = 0;
    if (cego && o.ouvir) for (let i = 1; i < o.ouvir.length; i++) {
      const dt = t - o.ouvir[i][0];
      if (dt >= 0) congela = Math.max(congela, dt < 0.25 ? suave(dt / 0.25) : Math.exp(-(dt - 0.25) / 0.6));
    }

    // 1) RESPIRAÇÃO no tronco: o peito abre (x/z) mais do que sobe (y); ombros sobem e abrem junto
    let b = folego(t, RT.freq, sem) * RT.amp * I;
    if (RT.solucos) {   // choro: soluços curtos e irregulares por cima da respiração
      const s = Math.max(0, Math.sin(2 * Math.PI * 1.7 * t + sem)); b += 0.45 * I * Math.pow(s, 10) * suave(ruido(t * 0.5, sem + 9) * 2);
    }
    if (rig.peito) {
      camada(rig.peito, "sx", (v) => v * (1 + 0.024 * b)); camada(rig.peito, "sz", (v) => v * (1 + 0.03 * b));
      camada(rig.peito, "sy", (v) => v * (1 + 0.008 * b));
    }
    for (const a of [rig.aL, rig.aR]) {
      const lado = a === rig.aL ? -1 : 1;
      camada(a.sh, "py", (v) => v + 0.011 * b);
      camada(a.sh, "px", (v) => v + lado * 0.006 * b);
    }
    camada(rig.head, "py", (v) => v + 0.009 * b);

    if (o.corpo !== false) {
      // 2) BALANÇO e troca de peso: o tronco oscila pela cintura (pernas ficam plantadas);
      // quem enxerga: a cabeça compensa uma parte (o olhar fica estável); cego: não compensa
      const bal = RT.balanco * I * (1 - 0.7 * congela), comp = cego ? 0 : 0.6;
      const lx = 0.010 * bal * fbm(t * 0.21, sem + 2), lz = 0.014 * bal * fbm(t * 0.17, sem + 4);
      if (rig.tronco) {
        camada(rig.tronco, "rx", (v) => v + lx + 0.012 * b);   // inclina um tico para a frente ao inspirar
        camada(rig.tronco, "rz", (v) => v + lz);
        camada(rig.tronco, "px", (v) => v + 0.012 * bal * fbm(t * 0.09, sem + 6));
      }
      // 3) CABEÇA: micro-movimento lento + compensação do balanço
      const inq = RT.inquieto * I * (1 - 0.8 * congela);
      camada(rig.head, "ry", (v) => v + 0.03 * inq * fbm(t * 0.33, sem + 8));
      camada(rig.head, "rx", (v) => v + 0.016 * inq * fbm(t * 0.29, sem + 10) - comp * lx);
      camada(rig.head, "rz", (v) => v + 0.012 * inq * fbm(t * 0.25, sem + 12) - comp * lz);
      if (cego) {
        // cabeça um tico baixa (0,05 rad — o queixo não afunda: a boca segue visível)
        camada(rig.head, "rx", (v) => v + 0.05);
        if (o.ouvir) {
          // ouvido para o som: vira só parte do caminho (o rosto não "aponta") e inclina para o lado;
          // mola lenta e amortecida = a cabeça hesita antes de chegar
          const a = Math.max(-1.1, Math.min(1.1, mola(o.ouvir, t, { freq: 1.2, amort: 0.85 })));
          camada(rig.head, "ry", (v) => v + 0.5 * a);
          camada(rig.head, "rz", (v) => v - 0.14 * a);
        }
      }
      // braços pendem com atraso do tronco (inércia): seguem o balanço meio segundo depois
      if (rig.tronco) for (const a of [rig.aL, rig.aR]) {
        camada(a.sh, "rz", (v) => v - 0.5 * 0.014 * bal * fbm((t - 0.5) * 0.17, sem + 4));
        camada(a.el, "rx", (v) => v - 0.025 * inq * Math.max(0, fbm(t * 0.4, sem + (a === rig.aL ? 20 : 21))));
      }
    }

    // 4) DEDOS: cada um mexe sozinho, pouco, fora de fase
    if (o.dedos !== false) for (const a of [rig.aL, rig.aR]) a.mao.dedos.forEach((d, i) =>
      camada(d, "rz", (v) => v - a.mao.side * 0.07 * (cego ? 1.5 : 1) * RT.inquieto * I * Math.max(0, fbm(t * 0.6 + i * 0.37, sem + 30 + i))));

    const r = g.userData.rosto;
    if (!r) return;
    // 5) PISCAR: o olho achata e a sobrancelha desce um pouco junto. O olho cego também pisca
    // (passa por cima do limite 0,78 da expressão só durante a piscada).
    if (o.piscar !== false) {
      const p = piscada(t, sem);
      for (const ol of r.olhos) camada(ol, "sy", (v) => v * (1 - 0.92 * p));
      for (const sb of r.sobr) camada(sb, "py", (v) => v - 0.012 * p);
    }
    // 6) OLHAR: pupilas em sacadas pequenas (só quem enxerga)
    if (o.olhar !== false && r.pupilas.length) {
      const [sx, sy] = sacada(t, sem);
      for (const pu of r.pupilas) { camada(pu, "px", (v) => v + 0.011 * sx); camada(pu, "py", (v) => v + 0.009 * sy); }
    }
  }

  window.Elenco = { FICHAS, EXPR, CABECA_Y, mao, lagrimas, build, expressao, cabeca, alcancar,
                    vida, mola, ruido, fbm, ambiente, RITMOS };
})();
