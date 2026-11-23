// Cenário da cozinha (cópia fiel de compositions/cozinha.html, aprovada em 98c9736), para outras cenas na cozinha.
// cozinha.html NÃO usa este módulo (não mexer no aprovado). Sem o copo/água (cada cena põe o seu).
//   const K = Cenarios.cozinha(grupo);
(function () {
  function cozinha(raiz) {
    const k = Cena.kit(raiz, 42048);   // mesma semente da cozinha aprovada
    const { box, cil, bolha, rnd, M } = k;
      // ---------- arquitetura ----------
      const X0 = -3.4, X1 = 3.6, Z0 = -3.0, Z1 = 3.0, H = 3.9;
      for (let i = 0; i < 14; i++) for (let j = 0; j < 12; j++) {           // piso xadrez
        box(0.5, 0.06, 0.5, ((i + j) % 2) ? 0xe9e4d6 : 0x6f7a74, X0 + 0.25 + i * 0.5, -0.03, Z0 + 0.25 + j * 0.5, { contorno: false, sombra: false });
      }
      const PAREDE = 0xd9cfa8, AZUL = 0xf3f1ea, REJ = 0xcfd3d0;
      box(X1 - X0 + 0.4, 0.12, Z1 - Z0 + 0.4, 0xeee8d8, (X0 + X1) / 2, H + 0.06, 0, { contorno: false });     // teto
      // parede do fundo com janela sobre a pia (x -0,6..1,0 · y 1,55..2,85)
      const JX0 = -0.6, JX1 = 1.0, JY0 = 1.55, JY1 = 2.85;
      const fundo = (x0, x1, y0, y1, c) => box(x1 - x0, y1 - y0, 0.12, c || PAREDE, (x0 + x1) / 2, (y0 + y1) / 2, Z0 - 0.06, { contorno: false });
      fundo(X0, JX0, 0, H); fundo(JX1, X1, 0, H); fundo(JX0, JX1, 0, JY0); fundo(JX0, JX1, JY1, H);
      box(0.12, H, Z1 - Z0, PAREDE, X0 - 0.06, H / 2, 0, { contorno: false });                // parede esquerda
      box(0.12, H, Z1 - Z0, PAREDE, X1 + 0.06, H / 2, 0, { contorno: false });                // parede direita
      // azulejo branco até 1,6 m nas paredes (com rejunte)
      for (let i = 0; i < 28; i++) for (let j = 0; j < 7; j++) {
        const x = X0 + 0.125 + i * 0.25, y = 0.125 + j * 0.25 + 0.9;
        if (x > JX0 && x < JX1 && y > JY0) continue;
        box(0.24, 0.24, 0.02, AZUL, x, y, Z0 + 0.01, { contorno: false, sombra: false });
      }
      box(X1 - X0, 1.75, 0.01, REJ, (X0 + X1) / 2, 1.78 - 0.85 / 2 + 0.45, Z0 - 0.0, { contorno: false, sombra: false });
      // porta para o corredor na parede esquerda (z 0,4..1,4)
      const PZ0 = 0.4, PZ1 = 1.4, PY1 = 2.75;
      box(0.05, PY1, PZ1 - PZ0, 0x30333b, X0 - 0.05, PY1 / 2, (PZ0 + PZ1) / 2, { contorno: false, sombra: false });
      for (const z of [PZ0, PZ1]) box(0.16, PY1, 0.08, 0xf2ede0, X0 + 0.02, PY1 / 2, z);
      box(0.16, 0.08, PZ1 - PZ0 + 0.16, 0xf2ede0, X0 + 0.02, PY1, (PZ0 + PZ1) / 2);
      // janela: tarde de sol, quintal com varal e o muro
      const ceu = new THREE.Mesh(new THREE.PlaneGeometry(10, 5), new THREE.MeshBasicMaterial({ color: 0xf3dfb8, fog: false }));
      ceu.position.set(0.2, 2.6, -9); raiz.add(ceu);
      box(8, 1.3, 0.2, 0xd6c8ae, 0.2, 0.65, -7.5);                                          // muro do quintal
      cil(0.02, 0.02, 3, 0x6a6a70, 0.2, 2.0, -5.5, { r: [0, 0, Math.PI / 2], seg: 6, contorno: false });   // varal
      for (let i = 0; i < 4; i++) box(0.35, 0.45, 0.02, [0xd9583f, 0xe8dfc9, 0x4a6a9a, 0xe8b923][i], -0.9 + i * 0.7, 1.75, -5.5, { r: [0, 0.2, 0.05 * (i - 2)], contorno: false });
      const CX = 0xf1ede4;
      box(JX1 - JX0 + 0.1, 0.08, 0.14, CX, (JX0 + JX1) / 2, JY0, Z0 + 0.03);
      box(JX1 - JX0 + 0.1, 0.08, 0.14, CX, (JX0 + JX1) / 2, JY1, Z0 + 0.03);
      for (const x of [JX0, (JX0 + JX1) / 2, JX1]) box(0.07, JY1 - JY0, 0.12, CX, x, (JY0 + JY1) / 2, Z0 + 0.03);
      bolha(0.12, 0xb5653f, JX1 - 0.25, JY0 + 0.1, Z0 + 0.1, [1, 0.8, 1]);                     // vasinho de tempero na janela
      for (let i = 0; i < 4; i++) bolha(0.06, 0x5f8a4a, JX1 - 0.25 + (i - 1.5) * 0.04, JY0 + 0.24, Z0 + 0.1, [0.6, 1.6, 0.6], { r: [0, 0, (i - 1.5) * 0.25], contorno: false });

      // ---------- bancada ao longo do fundo: fogão, pia, escorredor ----------
      const BZ = Z0 + 0.38, BH = 1.05, BX0 = -2.2, BX1 = 2.3;
      box(BX1 - BX0, BH - 0.06, 0.74, 0xe4e0d6, (BX0 + BX1) / 2, (BH - 0.06) / 2, BZ);          // armário de baixo
      for (let x = BX0 + 0.45; x < BX1; x += 0.9) {
        box(0.02, BH - 0.2, 0.02, 0xb9b4a8, x, BH / 2, BZ + 0.38, { contorno: false });
        box(0.12, 0.03, 0.03, 0x8a8a90, x - 0.12, BH - 0.2, BZ + 0.39, { contorno: false });
      }
      box(BX1 - BX0 + 0.04, 0.06, 0.78, 0x3e4246, (BX0 + BX1) / 2, BH, BZ);                    // tampo de granito
      // pia: cuba, torneira
      const PX = 0.2;
      box(0.75, 0.04, 0.48, 0xa9adb2, PX, BH + 0.01, BZ + 0.02, { contorno: false });
      box(0.66, 0.02, 0.4, 0x6f747a, PX, BH + 0.025, BZ + 0.02, { contorno: false });
      cil(0.03, 0.035, 0.38, 0xc9ccd0, PX, BH + 0.2, BZ - 0.25, { seg: 12 });
      const bico = cil(0.022, 0.022, 0.3, 0xc9ccd0, PX, BH + 0.38, BZ - 0.12, { r: [Math.PI / 2 + 0.25, 0, 0], seg: 10 });   // bico inclinado para baixo
      cil(0.03, 0.03, 0.06, 0x8a8f96, PX + 0.12, BH + 0.32, BZ - 0.25, { r: [0, 0, Math.PI / 2], seg: 10 });      // registro
      const BOCA = new THREE.Vector3(PX, BH + 0.34, BZ + 0.025);                                // saída d'água
      // escorredor com pratos e copos
      box(0.55, 0.05, 0.4, 0xd6d9dd, PX + 0.85, BH + 0.06, BZ);
      for (let i = 0; i < 5; i++) cil(0.17, 0.17, 0.02, 0xf2f2ee, PX + 0.68 + i * 0.07, BH + 0.24, BZ, { r: [0, 0, Math.PI / 2 - 0.15], seg: 22 });
      for (let i = 0; i < 2; i++) cil(0.05, 0.045, 0.14, 0xcfe3ef, PX + 1.05, BH + 0.16, BZ - 0.1 + i * 0.13, { r: [Math.PI, 0, 0], mat: new THREE.MeshToonMaterial({ color: 0xcfe3ef, gradientMap: k.grad, transparent: true, opacity: 0.6 }) });
      // fogão de 4 bocas com chaleira e panela
      const FX = -1.55;
      box(0.82, BH + 0.02, 0.72, 0xf0efea, FX, (BH + 0.02) / 2, BZ + 0.02);
      box(0.78, 0.04, 0.68, 0x2b2c30, FX, BH + 0.04, BZ + 0.02, { contorno: false });
      box(0.5, 0.34, 0.02, 0x2b2c30, FX, 0.55, BZ + 0.39, { contorno: false });               // vidro do forno
      for (let i = 0; i < 4; i++) cil(0.025, 0.025, 0.05, 0x2b2c30, FX - 0.27 + i * 0.18, BH - 0.12, BZ + 0.39, { r: [Math.PI / 2, 0, 0], seg: 10 });
      for (const [dx, dz] of [[-0.2, -0.15], [0.2, -0.15], [-0.2, 0.17], [0.2, 0.17]]) cil(0.09, 0.09, 0.03, 0x45474c, FX + dx, BH + 0.07, BZ + 0.02 + dz, { seg: 16 });
      cil(0.14, 0.16, 0.22, 0xc94a3e, FX - 0.2, BH + 0.2, BZ - 0.13);                         // chaleira
      cil(0.03, 0.03, 0.2, 0xc94a3e, FX - 0.06, BH + 0.25, BZ - 0.13, { r: [0, 0, -1.0], seg: 8 });
      cil(0.16, 0.16, 0.16, 0x8a8f96, FX + 0.2, BH + 0.16, BZ + 0.17);                        // panela
      box(0.32, 0.025, 0.04, 0x2b2c30, FX + 0.46, BH + 0.22, BZ + 0.17, { contorno: false });
      // tábua com pão, porta-utensílios, fruteira de bancada, micro-ondas
      box(0.45, 0.03, 0.3, 0xb68a5a, -0.75, BH + 0.05, BZ + 0.05, { r: [0, 0.15, 0] });
      bolha(0.13, 0xd9a35a, -0.75, BH + 0.12, BZ + 0.05, [1.4, 0.6, 0.8], { r: [0, 0.15, 0] });
      cil(0.08, 0.07, 0.2, 0xe8e0cc, -1.0, BH + 0.13, BZ - 0.22);
      for (let i = 0; i < 4; i++) cil(0.012, 0.012, 0.34, [0x6e4c37, 0xc9ccd0, 0x2e3036, 0x6e4c37][i], -1.0 + (i - 1.5) * 0.025, BH + 0.3, BZ - 0.22, { r: [(i - 1.5) * 0.08, 0, (i - 1.5) * 0.12], seg: 6, contorno: false });
      box(0.6, 0.36, 0.42, 0x2e3036, 1.85, BH + 0.21, BZ - 0.08);
      box(0.36, 0.24, 0.01, 0x14161a, 1.78, BH + 0.21, BZ + 0.135, { contorno: false });
      // armários de cima (fora da janela) e prateleira com potes e a caixa de primeiros socorros
      for (const [x0, x1] of [[BX0, JX0 - 0.1], [JX1 + 0.1, BX1]]) {
        box(x1 - x0, 0.75, 0.38, 0xe4e0d6, (x0 + x1) / 2, 2.85, Z0 + 0.2);
        for (let x = x0 + 0.45; x < x1; x += 0.9) box(0.015, 0.7, 0.02, 0xb9b4a8, x, 2.85, Z0 + 0.4, { contorno: false });
      }
      box(1.2, 0.04, 0.28, 0x8a6a4a, -2.85 + 0.5, 1.85, Z0 + 0.14);
      for (let i = 0; i < 3; i++) cil(0.08, 0.08, 0.2, [0xe0d6c2, 0xc94a3e, 0xd9b44a][i], -2.75 + i * 0.22, 1.97, Z0 + 0.14, { seg: 12 });
      box(0.34, 0.22, 0.2, 0xd23a3a, -1.95, 1.98, Z0 + 0.14);                                  // primeiros socorros
      box(0.06, 0.16, 0.005, 0xffffff, -1.95, 1.98, Z0 + 0.245, { contorno: false });
      box(0.16, 0.06, 0.005, 0xffffff, -1.95, 1.98, Z0 + 0.245, { contorno: false });
      // geladeira no canto esquerdo, com ímãs e um bilhete
      box(0.9, 2.4, 0.8, 0xf2f1ec, -2.85, 1.2, BZ + 0.04);
      box(0.02, 0.02, 0.8, 0xb9b4a8, -2.85, 1.65, BZ + 0.45, { r: [0, Math.PI / 2, 0], contorno: false });
      box(0.04, 0.5, 0.04, 0x9aa0a8, -2.5, 1.3, BZ + 0.46, { contorno: false });
      box(0.04, 0.35, 0.04, 0x9aa0a8, -2.5, 1.95, BZ + 0.46, { contorno: false });
      for (let i = 0; i < 5; i++) box(0.09, 0.09, 0.02, [0xd9583f, 0x4a6a9a, 0xe8b923, 0x5f8a4a, 0xc94a3e][i], -3.15 + rnd() * 0.5, 1.4 + rnd() * 0.8, BZ + 0.45, { contorno: false });
      box(0.2, 0.26, 0.005, 0xfff6d8, -2.95, 1.8, BZ + 0.452, { r: [0, 0, 0.08], contorno: false });
      // relógio e calendário
      cil(0.2, 0.2, 0.04, 0xfdfaf2, 1.6, 3.0, Z0 + 0.04, { r: [Math.PI / 2, 0, 0], seg: 24 });
      box(0.4, 0.55, 0.01, 0xf7f2e4, 3.2, 2.2, Z0 + 0.02);
      box(0.4, 0.2, 0.012, 0x6a9a7a, 3.2, 2.37, Z0 + 0.025, { contorno: false });
      // mesa com toalha, cadeiras, fruteira (onde a mãe vai enfaixar a mão dele)
      const MX = 1.1, MZ = 0.9;
      box(1.6, 0.06, 1.0, 0xe9dcc4, MX, 1.0, MZ);
      box(1.62, 0.25, 1.02, 0xc0563f, MX, 0.9, MZ, { contorno: false });                      // toalha xadrez (borda)
      for (let i = 0; i < 6; i++) box(0.04, 0.005, 1.0, 0xe9dcc4, MX - 0.7 + i * 0.28, 1.035, MZ, { contorno: false, sombra: false });
      for (const [dx, dz] of [[-0.7, -0.4], [0.7, -0.4], [-0.7, 0.4], [0.7, 0.4]]) box(0.07, 0.97, 0.07, 0x6e4c37, MX + dx, 0.485, MZ + dz);
      cil(0.2, 0.13, 0.1, 0xd9c7a3, MX + 0.2, 1.08, MZ);
      for (const [dx, dz, c] of [[0, 0, 0xe8b923], [0.08, 0.05, 0xd94a3e], [-0.07, 0.06, 0x8fb04a]]) bolha(0.065, c, MX + 0.2 + dx, 1.15, MZ + dz, [1, 1, 1], { contorno: false });
      function cadeira(x, z, ry) {
        const c = new THREE.Group(); c.position.set(x, 0, z); c.rotation.y = ry; raiz.add(c);
        box(0.5, 0.05, 0.5, 0x6e4c37, 0, 0.6, 0, { pai: c });
        box(0.5, 0.6, 0.05, 0x6e4c37, 0, 0.95, -0.23, { pai: c });
        for (const [sx, sz] of [[-0.21, -0.21], [0.21, -0.21], [-0.21, 0.21], [0.21, 0.21]]) box(0.045, 0.6, 0.045, 0x5a3d2c, sx, 0.3, sz, { pai: c });
      }
      cadeira(MX - 0.45, MZ - 0.75, 0.1); cadeira(MX + 0.5, MZ - 0.72, -0.15); cadeira(MX + 1.1, MZ + 0.05, -Math.PI / 2 + 0.2);
      // pano de prato pendurado no forno e tapetinho na frente da pia
      box(0.22, 0.38, 0.015, 0xe8dfc9, FX + 0.2, 0.75, BZ + 0.41, { r: [0, 0, 0.05] });
      for (let i = 0; i < 3; i++) box(0.22, 0.03, 0.016, 0xc94a3e, FX + 0.2, 0.62 + i * 0.1, BZ + 0.42, { contorno: false });
      const tap = cil(0.5, 0.5, 0.02, 0x7a8f9a, PX, 0.012, BZ + 0.95, { contorno: false, sombra: false }); tap.scale.set(1.3, 1, 0.65);
    return { k, X0, X1, Z0, Z1, H, JX0, JX1, JY0, JY1, PZ0, PZ1, PY1, BZ, BH, BX0, BX1, PX, BOCA, FX, MX, MZ };
  }
  window.Cenarios = Object.assign(window.Cenarios || {}, { cozinha });
})();
