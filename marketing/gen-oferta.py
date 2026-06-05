# -*- coding: utf-8 -*-
import base64, pathlib
OUT = pathlib.Path("/tmp/oferta"); OUT.mkdir(exist_ok=True)
IMGB64 = base64.b64encode(open("/tmp/prod_petg.png","rb").read()).decode()
IMG = "data:image/webp;base64," + IMGB64

# dados REAIS (melhorfilamento.com.br/ofertas em 2026)
D = dict(
  brand="NATIONAL 3D",
  name="Filamento PETG Preto",
  spec="1,75 mm · 1 kg",
  old="R$ 139,90",
  price="R$ 98,91",
  off="−29%",
  perkg="R$ 98,91/kg",
  url="melhorfilamento.com.br",
)

def mark(lupa="#0E7E7B", topc="#0E7E7B"):
    return (
      '<svg width="56" height="56" viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg">'
      '<defs><linearGradient id="sp" x1="0" y1="0" x2="0" y2="1">'
      '<stop offset="0" stop-color="#16ABA6"/><stop offset="1" stop-color="#54B62E"/></linearGradient></defs>'
      '<path d="M3.6 6.2V15.4c0 1.6 3.76 2.9 8.4 2.9s8.4-1.3 8.4-2.9V6.2" fill="url(#sp)"/>'
      f'<ellipse cx="12" cy="6.2" rx="8.4" ry="2.9" fill="{topc}"/>'
      '<ellipse cx="12" cy="6.2" rx="2.2" ry="0.78" fill="#fff" opacity="0.6"/>'
      '<path d="M3.7 10.1c1 1.3 4.4 2.2 8.3 2.2s7.3-.9 8.3-2.2" stroke="#fff" stroke-opacity="0.28" stroke-width="0.9"/>'
      '<path d="M3.7 12.9c1 1.3 4.4 2.2 8.3 2.2s7.3-.9 8.3-2.2" stroke="#fff" stroke-opacity="0.28" stroke-width="0.9"/>'
      f'<circle cx="21.4" cy="21" r="6.2" stroke="{lupa}" stroke-width="2"/>'
      f'<path d="M26.1 25.7 29.3 28.9" stroke="{lupa}" stroke-width="2.6" stroke-linecap="round"/>'
      '<path d="M18.3 21.1 20.6 23.3 24.7 19" stroke="#54B62E" stroke-width="2.1" stroke-linecap="round" stroke-linejoin="round"/>'
      '</svg>')

LOGO = ('<div style="display:flex;align-items:center;gap:13px">' + mark() +
  '<div style="font-family:Sora;font-weight:700;font-size:32px;letter-spacing:-.02em;color:#131B1A">'
  'Melhor<span style="color:#0A6967">Filamento</span></div></div>')

BASECSS = """
*{box-sizing:border-box;margin:0;padding:0}
html,body{overflow:hidden}
.card{background:radial-gradient(680px 460px at 92% 4%,rgba(14,126,123,.12),transparent 60%),#F6F9F8;
  display:flex;flex-direction:column;font-family:Manrope,sans-serif;color:#131B1A}
.eye{font-family:'Space Mono',monospace;font-weight:700;letter-spacing:.14em;text-transform:uppercase;color:#0A6967}
.imgwrap{position:relative;background:#fff;border-radius:34px;box-shadow:0 30px 60px -28px rgba(12,31,35,.35);
  display:flex;align-items:center;justify-content:center}
.imgwrap img{width:84%;height:84%;object-fit:contain}
.badge{position:absolute;top:24px;left:24px;background:linear-gradient(135deg,#54B62E,#357A1C);color:#fff;
  font-family:Sora;font-weight:800;border-radius:999px;display:flex;align-items:center;justify-content:center}
.brand{font-family:'Space Mono',monospace;font-weight:700;letter-spacing:.12em;color:#0A6967}
h1{font-family:Sora,sans-serif;font-weight:800;letter-spacing:-.03em;color:#0C1F23;line-height:1.03}
.spec{color:#5b6b6a}
.old{color:#9aa6a4;text-decoration:line-through;font-weight:600}
.price{font-family:Sora,sans-serif;font-weight:800;color:#2f8f1f;letter-spacing:-.02em}
.kg{display:inline-flex;align-items:center;background:#E4F4DC;color:#2f7d1c;font-family:'Space Mono',monospace;font-weight:700;border-radius:999px}
.note{color:#566;}
.bar{height:9px;border-radius:99px;background:linear-gradient(90deg,#0E7E7B,#54B62E)}
.tag{font-family:'Space Mono',monospace;font-weight:700;letter-spacing:.1em;text-transform:uppercase;color:#5b6b6a}
.tag .h{color:#357A1C}
.url{font-family:Sora;font-weight:700;color:#0A6967}
"""

