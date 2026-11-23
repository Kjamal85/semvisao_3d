// Pós-produção do semvisão (Three.js r155, global THREE): um passe de tela cheia por cima
// da cena 3D. Tudo depende só do tempo da timeline -> todo render sai idêntico.
//
//   const pos = Pos.criar(renderer, 1920, 1080);
//   pos.render(scene, cam, t, { grao: Pos.GRAO.medio, fumaca: 0.6, dessat: 0.35 });
//
// grao    0..1  granulado de filme (mais forte nas sombras, como película 16 mm)
// fumaca  0..1  vinheta de fumaça do MODO CEGO — "olho se fechando": 0 = aberto, 1 = fechado.
//               Fecha mais em cima e embaixo (pálpebra) e a borda ondula como fumaça.
// dessat  0..1  o mundo esvaziando de cor (modo cego)
(function () {
  const GRAO = { nenhum: 0, baixo: 0.2, leve: 0.35, medio: 0.6, forte: 1.0 };

  const vert = `
    varying vec2 vUv;
    void main() { vUv = uv; gl_Position = vec4(position.xy, 0.0, 1.0); }`;

  const frag = `
    uniform sampler2D tCena;
    uniform vec2 res;
    uniform float tempo, quadro, grao, fumaca, dessat;
    varying vec2 vUv;

    float hash(vec2 p) { p = fract(p * vec2(443.897, 441.423)); p += dot(p, p.yx + 19.19); return fract((p.x + p.y) * p.x); }
    float ruido(vec2 p) {
      vec2 i = floor(p), f = fract(p); f = f * f * (3.0 - 2.0 * f);
      return mix(mix(hash(i), hash(i + vec2(1, 0)), f.x), mix(hash(i + vec2(0, 1)), hash(i + vec2(1, 1)), f.x), f.y);
    }
    float fbm(vec2 p) { float v = 0.0, a = 0.5; for (int k = 0; k < 5; k++) { v += a * ruido(p); p *= 2.03; a *= 0.5; } return v; }

    void main() {
      // o alvo guarda cor linear; o efeito trabalha em sRGB (perceptual) e sai direto
      vec3 lin = texture2D(tCena, vUv).rgb;
      vec3 cor = mix(lin * 12.92, 1.055 * pow(lin, vec3(1.0 / 2.4)) - 0.055, step(0.0031308, lin));

      // dessaturação (modo cego)
      float l = dot(cor, vec3(0.299, 0.587, 0.114));
      cor = mix(cor, vec3(l), dessat);

      // vinheta de fumaça: elipse "pálpebra" + borda turbulenta que deriva devagar
      if (fumaca > 0.0) {
        vec2 c = vUv - 0.5; c.x *= res.x / res.y;
        vec2 e = vec2(c.x * 0.62, c.y * 1.15);                    // fecha mais em cima/embaixo
        float d = length(e);
        vec2 q = vUv * vec2(3.2, 1.8);
        float n = fbm(q + vec2(tempo * 0.05, -tempo * 0.035) + fbm(q * 1.7 - tempo * 0.04));
        float m = fbm(q * 2.6 + vec2(-tempo * 0.07, tempo * 0.05));  // fiapos menores
        float raio = mix(0.95, 0.06, fumaca);                      // aberto -> fechado
        float borda = smoothstep(raio - 0.3, raio + 0.1, d + (n - 0.5) * 0.55 + (m - 0.5) * 0.18);
        // fumaça: fundo quase preto com volutas cinza mais claras na faixa de transição
        float voluta = smoothstep(0.45, 0.85, n * 0.7 + m * 0.5) * (1.0 - smoothstep(0.55, 1.0, borda));
        vec3 fumo = mix(vec3(0.03, 0.032, 0.04), vec3(0.2, 0.21, 0.23), voluta);
        cor = mix(cor, fumo, borda);
      }

      // grão: novo a cada quadro, grãos de ~1,6 px, mais visível nas sombras e meios-tons
      if (grao > 0.0) {
        vec2 px = floor(gl_FragCoord.xy / 1.6);
        float g = hash(px + quadro * 17.31) + hash(px * 1.37 + quadro * 3.71) - 1.0;   // ~triangular
        float peso = 1.0 - smoothstep(0.35, 0.95, l);               // sombras granulam mais
        cor += g * grao * 0.11 * (0.45 + 0.55 * peso);
        cor += (vec3(hash(px + quadro), hash(px - quadro), hash(px.yx + quadro)) - 0.5) * grao * 0.018; // leve cor no grão
      }
      gl_FragColor = vec4(clamp(cor, 0.0, 1.0), 1.0);
    }`;

  function criar(renderer, w, h) {
    const alvo = new THREE.WebGLRenderTarget(w, h, { samples: 4 });
    const mat = new THREE.ShaderMaterial({
      uniforms: {
        tCena: { value: alvo.texture }, res: { value: new THREE.Vector2(w, h) },
        tempo: { value: 0 }, quadro: { value: 0 }, grao: { value: 0 }, fumaca: { value: 0 }, dessat: { value: 0 },
      },
      vertexShader: vert, fragmentShader: frag, depthTest: false, depthWrite: false,
    });
    const tela = new THREE.Scene();
    tela.add(new THREE.Mesh(new THREE.PlaneGeometry(2, 2), mat));
    const camTela = new THREE.OrthographicCamera(-1, 1, 1, -1, 0, 1);
    // com o renderer compartilhado (cena.js), o passe inteiro é adiado e feito só pela cena visível;
    // dentro do passe usa-se o renderer de verdade (r), senão a tela seria adiada de novo
    const r = renderer.base || renderer;
    function passe(scene, cam, t, p) {
      r.setRenderTarget(alvo); r.render(scene, cam); r.setRenderTarget(null);
      const u = mat.uniforms;
      u.tempo.value = t; u.quadro.value = Math.floor(t * 30) % 1000;   // 30 fps
      u.grao.value = p.grao || 0; u.fumaca.value = p.fumaca || 0; u.dessat.value = p.dessat || 0;
      r.render(tela, camTela);
    }
    return {
      render(scene, cam, t, p) {
        const q = Object.assign({}, p || {});
        if (renderer.agendar) return renderer.agendar(() => passe(scene, cam, t, q));
        passe(scene, cam, t, q);
      },
    };
  }

  window.Pos = { GRAO, criar };
})();
