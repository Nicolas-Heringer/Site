import os
import re
from pathlib import Path

sim_dir = Path(r"c:\Users\nicol\Documents\GitHub\Site\simulacoes")
scripts_dir = sim_dir / "scripts"
css_dir = sim_dir / "css"

ds_sims = [
    "atomo_de_hidrogenio.html",
    "clima.html",
    "drude.html",
    "estacionarias2d.html",
    "movimento.html",
    "particulas.html",
    "snell.html",
    "ui_lab.html"
]

print("=== DEEP DIVE: DESIGN SYSTEM 2.0 SIMULATIONS ON MOBILE ===")

for sim in ds_sims:
    html_path = sim_dir / sim
    with open(html_path, "r", encoding="utf-8", errors="replace") as f:
        html = f.read()

    js_path = scripts_dir / f"{html_path.stem}.js"
    js_content = ""
    if js_path.exists():
        with open(js_path, "r", encoding="utf-8", errors="replace") as f:
            js_content = f.read()

    css_path = css_dir / f"{html_path.stem}.css"
    css_content = ""
    if css_path.exists():
        with open(css_path, "r", encoding="utf-8", errors="replace") as f:
            css_content = f.read()

    print(f"\n--- {sim} ---")
    
    # 1. HTML Bottom Sheet structure
    has_handle = 'class="sheet-drag-handle"' in html or "sheet-drag-handle" in html
    handle_id = re.search(r'id=["\']([^"\']*sheet-drag[^"\']*)["\']', html)
    panel_class = re.search(r'class=["\']([^"\']*(?:controls-panel|sim-controls)[^"\']*)["\']', html)
    tab_nav = re.search(r'class=["\']([^"\']*tab-nav[^"\']*)["\']', html)
    collapse_btn = re.search(r'id=["\']([^"\']*collapse[^"\']*)["\']', html)
    
    print(f"Sheet handle in HTML: {has_handle} (id: {handle_id.group(1) if handle_id else 'none'})")
    print(f"Panel class: {panel_class.group(1) if panel_class else 'none'}")
    print(f"Tab nav class: {tab_nav.group(1) if tab_nav else 'none'}")
    print(f"Collapse button ID: {collapse_btn.group(1) if collapse_btn else 'none'}")

    # 2. initBottomSheet invocation in JS
    bs_call = re.search(r'initBottomSheet\s*\(\{([^}]+)\}\)', js_content, re.DOTALL)
    if bs_call:
        print(f"initBottomSheet args:\n  {bs_call.group(1).strip()}")
    else:
        print("initBottomSheet: NOT CALLED or DIFFERENT SYNTAX")

    # 3. Canvas & Touch Action
    # Check if canvas exists in HTML or created dynamically
    canvases = re.findall(r'<canvas[^>]*id=["\']([^"\']+)["\'][^>]*>', html)
    print(f"Static canvases: {canvases}")
    
    # Check touch-action on canvas / container
    ta_in_css = re.findall(r'([^{}]+)\{[^}]*touch-action\s*:\s*([^;]+);[^}]*\}', css_content, re.DOTALL)
    print(f"touch-action in custom CSS: {[(s.strip(), v.strip()) for s, v in ta_in_css]}")

    # Check if OrbitControls is used and if touchAction is set on renderer.domElement in JS
    if "OrbitControls" in js_content:
        dom_ta = "touchAction" in js_content or "touch-action" in js_content
        print(f"OrbitControls present. renderer.domElement.style.touchAction set in JS: {dom_ta}")

    # 4. Canvas touch listeners (pan/zoom/draw)
    touch_events = re.findall(r'addEventListener\s*\(\s*["\'](touch[a-z]+|pointer[a-z]+)["\']', js_content)
    print(f"Touch/pointer listeners in JS: {touch_events}")

    # 5. Floating UI elements inside canvas area
    toolbars = re.findall(r'class=["\']([^"\']*(?:toolbar|hud|top-actions|badge)[^"\']*)["\']', html)
    print(f"Overlays/Toolbars on canvas: {toolbars}")

    # 6. KaTeX containers
    katex_containers = re.findall(r'class=["\']([^"\']*(?:theory|math|formula|equation)[^"\']*)["\']', html)
    print(f"Theory/Math containers: {katex_containers}")