SQUARE = """<!DOCTYPE html><html><head><meta charset="utf-8">
<link href="https://fonts.googleapis.com/css2?family=Sora:wght@600;700;800&family=Manrope:wght@500;600;700&family=Space+Mono:wght@700&display=swap" rel="stylesheet">
<style>{css}
html,body{{width:1080px;height:1080px}}
.card{{width:1080px;height:1080px;padding:80px}}
.top{{display:flex;align-items:center;justify-content:space-between}}
.eye{{font-size:23px}}
.main{{flex:1;display:flex;align-items:center;gap:56px;margin:8px 0}}
.imgwrap{{width:430px;height:430px;flex:none}}
.badge{{width:118px;height:118px;font-size:34px;flex-direction:column;line-height:1}}
.badge small{{font-family:'Space Mono',monospace;font-weight:700;font-size:15px;letter-spacing:.06em;opacity:.9;margin-top:2px}}
.brand{{font-size:24px}}
h1{{font-size:62px;margin:8px 0 4px}}
.spec{{font-size:30px}}
.prow{{display:flex;align-items:baseline;gap:20px;margin-top:26px}}
.old{{font-size:34px}}
.price{{font-size:92px}}
.kg{{font-size:26px;padding:10px 20px;margin-top:20px}}
.note{{font-size:26px;margin-top:18px;max-width:430px;line-height:1.4}}
.foot{{display:flex;align-items:center;justify-content:space-between}}
.bar{{width:150px}}
.tag{{font-size:21px}}
.url{{font-size:28px;margin-top:4px}}
</style></head><body>
<div class="card">
  <div class="top">{logo}<div class="eye">🔥 Oferta do dia</div></div>
  <div class="main">
    <div class="imgwrap"><div class="badge">{off}<small>OFF</small></div><img src="{img}"></div>
    <div>
      <div class="brand">{brand}</div>
      <h1>{name}</h1>
      <div class="spec">{spec}</div>
      <div class="prow"><span class="old">{old}</span><span class="price">{price}</span></div>
      <span class="kg">{perkg}</span>
      <div class="note">Menor preço encontrado — já com o frete pro seu CEP.</div>
    </div>
  </div>
  <div class="foot">
    <div><div class="bar" style="margin-bottom:14px"></div>
      <div class="tag">Compare. Descubra. <span class="h">Compre melhor.</span></div></div>
    <div class="url">{url}</div>
  </div>
</div></body></html>"""

STORY = """<!DOCTYPE html><html><head><meta charset="utf-8">
<link href="https://fonts.googleapis.com/css2?family=Sora:wght@600;700;800&family=Manrope:wght@500;600;700&family=Space+Mono:wght@700&display=swap" rel="stylesheet">
<style>{css}
html,body{{width:1080px;height:1920px}}
.card{{width:1080px;height:1920px;padding:200px 90px 240px}}
.eye{{font-size:27px;margin:18px 0 30px}}
.imgwrap{{width:600px;height:600px;align-self:center}}
.badge{{width:140px;height:140px;font-size:42px;flex-direction:column;line-height:1}}
.badge small{{font-family:'Space Mono',monospace;font-weight:700;font-size:18px;letter-spacing:.06em;opacity:.9;margin-top:3px}}
.info{{margin-top:54px}}
.brand{{font-size:28px}}
h1{{font-size:78px;margin:10px 0 6px}}
.spec{{font-size:36px}}
.prow{{display:flex;align-items:baseline;gap:24px;margin-top:30px}}
.old{{font-size:42px}}
.price{{font-size:118px}}
.kg{{font-size:32px;padding:12px 26px;margin-top:26px}}
.note{{font-size:34px;margin-top:24px;line-height:1.4}}
.foot{{margin-top:auto}}
.bar{{width:180px;margin-bottom:18px}}
.tag{{font-size:26px}}
.url{{font-size:36px;margin-top:6px}}
</style></head><body>
<div class="card">
  <div style="display:flex;justify-content:space-between;align-items:center">{logo}</div>
  <div class="eye">🔥 Oferta do dia</div>
  <div class="imgwrap"><div class="badge">{off}<small>OFF</small></div><img src="{img}"></div>
  <div class="info">
    <div class="brand">{brand}</div>
    <h1>{name}</h1>
    <div class="spec">{spec}</div>
    <div class="prow"><span class="old">{old}</span><span class="price">{price}</span></div>
    <div><span class="kg">{perkg}</span></div>
    <div class="note">Menor preço encontrado — já com o frete pro seu CEP.</div>
  </div>
  <div class="foot">
    <div class="bar"></div>
    <div class="tag">Compare. Descubra. <span class="h">Compre melhor.</span></div>
    <div class="url">{url}</div>
  </div>
</div></body></html>"""

(OUT / "oferta-produto-quadrado.html").write_text(
  SQUARE.format(css=BASECSS, logo=LOGO, img=IMG, **D), encoding="utf-8")
(OUT / "oferta-produto-story.html").write_text(
  STORY.format(css=BASECSS, logo=LOGO, img=IMG, **D), encoding="utf-8")
print("oferta HTML:", [p.name for p in OUT.glob("*.html")])
