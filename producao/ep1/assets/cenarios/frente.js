// Cenário da sala vista de frente (parede da janela + porta da rua), cópia fiel de compositions/portao.html
// (aprovado em 0436580), para as cenas que acontecem ali depois que a Duda vai embora (plano 61, c10).
// portao.html NÃO usa este módulo (não mexer no aprovado). A cortina aqui não tem a sombra da Duda;
// `sombra` (0..1) escurece o tecido inteiro (nuvem, fim do dia) e `onda` faz o tecido ondular.
//   const F = Cenarios.frente(grupo);  F.porta.rotation.y = 0..0,55;  F.cortina.material.uniforms.onda.value = t;
(function () {
  function frente(sala) {
    const k = Cena.kit(sala, 57060);   // mesma semente do portão aprovado
    const { box, cil, bolha, rnd } = k;

    // ---------- arquitetura: parede da frente (z=0) com janela e porta da rua; a casa fica em z>0 ----------
    const X0 = -3.4, X1 = 3.0, Z1 = 5.0, H = 3.9;
    for (let i = 0; i < 13; i++) for (let j = 0; j < 10; j++) {
      const tom = ((i + j) % 2) ? 0xb9ad9b : 0xb2a693;
      box((X1 - X0) / 13 - 0.01, 0.06, Z1 / 10 - 0.01, tom, X0 + (i + 0.5) * (X1 - X0) / 13, -0.03, (j + 0.5) * Z1 / 10, { contorno: false, sombra: false });
    }
    const PAREDE = 0xd8cdb8, RODAPE = 0xf0ebe0;
    box(0.12, H, Z1, PAREDE, X0 - 0.06, H / 2, Z1 / 2, { contorno: false });
    box(0.12, H, Z1, PAREDE, X1 + 0.06, H / 2, Z1 / 2, { contorno: false });
    box(X1 - X0 + 0.4, 0.12, Z1 + 0.4, 0xcfc6b3, (X0 + X1) / 2, H + 0.06, Z1 / 2, { contorno: false });
    for (const x of [X0 + 0.02, X1 - 0.02]) box(0.04, 0.14, Z1, RODAPE, x, 0.07, Z1 / 2, { contorno: false });
    const JX0 = -1.9, JX1 = 0.5, JY0 = 0.95, JY1 = 2.95, PX0 = 1.25, PX1 = 2.15, PY1 = 2.75;
    const frenteP = (x0, x1, y0, y1) => box(x1 - x0, y1 - y0, 0.14, PAREDE, (x0 + x1) / 2, (y0 + y1) / 2, -0.07, { contorno: false });
    frenteP(X0, JX0, 0, H); frenteP(JX1, PX0, 0, H); frenteP(PX1, X1, 0, H);
    frenteP(JX0, JX1, 0, JY0); frenteP(JX0, JX1, JY1, H); frenteP(PX0, PX1, PY1, H);
    box(X1 - X0, 0.14, 0.04, RODAPE, (X0 + X1) / 2, 0.07, 0.02, { contorno: false });
    const CX = 0xf1ede4;
    for (const x of [PX0, PX1]) box(0.08, PY1, 0.16, CX, x, PY1 / 2, 0.02);
    box(PX1 - PX0 + 0.16, 0.08, 0.16, CX, (PX0 + PX1) / 2, PY1, 0.02);
    box(JX1 - JX0 + 0.3, 0.06, 0.28, CX, (JX0 + JX1) / 2, JY0 - 0.04, 0.12);
    const fora = new THREE.Mesh(new THREE.PlaneGeometry(8, 5), new THREE.MeshBasicMaterial({ color: 0xffe2b0, fog: false }));
    fora.position.set(1.7, 2.0, -2.5); sala.add(fora);
    box(6, 0.04, 2.4, 0xd9b98a, 1.7, -0.02, -1.25, { contorno: false, sombra: false });
    const porta = new THREE.Group(); porta.position.set(PX1 - 0.02, 0, 0.06); sala.add(porta);
    box(PX1 - PX0 - 0.06, PY1 - 0.04, 0.06, 0x6a4632, -(PX1 - PX0) / 2 + 0.01, (PY1 - 0.04) / 2, 0, { pai: porta });
    for (const y of [0.75, 1.95]) box(0.6, 0.6, 0.02, 0x5a3b2a, -(PX1 - PX0) / 2 + 0.01, y, 0.04, { pai: porta, contorno: false });
    const trinco = cil(0.03, 0.03, 0.1, 0xc9b07a, -(PX1 - PX0) + 0.14, 1.05, 0.08, { pai: porta, r: [Math.PI / 2, 0, 0], seg: 8 });

    // ---------- cortina fechada, contraluz do sol baixo (mesmo shader do portão, sem a sombra) ----------
    const CX0 = JX0 - 0.45, CX1 = JX1 + 0.4, CH = JY1 + 0.3, CZ = 0.34;
    cil(0.025, 0.025, CX1 - CX0 + 0.3, 0x3a3530, (CX0 + CX1) / 2, CH + 0.02, CZ, { r: [0, 0, Math.PI / 2], seg: 8 });
    const cortina = new THREE.Mesh(new THREE.PlaneGeometry(CX1 - CX0, CH, 120, 8), new THREE.ShaderMaterial({
      uniforms: { luz: { value: new THREE.Color(0xf6d29c) }, tecido: { value: new THREE.Color(0xc9b28e) }, somb: { value: new THREE.Color(0x8a6a52) },
        jan: { value: new THREE.Vector4((JX0 - CX0) / (CX1 - CX0), JY0 / CH, (JX1 - CX0) / (CX1 - CX0), JY1 / CH) }, onda: { value: 0 }, sombra: { value: 0 } },
      vertexShader: `
        uniform float onda; varying vec2 vUv;
        void main() { vUv = uv;
          vec3 p = position; p.z += 0.045 * sin(uv.x * 6.2832 * 13.0) + 0.012 * sin(uv.x * 40.0 + onda) * uv.y;
          gl_Position = projectionMatrix * modelViewMatrix * vec4(p, 1.0); }`,
      fragmentShader: `
        uniform vec3 luz, tecido, somb; uniform vec4 jan; uniform float sombra; varying vec2 vUv;
        void main() {
          float m = smoothstep(jan.x - 0.02, jan.x + 0.03, vUv.x) * smoothstep(jan.z + 0.02, jan.z - 0.03, vUv.x)
                  * smoothstep(jan.y - 0.03, jan.y + 0.04, vUv.y) * smoothstep(jan.w + 0.03, jan.w - 0.04, vUv.y);
          float dobra = 0.8 + 0.2 * sin(vUv.x * 6.2832 * 13.0 + 1.3);
          vec3 acesa = mix(luz, somb, sombra * 0.88);
          vec3 c = mix(tecido * 0.38, acesa, m) * dobra;
          c *= mix(1.0, 0.82, smoothstep(0.85, 1.0, vUv.y));
          gl_FragColor = vec4(c, 1.0);
        }`,
    }));
    cortina.position.set((CX0 + CX1) / 2, CH / 2, CZ); sala.add(cortina);

    // ---------- sofá encostado na parede direita, rack, planta, chaveiro e mochila perto da porta ----------
    const SX = 2.25, SZ = 2.4, SL = 2.6, SEAT = 0.48, SOFA = 0x6b7a5e;
    box(0.95, 0.32, SL, 0x58654d, SX, 0.2, SZ);
    for (const dz of [-0.65, 0.65]) bolha(0.55, SOFA, SX - 0.05, SEAT - 0.04, SZ + dz, [0.95, 0.22, 1.1]);
    box(0.32, 0.65, SL, SOFA, SX + 0.38, 0.75, SZ);
    for (const dz of [-0.65, 0.65]) bolha(0.45, 0x75855f, SX + 0.25, 0.86, SZ + dz, [0.35, 0.75, 1.25], { r: [0, 0, -0.15] });
    for (const s of [-1, 1]) box(0.95, 0.62, 0.25, SOFA, SX, 0.42, SZ + s * (SL / 2 + 0.05));
    bolha(0.4, 0xb3563f, SX + 0.15, 0.75, SZ + 1.15, [0.6, 0.8, 0.35], { r: [0.3, 0, -0.2] });
    box(0.5, 0.05, 0.5, 0x6e4c37, SX - 0.1, 0.62, SZ - 1.75);
    for (const [dx, dz] of [[-0.2, -0.2], [0.2, -0.2], [-0.2, 0.2], [0.2, 0.2]]) box(0.04, 0.6, 0.04, 0x4e3527, SX - 0.1 + dx, 0.3, SZ - 1.75 + dz);
    cil(0.05, 0.045, 0.16, 0xcfe0e8, SX - 0.2, 0.73, SZ - 1.65, { seg: 12 });
    box(0.45, 0.55, 2.0, 0x5a4232, X0 + 0.25, 0.28, 2.2);
    box(0.08, 0.75, 1.3, 0x1b1c22, X0 + 0.12, 1.1, 2.2);
    box(0.06, 0.32, 0.26, 0x4a3a2e, X0 + 0.3, 0.72, 1.35, { r: [0, 0.4, 0] });
    bolha(0.05, 0xc68e62, X0 + 0.34, 0.74, 1.3, [0.4, 1.1, 1], { contorno: false });
    bolha(0.05, 0xf3d6c2, X0 + 0.36, 0.74, 1.42, [0.4, 1.1, 1], { contorno: false });
    cil(0.24, 0.2, 0.5, 0xd9d2c4, X0 + 0.45, 0.25, 0.55);
    for (let i = 0; i < 9; i++) bolha(0.22, 0x4a7a46, X0 + 0.45 + Math.cos(i * 0.7) * 0.15, 0.75 + i * 0.13, 0.55 + Math.sin(i * 0.7) * 0.15, [0.55, 1.4, 0.3], { r: [0.4 * Math.sin(i), i * 0.7, 0.5] });
    box(0.5, 0.06, 0.05, 0x6e4c37, PX1 + 0.45, 1.75, 0.04);
    for (let i = 0; i < 3; i++) cil(0.012, 0.012, 0.12, 0xc9b07a, PX1 + 0.27 + i * 0.16, 1.66, 0.07, { seg: 6, contorno: false });
    bolha(0.28, 0x3b4a7a, PX1 + 0.5, 1.35, 0.17, [0.9, 1.2, 0.5]);
    box(1.0, 0.015, 0.6, 0x8a5a44, (PX0 + PX1) / 2, 0.008, 0.45, { contorno: false, sombra: false });
    for (const dx of [-0.12, 0.12]) bolha(0.1, 0xf2f2ee, PX1 + 0.35 + dx, 0.06, 0.4, [0.9, 0.5, 1.9]);

    // ---------- luz: sol baixo atravessando a cortina (laranja), sala na penumbra fria ----------
    // (a cena coloca isto na Scene: devolvidas prontas, mesmas do portão)
    const luzes = new THREE.Group();
    luzes.add(new THREE.HemisphereLight(0x8c97ad, 0x4a3e33, 1.5));
    const brilho = new THREE.SpotLight(0xf3c58a, 16, 9, 0.95, 0.85, 1.3);
    brilho.position.set((JX0 + JX1) / 2, 2.0, 0.45); brilho.target.position.set(1.2, 0.6, 3.2);
    brilho.castShadow = true; brilho.shadow.mapSize.set(1024, 1024); brilho.shadow.bias = -0.002; brilho.shadow.normalBias = 0.04;
    luzes.add(brilho); luzes.add(brilho.target);
    const fresta = new THREE.SpotLight(0xffd9a0, 0, 8, 0.45, 0.6, 1.2);
    fresta.position.set((PX0 + PX1) / 2 - 0.3, 2.2, -1.6); fresta.target.position.set(1.2, 0, 2.2);
    fresta.castShadow = true; fresta.shadow.mapSize.set(1024, 1024); fresta.shadow.bias = -0.002;
    luzes.add(fresta); luzes.add(fresta.target);
    const rosto = new THREE.PointLight(0xc9d6ee, 1.4, 3.2, 1.6);
    rosto.position.set(SX - 1.3, 1.9, SZ - 0.2); sala.add(rosto);
    // poeira no feixe da janela (determinística); `poeira(t)` anima
    const N = 160, pg = new THREE.BufferGeometry(), arr = new Float32Array(N * 3), base = [];
    for (let i = 0; i < N; i++) base.push([JX0 + rnd() * (JX1 - JX0 + 1.5), 0.5 + rnd() * 2.6, 0.4 + rnd() * 3.2, rnd() * 6.28]);
    pg.setAttribute("position", new THREE.BufferAttribute(arr, 3));
    sala.add(new THREE.Points(pg, new THREE.PointsMaterial({ color: 0xffe2b8, size: 0.012, transparent: true, opacity: 0.55, depthWrite: false })));
    function poeira(t) {
      for (let i = 0; i < N; i++) {
        const b = base[i];
        arr[i * 3] = b[0] + Math.sin(t * 0.3 + b[3]) * 0.08; arr[i * 3 + 1] = b[1] + Math.sin(t * 0.21 + b[3] * 2) * 0.06; arr[i * 3 + 2] = b[2];
      }
      pg.attributes.position.needsUpdate = true;
    }

    return { k, X0, X1, Z1, H, JX0, JX1, JY0, JY1, PX0, PX1, PY1, SX, SZ, SL, SEAT, porta, trinco, cortina, fora, luzes, brilho, fresta, rosto, poeira };
  }
  window.Cenarios = window.Cenarios || {};
  window.Cenarios.frente = frente;
})();
