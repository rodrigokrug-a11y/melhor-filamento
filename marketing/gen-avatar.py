# -*- coding: utf-8 -*-
import pathlib
OUT = pathlib.Path("/tmp/avatar"); OUT.mkdir(exist_ok=True)

def mark(lupa, topc="#0E7E7B"):
    # símbolo grande, centralizado; viewBox 0 0 32 32
    return (
      '<svg viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg" '
      'style="width:620px;height:620px">'
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

TPL = """<!DOCTYPE html><html><head><meta charset="utf-8"><style>
*{{margin:0;padding:0;box-sizing:border-box}}
html,body{{width:1080px;height:1080px;overflow:hidden}}
.wrap{{width:1080px;height:1080px;{bg}display:flex;align-items:center;justify-content:center}}
svg{{display:block}}
</style></head><body><div class="wrap">{mark}</div></body></html>"""

VARIANTS = {
 "navy": dict(
   bg="background:radial-gradient(680px 520px at 78% 14%,rgba(84,182,46,.20),transparent 60%),"
      "radial-gradient(700px 620px at 16% 84%,rgba(14,126,123,.45),transparent 58%),#0C1F23;",
   mark=mark("#2DD4BF")),
 "claro": dict(
   bg="background:radial-gradient(640px 520px at 80% 12%,rgba(84,182,46,.10),transparent 60%),#F6F9F8;",
   mark=mark("#0E7E7B")),
}

for name, v in VARIANTS.items():
    (OUT / (name + ".html")).write_text(TPL.format(bg=v["bg"], mark=v["mark"]), encoding="utf-8")
print("avatars HTML:", [p.name for p in OUT.glob("*.html")])
