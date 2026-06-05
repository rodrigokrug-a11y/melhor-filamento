# -*- coding: utf-8 -*-
import pathlib
OUT = pathlib.Path("/tmp/stories"); OUT.mkdir(exist_ok=True)

THEMES = {
 "navy": dict(bg="background:radial-gradient(900px 700px at 85% 6%,rgba(84,182,46,.18),transparent 60%),radial-gradient(900px 800px at -10% 70%,rgba(14,126,123,.4),transparent 55%),#0C1F23;",
   text="#fff", sub="#bcd3d0", eye="#5FB3AF", g="#9BE06A", taghl="#9BE06A", logo="mark",
   hole="#0C1F23", lupa="#2DD4BF", topc="#0E7E7B", wm2="#5FB3AF"),
 "paper": dict(bg="background:#F6F9F8;", text="#131B1A", sub="#4F5D5C", eye="#0A6967", g="#357A1C", taghl="#357A1C", logo="mark",
   hole="#F6F9F8", lupa="#0E7E7B", topc="#0E7E7B", wm2="#0A6967"),
 "grad": dict(bg="background:linear-gradient(160deg,#0E7E7B 0%,#54B62E 100%);",
   text="#fff", sub="rgba(255,255,255,.92)", eye="rgba(255,255,255,.92)", g="#0C1F23", taghl="#0C1F23", logo="white"),
 "teal": dict(bg="background:linear-gradient(165deg,#0A6967 0%,#063432 100%);",
   text="#fff", sub="#cde8e6", eye="#9BD0CD", g="#9BE06A", taghl="#9BE06A", logo="white"),
}

PIECES = [
 dict(file="01-lancamento", theme="navy", eyebrow="NO AR · BRASIL",
   head='O comparador de preços de <span class="g">impressão 3D</span> do Brasil',
   sub="Filamentos, resinas e impressoras de várias lojas — num lugar só.",
   url="melhorfilamento.com.br"),
 dict(file="02-economia", theme="paper", eyebrow="COMPARE ANTES DE COMPRAR",
   head='O mesmo filamento pode custar <span class="g">R$ 50 a mais.</span>',
   sub="A gente te mostra onde está mais barato — já com o frete pro seu CEP.",
   url="melhorfilamento.com.br"),
 dict(file="03-ofertas", theme="grad", eyebrow="🔥 OFERTAS DO DIA",
   head="As maiores <u>quedas de preço</u>, todo dia.",
   sub="Filamento e resina com desconto de verdade — a gente acompanha o histórico.",
   url="melhorfilamento.com.br/ofertas"),
 dict(file="04-ia", theme="navy", eyebrow="📷 IA · DIAGNÓSTICO POR FOTO",
   head='Peça com defeito? <span class="g">Manda a foto.</span>',
   sub="A IA diz o que houve e como corrigir. Grátis — com assistente que tira dúvidas na hora.",
   url="melhorfilamento.com.br/ia"),
 dict(file="05-ferramentas", theme="paper", eyebrow="🧰 FERRAMENTAS GRÁTIS",
   head='Calculadoras pra <span class="g">imprimir melhor.</span>',
   sub="Custo real da impressão, custo pelo G-code, energia, calibração e mais.",
   url="melhorfilamento.com.br/ferramentas"),
 dict(file="06-preco-kg", theme="teal", eyebrow="DICA DE COMPRA",
   head='Compare por <span class="g">preço/kg.</span><br>Não pela embalagem.',
   sub="Rolo menor às vezes sai mais caro o quilo. A gente já mostra pronto.",
   url="melhorfilamento.com.br"),
]

def mark_svg(hole, lupa, topc):
    return (
      '<svg width="62" height="62" viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg">'
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

def logo_html(t):
    if t["logo"] == "mark":
        svg = mark_svg(t["hole"], t["lupa"], t["topc"])
        return ('<div style="display:flex;align-items:center;gap:14px">' + svg +
          f'<div style="font-family:Sora;font-weight:700;font-size:36px;letter-spacing:-.02em;color:{t["text"]}">'
          f'Melhor<span style="color:{t["wm2"]}">Filamento</span></div></div>')
    return ('<div style="font-family:Sora;font-weight:700;font-size:40px;color:#fff;letter-spacing:-.02em">'
            'Melhor<span style="color:rgba(255,255,255,.7)">Filamento</span></div>')

TPL = """<!DOCTYPE html><html><head><meta charset="utf-8">
<link href="https://fonts.googleapis.com/css2?family=Sora:wght@600;700;800&family=Manrope:wght@500;600;700&family=Space+Mono:wght@700&display=swap" rel="stylesheet">
<style>
*{{box-sizing:border-box;margin:0;padding:0}}
html,body{{width:1080px;height:1920px;overflow:hidden}}
.card{{width:1080px;height:1920px;{bg}padding:200px 96px 240px;display:flex;flex-direction:column;font-family:Manrope,sans-serif}}
.mid{{flex:1;display:flex;flex-direction:column;justify-content:center}}
.eye{{font-family:'Space Mono',monospace;font-weight:700;font-size:27px;letter-spacing:.16em;text-transform:uppercase;color:{eye}}}
h1{{font-family:Sora,sans-serif;font-weight:800;font-size:96px;line-height:1.05;letter-spacing:-.03em;color:{text};margin:32px 0 0}}
h1 .g{{color:{g}}}
h1 u{{text-decoration-color:{g};text-underline-offset:10px;text-decoration-thickness:8px}}
.sub{{font-size:42px;line-height:1.42;color:{subcol};margin-top:40px;max-width:840px}}
.bar{{height:12px;width:180px;border-radius:99px;background:linear-gradient(90deg,#0E7E7B,#54B62E);margin-bottom:28px}}
.tag{{font-family:'Space Mono',monospace;font-weight:700;font-size:26px;letter-spacing:.12em;text-transform:uppercase;color:{subcol}}}
.tag .h{{color:{taghl}}}
.url{{font-family:Sora;font-weight:700;font-size:36px;color:{eye};margin-top:8px}}
</style></head><body>
<div class="card">
  <div>{logo}</div>
  <div class="mid">
    <div class="eye">{eyebrow}</div>
    <h1>{head}</h1>
    <div class="sub">{sub}</div>
  </div>
  <div>
    <div class="bar"></div>
    <div class="tag">Compare. Descubra. <span class="h">Compre melhor.</span></div>
    <div class="url">{url}</div>
  </div>
</div></body></html>"""

for p in PIECES:
    t = THEMES[p["theme"]]
    htmlstr = TPL.format(bg=t["bg"], text=t["text"], subcol=t["sub"], eye=t["eye"],
        g=t["g"], taghl=t["taghl"], logo=logo_html(t),
        eyebrow=p["eyebrow"], head=p["head"], sub=p["sub"], url=p["url"])
    (OUT / (p["file"] + ".html")).write_text(htmlstr, encoding="utf-8")

print("Stories HTML:", len(PIECES), "em", OUT)
