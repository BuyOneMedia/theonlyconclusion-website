#!/usr/bin/env python3
"""Build theonlyconclusion.com from src/ into site/ (to upload) and preview/ (flat copy).

    python3 build.py

Edit the words in src/pages/*.html and the shared header/footer in src/partials/.
Links inside pages are written {{L:path/}} (e.g. {{L:books/all-hands/}}, {{L:}} for home,
{{L:#cases}} for a section on the home page) and assets as {{A}}img/...
Settings (Amazon links, email service) are in site/assets/js/config.js, not here.
"""
import json, os, re, shutil, sys

HERE = os.path.dirname(os.path.abspath(__file__))
SRC, SITE, PREV = (os.path.join(HERE, d) for d in ("src", "site", "preview"))
DOMAIN = "https://theonlyconclusion.com"


def read(p):
    with open(p, encoding="utf-8") as f:
        return f.read()


def pages():
    out = []
    for fn in sorted(os.listdir(os.path.join(SRC, "pages"))):
        if not fn.endswith(".html"):
            continue
        txt = read(os.path.join(SRC, "pages", fn))
        m = re.match(r"\s*<!--\s*(\{.*?\})\s*-->\s*", txt, re.S)
        if not m:
            sys.exit(f"{fn}: first line must be a <!-- {{json}} --> settings comment")
        meta = json.loads(m.group(1)); meta["body"] = txt[m.end():]; meta["src"] = fn
        out.append(meta)
    return out


def flat(path):
    """preview file name for a site path: '' -> index.html, 'books/all-hands/' -> books-all-hands.html"""
    p = path.strip("/")
    return "index.html" if not p else p.replace("/", "-") + ".html"


def render(meta, mode):
    path = meta["path"]                                  # '' or 'books/all-hands/' or '404.html'
    depth = 0 if path.endswith(".html") else path.count("/")
    root = "../" * depth if mode == "site" else ""
    if mode == "site" and path == "404.html":
        root = "/"          # a 404 can be served at any depth, so it uses absolute paths

    def link(m):
        target = m.group(1)
        anchor = ""
        if "#" in target:
            target, anchor = target.split("#", 1); anchor = "#" + anchor
        if mode == "site":
            return (root + target + anchor) or "./"
        return flat(target) + anchor

    head = read(os.path.join(SRC, "partials", "head.html"))
    header = read(os.path.join(SRC, "partials", "header.html"))
    footer = read(os.path.join(SRC, "partials", "footer.html"))
    canon = DOMAIN + "/" + (path if not path.endswith(".html") else "")
    body = meta["body"]
    if "cz" in meta:
        # Case Zero pages: the walkthrough and the letter are kept out of plain view in the page
        # source (base64), so a reader can't see the answer before they submit the form.
        import base64
        blocks = {}
        for key in ("walk", "letter"):
            m = re.search(r'<template id="cz-%s">(.*?)</template>' % key, body, re.S)
            if not m:
                sys.exit(f"{meta['src']}: missing <template id=\"cz-{key}\">")
            blocks[key] = base64.b64encode(m.group(1).strip().encode("utf-8")).decode("ascii")
            body = body.replace(m.group(0), "")
        cz = dict(meta["cz"], **blocks)
        body += "<script>window.CZ=" + json.dumps(cz) + ";</script>\n"
    html = (head + header + body + footer)
    html = (html.replace("{{TITLE}}", meta["title"]).replace("{{DESC}}", meta["description"])
                .replace("{{CANON}}", canon).replace("{{OG}}", DOMAIN + "/assets/img/" + meta.get("og", "og-image.jpg"))
                .replace("{{ROBOTS}}", meta.get("robots", "index,follow"))
                .replace("{{HEADEXTRA}}", meta.get("head", "")))
    html = re.sub(r"\{\{L:([^}]*)\}\}", link, html)
    html = html.replace("{{A}}", root + "assets/")
    if mode == "site" and "{{" in html:
        left = sorted(set(re.findall(r"\{\{[^}]*\}\}", html)))
        sys.exit(f"{meta['src']}: unfilled {left}")
    return html


def main():
    ps = pages()
    for meta in ps:
        # site
        path = meta["path"]
        dest = os.path.join(SITE, path if path.endswith(".html") else os.path.join(path, "index.html"))
        os.makedirs(os.path.dirname(dest), exist_ok=True)
        with open(dest, "w", encoding="utf-8") as f:
            f.write(render(meta, "site"))
        # preview (flat, every page next to assets/)
        os.makedirs(PREV, exist_ok=True)
        with open(os.path.join(PREV, flat(path) if not path.endswith(".html") else path), "w", encoding="utf-8") as f:
            f.write(render(meta, "preview"))
    # preview shares the site's assets
    if os.path.exists(os.path.join(PREV, "assets")):
        shutil.rmtree(os.path.join(PREV, "assets"))
    shutil.copytree(os.path.join(SITE, "assets"), os.path.join(PREV, "assets"))
    # sitemap
    urls = [DOMAIN + "/" + m["path"] for m in ps if m.get("robots", "index") .startswith("index") and not m["path"].endswith(".html")]
    with open(os.path.join(SITE, "sitemap.xml"), "w", encoding="utf-8") as f:
        f.write('<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n')
        for u in urls:
            f.write(f"  <url><loc>{u}</loc></url>\n")
        f.write("</urlset>\n")
    print(f"built {len(ps)} pages -> site/ and preview/")


if __name__ == "__main__":
    main()
