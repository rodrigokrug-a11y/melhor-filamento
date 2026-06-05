# -*- coding: utf-8 -*-
import re, html, pathlib

SRC = pathlib.Path("/Users/rodrigokrug/melhorfilamento/marketing/plano-de-negocios.md")
OUTHTML = pathlib.Path("/tmp/plano.html")
raw = SRC.read_text(encoding="utf-8")

# separa capa (topo) do corpo no primeiro divisor isolado
parts = raw.split("\n---\n", 1)
body_src = parts[1] if len(parts) > 1 else raw

def inline(s):
    s = html.escape(s)
    s = re.sub(r"\*\*(.+?)\*\*", r"<strong>\1</strong>", s)
    s = re.sub(r"(?<![\*\w])\*(?!\s)(.+?)(?<!\s)\*(?![\*\w])", r"<em>\1</em>", s)
    s = re.sub(r"`(.+?)`", r"<code>\1</code>", s)
    return s

lines = body_src.split("\n")
i, out = 0, []
while i < len(lines):
    st = lines[i].strip()
    if not st:
        i += 1; continue
    if st == "---":
        out.append("<hr>"); i += 1; continue
    m = re.match(r"^(#{1,4})\s+(.*)", st)
    if m:
        lvl = len(m.group(1)); out.append("<h%d>%s</h%d>" % (lvl, inline(m.group(2)), lvl)); i += 1; continue
    # tabela
    if st.startswith("|") and i + 1 < len(lines) and "---" in lines[i+1] and lines[i+1].strip().startswith(("|", ":", "-")):
        header = [c.strip() for c in st.strip().strip("|").split("|")]
        i += 2
        rows = []
        while i < len(lines) and lines[i].strip().startswith("|"):
            rows.append([c.strip() for c in lines[i].strip().strip("|").split("|")]); i += 1
        thead = "".join("<th>%s</th>" % inline(c) for c in header)
        tbody = "".join("<tr>" + "".join("<td>%s</td>" % inline(c) for c in r) + "</tr>" for r in rows)
        out.append("<table><thead><tr>%s</tr></thead><tbody>%s</tbody></table>" % (thead, tbody))
        continue
    # citação
    if st.startswith(">"):
        buf = []
        while i < len(lines) and lines[i].strip().startswith(">"):
            buf.append(lines[i].strip()[1:].strip()); i += 1
        out.append("<blockquote>%s</blockquote>" % inline(" ".join(buf)))
        continue
    # lista não ordenada
    if re.match(r"^[-*]\s+", st):
        buf = []
        while i < len(lines) and re.match(r"^[-*]\s+", lines[i].strip()):
            buf.append(inline(re.sub(r"^[-*]\s+", "", lines[i].strip()))); i += 1
        out.append("<ul>" + "".join("<li>%s</li>" % x for x in buf) + "</ul>")
        continue
    # lista ordenada
    if re.match(r"^\d+\.\s+", st):
        buf = []
        while i < len(lines) and re.match(r"^\d+\.\s+", lines[i].strip()):
            buf.append(inline(re.sub(r"^\d+\.\s+", "", lines[i].strip()))); i += 1
        out.append("<ol>" + "".join("<li>%s</li>" % x for x in buf) + "</ol>")
        continue
    # parágrafo (consome primeira linha incondicionalmente — evita loop infinito)
    buf = [st]; i += 1
    while i < len(lines):
        nx = lines[i].strip()
        if (not nx) or nx == "---" or nx[:1] in "#-*>|" or re.match(r"^\d+\.\s", nx):
            break
        buf.append(nx); i += 1
    out.append("<p>%s</p>" % inline(" ".join(buf)))

body_html = "\n".join(out)

MARK = ('<svg width="64" height="64" viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg">'
  '<defs><linearGradient id="sp" x1="0" y1="0" x2="0" y2="1">'
  '<stop offset="0" stop-color="#16ABA6"/><stop offset="1" stop-color="#54B62E"/></linearGradient></defs>'
  '<path d="M3.6 6.2V15.4c0 1.6 3.76 2.9 8.4 2.9s8.4-1.3 8.4-2.9V6.2" fill="url(#sp)"/>'
  '<ellipse cx="12" cy="6.2" rx="8.4" ry="2.9" fill="#0E7E7B"/>'
  '<ellipse cx="12" cy="6.2" rx="2.2" ry="0.78" fill="#fff" opacity="0.6"/>'
  '<path d="M3.7 10.1c1 1.3 4.4 2.2 8.3 2.2s7.3-.9 8.3-2.2" stroke="#fff" stroke-opacity="0.28" stroke-width="0.9"/>'
  '<path d="M3.7 12.9c1 1.3 4.4 2.2 8.3 2.2s7.3-.9 8.3-2.2" stroke="#fff" stroke-opacity="0.28" stroke-width="0.9"/>'
  '<circle cx="21.4" cy="21" r="6.2" stroke="#2DD4BF" stroke-width="2"/>'
  '<path d="M26.1 25.7 29.3 28.9" stroke="#2DD4BF" stroke-width="2.6" stroke-linecap="round"/>'
  '<path d="M18.3 21.1 20.6 23.3 24.7 19" stroke="#54B62E" stroke-width="2.1" stroke-linecap="round" stroke-linejoin="round"/>'
  '</svg>')

