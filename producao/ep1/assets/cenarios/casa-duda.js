// Casa da Duda por dentro (EP2). O interior fica NO LUGAR da casa dela na rua do EP1: a janela do quarto
// é a janela da frente de rua.js (x local -2,0), então pela janela aparece a rua de verdade e a casa do
// Gabi na diagonal, do outro lado. Usar junto com Cenarios.rua(grupo, { semCasaDuda: true }), que tira
// as paredes da casa dela e deixa o muro, o portãozinho e as plantas.
//
//   const casa = new THREE.Group(); casa.position.set(-6.4, 0, R.FZ2); casa.rotation.y = Math.PI; raiz.add(casa);
//   const Q = Cenarios.quartoDuda(casa);           // coordenadas LOCAIS da casa (fachada em z = 0, rua em +z)
//   Q.cortina(u)  u = 0 aberta (recolhida nos cantos) · 1 fechada
//   Q.janela(u)   u = 0 fechada · 1 aberta (as duas folhas giram para dentro)
//   Q.mundo(x, y, z) -> THREE.Vector3 do ponto local no mundo (para câmera e personagens)
//
// Escala do elenco (Gabi = 2,6 de altura): pé-direito 3,9 como os interiores do EP1. O interior é maior que
// a caixa da fachada (3,2 de altura) — de dentro isso não aparece, e por fora a casa continua a de rua.js.
(function () {
  // visor vermelho "00:00" (o relógio zerou no apagão): plano com textura de canvas
  function visor00(raiz, x, y, z, ry, w, h) {
    const cv = document.createElement("canvas"); cv.width = 256; cv.height = 96; const g = cv.getContext("2d");
    g.fillStyle = "#ff3a2e"; g.font = "bold 78px monospace"; g.textAlign = "center"; g.textBaseline = "middle"; g.fillText("00:00", 128, 52);
    const tex = new THREE.CanvasTexture(cv); tex.colorSpace = THREE.SRGBColorSpace;
    const m = new THREE.Mesh(new THREE.PlaneGeometry(w || 0.2, h || 0.075), new THREE.MeshBasicMaterial({ map: tex, transparent: true, toneMapped: false }));
    m.position.set(x, y, z); m.rotation.y = ry || 0; raiz.add(m); return m;
  }

  function quartoDuda(raiz, op) {
    op = op || {};
    const k = Cena.kit(raiz, 20261127);
    const { box, cil, bolha, rnd } = k;
    const basico = (c) => new THREE.MeshBasicMaterial({ color: c });

    // ---------- arquitetura ----------
    const X0 = -3.6, X1 = 0.6, Z0 = -4.4, Z1 = 0, H = 3.9;
    const WX0 = -2.75, WX1 = -1.25, WY0 = 1.25, WY1 = 2.65;          // vão da janela (centro x -2,0 = janela de rua.js)
    const PAREDE = 0xd6e3da, RODAPE = 0xf3efe8, TETO = 0xeef0ec;      // verde-menta claro: contrasta com o rosa dela
    // piso laminado claro em réguas ao longo de z
    for (let i = 0; i < 14; i++) {
      const tom = [0xb89572, 0xa98767, 0xc2a07c][i % 3];
      box((X1 - X0) / 14, 0.06, Z1 - Z0, tom, X0 + (i + 0.5) * (X1 - X0) / 14, -0.03, (Z0 + Z1) / 2, { contorno: false, sombra: false });
    }
    box(X1 - X0, H, 0.12, PAREDE, (X0 + X1) / 2, H / 2, Z0 - 0.06, { contorno: false });                          // fundo
    box(0.12, H, Z1 - Z0, PAREDE, X1 + 0.06, H / 2, (Z0 + Z1) / 2, { contorno: false });                          // direita
    // esquerda, com a porta (z de -1,25 a -0,25, altura 2,85)
    const PZ0 = -1.25, PZ1 = -0.25, PH = 2.85;
    box(0.12, H, PZ0 - Z0, PAREDE, X0 - 0.06, H / 2, (Z0 + PZ0) / 2, { contorno: false });
    box(0.12, H, Z1 - PZ1, PAREDE, X0 - 0.06, H / 2, (PZ1 + Z1) / 2, { contorno: false });
    box(0.12, H - PH, PZ1 - PZ0, PAREDE, X0 - 0.06, (PH + H) / 2, (PZ0 + PZ1) / 2, { contorno: false });
    box(0.06, PH, PZ1 - PZ0, 0xefe9e0, X0 + 0.02, PH / 2, (PZ0 + PZ1) / 2);                                          // porta (fechada)
    cil(0.035, 0.035, 0.08, 0xc9a86a, X0 + 0.08, 1.35, PZ1 - 0.15, { r: [0, 0, Math.PI / 2], seg: 10, contorno: false });
    box(0.02, 0.18, 0.12, 0xf7f4ee, X0 + 0.02, 1.6, PZ1 + 0.25, { contorno: false });                               // interruptor
    // frente (fachada), com o vão da janela
    box(WX0 - X0, H, 0.12, PAREDE, (X0 + WX0) / 2, H / 2, Z1 - 0.06, { contorno: false });
    box(X1 - WX1, H, 0.12, PAREDE, (WX1 + X1) / 2, H / 2, Z1 - 0.06, { contorno: false });
    box(WX1 - WX0, WY0, 0.12, PAREDE, (WX0 + WX1) / 2, WY0 / 2, Z1 - 0.06, { contorno: false });
    box(WX1 - WX0, H - WY1, 0.12, PAREDE, (WX0 + WX1) / 2, (WY1 + H) / 2, Z1 - 0.06, { contorno: false });
    box(X1 - X0 + 0.3, 0.12, Z1 - Z0 + 0.3, TETO, (X0 + X1) / 2, H + 0.06, (Z0 + Z1) / 2, { contorno: false });  // teto
    for (const [w, d, x, z] of [[X1 - X0, 0.04, (X0 + X1) / 2, Z0 + 0.02], [0.04, Z1 - Z0, X1 - 0.02, (Z0 + Z1) / 2], [0.04, PZ0 - Z0, X0 + 0.02, (Z0 + PZ0) / 2]])
      box(w, 0.14, d, RODAPE, x, 0.07, z, { contorno: false });

    // ---------- janela: caixilho branco, duas folhas de vidro (abrem para dentro), peitoril ----------
    const CX = 0xf1ede4, WXc = (WX0 + WX1) / 2, WYc = (WY0 + WY1) / 2;
    box(WX1 - WX0 + 0.1, 0.08, 0.12, CX, WXc, WY0, Z1 - 0.06);
    box(WX1 - WX0 + 0.1, 0.08, 0.12, CX, WXc, WY1, Z1 - 0.06);
    box(0.08, WY1 - WY0, 0.12, CX, WX0, WYc, Z1 - 0.06);
    box(0.08, WY1 - WY0, 0.12, CX, WX1, WYc, Z1 - 0.06);
    box(WX1 - WX0 + 0.3, 0.06, 0.34, CX, WXc, WY0 - 0.04, Z1 - 0.2);                                               // peitoril
    const vidroM = new THREE.MeshToonMaterial({ color: 0xd8e8f2, gradientMap: k.grad, transparent: true, opacity: 0.18 });
    const folhas = [];
    for (const s of [-1, 1]) {
      const f = new THREE.Group(); f.position.set(s < 0 ? WX0 + 0.04 : WX1 - 0.04, WYc, Z1 - 0.08); raiz.add(f);
      const wf = (WX1 - WX0) / 2 - 0.04;
      const vid = new THREE.Mesh(new THREE.PlaneGeometry(wf, WY1 - WY0 - 0.08), vidroM); vid.position.x = -s * wf / 2; f.add(vid);
      box(0.04, WY1 - WY0 - 0.08, 0.04, CX, -s * wf, 0, 0, { pai: f, contorno: false });                          // montante do meio
      box(wf, 0.04, 0.04, CX, -s * wf / 2, 0, 0, { pai: f, contorno: false });                                      // travessa
      f.userData.s = s; folhas.push(f);
    }
    function janela(u) { for (const f of folhas) f.rotation.y = f.userData.s * -1.35 * u; }
    // planta no peitoril (o minimundo: "uma planta na janela")
    cil(0.09, 0.07, 0.16, 0xc97a5a, WX1 - 0.05, WY0 + 0.07, Z1 - 0.2);
    for (let i = 0; i < 6; i++) bolha(0.07, 0x4f8a52, WX1 - 0.05 + Math.cos(i * 1.1) * 0.07, WY0 + 0.22 + i * 0.025, Z1 - 0.2 + Math.sin(i * 1.1) * 0.05, [1, 1.5, 0.6], { r: [0, i, 0.3] });

    // ---------- cortina rosa (a mesma cor da fachada, 0xe9b7c4), duas bandas que correm no varão ----------
    const CORT = 0xe9b7c4;
    cil(0.025, 0.025, WX1 - WX0 + 1.0, 0xd9d2c6, WXc, WY1 + 0.3, Z1 - 0.2, { r: [0, 0, Math.PI / 2], seg: 8 });
    const bandas = [];
    for (const s of [-1, 1]) {
      const b = new THREE.Group(); b.position.set(s < 0 ? WX0 - 0.45 : WX1 + 0.45, 0, Z1 - 0.22); raiz.add(b);
      for (let i = 0; i < 8; i++) cil(0.06, 0.075, WY1 + 0.25 - 0.55, CORT, -s * i * 0.15, (WY1 + 0.25 + 0.55) / 2 + 0.0, (i % 2) * 0.04, { pai: b, seg: 10, contorno: i === 0 || i === 7 });
      b.userData.s = s; bandas.push(b);
    }
    // u = 0: recolhida no canto (sem tapar o vão) · u = 1: fechada (as bandas se encontram no meio)
    function cortina(u) { for (const b of bandas) b.scale.x = 0.32 + 0.68 * Math.min(1, Math.max(0, u)) * 1.02; }
    cortina(op.cortina === undefined ? 1 : op.cortina);

    // ---------- cama (cabeceira na parede do fundo), edredom lilás, pelúcia, luzinhas ----------
    const BX = -1.45, BW = 1.5, BZ0 = -4.3, BZ1 = -1.35, MT = 0.78, BZ = (BZ0 + BZ1) / 2;
    box(BW + 0.14, 1.45, 0.12, 0xf3efe8, BX, 0.73, BZ0 - 0.02);                                   // cabeceira branca
    box(BW + 0.1, 0.18, BZ1 - BZ0, 0xe3ddd3, BX, 0.32, BZ);                                       // estrado
    box(BW, 0.36, BZ1 - BZ0 - 0.06, 0xf4f1ea, BX, 0.59, BZ);                                      // colchão
    bolha(0.4, 0xfbf9f4, BX - 0.05, MT + 0.14, BZ0 + 0.35, [1.55, 0.42, 0.75], { r: [0, -0.06, 0.04] });   // travesseiro
    const EDR = 0xd8cde8;
    box(BW + 0.08, 0.14, 1.75, EDR, BX, MT + 0.06, BZ1 - 0.95);
    bolha(0.48, EDR, BX + 0.2, MT + 0.14, -2.6, [1.3, 0.36, 1.0], { r: [0, 0.3, 0] });
    bolha(0.4, 0xe9b7c4, BX - 0.35, MT + 0.12, -2.0, [0.9, 0.3, 0.7], { r: [0, -0.4, 0] });   // manta rosa dobrada
    box(0.1, 0.6, 1.6, EDR, BX + BW / 2 + 0.05, MT - 0.24, BZ1 - 0.95, { r: [0, 0, 0.1] });            // aba caída
    // pelúcia (urso) sentada no canto da cabeceira
    const urso = new THREE.Group(); urso.position.set(BX + 0.55, MT + 0.1, BZ0 + 0.3); urso.rotation.y = -0.4; raiz.add(urso);
    bolha(0.15, 0xc9a27a, 0, 0.15, 0, [1, 1.1, 0.9], { pai: urso });
    bolha(0.11, 0xc9a27a, 0, 0.4, 0.02, [1, 1, 1], { pai: urso });
    for (const s of [-1, 1]) bolha(0.04, 0xc9a27a, s * 0.08, 0.5, 0, [1, 1, 0.6], { pai: urso });
    // luzinhas (pisca-pisca) em arco sobre a cabeceira: apagadas de dia, acesas à noite (Q.luzinhas(on))
    const lampadas = [], lampM = new THREE.MeshBasicMaterial({ color: 0x9a948a });
    for (let i = 0; i <= 16; i++) {
      const u = i / 16, x = BX - 1.0 + u * 2.0, y = 2.7 - Math.sin(u * Math.PI) * 0.28 + Math.sin(u * Math.PI * 4) * 0.03;
      const m = new THREE.Mesh(new THREE.SphereGeometry(0.03, 8, 6), lampM); m.position.set(x, y, Z0 + 0.04); raiz.add(m); lampadas.push(m);
    }
    function luzinhas(on) { lampM.color.setHex(on ? 0xffe2a8 : 0x9a948a); }

    // ---------- criado-mudo: o MESMO despertador do quarto do Gabi, piscando 00:00 ----------
    const NX = -2.95, NZ = -4.0;
    box(0.7, 0.8, 0.6, 0xf3efe8, NX, 0.4, NZ);
    box(0.62, 0.02, 0.02, 0xd6cfc3, NX, 0.55, NZ + 0.31, { contorno: false });
    cil(0.025, 0.025, 0.02, 0xe9b7c4, NX, 0.65, NZ + 0.32, { r: [Math.PI / 2, 0, 0], seg: 10, contorno: false });
    const DPX = NX + 0.1, DPZ = NZ + 0.05;
    box(0.3, 0.15, 0.12, 0x1f2126, DPX, 0.875, DPZ, { r: [0, 0.35, 0] });                        // despertador (modelo de quarto.js)
    box(0.22, 0.08, 0.01, 0x0b0c0f, DPX + 0.02, 0.885, DPZ + 0.06, { r: [0, 0.35, 0], contorno: false });
    const visor = visor00(raiz, DPX + 0.024, 0.885, DPZ + 0.068, 0.35);
    // abajur rosa pequeno e um livro
    cil(0.09, 0.11, 0.05, 0xe9b7c4, NX - 0.18, 0.825, NZ - 0.1);
    cil(0.015, 0.015, 0.32, 0xd9d2c6, NX - 0.18, 1.0, NZ - 0.1, { seg: 8 });
    cil(0.1, 0.19, 0.22, 0xf7e6ea, NX - 0.18, 1.22, NZ - 0.1);
    box(0.26, 0.05, 0.34, 0x5a7aa0, NX + 0.12, 0.825, NZ - 0.12, { r: [0, 0.2, 0] });

    // ---------- guarda-roupa branco com espelho (parede direita, perto da cama) ----------
    box(0.7, 3.0, 1.5, 0xece6dc, X1 - 0.35, 1.5, -3.6);
    box(0.02, 2.8, 0.02, 0xb9b1a4, X1 - 0.7, 1.5, -3.6, { contorno: false });
    for (const s of [-1, 1]) cil(0.02, 0.02, 0.22, 0xe9b7c4, X1 - 0.72, 1.55, -3.6 + s * 0.1, { seg: 8, contorno: false });
    box(0.02, 1.3, 0.5, 0, X1 - 0.715, 1.75, -3.95, { mat: basico(0xc9d6de), contorno: false });   // espelho

    // ---------- escrivaninha (parede direita, perto da janela): a cena da tarefa ----------
    const EX = X1 - 0.4, EZ = -1.3;
    box(0.8, 0.08, 1.6, 0xf3efe8, EX, 1.15, EZ);
    for (const [sx, sz] of [[-0.34, -0.74], [0.34, -0.74], [-0.34, 0.74], [0.34, 0.74]]) box(0.06, 1.11, 0.06, 0xd9d2c6, EX + sx, 0.555, EZ + sz);
    const mesa = { caderno: new THREE.Group(), livro: new THREE.Group() };
    for (const g of Object.values(mesa)) raiz.add(g);
    box(0.5, 0.02, 0.62, 0xf7f5ef, EX - 0.05, 1.2, EZ + 0.15, { r: [0, 0.1, 0], pai: mesa.caderno });        // caderno aberto
    box(0.01, 0.025, 0.6, 0x9a948a, EX - 0.05, 1.205, EZ + 0.15, { r: [0, 0.1, 0], contorno: false, pai: mesa.caderno });
    box(0.36, 0.06, 0.5, 0x3e6a5a, EX + 0.15, 1.22, EZ - 0.45, { r: [0, -0.2, 0], pai: mesa.livro });          // livro
    cil(0.06, 0.05, 0.18, 0xe9b7c4, EX + 0.2, 1.28, EZ + 0.6);                                                  // porta-lápis
    for (let i = 0; i < 3; i++) cil(0.008, 0.008, 0.26, [0xd9b44a, 0x4fa3a0, 0x2e3036][i], EX + 0.19 + i * 0.015, 1.4, EZ + 0.6, { r: [(i - 1) * 0.2, 0, 0], seg: 6, contorno: false });
    box(0.08, 0.012, 0.16, 0x15171c, EX - 0.2, 1.2, EZ - 0.15, { r: [0, 0.4, 0] });                          // celular
    // luminária de mesa
    cil(0.08, 0.1, 0.04, 0xf3efe8, EX + 0.2, 1.21, EZ - 0.05);
    cil(0.015, 0.015, 0.4, 0xf3efe8, EX + 0.2, 1.42, EZ - 0.05, { seg: 8, r: [0.3, 0, 0] });
    cil(0.05, 0.11, 0.14, 0xf3efe8, EX + 0.12, 1.62, EZ - 0.05, { r: [0, 0, 0.6] });
    // cadeira rosa-clara
    const cad = new THREE.Group(); cad.position.set(EX - 0.85, 0, EZ + 0.05); cad.rotation.y = -1.9; raiz.add(cad);
    box(0.58, 0.07, 0.56, 0xf2c4d0, 0, 0.72, 0, { pai: cad });
    box(0.58, 0.62, 0.07, 0xf2c4d0, 0, 1.06, 0.26, { pai: cad });
    for (const [sx, sz] of [[-0.25, -0.23], [0.25, -0.23], [-0.25, 0.23], [0.25, 0.23]]) box(0.045, 0.7, 0.045, 0xd9d2c6, sx, 0.35, sz, { pai: cad });
    // mural de cortiça com fotos e bilhetes, acima da escrivaninha
    box(0.03, 0.95, 1.45, 0xb08a5e, X1 - 0.015, 2.35, EZ);
    const CORES = [0xf2c4d0, 0x8fc8ec, 0xf1ece4, 0xd9b44a, 0x9fc59a];
    for (let i = 0; i < 9; i++) {
      const y = 2.0 + (i % 3) * 0.3 + (rnd() - 0.5) * 0.06, z = EZ - 0.55 + Math.floor(i / 3) * 0.5 + (rnd() - 0.5) * 0.1, foto = i % 2 === 0;
      box(0.012, foto ? 0.24 : 0.16, foto ? 0.2 : 0.18, foto ? 0xfbf9f4 : CORES[i % CORES.length], X1 - 0.035, y, z, { r: [(rnd() - 0.5) * 0.3, 0, 0], contorno: false });
      if (foto) box(0.012, 0.15, 0.16, CORES[(i + 2) % CORES.length], X1 - 0.042, y + 0.02, z, { r: [0, 0, 0], contorno: false });
    }

    // ---------- chão: tapete redondo, tênis brancos, mochila ----------
    for (let i = 0; i < 3; i++) { const a = cil(1.0 - i * 0.28, 1.0 - i * 0.28, 0.026, [0xf2d7de, 0xe9b7c4, 0xf7e6ea][i], -1.4, 0.014 + i * 0.002, -0.85, { contorno: false, sombra: false }); a.scale.set(1, 1, 0.85); }
    function tenis(x, z, ry) {
      const t = new THREE.Group(); t.position.set(x, 0, z); t.rotation.y = ry; raiz.add(t);
      box(0.2, 0.05, 0.42, 0xf4f1ea, 0, 0.025, 0, { pai: t });
      box(0.18, 0.1, 0.28, 0xf7f5ef, 0, 0.1, -0.06, { pai: t });
      bolha(0.095, 0xf7f5ef, 0, 0.08, 0.11, [0.95, 0.6, 1.1], { pai: t });
      box(0.19, 0.012, 0.02, 0xe9b7c4, 0, 0.055, -0.21, { pai: t, contorno: false });
    }
    tenis(-2.45, -2.2, 0.3); tenis(-2.65, -2.0, -0.2);
    const moc = new THREE.Group(); moc.position.set(X1 - 0.95, 0, EZ + 0.95); moc.rotation.set(0, 0.5, 0.1); raiz.add(moc);
    box(0.55, 0.55, 0.28, 0x8fa3c4, 0, 0.28, 0, { pai: moc });
    bolha(0.28, 0x8fa3c4, 0, 0.55, 0, [1.0, 0.5, 0.5], { pai: moc });
    box(0.38, 0.26, 0.06, 0x7a8db0, 0, 0.24, 0.16, { pai: moc });

    const mundo = (x, y, z) => raiz.localToWorld(new THREE.Vector3(x, y, z));
    return { k, X0, X1, Z0, Z1, H, WX0, WX1, WY0, WY1, BX, BW, BZ0, BZ1, MT, NX, NZ, EX, EZ, PZ0, PZ1,
             visor, folhas, bandas, mesa, cad, cortina, janela, luzinhas, lampadas, mundo };
  }

  // ======================= COZINHA (à direita do quarto) =======================
  // A janela da frente é a da direita da fachada (x local 1,3 em rua.js; aqui centrada em 1,7): é por ela que
  // a Duda almoça olhando a rua. A porta da frente fica na mesma parede (a mãe sai por ela). Na fachada a
  // porta está em x 0,2; por dentro ela foi para 4,05 — de dentro e de fora nunca aparecem juntas.
  //   const C = Cenarios.cozinhaDuda(casa);  C.tv (tela, plano), C.cadeiras[i] {pos, ry}, C.mesaY, C.mundo()
  function cozinhaDuda(raiz, op) {
    op = op || {};
    const k = Cena.kit(raiz, 20261128);
    const { box, cil, bolha } = k;
    const basico = (c) => new THREE.MeshBasicMaterial({ color: c });
    const X0 = 0.78, X1 = 5.15, Z0 = -4.4, Z1 = 0, H = 3.9;
    const WX0 = 1.05, WX1 = 2.35, WY0 = 1.35, WY1 = 2.45;               // janela
    const DX0 = 3.55, DX1 = 4.55, DH = 2.85;                             // porta da frente
    const PAREDE = 0xf1e6c8, AZUL = 0xf4f2ec, RODAPE = 0xece6da;         // amarelo-manteiga; azulejo branco
    // piso de lajota bege em grade
    for (let i = 0; i < 8; i++) for (let j = 0; j < 8; j++)
      box((X1 - X0) / 8 - 0.015, 0.06, (Z1 - Z0) / 8 - 0.015, (i + j) % 2 ? 0xd9cfc0 : 0xd1c6b5, X0 + (i + 0.5) * (X1 - X0) / 8, -0.03, Z0 + (j + 0.5) * (Z1 - Z0) / 8, { contorno: false, sombra: false });
    box(X1 - X0, H, 0.12, PAREDE, (X0 + X1) / 2, H / 2, Z0 - 0.06, { contorno: false });                     // fundo
    box(X1 - X0, 1.3, 0.02, AZUL, (X0 + X1) / 2, 1.15 + 0.65, Z0 + 0.01, { contorno: false });              // azulejo atrás da bancada
    box(0.12, H, Z1 - Z0, PAREDE, X0 - 0.06, H / 2, (Z0 + Z1) / 2, { contorno: false });                     // esquerda (encosta no quarto)
    box(0.12, H, Z1 - Z0, PAREDE, X1 + 0.06, H / 2, (Z0 + Z1) / 2, { contorno: false });                     // direita (a da TV)
    // frente: janela e porta
    box(WX0 - X0, H, 0.12, PAREDE, (X0 + WX0) / 2, H / 2, Z1 - 0.06, { contorno: false });
    box(DX0 - WX1, H, 0.12, PAREDE, (WX1 + DX0) / 2, H / 2, Z1 - 0.06, { contorno: false });
    box(X1 - DX1, H, 0.12, PAREDE, (DX1 + X1) / 2, H / 2, Z1 - 0.06, { contorno: false });
    box(WX1 - WX0, WY0, 0.12, PAREDE, (WX0 + WX1) / 2, WY0 / 2, Z1 - 0.06, { contorno: false });
    box(WX1 - WX0, H - WY1, 0.12, PAREDE, (WX0 + WX1) / 2, (WY1 + H) / 2, Z1 - 0.06, { contorno: false });
    box(DX1 - DX0, H - DH, 0.12, PAREDE, (DX0 + DX1) / 2, (DH + H) / 2, Z1 - 0.06, { contorno: false });
    box(X1 - X0 + 0.3, 0.12, Z1 - Z0 + 0.3, 0xf4f1ea, (X0 + X1) / 2, H + 0.06, (Z0 + Z1) / 2, { contorno: false });   // teto
    for (const [w, d, x, z] of [[0.04, Z1 - Z0, X0 + 0.02, (Z0 + Z1) / 2], [0.04, Z1 - Z0, X1 - 0.02, (Z0 + Z1) / 2]]) box(w, 0.14, d, RODAPE, x, 0.07, z, { contorno: false });
    // janela: caixilho, vidro (fixo) e meia-cortina de café
    const CX = 0xf1ede4, WXc = (WX0 + WX1) / 2, WYc = (WY0 + WY1) / 2;
    for (const [w, h, x, y] of [[WX1 - WX0 + 0.1, 0.08, WXc, WY0], [WX1 - WX0 + 0.1, 0.08, WXc, WY1], [0.08, WY1 - WY0, WX0, WYc], [0.08, WY1 - WY0, WX1, WYc], [0.05, WY1 - WY0, WXc, WYc]])
      box(w, h, 0.12, CX, x, y, Z1 - 0.06);
    box(WX1 - WX0 + 0.25, 0.06, 0.3, CX, WXc, WY0 - 0.04, Z1 - 0.18);
    const vidM = new THREE.MeshToonMaterial({ color: 0xd8e8f2, gradientMap: k.grad, transparent: true, opacity: 0.15 });
    const vid = new THREE.Mesh(new THREE.PlaneGeometry(WX1 - WX0, WY1 - WY0), vidM); vid.position.set(WXc, WYc, Z1 - 0.06); raiz.add(vid);
    cil(0.015, 0.015, WX1 - WX0 + 0.2, 0xd9d2c6, WXc, WYc + 0.05, Z1 - 0.16, { r: [0, 0, Math.PI / 2], seg: 6, contorno: false });
    for (let i = 0; i < 9; i++) cil(0.035, 0.04, 0.6, 0xf2d7de, WX0 + 0.05 + i * 0.15, WYc - 0.25, Z1 - 0.15 + (i % 2) * 0.025, { seg: 8, contorno: i === 0 || i === 8 });
    // porta da frente (madeira), maçaneta, olho mágico, o capacho
    const porta = new THREE.Group(); porta.position.set(DX0 + 0.02, 0, Z1 - 0.07); raiz.add(porta);   // dobradiça à esquerda
    box(DX1 - DX0 - 0.04, DH - 0.02, 0.07, 0x7a553a, (DX1 - DX0) / 2 - 0.02, DH / 2, 0, { pai: porta });
    cil(0.04, 0.04, 0.1, 0xc9a86a, DX1 - DX0 - 0.15, 1.35, -0.06, { r: [Math.PI / 2, 0, 0], seg: 10, pai: porta });
    cil(0.02, 0.02, 0.02, 0x22242a, (DX1 - DX0) / 2, 2.05, -0.04, { r: [Math.PI / 2, 0, 0], seg: 8, contorno: false, pai: porta });
    for (const [w, h, y] of [[DX1 - DX0 + 0.12, 0.08, DH + 0.02]]) box(w, h, 0.14, 0xe9e2d4, (DX0 + DX1) / 2, y, Z1 - 0.06);
    box(0.9, 0.02, 0.55, 0x8a6a4a, (DX0 + DX1) / 2, 0.01, Z1 - 0.45, { contorno: false });          // capacho
    function abrePorta(u) { porta.rotation.y = 1.4 * Math.min(1, Math.max(0, u)); }
    // ---------- bancada com pia, fogão, geladeira, armários aéreos ----------
    const BY = 1.15, BZc = Z0 + 0.42;
    box(1.75, BY - 0.08, 0.8, 0xe8e1d4, 1.68, (BY - 0.08) / 2, BZc);                                   // gabinete
    box(1.85, 0.08, 0.84, 0xb9b3a8, 1.68, BY - 0.04, BZc);                                             // tampo de granito claro
    for (let i = 0; i < 3; i++) box(0.02, 0.8, 0.02, 0xc9c1b3, 0.95 + i * 0.55, 0.5, BZc + 0.41, { contorno: false });
    box(0.7, 0.02, 0.5, 0x9aa3ab, 1.55, BY + 0.005, BZc + 0.02, { contorno: false, mat: basico(0x8a939b) });   // cuba
    cil(0.025, 0.025, 0.35, 0xc8cdd2, 1.55, BY + 0.18, BZc - 0.28, { seg: 8 });                        // torneira
    cil(0.02, 0.02, 0.22, 0xc8cdd2, 1.55, BY + 0.34, BZc - 0.18, { r: [Math.PI / 2, 0, 0], seg: 8 });
    // escorredor com a louça (pratos em pé, copos de boca para baixo)
    box(0.5, 0.04, 0.35, 0xd9d2c6, 2.25, BY + 0.02, BZc - 0.05);
    for (let i = 0; i < 4; i++) cil(0.16, 0.16, 0.02, 0xfbf9f4, 2.12 + i * 0.07, BY + 0.2, BZc - 0.05, { r: [0, 0, Math.PI / 2], seg: 16 });
    for (let i = 0; i < 2; i++) cil(0.05, 0.04, 0.12, 0xcfe3ef, 2.42, BY + 0.1, BZc - 0.15 + i * 0.13, { seg: 10 });
    // micro-ondas e o rádio-relógio piscando 00:00, na ponta esquerda da bancada
    box(0.62, 0.36, 0.45, 0xf2f0ea, 1.1, BY + 0.18, BZc - 0.05);
    box(0.38, 0.26, 0.01, 0x2a2d33, 1.02, BY + 0.19, BZc + 0.18, { contorno: false });
    box(0.12, 0.26, 0.01, 0x9aa3ab, 1.3, BY + 0.19, BZc + 0.18, { contorno: false });
    const RX = 0.98, RZ = BZc + 0.3;
    box(0.34, 0.16, 0.14, 0x2a2b30, RX + 0.05, BY + 0.08, RZ + 0.02, { r: [0, 0.25, 0] });          // rádio-relógio
    cil(0.05, 0.05, 0.015, 0x15171c, RX - 0.06, BY + 0.08, RZ + 0.09, { r: [Math.PI / 2, 0, 0], seg: 12, contorno: false });
    const radio = visor00(raiz, RX + 0.1, BY + 0.09, RZ + 0.1, 0.25, 0.14, 0.055);
    // fogão de 4 bocas
    box(0.85, BY - 0.02, 0.8, 0xf4f2ec, 3.0, (BY - 0.02) / 2, BZc);
    box(0.7, 0.45, 0.01, 0x2a2d33, 3.0, 0.55, BZc + 0.41, { contorno: false });
    for (const [sx, sz] of [[-0.18, -0.15], [0.18, -0.15], [-0.18, 0.18], [0.18, 0.18]]) cil(0.1, 0.1, 0.02, 0x2a2b30, 3.0 + sx, BY, BZc + sz, { seg: 14, contorno: false });
    cil(0.18, 0.15, 0.22, 0x9aa3ab, 3.18, BY + 0.12, BZc - 0.15, { seg: 14 });                        // chaleira
    // geladeira
    box(0.9, 2.9, 0.85, 0xf2f0ea, 3.95, 1.45, Z0 + 0.45);
    box(0.88, 0.02, 0.02, 0xc9c1b3, 3.95, 2.0, Z0 + 0.885, { contorno: false });
    for (const y of [1.45, 2.4]) box(0.04, 0.35, 0.05, 0xb9b3a8, 3.6, y, Z0 + 0.9, { contorno: false });
    for (let i = 0; i < 4; i++) box(0.12, 0.12, 0.01, [0xe9b7c4, 0x8fc8ec, 0xd9b44a, 0x9fc59a][i], 4.05 + (i % 2) * 0.18, 2.4 + Math.floor(i / 2) * 0.2, Z0 + 0.875, { contorno: false });   // ímãs
    box(0.22, 0.3, 0.005, 0xfbf9f4, 4.15, 1.7, Z0 + 0.875, { contorno: false });                         // bilhete preso
    // armários aéreos
    box(2.6, 0.75, 0.42, 0xe8e1d4, 2.1, 3.05, Z0 + 0.21);
    for (let i = 0; i < 4; i++) { box(0.02, 0.7, 0.01, 0xc9c1b3, 1.15 + i * 0.65, 3.05, Z0 + 0.425, { contorno: false }); box(0.1, 0.03, 0.03, 0xb9b3a8, 1.0 + i * 0.65, 2.75, Z0 + 0.44, { contorno: false }); }
    // TV pequena na parede direita (a tela é um plano: a cena põe o plantão nela)
    const TVZ = -2.1, TVY = 2.55;
    box(0.08, 0.78, 1.25, 0x1b1c20, X1 - 0.04, TVY, TVZ);
    box(0.25, 0.08, 0.3, 0x2a2b30, X1 - 0.13, TVY - 0.5, TVZ, { contorno: false });
    const tv = new THREE.Mesh(new THREE.PlaneGeometry(1.12, 0.66), basico(0x14161b));
    tv.rotation.y = -Math.PI / 2; tv.position.set(X1 - 0.085, TVY, TVZ); raiz.add(tv);
    // ---------- mesa posta para o café, duas cadeiras ----------
    const MX = 2.55, MZ = -1.95, MY = 1.15;
    box(1.7, 0.07, 1.05, 0xa97c55, MX, MY - 0.035, MZ);
    for (const [sx, sz] of [[-0.75, -0.45], [0.75, -0.45], [-0.75, 0.45], [0.75, 0.45]]) box(0.07, MY - 0.07, 0.07, 0x8a6446, MX + sx, (MY - 0.07) / 2, MZ + sz);
    box(1.0, 0.005, 0.75, 0xf2d7de, MX, MY + 0.003, MZ, { contorno: false });                            // toalhinha rosa
    for (const [x, z] of [[MX - 0.4, MZ + 0.2], [MX + 0.15, MZ - 0.3]]) {
      cil(0.16, 0.16, 0.015, 0xfbf9f4, x, MY + 0.01, z, { seg: 16 });                                       // pires/prato
      cil(0.06, 0.05, 0.1, 0xfbf9f4, x + 0.05, MY + 0.07, z - 0.04, { seg: 12 });                            // xícara
    }
    cil(0.09, 0.09, 0.42, 0xc4473f, MX + 0.5, MY + 0.21, MZ + 0.1, { seg: 12 });                            // garrafa térmica
    cil(0.05, 0.06, 0.06, 0x2a2b30, MX + 0.5, MY + 0.45, MZ + 0.1, { seg: 10 });
    bolha(0.12, 0xd9a865, MX - 0.05, MY + 0.06, MZ + 0.15, [1.6, 0.6, 0.9]);                                 // pão
    box(0.14, 0.06, 0.1, 0xf2e6a8, MX + 0.2, MY + 0.03, MZ + 0.3);                                         // manteiga
    for (let i = 0; i < 3; i++) bolha(0.065, [0xd9583f, 0xf0b23a, 0x9fc55a][i], MX - 0.55 + i * 0.1, MY + 0.06, MZ - 0.3 + (i % 2) * 0.08, [1, 1, 1]);   // frutas
    const cadeiras = [];
    for (const [x, z, ry] of [[MX - 1.05, MZ, Math.PI / 2], [MX, MZ + 0.85, Math.PI]]) {                  // a da mãe olha a TV (+x); a da Duda, a janela
      const c = new THREE.Group(); c.position.set(x, 0, z); c.rotation.y = ry; raiz.add(c);
      box(0.56, 0.06, 0.54, 0x8a6446, 0, 0.72, 0, { pai: c });
      box(0.56, 0.6, 0.06, 0x8a6446, 0, 1.05, -0.25, { pai: c });
      for (const [sx, sz] of [[-0.24, -0.22], [0.24, -0.22], [-0.24, 0.22], [0.24, 0.22]]) box(0.045, 0.7, 0.045, 0x6e4c37, sx, 0.35, sz, { pai: c });
      cadeiras.push({ g: c, pos: new THREE.Vector3(x, 0, z), ry });
    }
    // luminária pendente sobre a mesa e um relógio de parede parado (sem pilha? não: só decoração, sem ponteiro)
    cil(0.01, 0.01, 1.0, 0x2a2b30, MX, H - 0.5, MZ, { seg: 6, contorno: false });
    cil(0.12, 0.32, 0.25, 0xf2d7de, MX, H - 1.1, MZ, { seg: 16 });
    // vaso com planta no canto, perto da porta
    cil(0.2, 0.16, 0.45, 0xc97a5a, X1 - 0.35, 0.225, -0.45);
    for (let i = 0; i < 7; i++) bolha(0.14, 0x4f8a52, X1 - 0.35 + Math.cos(i) * 0.12, 0.6 + i * 0.07, -0.45 + Math.sin(i) * 0.1, [1, 1.6, 0.6], { r: [0, i, 0.35] });
    const mundo = (x, y, z) => raiz.localToWorld(new THREE.Vector3(x, y, z));
    return { k, X0, X1, Z0, Z1, H, WX0, WX1, WY0, WY1, DX0, DX1, tv, radio, cadeiras, MX, MZ, MY, porta, abrePorta, mundo };
  }

  // ======================= BANHEIRO (nos fundos, atrás da cozinha) =======================
  // Pia com espelho na parede do fundo, escova e pasta na prateleira, toalha, box, vitrô. O "espelho" é
  // só a moldura: para o plano dela no espelho, a câmera fica no plano do espelho, olhando para ela.
  //   const B = Cenarios.banheiroDuda(casa);  B.espelho {pos, normal}, B.pia {x, y, z}, B.escova (grupo)
  function banheiroDuda(raiz) {
    const k = Cena.kit(raiz, 20261129);
    const { box, cil, bolha } = k;
    const basico = (c) => new THREE.MeshBasicMaterial({ color: c });
    const X0 = 0.78, X1 = 3.38, Z0 = -7.4, Z1 = -4.6, H = 3.9;
    const AZ = 0xf2f4f3, TOPO = 0xcfe1e6;                                 // azulejo branco até 1,9; azul-claro em cima
    for (let i = 0; i < 9; i++) for (let j = 0; j < 9; j++)
      box((X1 - X0) / 9 - 0.01, 0.06, (Z1 - Z0) / 9 - 0.01, (i + j) % 2 ? 0x9fb4bd : 0xb3c5cc, X0 + (i + 0.5) * (X1 - X0) / 9, -0.03, Z0 + (j + 0.5) * (Z1 - Z0) / 9, { contorno: false, sombra: false });
    const parede = (w, d, x, z) => { box(w, 1.9, d, AZ, x, 0.95, z, { contorno: false }); box(w, H - 1.9, d, TOPO, x, 1.9 + (H - 1.9) / 2, z, { contorno: false }); };
    parede(X1 - X0, 0.12, (X0 + X1) / 2, Z0 - 0.06);
    parede(X1 - X0, 0.12, (X0 + X1) / 2, Z1 + 0.06);
    parede(0.12, Z1 - Z0, X0 - 0.06, (Z0 + Z1) / 2);
    // parede direita com vitrô alto (a luz do dia entra por ele)
    const VZ0 = -6.6, VZ1 = -5.6, VY0 = 2.7, VY1 = 3.4;
    box(0.12, VY0, Z1 - Z0, AZ, X1 + 0.06, VY0 / 2, (Z0 + Z1) / 2, { contorno: false });
    box(0.12, H - VY1, Z1 - Z0, TOPO, X1 + 0.06, (VY1 + H) / 2, (Z0 + Z1) / 2, { contorno: false });
    box(0.12, VY1 - VY0, VZ0 - Z0, TOPO, X1 + 0.06, (VY0 + VY1) / 2, (Z0 + VZ0) / 2, { contorno: false });
    box(0.12, VY1 - VY0, Z1 - VZ1, TOPO, X1 + 0.06, (VY0 + VY1) / 2, (VZ1 + Z1) / 2, { contorno: false });
    const vit = new THREE.Mesh(new THREE.PlaneGeometry(VZ1 - VZ0, VY1 - VY0), basico(0xe9f1f6)); vit.rotation.y = -Math.PI / 2; vit.position.set(X1 + 0.03, (VY0 + VY1) / 2, (VZ0 + VZ1) / 2); raiz.add(vit);
    for (let i = 1; i < 4; i++) box(0.03, 0.02, VZ1 - VZ0, 0xd9d2c6, X1 + 0.0, VY0 + i * (VY1 - VY0) / 4, (VZ0 + VZ1) / 2, { contorno: false });
    box(X1 - X0 + 0.3, 0.12, Z1 - Z0 + 0.3, 0xf4f6f5, (X0 + X1) / 2, H + 0.06, (Z0 + Z1) / 2, { contorno: false });
    // pia (gabinete + cuba), torneira, prateleira com copo, escova e pasta, espelho
    const PX = 2.35, PY = 1.15, PZ = Z0 + 0.35;
    box(1.2, PY - 0.08, 0.62, 0xe8e1d4, PX, (PY - 0.08) / 2, PZ);
    box(1.28, 0.08, 0.68, 0xf4f2ec, PX, PY - 0.04, PZ);
    const cuba = cil(0.3, 0.24, 0.06, 0, PX, PY + 0.01, PZ + 0.04, { seg: 20, mat: basico(0xdfe5e8), contorno: false }); cuba.scale.z = 0.75;
    cil(0.025, 0.025, 0.3, 0xc8cdd2, PX, PY + 0.15, PZ - 0.25, { seg: 8 });
    cil(0.02, 0.02, 0.18, 0xc8cdd2, PX, PY + 0.29, PZ - 0.17, { r: [Math.PI / 2, 0, 0], seg: 8 });
    box(0.9, 0.04, 0.2, 0xe9f1f6, PX, PY + 0.55, Z0 + 0.1);                                               // prateleira de vidro
    cil(0.05, 0.045, 0.14, 0x8fc8ec, PX - 0.25, PY + 0.64, Z0 + 0.1, { seg: 10 });                         // copo das escovas
    const escova = new THREE.Group(); escova.position.set(PX + 0.46, PY + 0.02, PZ + 0.2); escova.rotation.y = 0.35; raiz.add(escova);   // a escova com pasta, deitada na pia
    box(0.025, 0.02, 0.22, 0xe9b7c4, 0, 0.0, 0, { pai: escova, contorno: false });
    box(0.03, 0.03, 0.05, 0xfbf9f4, 0, 0.025, 0.09, { pai: escova, contorno: false });                     // cerdas
    bolha(0.018, 0x8fc8ec, 0, 0.05, 0.09, [1, 0.7, 1.8], { pai: escova });                                // a pasta em cima
    const tubo = new THREE.Group(); tubo.position.set(PX + 0.5, PY + 0.03, PZ - 0.08); tubo.rotation.y = -0.4; raiz.add(tubo);   // o tubo de pasta
    cil(0.03, 0.03, 0.16, 0xfbf9f4, 0, 0, 0, { r: [0, 0, Math.PI / 2], seg: 10, pai: tubo, contorno: false });
    cil(0.02, 0.02, 0.03, 0x4fa3a0, 0.095, 0, 0, { r: [0, 0, Math.PI / 2], seg: 10, pai: tubo, contorno: false });
    // espelho: moldura com uma "superfície" fria (o reflexo não é simulado)
    const EY = PY + 1.15;
    box(0.95, 1.0, 0.04, 0xd9d2c6, PX, EY, Z0 + 0.02);
    box(0.85, 0.9, 0.01, 0, PX, EY, Z0 + 0.045, { mat: basico(0xb7c8cf), contorno: false });
    // toalha de rosto na argola (parede direita, perto da pia)
    cil(0.1, 0.1, 0.015, 0xc8cdd2, X1 - 0.02, PY + 0.75, -5.4, { r: [0, 0, Math.PI / 2], seg: 14, contorno: false });
    box(0.06, 0.55, 0.32, 0xf2c4d0, X1 - 0.06, PY + 0.45, -5.4);
    // box no canto esquerdo do fundo: cortina azul-clara correndo ao longo de z, chuveiro
    box(0.02, 0.02, 1.9, 0xc8cdd2, 1.5, 3.3, Z0 + 0.95, { contorno: false });
    for (let i = 0; i < 10; i++) cil(0.05, 0.06, 2.4, 0xbfd9e6, 1.5 + (i % 2) * 0.04, 2.1, Z0 + 0.2 + i * 0.17, { seg: 8, contorno: i === 0 || i === 9 });
    cil(0.12, 0.08, 0.06, 0xc8cdd2, X0 + 0.25, 3.1, Z0 + 0.6, { seg: 12 });
    cil(0.015, 0.015, 0.5, 0xc8cdd2, X0 + 0.25, 3.35, Z0 + 0.6, { seg: 6, contorno: false });
    // vaso sanitário no canto direito, tapete
    box(0.55, 0.5, 0.45, 0xf4f2ec, X1 - 0.4, 0.25, Z1 - 0.75);
    box(0.6, 0.07, 0.48, 0xf4f2ec, X1 - 0.38, 0.53, Z1 - 0.75);
    box(0.2, 0.55, 0.5, 0xf4f2ec, X1 - 0.12, 0.82, Z1 - 0.75);
    box(0.9, 0.02, 0.55, 0xf2c4d0, PX, 0.01, PZ + 0.75, { contorno: false });
    const mundo = (x, y, z) => raiz.localToWorld(new THREE.Vector3(x, y, z));
    return { k, X0, X1, Z0, Z1, H, pia: { x: PX, y: PY, z: PZ }, espelho: { x: PX, y: EY, z: Z0 + 0.06 }, escova, mundo };
  }

  // Luz da casa da Duda + da rua vista pela janela (modo VIDENTE: nítido e com cor). hora: "manha".
  // A luz do sol entra pela janela (a fachada dela olha para a rua: -z do mundo) e faz sombra.
  function luzCasaDuda(scene, raizRua, hora) {
    raizRua.traverse((o) => { if (o.isPointLight) o.intensity = 0; });             // postes apagados de dia
    scene.background = new THREE.Color(0xbcd3e8);
    scene.fog = new THREE.Fog(0xc9d6e2, 18, 60);
    scene.add(new THREE.HemisphereLight(0xe6edf5, 0x6e5e4c, 1.9));
    const sol = new THREE.DirectionalLight(0xfff0d8, 2.4);
    sol.position.set(-1.0, 11, -2.0); sol.target.position.set(-4.8, 0.8, 11.2); scene.add(sol.target);
    sol.castShadow = true; sol.shadow.mapSize.set(2048, 2048); sol.shadow.bias = -0.0006;
    Object.assign(sol.shadow.camera, { left: -14, right: 14, top: 14, bottom: -14, near: 1, far: 40 });
    scene.add(sol);
    const rebate = new THREE.PointLight(0xfff3e6, 1.1, 9, 1.6); rebate.position.set(-4.6, 3.2, 11.4); scene.add(rebate);   // luz rebatida dentro do quarto
    return { sol, rebate };
  }

  window.Cenarios = Object.assign(window.Cenarios || {}, { quartoDuda, cozinhaDuda, banheiroDuda, luzCasaDuda });
})();
