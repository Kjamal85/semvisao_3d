// Kit de montagem de cenários (Three.js r155, global THREE). Mesmo traço em todos:
// cel-shading em 3 faixas, contorno fino, sombra projetada e recebida, variedade com semente.
//
//   const k = Cena.kit(grupo, 20261122);
//   k.box(w, h, d, cor, x, y, z, { r:[rx,ry,rz], pai, contorno:false, sombra:false });
//   k.cil(rTopo, rBase, h, cor, x, y, z, { r, pai, seg, mat, contorno, sombra });
//   k.bolha(r, cor, x, y, z, [sx,sy,sz], { r, pai, contorno });
//   k.rnd()  -> 0..1 determinístico
(function () {
  function prng(seed) { // mulberry32: mesma sequência em todo render
    return function () {
      seed |= 0; seed = (seed + 0x6D2B79F5) | 0;
      let t = Math.imul(seed ^ (seed >>> 15), 1 | seed);
      t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
      return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
    };
  }

  function kit(raiz, seed) {
    // luz, meio-tom, sombra (sombra levantada para não virar tela preta no celular)
    const grad = new THREE.DataTexture(new Uint8Array([100, 100, 100, 255, 170, 170, 170, 255, 255, 255, 255, 255]), 3, 1);
    grad.minFilter = grad.magFilter = THREE.NearestFilter; grad.needsUpdate = true;
    const mats = {};
    const M = (c) => mats[c] || (mats[c] = new THREE.MeshToonMaterial({ color: c, gradientMap: grad }));
    const linha = new THREE.MeshBasicMaterial({ color: 0x15161b, side: THREE.BackSide });

    function box(w, h, d, c, x, y, z, opt) {
      opt = opt || {};
      const geo = new THREE.BoxGeometry(w, h, d);
      const m = new THREE.Mesh(geo, opt.mat || M(c)); m.position.set(x, y, z);
      if (opt.r) m.rotation.set(opt.r[0], opt.r[1], opt.r[2]);
      m.castShadow = opt.sombra !== false; m.receiveShadow = true;
      (opt.pai || raiz).add(m);
      if (opt.contorno !== false) {
        const o = new THREE.Mesh(geo, linha); o.scale.set(1 + 0.025 / w, 1 + 0.025 / h, 1 + 0.025 / d);
        m.add(o);
      }
      return m;
    }
    function cil(rt, rb, h, c, x, y, z, opt) {
      opt = opt || {};
      const geo = new THREE.CylinderGeometry(rt, rb, h, opt.seg || 20);
      const m = new THREE.Mesh(geo, opt.mat || M(c)); m.position.set(x, y, z);
      if (opt.r) m.rotation.set(opt.r[0], opt.r[1], opt.r[2]);
      m.castShadow = opt.sombra !== false; m.receiveShadow = true;
      (opt.pai || raiz).add(m);
      if (opt.contorno !== false) { const o = new THREE.Mesh(geo, linha); o.scale.multiplyScalar(1.04); m.add(o); }
      return m;
    }
    function bolha(r, c, x, y, z, s, opt) { // volume macio: almofada, lençol, roupa
      opt = opt || {};
      const geo = new THREE.SphereGeometry(r, 18, 12);
      const m = new THREE.Mesh(geo, opt.mat || M(c)); m.position.set(x, y, z); m.scale.set(s[0], s[1], s[2]);
      if (opt.r) m.rotation.set(opt.r[0], opt.r[1], opt.r[2]);
      m.castShadow = true; m.receiveShadow = true; (opt.pai || raiz).add(m);
      if (opt.contorno !== false) { const o = new THREE.Mesh(geo, linha); o.scale.multiplyScalar(1.03); m.add(o); }
      return m;
    }
    return { M, grad, linha, box, cil, bolha, rnd: prng(seed || 1) };
  }

  // renderer padrão das cenas: 1920x1080, sombras suaves, canvas dentro do palco
  function renderer(palcoId) {
    const r = new THREE.WebGLRenderer({ antialias: true, preserveDrawingBuffer: true });
    r.setPixelRatio(1); r.setSize(1920, 1080);
    r.shadowMap.enabled = true; r.shadowMap.type = THREE.PCFSoftShadowMap;
    document.getElementById(palcoId).appendChild(r.domElement);
    return r;
  }

  const suave = (u) => 0.5 - 0.5 * Math.cos(Math.PI * Math.min(1, Math.max(0, u))); // sine in-out

  window.Cena = { kit, renderer, prng, suave };
})();