CSS = """
*{box-sizing:border-box;margin:0;padding:0}
@page{size:A4;margin:0}
html{font-family:'Manrope',sans-serif;color:#1B2A29;font-size:11.2pt;line-height:1.55}
.cover{height:297mm;background:radial-gradient(700px 480px at 88% 8%,rgba(84,182,46,.20),transparent 60%),radial-gradient(640px 560px at 6% 88%,rgba(14,126,123,.42),transparent 55%),#0C1F23;color:#fff;padding:30mm 26mm;display:flex;flex-direction:column;justify-content:space-between;page-break-after:always}
.cover .brand{display:flex;align-items:center;gap:16px;font-family:'Sora';font-weight:800;font-size:26px;letter-spacing:-.02em}
.cover .brand span{color:#5FB3AF}
.cover .eyebrow{font-family:'Space Mono',monospace;font-weight:700;font-size:13pt;letter-spacing:.22em;color:#5FB3AF;text-transform:uppercase}
.cover h1{font-family:'Sora';font-weight:800;font-size:46pt;line-height:1.02;letter-spacing:-.03em;margin:14px 0 0}
.cover h1 b{color:#9BE06A;font-weight:800}
.cover .lead{font-size:15pt;color:#cfe0de;margin-top:18px;max-width:150mm}
.cover .bar{height:8px;width:120px;border-radius:99px;background:linear-gradient(90deg,#0E7E7B,#54B62E);margin:26px 0 14px}
.cover .meta{font-family:'Space Mono',monospace;font-size:11pt;color:#9fb6b3;letter-spacing:.04em}
.content{padding:20mm 22mm 24mm}
h2{font-family:'Sora';font-weight:800;font-size:18.5pt;letter-spacing:-.02em;color:#0C1F23;margin:26px 0 8px;padding-bottom:7px;border-bottom:2px solid #E4ECEA;page-break-after:avoid}
h2:first-child{margin-top:0}
h3{font-family:'Sora';font-weight:700;font-size:13pt;color:#0A6967;margin:16px 0 5px;page-break-after:avoid}
h4{font-family:'Sora';font-weight:700;font-size:11.5pt;color:#1B2A29;margin:12px 0 4px}
p{margin:7px 0}
strong{font-weight:700;color:#0C1F23}
em{color:#0A6967;font-style:normal;font-weight:600}
code{font-family:'Space Mono',monospace;font-size:.9em;background:#EEF4F2;padding:1px 5px;border-radius:5px;color:#0A6967}
ul,ol{margin:7px 0 7px 20px}
li{margin:4px 0}
hr{border:0;border-top:1px solid #E4ECEA;margin:18px 0}
blockquote{background:#F0F7F4;border-left:4px solid #54B62E;border-radius:0 10px 10px 0;padding:12px 16px;margin:12px 0;color:#244;font-size:10.8pt}
blockquote strong{color:#0A6967}
table{width:100%;border-collapse:collapse;margin:12px 0;font-size:10pt;page-break-inside:avoid}
thead th{background:linear-gradient(135deg,#0E7E7B,#0A6967);color:#fff;text-align:left;padding:8px 10px;font-family:'Sora';font-weight:600;font-size:9.6pt}
tbody td{padding:7px 10px;border-bottom:1px solid #E8EFED;vertical-align:top}
tbody tr:nth-child(even){background:#F7FAF9}
tbody tr td:first-child{font-weight:600;color:#0C1F23}
.content h2,.content h3{break-after:avoid}
"""

COVER = (
  '<div class="cover">'
    '<div class="brand">' + MARK + '<div>Melhor<span>Filamento</span></div></div>'
    '<div>'
      '<div class="eyebrow">Plano de Negócios</div>'
      '<h1>O comparador de preços da <b>impressão 3D</b> do Brasil</h1>'
      '<div class="lead">Ranking por custo total para o seu CEP, comparação por preço/kg, '
      'histórico de ofertas, IA e comunidade — num só lugar.</div>'
      '<div class="bar"></div>'
    '</div>'
    '<div class="meta">melhorfilamento.com.br &nbsp;·&nbsp; Documento estratégico &nbsp;·&nbsp; 2026</div>'
  '</div>')

HTMLDOC = (
  '<!DOCTYPE html><html lang="pt-BR"><head><meta charset="utf-8">'
  '<link href="https://fonts.googleapis.com/css2?family=Sora:wght@600;700;800&family=Manrope:wght@400;500;600;700&family=Space+Mono:wght@400;700&display=swap" rel="stylesheet">'
  '<style>' + CSS + '</style></head><body>'
  + COVER + '<div class="content">' + body_html + '</div></body></html>')

OUTHTML.write_text(HTMLDOC, encoding="utf-8")
print("HTML do plano:", OUTHTML, "·", len(body_html), "chars de corpo")
