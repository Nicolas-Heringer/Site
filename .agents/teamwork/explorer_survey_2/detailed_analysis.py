import os
import re
from pathlib import Path

sim_dir = Path(r"c:\Users\nicol\Documents\GitHub\Site\simulacoes")
scripts_dir = sim_dir / "scripts"
css_dir = sim_dir / "css"

html_files = sorted(list(sim_dir.glob("*.html")))

def analyze_file(html_path):
    with open(html_path, "r", encoding="utf-8", errors="replace") as f:
        html = f.read()

    name = html_path.name
    print(f"\n==========================================")
    print(f"ANALYSIS: {name}")
    print(f"==========================================")

    # 1. Viewport
    vp = re.search(r'<meta\s+name=["\']viewport["\'][^>]*>', html, re.I)
    print("Viewport tag:", vp.group(0) if vp else "MISSING")

    # 2. Main structure / Layout classes
    layout_match = re.search(r'class=["\']([^"\']*sim-layout[^"\']*)["\']', html, re.I)
    print("sim-layout class:", layout_match.group(1) if layout_match else "NO sim-layout")

    # Controls panel class
    ctrl_panel = re.findall(r'class=["\']([^"\']*(?:controls-panel|sim-controls)[^"\']*)["\']', html, re.I)
    print("Controls panel classes:", ctrl_panel)

    # Sheet drag handle
    drag_handle = re.findall(r'<div[^>]*class=["\']([^"\']*sheet-drag[^"\']*)["\'][^>]*>', html, re.I)
    print("Sheet drag handle element:", drag_handle)

    # CSS links
    css_links = re.findall(r'<link[^>]*href=["\']([^"\']+\.css[^"\']*)["\']', html, re.I)
    print("CSS links:", css_links)

    # JS scripts
    js_links = re.findall(r'<script[^>]*src=["\']([^"\']+\.js[^"\']*)["\']', html, re.I)
    print("JS links:", js_links)

    # Find associated JS code
    js_code = ""
    for jsl in js_links:
        clean = jsl.split("?")[0]
        if "scripts/" in clean:
            target = scripts_dir / clean.split("scripts/")[-1]
        else:
            target = sim_dir / clean
        if target.exists():
            with open(target, "r", encoding="utf-8", errors="replace") as jf:
                js_code += f"\n// --- {target.name} ---\n" + jf.read()
    
    # Inline scripts
    inline_scripts = re.findall(r'<script(?![^>]*src=)[^>]*>(.*?)</script>', html, re.DOTALL | re.I)
    for s in inline_scripts:
        js_code += "\n// --- inline ---\n" + s

    # Check initBottomSheet calls and args
    bs_calls = re.findall(r'initBottomSheet\s*\((.*?)\)', js_code, re.DOTALL)
    print("initBottomSheet calls:", bs_calls if bs_calls else "NONE")

    # Check initSidebarCollapse calls
    sc_calls = re.findall(r'initSidebarCollapse\s*\((.*?)\)', js_code, re.DOTALL)
    print("initSidebarCollapse calls:", sc_calls if sc_calls else "NONE")

    # Check OrbitControls
    oc_match = re.findall(r'new\s+(?:THREE\.)?OrbitControls\s*\((.*?)\)', js_code)
    print("OrbitControls:", oc_match if oc_match else "NONE")

    # Check touch-action in specific CSS for this file
    this_css = ""
    for cl in css_links:
        clean = cl.split("?")[0]
        if "css/" in clean:
            target = css_dir / clean.split("css/")[-1]
        else:
            target = sim_dir / clean
        if target.exists():
            with open(target, "r", encoding="utf-8", errors="replace") as cf:
                this_css += f"\n/* --- {target.name} --- */\n" + cf.read()
    
    # Check touch-action declarations
    ta_decl = re.findall(r'([^{}]*)\{\s*([^}]*touch-action[^}]*)\}', this_css, re.I | re.DOTALL)
    print("touch-action rules in linked CSS:")
    for sel, body in ta_decl:
        sel_clean = " ".join(sel.strip().split())
        body_clean = " ".join(body.strip().split())
        print(f"  {sel_clean} -> {body_clean}")

    # Check canvas elements and container
    canvas_els = re.findall(r'(<canvas[^>]*>)', html, re.I)
    print("Canvas elements:", canvas_els)

    canvas_containers = re.findall(r'(<(?:div|main)[^>]*class=["\'][^"\']*(?:canvas|viewport|render)[^"\']*["\'][^>]*>)', html, re.I)
    print("Canvas container elements:", canvas_containers)

    # Touch events in JS
    touch_listeners = re.findall(r'addEventListener\s*\(\s*["\'](touch[a-z]+|pointer[a-z]+|gesture[a-z]+)["\']', js_code, re.I)
    print("Touch / pointer listeners in JS:", touch_listeners)

    # Sliders and controls in HTML
    ranges = re.findall(r'<input[^>]*type=["\']range["\'][^>]*>', html, re.I)
    print(f"Native range sliders count: {len(ranges)}")

    dual_sliders = re.findall(r'<div[^>]*class=["\']([^"\']*sim-dual-slider[^"\']*)["\'][^>]*>', html, re.I)
    print(f"sim-dual-slider count: {len(dual_sliders)}")

    # KaTeX references in HTML & JS
    katex_html = "katex" in html.lower()
    katex_js = "katex" in js_code.lower() or "rendermath" in js_code.lower()
    print(f"KaTeX in HTML: {katex_html}, in JS: {katex_js}")

for f in html_files:
    analyze_file(f)
