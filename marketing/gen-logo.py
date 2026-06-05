import pathlib
OUT = pathlib.Path("/tmp/logo"); OUT.mkdir(exist_ok=True)

def mark(lupa, topc="#0E7E7B"):
    return (
      '<svg width="120" height="120" viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg">'
      '<defs><linearGradient id="sp" x1="0" y1="0" x2="0" y2="1">'
      '<stop offset="0" stop-color="#16ABA6"/><stop offset="1" stop-color="#54B62E"/>'
      '</linearGradient></defs>'
      '<path d="M3.6 6.2V15.4c0 1.6 3.76 2.9 8.4 2.9s8.4-1.3 8.4-2.9V6.2" fill="url(#sp)"/>'
      f'<ellipse cx="12" cy="6.2" rx="8.4" ry="2.9" fill="{topc}"/>'
      '<ellipse cx="12" cy="6.2" rx="2.2" ry="0.78" fill="#fff" opacity="0.6"/>'
      '<path d="M3.7 10.1c1 1.3 4.4 2.2 8.3 2.2s7.3-.9 8.3-2.2" stroke="#fff" stroke-opacity="0.28" stroke-width="0.9"/>'
      '<path d="M3.7 12.9c1 1.3 4.4 2.2 8.3 2.2s7.3-.9 8.3-2.2" stroke="#fff" stroke-opacity="0.28" stroke-width="0.9"/>'
      f'<circle cx="21.4" cy="21" r="6.2" stroke="{lupa}" stroke-width="2"/>'
      f'<path d="M26.1 25.7 29.3 28.9" stroke="{lupa}" stroke-width="2.6" stroke-linecap="round"/>'
      '<path d="M18.3 21.1 20.6 23.3 24.7 19" stroke="#54B62E" stroke-width="2.1" stroke-linecap="round" stroke-linejoin="round"/>'
      '</svg>')

PAGE = """<!DOCTYPE html><html><head><meta charset="utf-8">
<link href="https://fonts.googleapis.com/css2?family=Sora:wght@700;800&display=swap" rel="stylesheet">
<style>*{{margin:0;padding:0;box-sizing:border-box}}
html,body{{background:transparent}}
.wrap{{width:{w}px;height:{h}px;display:flex;align-items:center;justify-content:center;gap:28px;background:transparent}}
.wm{{font-family:Sora,sans-serif;font-weight:800;font-size:84px;letter-spacing:-.03em;color:{wm1};line-height:1}}
.wm span{{color:{wm2}}}</style></head>
<body><div class="wrap">{mark}<div class="wm">Melhor<span>Filamento</span></div></div></body></html>"""

SYMBOL = """<!DOCTYPE html><html><head><meta charset="utf-8"><style>*{{margin:0;padding:0}}
html,body{{background:transparent}}
.wrap{{width:{w}px;height:{h}px;display:flex;align-items:center;justify-content:center;background:transparent}}
svg{{width:440px;height:440px}}</style></head>
<body><div class="wrap">{mark}</div></body></html>"""

# lockup claro (fundo claro): wordmark escuro + lupa teal-600
(OUT / "horizontal-claro.html").write_text(
    PAGE.format(w=1180, h=300, mark=mark("#0E7E7B"), wm1="#131B1A", wm2="#0E7E7B"), encoding="utf-8")
# lockup escuro (fundo escuro): wordmark claro + lupa teal-400
(OUT / "horizontal-escuro.html").write_text(
    PAGE.format(w=1180, h=300, mark=mark("#2DD4BF"), wm1="#FFFFFF", wm2="#5FB3AF"), encoding="utf-8")
# simbolo isolado (lupa teal-600), 512x512
sym = mark("#0E7E7B").replace('width="120" height="120"', 'width="440" height="440"')
(OUT / "simbolo.html").write_text(SYMBOL.format(w=512, h=512, mark=sym), encoding="utf-8")

print("logos HTML:", [p.name for p in OUT.glob("*.html")])
