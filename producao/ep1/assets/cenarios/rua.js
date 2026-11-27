// Cenário da rua (cópia fiel de compositions/rua.html, aprovada em e575c2c), para outras cenas na rua.
// rua.html NÃO usa este módulo (não mexer no aprovado). Sem as pessoas; a van vem parada no portão com as
// portas de trás abertas (portasVan[i].pt.rotation.y = s * 2,75 · 0 = fechada). op: portaAberta, portaoAberto.
//   const R = Cenarios.rua(grupo, op);  R.ambiente(scene);  R.giroflex(t);
(function () {
  function rua(raiz, op0) {
    op0 = op0 || {};
    const k = Cena.kit(raiz, 62068);   // mesma semente da rua aprovada
      const { box, cil, bolha, rnd, M } = k;
      const luz = (c) => new THREE.MeshBasicMaterial({ color: c });           // janelas e lâmpadas acesas

      // ---------- geografia (briefing/cenarios.md) ----------
      // lado de cá (casa do Gabi) com fachada em z=-6,5; rua de z=-1,6 a 4,4; lado de lá (casa da Duda) em z=9
      const FZ = -6.5, MURO = -3.0, GUIA = -1.6, GUIA2 = 4.4, MURO2 = 5.8, FZ2 = 9.0;
      box(70, 0.06, 6, 0x34363c, 0, -0.03, (GUIA + GUIA2) / 2, { contorno: false, sombra: false });       // asfalto
      for (let i = -12; i <= 12; i++) box(1.2, 0.01, 0.12, 0xd9d2b0, i * 2.6, 0.005, (GUIA + GUIA2) / 2, { contorno: false, sombra: false });   // faixa
      for (const [z0, z1] of [[MURO, GUIA], [GUIA2, MURO2]]) {
        box(70, 0.16, z1 - z0, 0xa9a59c, 0, 0.08, (z0 + z1) / 2, { contorno: false });                 // calçada
        box(70, 0.17, 0.12, 0xc9c5bb, 0, 0.085, z0 > 0 ? z0 : z1, { contorno: false });                   // guia
      }
      box(70, 0.04, 30, 0x3e4a36, 0, -0.06, -16, { contorno: false, sombra: false });                    // terrenos
      box(70, 0.04, 30, 0x3e4a36, 0, -0.06, 21, { contorno: false, sombra: false });

      // casa térrea: corpo, telhado de duas águas, porta, janelas (acesas ou não), muro baixo e portãozinho
      const PAREDES = [0xd9c7a3, 0xa9c2b5, 0xe2d6b8, 0xc98f7a, 0xb8b9c9, 0xe0b9a0, 0x9fb3c8];
      const TELHAS = [0x8e4b3c, 0x5d4a44, 0x7b5d4a, 0x9a5a3a, 0x4f5560];
      function casa(x, lado, op) {                 // lado +1: lado de cá (fachada para +z); -1: lado de lá
        op = op || {};
        const g = new THREE.Group(); g.position.set(x, 0, lado > 0 ? FZ : FZ2); if (lado < 0) g.rotation.y = Math.PI; raiz.add(g);
        const W = op.w || 5.6, D = 5, Hc = 3.2, cor = op.cor || PAREDES[Math.floor(rnd() * PAREDES.length)];
        const tel = op.telha || TELHAS[Math.floor(rnd() * TELHAS.length)];
        // op.soMuro (EP2): sem corpo, telhado, porta e janelas — só muro, portão, caminho e plantas.
        // Serve para montar um interior no lugar da casa. Não consome rnd() a mais nem a menos se a
        // casa vier com cor, telha e "acesa" dados (caso da casa da Duda): as outras casas não mudam.
        const corpo = op.soMuro ? new THREE.Group() : g;
        if (op.soMuro) corpo.visible = false;
        if (op.soMuro) g.add(corpo);
        box(W, Hc, D, cor, 0, Hc / 2, -D / 2, { pai: corpo });
        for (const s of [-1, 1]) box(W + 0.5, 0.15, D / 2 + 0.6, tel, 0, Hc + 0.55, -D / 2 + s * (D / 4 + 0.1), { pai: corpo, r: [s * 0.42, 0, 0] });
        box(W + 0.5, 0.12, 0.12, 0x3a3030, 0, Hc + 1.05, -D / 2, { pai: corpo });                  // cumeeira
        // porta e janelas
        const PX = op.porta !== undefined ? op.porta : -1.2;
        box(0.95, 2.1, 0.08, op.portaCor || 0x5a3d2c, PX, 1.05, 0.02, { pai: corpo });
        if (op.portaAberta) box(0.85, 2.0, 0.02, 0xf4c98a, PX, 1.02, 0.07, { pai: corpo, mat: luz(0xf4c98a), contorno: false });
        for (const jx of op.janelas || [1.3]) {
          const acesa = op.acesa === undefined ? rnd() < 0.5 : op.acesa;
          box(1.3, 1.0, 0.06, acesa ? 0xf2c27a : 0x2c3442, jx, 1.75, 0.03, { pai: corpo, mat: acesa ? luz(op.luzJanela || 0xf2c27a) : undefined });
          box(1.42, 0.08, 0.14, 0xf1ede4, jx, 1.21, 0.06, { pai: corpo });
          box(0.06, 1.0, 0.09, 0xf1ede4, jx, 1.75, 0.06, { pai: corpo, contorno: false });
          if (op.cortina) for (const s of [-1, 1]) box(0.36, 0.98, 0.03, op.cortina, jx + s * 0.46, 1.75, 0.08, { pai: corpo, contorno: false });   // cortina aberta nos cantos
        }
        // muro baixo com portãozinho de grade
        const MZ = (lado > 0 ? MURO - FZ : -(MURO2 - FZ2));
        box(W / 2 + PX - 0.6 + W / 2 - W / 2, 1.25, 0.2, cor, (-W / 2 + PX - 0.55) / 2 - 0.0, 0.62, MZ, { pai: g });
        box(W / 2 - PX - 0.55, 1.25, 0.2, cor, (PX + 0.55 + W / 2) / 2, 0.62, MZ, { pai: g });
        const portao = new THREE.Group(); portao.position.set(PX - 0.55, 0, MZ); g.add(portao);
        if (op.portaoAberto) portao.rotation.y = lado > 0 ? -1.2 : 1.2;
        box(1.1, 0.05, 0.05, 0x22242a, 0.55, 1.15, 0, { pai: portao, contorno: false });
        box(1.1, 0.05, 0.05, 0x22242a, 0.55, 0.15, 0, { pai: portao, contorno: false });
        for (let i = 0; i < 8; i++) box(0.03, 1.05, 0.03, 0x22242a, 0.08 + i * 0.135, 0.65, 0, { pai: portao, contorno: false });
        // quintal: caminho, plantas
        box(1.0, 0.03, Math.abs(MZ) - 0.1, 0x9a948a, PX, 0.015, MZ / 2, { pai: g, contorno: false, sombra: false });
        for (let i = 0; i < 3; i++) bolha(0.35 + rnd() * 0.2, 0x3f6a3a, 1.2 + i * 0.7, 0.3, MZ / 2 + (rnd() - 0.5), [1, 0.8, 1], { pai: g });
        return g;
      }
      // lado de cá: a casa do Gabi no centro (porta aberta, luz de dentro), vizinhos
      const gabiCasa = casa(0, 1, { cor: 0xd9c7a3, telha: 0x8e4b3c, portaAberta: op0.portaAberta !== false, portaoAberto: op0.portaoAberto !== false, janelas: [1.3], acesa: true, cortina: 0xd9c7a3 });
      casa(-6.4, 1, { acesa: false }); casa(6.4, 1, { acesa: true }); casa(-12.8, 1); casa(12.8, 1);
      // lado de lá: a casa da Duda na diagonal (janela da frente acesa, cortina rosa), outras casas
      const dudaCasa = casa(-6.4, -1, { cor: 0xe8d9d2, telha: 0x5d4a44, janelas: [1.3, -2.0], acesa: true, luzJanela: 0xf7d6b0, cortina: 0xe9b7c4, porta: 0.2, soMuro: !!op0.semCasaDuda });
      casa(0, -1, { acesa: false }); casa(6.4, -1, { acesa: true }); casa(-12.8, -1, { soMuro: !!op0.semCasaDuda }); casa(12.8, -1, { acesa: false });   // a vizinha da Duda (x -12,8) também vira só muro: a cozinha dela ocupa esse espaço

      // ---------- sinais de vida: postes com fios, carro estacionado, lixeira, bola esquecida ----------
      const lampadas = [];
      for (const [x, z] of [[-4.2, GUIA + 0.3], [8.2, GUIA + 0.3], [2.5, GUIA2 - 0.3], [-10, GUIA2 - 0.3]]) {
        cil(0.09, 0.12, 6.4, 0x8a8a84, x, 3.2, z, { seg: 8 });
        box(0.9, 0.08, 0.08, 0x6a6a66, x, 6.0, z + (z < 0 ? 0.4 : -0.4), { r: [0, Math.PI / 2, 0], contorno: false });
        const lp = cil(0.18, 0.1, 0.12, 0, x, 5.92, z + (z < 0 ? 0.8 : -0.8), { mat: luz(0xffd9a0), contorno: false, sombra: false });
        const pl = new THREE.PointLight(0xffc98a, 6, 12, 1.8); pl.position.set(x, 5.7, z + (z < 0 ? 0.8 : -0.8)); raiz.add(pl);
        lampadas.push(lp);
      }
      for (const z of [GUIA + 0.3, GUIA2 - 0.3]) for (const y of [6.3, 6.15]) cil(0.012, 0.012, 70, 0x1a1a1e, 0, y, z, { r: [0, 0, Math.PI / 2], seg: 4, contorno: false, sombra: false });
      const carro = new THREE.Group(); carro.position.set(-9.5, 0, 3.4); raiz.add(carro);
      box(3.6, 0.7, 1.6, 0x6a2e2e, 0, 0.6, 0, { pai: carro });
      box(2.0, 0.6, 1.45, 0x6a2e2e, -0.2, 1.2, 0, { pai: carro });
      box(1.9, 0.45, 1.47, 0x2a3442, -0.2, 1.22, 0, { pai: carro, contorno: false });
      for (const [sx, sz] of [[-1.15, -0.8], [1.15, -0.8], [-1.15, 0.8], [1.15, 0.8]]) cil(0.32, 0.32, 0.2, 0x18181c, sx, 0.32, sz, { pai: carro, r: [Math.PI / 2, 0, 0], seg: 14 });
      cil(0.28, 0.25, 0.9, 0x3f6a3a, 3.6, 0.6, MURO + 0.35, { seg: 12 });                         // lixeira
      bolha(0.18, 0xd94a3e, -3.2, 0.34, GUIA - 0.6, [1, 1, 1]);                                    // bola esquecida na calçada
      // árvore na calçada de lá
      cil(0.14, 0.2, 2.6, 0x5a4232, 11.5, 1.3, GUIA2 + 0.6, { seg: 8 });
      for (let i = 0; i < 6; i++) bolha(0.9, 0x2f4a32, 11.5 + Math.cos(i) * 0.7, 3.0 + (i % 3) * 0.4, GUIA2 + 0.6 + Math.sin(i) * 0.7, [1, 0.8, 1]);

      // ---------- a van da quarentena, encostada no portão, portas de trás abertas ----------
      const van = new THREE.Group(); van.position.set(1.6, 0, 0.1); raiz.add(van);
      const BR = 0xeef0ee;
      box(5.0, 2.1, 2.1, BR, 0, 1.45, 0, { pai: van });                                           // baú
      box(1.3, 1.5, 2.05, BR, 3.05, 1.15, 0, { pai: van });                                        // cabine
      box(0.6, 0.75, 1.9, 0x2a3442, 3.45, 1.55, 0, { pai: van, contorno: false, r: [0, 0, -0.35] });   // para-brisa
      for (const [sx, sz] of [[-1.7, -1.0], [1.7, -1.0], [-1.7, 1.0], [2.9, 1.0], [2.9, -1.0]]) cil(0.42, 0.42, 0.25, 0x18181c, sx, 0.42, sz, { pai: van, r: [Math.PI / 2, 0, 0], seg: 16 });
      for (let i = 0; i < 10; i++) box(0.5, 0.25, 0.02, i % 2 ? 0x1b1b20 : 0xe8b923, -2.25 + i * 0.5, 0.75, -1.06, { pai: van, contorno: false, r: [0, 0, 0.5] });   // faixa zebrada
      // letreiro lateral
      const cv = document.createElement("canvas"); cv.width = 1024; cv.height = 256; const g2 = cv.getContext("2d");
      g2.fillStyle = "#c8102e"; g2.fillRect(0, 0, 1024, 256);
      g2.fillStyle = "#fff"; g2.font = "bold 120px sans-serif"; g2.fillText("ISOLAMENTO", 60, 170);
      const placa = new THREE.Mesh(new THREE.PlaneGeometry(3.6, 0.9), new THREE.MeshBasicMaterial({ map: new THREE.CanvasTexture(cv) }));
      placa.material.map.colorSpace = THREE.SRGBColorSpace; placa.rotation.y = Math.PI; placa.position.set(0, 1.85, -1.06); van.add(placa);
      // portas traseiras abertas e o escuro lá dentro
      const portasVan = [];
      box(0.05, 1.9, 2.0, 0x0b0c10, -2.5, 1.45, 0, { pai: van, contorno: false });
      for (const s of [-1, 1]) {
        const pt = new THREE.Group(); pt.position.set(-2.52, 0, s * 1.0); pt.rotation.y = s * 2.75; van.add(pt); portasVan.push({ pt, s });   // portas dobradas rente à lateral
        box(0.06, 1.95, 1.0, BR, 0, 1.45, -s * 0.5, { pai: pt });
      }
      // giroflex: azul e vermelho alternando
      const giroA = box(0.5, 0.18, 0.4, 0, 2.6, 2.65, -0.45, { pai: van, mat: luz(0x3a6bff) });
      const giroV = box(0.5, 0.18, 0.4, 0, 2.6, 2.65, 0.45, { pai: van, mat: luz(0xff2a2a) });
      const luzA = new THREE.PointLight(0x3a6bff, 0, 16, 1.4); luzA.position.set(2.6, 3.0, -0.6); van.add(luzA);
      const luzV = new THREE.PointLight(0xff2a2a, 0, 16, 1.4); luzV.position.set(2.6, 3.0, 0.6); van.add(luzV);

      // céu de anoitecer, luz fria, postes quentes (mesmo da rua aprovada)
      function ambiente(scene) {
        const cc = document.createElement("canvas"); cc.width = 4; cc.height = 256; const gc = cc.getContext("2d");
        const gr = gc.createLinearGradient(0, 0, 0, 256); gr.addColorStop(0, "#1a2340"); gr.addColorStop(0.55, "#4a4e78"); gr.addColorStop(0.85, "#c2775e"); gr.addColorStop(1, "#e3a06c");
        gc.fillStyle = gr; gc.fillRect(0, 0, 4, 256);
        const ceuTex = new THREE.CanvasTexture(cc); ceuTex.colorSpace = THREE.SRGBColorSpace; scene.background = ceuTex;
        scene.fog = new THREE.Fog(0x3a3f5c, 16, 46);
        scene.add(new THREE.HemisphereLight(0x8a96c8, 0x3a3028, 2.4));
        const lua = new THREE.DirectionalLight(0xaab6e0, 1.4);
        lua.position.set(-12, 14, -6); lua.target.position.set(0, 0, 1);
        lua.castShadow = true; lua.shadow.mapSize.set(2048, 2048); lua.shadow.bias = -0.0008; lua.shadow.normalBias = 0.03;
        Object.assign(lua.shadow.camera, { left: -16, right: 16, top: 16, bottom: -16, near: 1, far: 50 });
        scene.add(lua); scene.add(lua.target);
      }
      // giroflex: alterna azul/vermelho em pulsos duplos (mesmo ritmo da rua aprovada)
      function giroflex(t, liga) {
        const on = liga === undefined ? 1 : liga;
        const fase = (t * 2.2) % 1, azul = (Math.floor(t * 2.2) % 2) === 0, pisca = on > 0 && (fase < 0.18 || (fase > 0.3 && fase < 0.46));
        luzA.intensity = azul && pisca ? 22 * on : 0; luzV.intensity = !azul && pisca ? 22 * on : 0;
        giroA.material.color.setHex(azul && pisca ? 0x6f95ff : 0x1a2650); giroV.material.color.setHex(!azul && pisca ? 0xff5a5a : 0x501a1a);
        return { azul: azul && pisca, vermelho: !azul && pisca };
      }
      return { k, FZ, MURO, GUIA, GUIA2, MURO2, FZ2, gabiCasa, dudaCasa, van, portasVan, giroA, giroV, luzA, luzV, lampadas, carro, ambiente, giroflex };
  }
  window.Cenarios = window.Cenarios || {};
  window.Cenarios.rua = rua;
})();
