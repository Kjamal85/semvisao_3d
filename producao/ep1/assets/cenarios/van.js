// Baú da van de quarentena por dentro (cópia fiel de compositions/van.html, aprovado no EP1), para as cenas
// novas. van.html NÃO usa este módulo (não mexer no aprovado). Sem a rua quente lá fora, sem a mãe e sem
// pessoas: cada cena põe o que precisa.
//   const V = Cenarios.vanBau(grupo);   // x 0 (divisória da cabine) .. L (portas de trás); z -W..W
//   V.portas(u)  0 = fechadas · 1 = abertas (abrem para fora, como no EP1: 1,75 rad)
(function () {
  function vanBau(raiz) {
    const k = Cena.kit(raiz, 69069);                   // mesma semente do van.html
    const { box, cil, M } = k;
    const luz = (c) => new THREE.MeshBasicMaterial({ color: c });
    const L = 4.2, W = 1.2, H = 2.7, CHAPA = 0xa9afb4;
    box(L, 0.06, 2 * W, 0x2a2c31, L / 2, -0.03, 0, { contorno: false, sombra: false });            // piso de borracha
    for (let i = 0; i < 14; i++) box(L, 0.012, 0.03, 0x3a3d44, L / 2, 0.004, -W + 0.1 + i * 0.17, { contorno: false, sombra: false });
    box(L, 0.08, 2 * W, 0xc9cdd0, L / 2, H + 0.04, 0, { contorno: false });                         // teto
    for (const s of [-1, 1]) {
      box(L, H, 0.08, CHAPA, L / 2, H / 2, s * (W + 0.04), { contorno: false });                     // laterais
      for (let i = 0; i < 9; i++) box(0.05, H - 0.2, 0.04, 0xc2c7ca, 0.25 + i * 0.47, H / 2, s * (W - 0.01), { contorno: false });
      box(L - 0.6, 0.12, 0.5, 0x4a4f5a, L / 2 + 0.1, 0.48, s * (W - 0.27));                         // banco
      box(L - 0.6, 0.42, 0.06, 0x3a3d44, L / 2 + 0.1, 0.21, s * (W - 0.5), { contorno: false });
      box(L - 0.6, 0.55, 0.1, 0x4a4f5a, L / 2 + 0.1, 1.0, s * (W - 0.06));
      for (let i = 0; i < 4; i++) {                                                                // alças
        const ax = 0.9 + i * 0.85;
        cil(0.012, 0.012, 0.35, 0x6a6d74, ax, H - 0.18, s * (W - 0.35), { seg: 4, contorno: false });
        const al = new THREE.Mesh(new THREE.TorusGeometry(0.06, 0.012, 6, 14), M(0x2a2c31)); al.position.set(ax, H - 0.4, s * (W - 0.35)); raiz.add(al);
      }
    }
    box(0.08, H, 2 * W, 0xb9bec2, -0.04, H / 2, 0, { contorno: false });                            // divisória da cabine
    box(0.04, 0.4, 0.7, 0x151820, 0.0, 1.95, 0, { contorno: false });
    for (let i = 0; i < 4; i++) box(0.05, 0.4, 0.02, 0x8a8f96, 0.02, 1.95, -0.27 + i * 0.18, { contorno: false });
    box(0.6, 0.35, 0.02, 0x1a2030, 2.0, 2.05, -W + 0.02, { mat: luz(0x1a2236), contorno: false });   // janelinha gradeada
    for (let i = 0; i < 4; i++) box(0.02, 0.35, 0.03, 0x8a8f96, 1.78 + i * 0.15, 2.05, -W + 0.04, { contorno: false });
    box(0.4, 0.28, 0.2, 0xe9e9e4, 0.35, 1.7, W - 0.15); box(0.05, 0.16, 0.21, 0xc8102e, 0.35, 1.7, W - 0.15, { contorno: false }); box(0.16, 0.05, 0.21, 0xc8102e, 0.35, 1.7, W - 0.15, { contorno: false });
    cil(0.08, 0.08, 0.45, 0xc8102e, 0.25, 0.3, -W + 0.2);
    box(0.5, 0.05, 0.25, 0, 2.1, H - 0.03, 0, { mat: luz(0xdce8f2), contorno: false });           // domo
    const portas = [];
    for (const s of [-1, 1]) {
      const p = new THREE.Group(); p.position.set(L, 0, s * W); raiz.add(p); portas.push({ p, s });
      box(0.06, H, W, CHAPA, 0, H / 2, -s * W / 2, { pai: p });
      box(0.03, 0.6, 0.45, 0x1a2236, 0.035, 1.9, -s * W / 2, { pai: p, mat: luz(0x1f2840), contorno: false });
      box(0.02, 0.06, 0.25, 0x6a6d74, 0.07, 1.2, -s * W * 0.85, { pai: p, contorno: false });        // maçaneta por fora
    }
    function abre(u) { for (const { p, s } of portas) p.rotation.y = s * 1.75 * Math.min(1, Math.max(0, u)); }
    return { k, L, W, H, SEAT: 0.54, portas: abre };
  }
  window.Cenarios = Object.assign(window.Cenarios || {}, { vanBau });
})();
