// Cenário do quarto do Gabi (cópia fiel de compositions/quarto.html, aprovado em 0493a39/9beb522),
// para as outras cenas que acontecem no quarto. quarto.html NÃO usa este módulo (não mexer no aprovado).
//   const Q = Cenarios.quarto(grupo);   // devolve medidas úteis (cama, criado-mudo, janela) e o visor do despertador
(function () {
  function quarto(raiz) {
    const k = Cena.kit(raiz, 20261122);   // mesma semente do quarto aprovado: mesmos livros, mesmas manchas
    const { box, cil, bolha, rnd, M } = k;
      // ---------- arquitetura: canto do quarto em corte (parede do fundo + parede da janela) ----------
      // unidades do rig: Gabi = 2,6 de altura (~1,75 m) -> 1 unidade ~ 0,67 m
      const X0 = -3.2, X1 = 3.4, Z0 = -2.6, Z1 = 2.6, H = 3.9;
      // piso de tacos em faixas de tons alternados
      for (let i = 0; i < 16; i++) {
        const tom = [0x80614a, 0x896a51, 0x7a5c46][i % 3];
        box((X1 - X0) / 16, 0.06, Z1 - Z0, tom, X0 + (i + 0.5) * (X1 - X0) / 16, -0.03, 0, { contorno: false, sombra: false });
      }
      const PAREDE = 0xaab6c4, RODAPE = 0xd9d4c7;
      box(X1 - X0, H, 0.12, PAREDE, (X0 + X1) / 2, H / 2, Z0 - 0.06, { contorno: false });          // fundo
      box(X1 - X0, 0.14, 0.04, RODAPE, (X0 + X1) / 2, 0.07, Z0 + 0.02, { contorno: false });
      box(X1 - X0 + 0.4, 0.12, Z1 - Z0 + 0.4, 0x6f7a88, (X0 + X1) / 2, H + 0.06, 0, { contorno: false }); // teto (bloqueia a luz de cima)
      // parede esquerda com vão de janela (z de -2,25 a -0,45, y de 1,55 a 3,15): o feixe cai na cabeceira
      const WZ0 = -2.25, WZ1 = -0.45, WY0 = 1.55, WY1 = 3.15;
      box(0.12, H, WZ0 - Z0, PAREDE, X0 - 0.06, H / 2, (Z0 + WZ0) / 2, { contorno: false });
      box(0.12, H, Z1 - WZ1, PAREDE, X0 - 0.06, H / 2, (WZ1 + Z1) / 2, { contorno: false });
      box(0.12, WY0, WZ1 - WZ0, PAREDE, X0 - 0.06, WY0 / 2, (WZ0 + WZ1) / 2, { contorno: false });
      box(0.12, H - WY1, WZ1 - WZ0, PAREDE, X0 - 0.06, (WY1 + H) / 2, (WZ0 + WZ1) / 2, { contorno: false });
      box(0.04, 0.14, Z1 - Z0, RODAPE, X0 + 0.02, 0.07, 0, { contorno: false });
      // janela: céu de madrugada clareando, caixilho e cruz
      const ceu = new THREE.Mesh(new THREE.PlaneGeometry(WZ1 - WZ0, WY1 - WY0),
        new THREE.MeshBasicMaterial({ color: 0x9fb2cc, fog: false }));
      ceu.rotation.y = Math.PI / 2; ceu.position.set(X0 - 0.5, (WY0 + WY1) / 2, (WZ0 + WZ1) / 2); raiz.add(ceu);
      const CX = 0xe6e2d8;
      box(0.1, 0.08, WZ1 - WZ0 + 0.1, CX, X0 + 0.02, WY0, (WZ0 + WZ1) / 2);
      box(0.1, 0.08, WZ1 - WZ0 + 0.1, CX, X0 + 0.02, WY1, (WZ0 + WZ1) / 2);
      box(0.1, WY1 - WY0, 0.08, CX, X0 + 0.02, (WY0 + WY1) / 2, WZ0);
      box(0.1, WY1 - WY0, 0.08, CX, X0 + 0.02, (WY0 + WY1) / 2, WZ1);
      box(0.06, WY1 - WY0, 0.05, CX, X0 - 0.02, (WY0 + WY1) / 2, (WZ0 + WZ1) / 2);
      box(0.06, 0.05, WZ1 - WZ0, CX, X0 - 0.02, (WY0 + WY1) / 2 + 0.1, (WZ0 + WZ1) / 2);
      box(0.3, 0.06, WZ1 - WZ0 + 0.2, CX, X0 + 0.12, WY0 - 0.05, (WZ0 + WZ1) / 2);           // peitoril
      // cortina: pregas em cilindros finos; uma banda meio aberta, a outra recolhida
      const CORT = 0x3d4a69;
      cil(0.025, 0.025, 2.4, 0x2a2b30, X0 + 0.25, WY1 + 0.25, (WZ0 + WZ1) / 2, { r: [Math.PI / 2, 0, 0], seg: 8 });
      for (let i = 0; i < 7; i++) cil(0.075, 0.09, 2.95, CORT, X0 + 0.25 + (i % 2) * 0.05, WY1 + 0.2 - 1.48, WZ0 - 0.25 + i * 0.11, { seg: 10, contorno: i === 0 });
      for (let i = 0; i < 4; i++) cil(0.075, 0.1, 2.95, CORT, X0 + 0.25 + (i % 2) * 0.05, WY1 + 0.2 - 1.48, WZ1 + 0.05 + i * 0.1, { seg: 10, contorno: i === 3 });

      // ---------- cama ----------
      const BX = -1.55, BZ0 = -2.5, BZ1 = 0.55, BW = 1.6, MT = 0.78; // topo do colchão
      const BZ = (BZ0 + BZ1) / 2;
      box(BW + 0.12, 1.55, 0.14, 0x5a3d2c, BX, 0.78, BZ0 - 0.02);                               // cabeceira
      box(BW + 0.12, 0.5, 0.12, 0x5a3d2c, BX, 0.25, BZ1 + 0.02);                               // pé
      box(BW + 0.1, 0.18, BZ1 - BZ0, 0x4e3527, BX, 0.32, BZ);                                   // estrado
      box(BW, 0.36, BZ1 - BZ0 - 0.06, 0xe9e6df, BX, 0.59, BZ);                                  // colchão
      bolha(0.42, 0xf1eee8, BX - 0.1, MT + 0.14, BZ0 + 0.35, [1.55, 0.42, 0.75], { r: [0, 0.08, 0.05] }); // travesseiro
      // edredom amarrotado, puxado até a cintura e caindo pelo lado
      const EDR = 0x5d7491;
      box(BW + 0.08, 0.14, 1.55, EDR, BX, MT + 0.06, BZ1 - 0.85);
      bolha(0.5, EDR, BX - 0.25, MT + 0.14, -0.9, [1.25, 0.38, 0.9], { r: [0, 0.4, 0] });
      bolha(0.45, EDR, BX + 0.35, MT + 0.12, -0.1, [1.2, 0.36, 1.1], { r: [0, -0.3, 0] });
      box(0.1, 0.62, 1.4, EDR, BX + BW / 2 + 0.05, MT - 0.24, BZ1 - 0.85, { r: [0, 0, 0.12] });       // aba caída
      bolha(0.3, 0xd8d4cb, BX - 0.55, MT + 0.08, -1.25, [1.2, 0.3, 0.9]);                          // lençol solto
      bolha(0.42, EDR, BX - 0.05, MT + 0.22, -0.72, [1.35, 0.62, 0.95]);                            // edredom sobre os pés

      // ---------- criado-mudo: abajur, copo, despertador piscando 00:00 (a energia voltou), fone ----------
      const NX = 0.75, NZ = -2.15;
      box(0.9, 0.95, 0.75, 0x6e4c37, NX, 0.475, NZ);
      box(0.82, 0.02, 0.02, 0x3a271c, NX, 0.62, NZ + 0.38, { contorno: false });
      cil(0.03, 0.03, 0.02, 0xc9a86a, NX, 0.75, NZ + 0.39, { r: [Math.PI / 2, 0, 0], contorno: false, seg: 10 });
      // abajur em grupo (pivô na base) para poder cair; mesma forma e posição do quarto aprovado
      const abajur = new THREE.Group(); abajur.position.set(NX - 0.22, 0.95, NZ - 0.08); raiz.add(abajur);
      cil(0.12, 0.15, 0.06, 0x2e3036, 0, 0.03, 0, { pai: abajur });                              // abajur: base
      cil(0.02, 0.02, 0.5, 0x2e3036, 0, 0.3, 0, { seg: 8, pai: abajur });
      cil(0.14, 0.26, 0.3, 0xe7dcc4, 0, 0.6, 0, { pai: abajur });                                // cúpula (apagada)
      const vidro = new THREE.MeshToonMaterial({ color: 0xcfe3ef, gradientMap: k.grad, transparent: true, opacity: 0.55 });
      cil(0.06, 0.05, 0.2, 0, NX + 0.12, 1.05, NZ + 0.18, { mat: vidro });                       // copo d'água
      const agua = new THREE.MeshToonMaterial({ color: 0x8fb4cf, gradientMap: k.grad, transparent: true, opacity: 0.6 });
      cil(0.052, 0.048, 0.1, 0, NX + 0.12, 1.0, NZ + 0.18, { mat: agua, contorno: false });
      box(0.3, 0.15, 0.12, 0x1f2126, NX + 0.25, 1.03, NZ - 0.2, { r: [0, -0.35, 0] });           // despertador
      box(0.22, 0.08, 0.01, 0x0b0c0f, NX + 0.27, 1.04, NZ - 0.135, { r: [0, -0.35, 0], contorno: false }); // visor
      // "00:00" piscando: o relógio zerou quando a energia caiu e voltou (continuidade com a TV da sala)
      const cvR = document.createElement("canvas"); cvR.width = 256; cvR.height = 96; const gR = cvR.getContext("2d");
      gR.fillStyle = "#ff3a2e"; gR.font = "bold 78px monospace"; gR.textAlign = "center"; gR.textBaseline = "middle"; gR.fillText("00:00", 128, 52);
      const texR = new THREE.CanvasTexture(cvR); texR.colorSpace = THREE.SRGBColorSpace;
      const visor = new THREE.Mesh(new THREE.PlaneGeometry(0.2, 0.075), new THREE.MeshBasicMaterial({ map: texR, transparent: true, toneMapped: false }));
      visor.position.set(NX + 0.272, 1.04, NZ - 0.128); visor.rotation.y = -0.35; raiz.add(visor);
      const brilhoR = new THREE.PointLight(0xff3a2e, 0.35, 1.2, 2); brilhoR.position.set(NX + 0.3, 1.06, NZ - 0.05); raiz.add(brilhoR);
      // fone: o objeto-assinatura, largado na mesinha
      const fone = new THREE.Group(); fone.position.set(NX - 0.05, 1.0, NZ + 0.22); fone.rotation.set(-1.25, 0.5, 0); raiz.add(fone);
      const arco = new THREE.Mesh(new THREE.TorusGeometry(0.17, 0.03, 8, 20, Math.PI), M(0x24242a)); arco.castShadow = true; fone.add(arco);
      for (const s of [-1, 1]) { const c = new THREE.Mesh(new THREE.CylinderGeometry(0.07, 0.07, 0.06, 14), M(0x24242a)); c.rotation.z = Math.PI / 2; c.position.set(s * 0.17, 0, 0); c.castShadow = true; fone.add(c); }
      box(0.15, 0.015, 0.3, 0x15171c, NX - 0.3, 0.965, NZ + 0.25, { r: [0, 0.3, 0] });            // celular sem sinal

      // ---------- escrivaninha, cadeira com o moletom, estante ----------
      const DX = 2.35, DZ = -2.15;
      box(1.9, 0.08, 0.85, 0x7b5a41, DX, 1.15, DZ);
      for (const [sx, sz] of [[-0.88, -0.36], [0.88, -0.36], [-0.88, 0.36], [0.88, 0.36]]) box(0.07, 1.11, 0.07, 0x5f4432, DX + sx, 0.555, DZ + sz);
      box(0.75, 0.04, 0.52, 0x2c2f36, DX - 0.35, 1.21, DZ + 0.05, { r: [0, 0.12, 0] });           // notebook fechado
      for (let i = 0; i < 5; i++) box(0.5 - i * 0.03, 0.07, 0.36, [0x9c4a3e, 0x3e6a5a, 0xc2a25a, 0x4a5a8a, 0x7a7d84][i], DX + 0.55, 1.225 + i * 0.075, DZ - 0.12, { r: [0, 0.1 * (i % 2 ? 1 : -1), 0] });
      cil(0.07, 0.06, 0.2, 0x3f6d8c, DX + 0.15, 1.29, DZ - 0.25);                                // porta-lápis
      for (let i = 0; i < 3; i++) cil(0.008, 0.008, 0.28, [0xd9b44a, 0xc94a3e, 0x2e3036][i], DX + 0.13 + i * 0.02, 1.4, DZ - 0.25, { r: [0, 0, (i - 1) * 0.2], seg: 6, contorno: false });
      cil(0.08, 0.07, 0.14, 0xb5653f, DX + 0.82, 1.26, DZ + 0.2);                                // vaso
      for (let i = 0; i < 5; i++) bolha(0.07, 0x4f7a4a, DX + 0.82 + Math.cos(i * 1.3) * 0.06, 1.4 + i * 0.03, DZ + 0.2 + Math.sin(i * 1.3) * 0.06, [1, 1.4, 0.6], { r: [0, i, 0.4] });
      // cadeira virada, com o moletom de ontem jogado no encosto
      const cad = new THREE.Group(); cad.position.set(DX - 0.3, 0, DZ + 1.0); cad.rotation.y = 0.5; raiz.add(cad);
      box(0.62, 0.07, 0.6, 0x3b3e46, 0, 0.72, 0, { pai: cad });
      box(0.62, 0.7, 0.07, 0x3b3e46, 0, 1.1, 0.28, { pai: cad });
      for (const [sx, sz] of [[-0.27, -0.25], [0.27, -0.25], [-0.27, 0.25], [0.27, 0.25]]) box(0.05, 0.7, 0.05, 0x2a2c32, sx, 0.35, sz, { pai: cad });
      bolha(0.3, 0xc4473f, 0.05, 1.42, 0.3, [1.2, 0.35, 0.55], { pai: cad, r: [0.2, 0, 0.1] });
      box(0.5, 0.5, 0.05, 0xc4473f, 0.02, 1.15, 0.34, { pai: cad, r: [0.05, 0, 0.06] });
      // estante na parede: livros de alturas e cores variadas (sementes fixas)
      box(1.9, 0.06, 0.4, 0x6e4c37, DX, 2.45, Z0 + 0.22);
      box(1.9, 0.06, 0.4, 0x6e4c37, DX, 3.15, Z0 + 0.22);
      let bx = DX - 0.88;
      const CORES = [0x9c4a3e, 0x3e6a5a, 0xc2a25a, 0x4a5a8a, 0x7a7d84, 0xd38b5d, 0x5b4a6e, 0xe0d6c2];
      while (bx < DX + 0.4) {
        const w = 0.06 + rnd() * 0.06, h = 0.36 + rnd() * 0.22;
        box(w, h, 0.3, CORES[Math.floor(rnd() * CORES.length)], bx + w / 2, 2.48 + h / 2, Z0 + 0.22, { r: [0, 0, rnd() < 0.1 ? 0.25 : 0] });
        bx += w + 0.008;
      }
      cil(0.1, 0.14, 0.08, 0xc9a86a, DX + 0.62, 2.52, Z0 + 0.22);                               // troféu
      cil(0.02, 0.02, 0.2, 0xc9a86a, DX + 0.62, 2.66, Z0 + 0.22, { seg: 8 });
      bolha(0.09, 0xd9b44a, DX + 0.62, 2.82, Z0 + 0.22, [1.1, 0.8, 1.1]);
      for (let i = 0; i < 4; i++) box(0.42, 0.06, 0.3, CORES[i + 3], DX - 0.5, 3.21 + i * 0.065, Z0 + 0.22, { r: [0, 0.15 * (i % 2 ? 1 : -1), 0] });
      // pôsteres na parede do fundo, acima da cama: um mapa e um de banda
      box(1.0, 1.3, 0.03, 0xe8dfc9, BX - 0.45, 2.55, Z0 + 0.03);
      for (let i = 0; i < 6; i++) bolha(0.12 + rnd() * 0.1, 0x7fa07a, BX - 0.45 + (rnd() - 0.5) * 0.7, 2.55 + (rnd() - 0.5) * 0.95, Z0 + 0.05, [1.2, 0.8, 0.05], { contorno: false });
      box(0.85, 1.15, 0.03, 0x22262f, BX + 0.75, 2.75, Z0 + 0.03);
      box(0.6, 0.08, 0.01, 0xd9583f, BX + 0.75, 3.05, Z0 + 0.05, { contorno: false });
      bolha(0.25, 0xd9583f, BX + 0.75, 2.6, Z0 + 0.05, [1, 1, 0.05], { contorno: false });
      // interruptor e tomada
      box(0.12, 0.18, 0.02, 0xece8de, 3.05, 1.6, Z0 + 0.01);
      box(0.12, 0.12, 0.02, 0xece8de, 0.2, 0.45, Z0 + 0.01);
      // chão: tapete, tênis (um tombado), mochila, camiseta largada
      const tap = cil(1.15, 1.15, 0.025, 0x7a4a4a, 0.55, 0.015, -0.2, { contorno: false });
      tap.scale.set(1, 1, 0.7);
      for (let i = 0; i < 3; i++) { const a = cil(1.0 - i * 0.25, 1.0 - i * 0.25, 0.028, [0x8d5a52, 0x6a3f3f, 0x9a6a5a][i], 0.55, 0.017 + i * 0.002, -0.2, { contorno: false, sombra: false }); a.scale.set(1, 1, 0.7); }
      function tenis(x, z, ry, tomb) {
        const t = new THREE.Group(); t.position.set(x, tomb ? 0.11 : 0, z); t.rotation.set(0, ry, tomb ? 1.4 : 0); raiz.add(t);
        box(0.21, 0.05, 0.44, 0xf2efe8, 0, 0.025, 0, { pai: t });                         // solado
        box(0.19, 0.11, 0.3, 0x2f3d55, 0, 0.1, -0.06, { pai: t });                         // cabedal
        bolha(0.1, 0x2f3d55, 0, 0.08, 0.12, [0.95, 0.6, 1.1], { pai: t });                 // bico
        box(0.2, 0.15, 0.08, 0x2f3d55, 0, 0.12, -0.18, { pai: t });                        // calcanhar
        box(0.08, 0.012, 0.18, 0xf2efe8, 0, 0.16, 0.0, { pai: t, contorno: false });       // cadarço
        box(0.2, 0.012, 0.02, 0xc94a3e, 0, 0.055, -0.22, { pai: t, contorno: false });     // friso
      }
      tenis(-0.45, 0.15, 0.4, false);
      tenis(-0.05, 0.4, -0.9, true);
      const moc = new THREE.Group(); moc.position.set(1.35, 0, -1.05); moc.rotation.set(0, -0.6, 0.12); raiz.add(moc);
      box(0.6, 0.6, 0.3, 0x3f6b8f, 0, 0.3, 0, { pai: moc });                                      // mochila encostada
      bolha(0.3, 0x3f6b8f, 0, 0.6, 0, [1.0, 0.55, 0.5], { pai: moc });                              // topo arredondado
      bolha(0.3, 0x34597a, 0, 0.6, 0.06, [1.02, 0.4, 0.48], { pai: moc, r: [0.25, 0, 0] });         // aba
      box(0.4, 0.3, 0.08, 0x34597a, 0, 0.26, 0.18, { pai: moc });                                  // bolso
      for (const s of [-1, 1]) box(0.06, 0.55, 0.04, 0x22262f, s * 0.18, 0.45, -0.17, { pai: moc, contorno: false });
      const cam1 = new THREE.Group(); cam1.position.set(1.45, 0.02, 0.35); cam1.rotation.y = 0.6; raiz.add(cam1);
      box(0.52, 0.03, 0.6, 0x8a9bb0, 0, 0.015, 0, { pai: cam1 });                                     // tronco
      box(0.3, 0.03, 0.2, 0x8a9bb0, -0.36, 0.015, -0.2, { pai: cam1, r: [0, 0.6, 0] });               // manga
      box(0.3, 0.03, 0.2, 0x8a9bb0, 0.33, 0.015, -0.12, { pai: cam1, r: [0, -0.3, 0] });              // manga
      bolha(0.18, 0x8a9bb0, 0.05, 0.04, 0.1, [1.4, 0.25, 1.0], { pai: cam1 });                        // amassado
      box(0.18, 0.031, 0.06, 0x2a3140, 0, 0.032, -0.27, { pai: cam1, contorno: false });              // gola
      // guarda-roupa na parede da janela, perto da câmera
      box(0.75, 3.2, 1.6, 0x7d5d44, X0 + 0.4, 1.6, 1.65);
      box(0.02, 3.0, 0.02, 0x3a271c, X0 + 0.785, 1.6, 1.65, { contorno: false });
      for (const s of [-1, 1]) box(0.04, 0.3, 0.04, 0xc9a86a, X0 + 0.8, 1.6, 1.65 + s * 0.1, { contorno: false });
    return { k, X0, X1, Z0, Z1, H, WZ0, WZ1, WY0, WY1, BX, BZ0, BZ1, BW, MT, BZ, NX, NZ, visor, brilhoR, fone, abajur, rnd };
  }
  window.Cenarios = Object.assign(window.Cenarios || {}, { quarto });
})();
