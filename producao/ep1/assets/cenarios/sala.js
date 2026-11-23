// Cenário da sala (cópia fiel de compositions/sala.html, aprovada em a8578fe), para outras cenas na sala.
// sala.html NÃO usa este módulo (não mexer no aprovado). A tela da TV fica a cargo de cada cena.
//   const S = Cenarios.sala(grupo);
(function () {
  function sala(raiz) {
    const k = Cena.kit(raiz, 32036);   // mesma semente da sala aprovada
    const { box, cil, bolha, rnd, M } = k;

      // ---------- arquitetura: parede da TV (esquerda) + parede da janela (fundo) ----------
      const X0 = -3.4, X1 = 3.6, Z0 = -3.0, Z1 = 3.0, H = 3.9;
      for (let i = 0; i < 14; i++) {             // piso de porcelanato em placas
        for (let j = 0; j < 12; j++) {
          const tom = ((i + j) % 2) ? 0xb9ad9b : 0xb2a693;
          box((X1 - X0) / 14 - 0.01, 0.06, (Z1 - Z0) / 12 - 0.01, tom, X0 + (i + 0.5) * (X1 - X0) / 14, -0.03, Z0 + (j + 0.5) * (Z1 - Z0) / 12, { contorno: false, sombra: false });
        }
      }
      const PAREDE = 0xd8cdb8, RODAPE = 0xf0ebe0;
      box(0.12, H, Z1 - Z0, PAREDE, X0 - 0.06, H / 2, 0, { contorno: false });                // parede da TV
      box(0.04, 0.14, Z1 - Z0, RODAPE, X0 + 0.02, 0.07, 0, { contorno: false });
      box(X1 - X0 + 0.4, 0.12, Z1 - Z0 + 0.4, 0xcfc6b3, (X0 + X1) / 2, H + 0.06, 0, { contorno: false }); // teto
      box(0.12, H, Z1 - Z0, PAREDE, X1 + 0.06, H / 2, 0, { contorno: false });                // parede direita
      box(0.04, 0.14, Z1 - Z0, RODAPE, X1 - 0.02, 0.07, 0, { contorno: false });
      // quadro grande acima do sofá e estante baixa na parede direita
      box(0.04, 1.0, 1.6, 0x3b3f4a, X1 - 0.03, 2.35, -0.4);
      box(0.02, 0.86, 1.46, 0xc9a06a, X1 - 0.055, 2.35, -0.4, { contorno: false });
      bolha(0.35, 0xb5653f, X1 - 0.06, 2.25, -0.4 - 0.3, [0.1, 0.8, 1.2], { contorno: false });
      bolha(0.3, 0x5d7491, X1 - 0.065, 2.45, -0.4 + 0.35, [0.1, 0.7, 1.0], { contorno: false });
      // parede do fundo com janela (x 0..2,2 · y 1..2,9) e porta para o corredor (x 2,7..3,5)
      const JX0 = -0.5, JX1 = 1.7, JY0 = 1.0, JY1 = 2.9, PX0 = 2.55, PX1 = 3.45, PY1 = 2.75;
      const fundo = (x0, x1, y0, y1) => box(x1 - x0, y1 - y0, 0.12, PAREDE, (x0 + x1) / 2, (y0 + y1) / 2, Z0 - 0.06, { contorno: false });
      fundo(X0, JX0, 0, H); fundo(JX1, PX0, 0, H); fundo(PX1, X1, 0, H);
      fundo(JX0, JX1, 0, JY0); fundo(JX0, JX1, JY1, H); fundo(PX0, PX1, PY1, H);
      box(X1 - X0, 0.14, 0.04, RODAPE, (X0 + X1) / 2, 0.07, Z0 + 0.02, { contorno: false });
      box(PX1 - PX0, PY1, 0.05, 0x2a2c33, (PX0 + PX1) / 2, PY1 / 2, Z0 - 0.4, { contorno: false, sombra: false }); // corredor escuro
      for (const x of [PX0, PX1]) box(0.08, PY1, 0.16, 0xece6d8, x, PY1 / 2, Z0 + 0.02);
      box(PX1 - PX0 + 0.16, 0.08, 0.16, 0xece6d8, (PX0 + PX1) / 2, PY1, Z0 + 0.02);
      // janela: céu de manhã nublada e as casas do outro lado da rua
      const ceu = new THREE.Mesh(new THREE.PlaneGeometry(14, 6), new THREE.MeshBasicMaterial({ color: 0xc9d3de, fog: false }));
      ceu.position.set(0.6, 3, -14); raiz.add(ceu);
      const CASAS = [0xd9b48f, 0xa9c2b5, 0xe2d6b8, 0xc98f7a, 0xb8b9c9];
      for (let i = 0; i < 6; i++) {
        const cx = -3.2 + i * 1.6, ch = 1.6 + rnd() * 0.6;
        box(1.4, ch, 1.2, CASAS[i % 5], cx, ch / 2, -9.5);
        box(1.55, 0.5, 1.3, [0x8e4b3c, 0x5d4a44, 0x7b5d4a][i % 3], cx, ch + 0.2, -9.5, { r: [0, 0, 0] });
        box(0.4, 0.45, 0.05, 0x3a4250, cx + 0.2, ch * 0.55, -8.88, { contorno: false });
      }
      box(12, 0.9, 0.2, 0xd8d2c6, 0.6, 0.45, -8.0);                                          // muros baixos
      const CX = 0xf1ede4;
      box(JX1 - JX0 + 0.1, 0.08, 0.14, CX, (JX0 + JX1) / 2, JY0, Z0 + 0.03);
      box(JX1 - JX0 + 0.1, 0.08, 0.14, CX, (JX0 + JX1) / 2, JY1, Z0 + 0.03);
      for (const x of [JX0, (JX0 + JX1) / 2, JX1]) box(0.07, JY1 - JY0, 0.12, CX, x, (JY0 + JY1) / 2, Z0 + 0.03);
      box(JX1 - JX0 + 0.3, 0.06, 0.28, CX, (JX0 + JX1) / 2, JY0 - 0.04, Z0 + 0.12);           // peitoril
      // cortina comprida bege, aberta (o pai vai fechá-la no plano 37)
      cil(0.025, 0.025, JX1 - JX0 + 1.6, 0x3a3530, (JX0 + JX1) / 2, JY1 + 0.35, Z0 + 0.22, { r: [0, 0, Math.PI / 2], seg: 8 });
      for (const lado of [-1, 1]) {
        const base = lado < 0 ? JX0 - 0.7 : JX1 + 0.15;
        for (let i = 0; i < 5; i++) cil(0.07, 0.085, JY1 + 0.3, 0xd9c7a3, base + i * 0.11, (JY1 + 0.3) / 2, Z0 + 0.22 + (i % 2) * 0.05, { seg: 10, contorno: i === 0 || i === 4 });
      }
      // relógio de parede (07:40) e porta-retratos da família
      cil(0.28, 0.28, 0.05, 0xf4f0e6, -2.0, 3.0, Z0 + 0.04, { r: [Math.PI / 2, 0, 0], seg: 28 });
      box(0.025, 0.2, 0.01, 0x22242a, -2.0 + 0.05, 3.0 - 0.07, Z0 + 0.08, { r: [0, 0, 2.3], contorno: false });   // hora
      box(0.018, 0.25, 0.01, 0x22242a, -2.0 - 0.1, 3.0 - 0.06, Z0 + 0.085, { r: [0, 0, -1.05], contorno: false }); // minuto
      const RET = [[-2.6, 2.1, 0.45, 0.55], [-1.95, 2.0, 0.6, 0.42], [-1.35, 2.15, 0.38, 0.5]];
      for (const [x, y, w, h] of RET) {
        box(w, h, 0.03, 0x4a3a2e, x, y, Z0 + 0.03);
        box(w - 0.08, h - 0.08, 0.01, [0xbfa38a, 0x9ab0c2, 0xc9b08a][Math.floor(rnd() * 3)], x, y, Z0 + 0.05, { contorno: false });
        bolha(0.07, 0x6e4c37, x - 0.06, y - 0.04, Z0 + 0.06, [1, 1.2, 0.1], { contorno: false });
        bolha(0.06, 0xc68e62, x + 0.08, y - 0.06, Z0 + 0.06, [1, 1.2, 0.1], { contorno: false });
      }

      // ---------- rack e TV na parede esquerda ----------
      const TZ = -0.4;
      box(0.55, 0.55, 2.6, 0x5e4636, X0 + 0.3, 0.3, TZ);
      for (const dz of [-0.65, 0.65]) box(0.02, 0.4, 1.2, 0x3b2b20, X0 + 0.58, 0.3, TZ + dz, { contorno: false });
      box(0.14, 0.7, 0.14, 0x1e1f24, X0 + 0.35, 0.92, TZ - 1.15);                              // caixa de som
      box(0.14, 0.7, 0.14, 0x1e1f24, X0 + 0.35, 0.92, TZ + 1.15);
      cil(0.13, 0.1, 0.24, 0xb5653f, X0 + 0.32, 0.7, TZ + 0.85);                                // vaso no rack
      for (let i = 0; i < 6; i++) bolha(0.07, 0x4f7a4a, X0 + 0.32 + Math.cos(i) * 0.08, 0.82 + (i % 3) * 0.015, TZ + 0.85 + Math.sin(i) * 0.08, [1.1, 0.8, 0.9], { r: [0.3, i, 0.2] });   // suculenta baixa
      box(0.25, 0.04, 0.35, 0x2a2c33, X0 + 0.32, 0.6, TZ - 0.6);                               // decodificador
      box(0.04, 0.02, 0.05, 0x5de07a, X0 + 0.45, 0.61, TZ - 0.5, { contorno: false, sombra: false, mat: new THREE.MeshBasicMaterial({ color: 0x5de07a }) });
      // TV
      const TV_W = 1.9, TV_H = 1.07, TV_Y = 1.45;
      box(0.08, TV_H + 0.08, TV_W + 0.08, 0x111216, X0 + 0.12, TV_Y, TZ);
      box(0.1, 0.05, 0.5, 0x111216, X0 + 0.3, 0.6, TZ);

      // ---------- sofá virado para a TV, mesa de centro, tapete, poltrona ----------
      const SX = 1.15, SZ = -0.4, SL = 2.9, SEAT = 0.48;
      const SOFA = 0x6b7a5e;
      box(0.95, 0.32, SL, 0x58654d, SX, 0.2, SZ);                                              // base
      for (const dz of [-1, 0, 1]) bolha(0.5, SOFA, SX - 0.05, SEAT - 0.04, SZ + dz * 0.92, [0.95, 0.22, 0.9]);      // assentos
      box(0.32, 0.65, SL, SOFA, SX + 0.38, 0.75, SZ);                                          // encosto
      for (const dz of [-1, 0, 1]) bolha(0.42, 0x75855f, SX + 0.25, 0.86, SZ + dz * 0.92, [0.35, 0.75, 1.05], { r: [0, 0, -0.15] });
      for (const s of [-1, 1]) box(0.95, 0.62, 0.25, SOFA, SX, 0.42, SZ + s * (SL / 2 + 0.05));     // braços
      bolha(0.4, 0xb3563f, SX + 0.15, 0.75, SZ - 1.25, [0.6, 0.8, 0.35], { r: [0.3, 0, -0.2] });     // manta dobrada no braço
      // mesa de centro: controle, canecas, revistas, fruteira
      const MX = -0.95;
      box(0.75, 0.06, 1.5, 0x6e4c37, MX, 0.38, SZ);
      for (const [dx, dz] of [[-0.3, -0.65], [0.3, -0.65], [-0.3, 0.65], [0.3, 0.65]]) box(0.06, 0.36, 0.06, 0x4e3527, MX + dx, 0.18, SZ + dz);
      box(0.08, 0.03, 0.22, 0x1e1f24, MX + 0.15, 0.425, SZ - 0.2, { r: [0, 0.4, 0] });          // controle
      for (const [dx, dz, c] of [[-0.15, 0.3, 0xe9e4d8], [0.12, 0.45, 0x3f6d8c]]) {
        cil(0.07, 0.065, 0.14, c, MX + dx, 0.48, SZ + dz);
        const asa = new THREE.Mesh(new THREE.TorusGeometry(0.04, 0.012, 6, 12), M(c)); asa.position.set(MX + dx, 0.48, SZ + dz + 0.08); asa.rotation.y = Math.PI / 2; raiz.add(asa);
      }
      for (let i = 0; i < 3; i++) box(0.38, 0.015, 0.5, [0xc94a3e, 0xe8dfc9, 0x4a5a8a][i], MX - 0.1, 0.42 + i * 0.016, SZ - 0.45, { r: [0, 0.15 * i, 0], contorno: i === 2 });
      cil(0.2, 0.12, 0.1, 0xd9c7a3, MX + 0.05, 0.46, SZ + 0.05);
      for (const [dx, dz, c] of [[0, 0, 0xd94a3e], [0.08, 0.06, 0xe8b923], [-0.07, 0.05, 0xd94a3e], [0.02, -0.08, 0x8fb04a]]) bolha(0.065, c, MX + 0.05 + dx, 0.53, SZ + 0.05 + dz, [1, 1, 1], { contorno: false });
      const tap = cil(1.6, 1.6, 0.02, 0x7c6a8a, -0.35, 0.012, SZ, { contorno: false, sombra: false }); tap.scale.set(0.8, 1, 1.15);
      // poltrona e luminária de pé (desligada: é de manhã)
      const pol = new THREE.Group(); pol.position.set(2.7, 0, 1.75); pol.rotation.y = -Math.PI / 2 - 0.5; raiz.add(pol);
      box(0.95, 0.3, 0.85, 0x7a4c38, 0, 0.2, 0, { pai: pol });
      bolha(0.45, 0x9a6a50, 0, 0.45, 0.04, [1.0, 0.28, 0.9], { pai: pol });                  // assento macio
      bolha(0.5, 0x8a5a44, 0, 0.85, -0.33, [0.95, 0.85, 0.35], { pai: pol });                // encosto arredondado
      for (const s of [-1, 1]) bolha(0.3, 0x7a4c38, s * 0.47, 0.5, 0, [0.4, 0.6, 1.4], { pai: pol });   // braços
      for (const [sx, sz] of [[-0.38, -0.35], [0.38, -0.35], [-0.38, 0.35], [0.38, 0.35]]) cil(0.03, 0.02, 0.1, 0x3a271c, sx, 0.05, sz, { pai: pol, seg: 8 });
      bolha(0.2, 0xd9c7a3, 0.15, 0.62, 0.0, [1.1, 0.55, 0.4], { pai: pol, r: [0.3, 0.4, 0] });            // almofada
      cil(0.18, 0.2, 0.04, 0x2e3036, 3.25, 0.02, 0.85);
      cil(0.025, 0.025, 2.4, 0x2e3036, 3.25, 1.22, 0.85, { seg: 8 });
      cil(0.2, 0.32, 0.38, 0xefe4cc, 3.25, 2.5, 0.85);
      // planta no canto
      cil(0.28, 0.22, 0.55, 0xd9d2c4, X0 + 0.45, 0.28, Z0 + 0.45);
      for (let i = 0; i < 9; i++) bolha(0.22, 0x4a7a46, X0 + 0.45 + Math.cos(i * 0.7) * 0.15, 0.8 + i * 0.13, Z0 + 0.45 + Math.sin(i * 0.7) * 0.15, [0.55, 1.4, 0.3], { r: [0.4 * Math.sin(i), i * 0.7, 0.5] });

    return { k, X0, X1, Z0, Z1, H, JX0, JX1, JY0, JY1, PX0, PX1, PY1, TZ, TV_W, TV_H, TV_Y, SX, SZ, SL, SEAT, MX };
  }
  window.Cenarios = Object.assign(window.Cenarios || {}, { sala });
})();
