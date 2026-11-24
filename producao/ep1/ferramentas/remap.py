"""Remapeia o tempo de uma cena (compositions/<id>.html) sem refazer a animação.
keys: [(tau_novo, t_original), ...] crescentes; depois do último ponto, inclinação 1.
Ajusta: render() passa a usar __remap(estado.t); duração da timeline e dos clips; data-start dos <audio> da cena.
"""
import re, sys


def inversa(keys, t):
    for (a0, b0), (a1, b1) in zip(keys, keys[1:]):
        if b0 <= t <= b1:
            return a0 + (a1 - a0) * (t - b0) / (b1 - b0)
    a, b = keys[-1]
    return a + (t - b)


def aplicar(path, keys, total, velho, audio_fixo=None):
    s = open(path, encoding="utf-8").read()
    assert "__remap" not in s, "já remapeada"
    js = "[" + ",".join(f"[{a},{b}]" for a, b in keys) + "]"
    fn = ("      // montagem: tempo remapeado (tau da montagem -> t da animação aprovada)\n"
          f"      const __K = {js};\n"
          "      const __remap = (x) => { for (let i = 1; i < __K.length; i++) if (x <= __K[i][0]) { const [a0, b0] = __K[i - 1], [a1, b1] = __K[i]; return b0 + (b1 - b0) * (x - a0) / (a1 - a0); } const [a, b] = __K[__K.length - 1]; return b + (x - a); };\n")
    i = s.index("      function render()")
    s = s[:i] + fn + s[i:]
    n = s.count("const t = estado.t;")
    assert n == 1, n
    s = s.replace("const t = estado.t;", "const t = __remap(estado.t);")
    old = re.search(r"tl\.fromTo\(estado, \{ t: 0 \}, \{ t: (\w+), duration: (\w+), ease: \"none\" \}, 0\);", s)
    s = s.replace(old.group(0), f'tl.fromTo(estado, {{ t: 0 }}, {{ t: {total}, duration: {total}, ease: "none" }}, 0);')
    s = s.replace(f'data-duration="{velho}"', f'data-duration="{total}"')

    def mov(m):
        ini = float(m.group(2))
        novo = audio_fixo.get(m.group(1), None) if audio_fixo else None
        if novo is None:
            novo = round(inversa(keys, ini), 3)
        return m.group(0).replace(f'data-start="{m.group(2)}"', f'data-start="{novo}"')
    s = re.sub(r'<audio id="([\w-]+)"[^>]*?data-start="([0-9.]+)"', mov, s)
    open(path, "w", encoding="utf-8").write(s)
    print(path, "->", total, "s;", re.findall(r'<audio id="([\w-]+)"[^>]*?data-start="([0-9.]+)"', s))


if __name__ == "__main__":
    import json
    p, keys, total, velho = sys.argv[1], json.loads(sys.argv[2]), sys.argv[3], sys.argv[4]
    aplicar(p, [tuple(k) for k in keys], total, velho)
