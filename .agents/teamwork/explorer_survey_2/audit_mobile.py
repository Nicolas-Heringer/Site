import os
import re
from pathlib import Path

sim_dir = Path(r"c:\Users\nicol\Documents\GitHub\Site\simulacoes")
scripts_dir = sim_dir / "scripts"
css_dir = sim_dir / "css"

html_files = sorted(list(sim_dir.glob("*.html")))

results = {}

for html_path in html_files:
    name = html_path.name
    with open(html_path, "r", encoding="utf-8", errors="replace") as f:
        html_content = f.read()

    # 1. Viewport meta
    viewport_match = re.search(r'<meta\s+name=["\']viewport["\']\s+content=["\']([^"\']+)["\']', html_content, re.IGNORECASE)
    viewport = viewport_match.group(1) if viewport_match else "NONE"

    # 2. Linked CSS
    css_links = re.findall(r'<link\s+[^>]*rel=["\']stylesheet["\'][^>]*href=["\']([^"\']+)["\']', html_content, re.IGNORECASE)
    # also href before rel
    css_links += re.findall(r'<link\s+[^>]*href=["\']([^"\']+)["\'][^>]*rel=["\']stylesheet["\']', html_content, re.IGNORECASE)
    css_links = list(dict.fromkeys(css_links))

    # 3. Scripts
    scripts = re.findall(r'<script\s+[^>]*src=["\']([^"\']+)["\']', html_content, re.IGNORECASE)

    # 4. Sheet drag handle & controls panel
    has_sheet_drag_handle = "sheet-drag-handle" in html_content
    has_sheet_drag_pill = "sheet-drag-pill" in html_content
    has_controls_panel = "controls-panel" in html_content or "sim-controls-panel" in html_content
    has_sim_layout = "sim-layout" in html_content

    # 5. Check JS files linked to this simulation
    js_files = []
    for s in scripts:
        clean_s = s.split("?")[0]
        # if relative to scripts/
        if "scripts/" in clean_s:
            js_name = clean_s.split("scripts/")[-1]
            target_js = scripts_dir / js_name
            if target_js.exists():
                js_files.append(target_js)
        else:
            target_js = sim_dir / clean_s
            if target_js.exists():
                js_files.append(target_js)

    # Also check if same-named js exists in scripts/
    default_js = scripts_dir / f"{html_path.stem}.js"
    if default_js.exists() and default_js not in js_files:
        js_files.append(default_js)

    # Aggregate JS content
    combined_js = ""
    for jf in js_files:
        with open(jf, "r", encoding="utf-8", errors="replace") as f:
            combined_js += f"\n--- {jf.name} ---\n" + f.read()

    # In HTML script tags (inline)
    inline_scripts = re.findall(r'<script(?![^>]*src=)[^>]*>(.*?)</script>', html_content, re.DOTALL | re.IGNORECASE)
    for idx, inline in enumerate(inline_scripts):
        combined_js += f"\n--- inline_script_{idx} ---\n" + inline

    # Checks in JS
    has_init_bottom_sheet = "initBottomSheet" in combined_js
    has_init_sidebar_collapse = "initSidebarCollapse" in combined_js
    has_sync_dual_slider = "syncDualSlider" in combined_js
    has_three = "THREE" in combined_js or "three" in html_content or "OrbitControls" in combined_js
    has_orbit_controls = "OrbitControls" in combined_js
    has_prevent_default = "preventDefault" in combined_js
    has_touch_events = any(evt in combined_js for evt in ["touchstart", "touchmove", "touchend"])

    # Aggregate CSS content
    combined_css = ""
    for cl in css_links:
        clean_cl = cl.split("?")[0]
        if "css/" in clean_cl:
            c_name = clean_cl.split("css/")[-1]
            target_css = css_dir / c_name
            if target_css.exists():
                with open(target_css, "r", encoding="utf-8", errors="replace") as f:
                    combined_css += f"\n--- {target_css.name} ---\n" + f.read()
        else:
            target_css = sim_dir / clean_cl
            if target_css.exists():
                with open(target_css, "r", encoding="utf-8", errors="replace") as f:
                    combined_css += f"\n--- {target_css.name} ---\n" + f.read()

    default_css = css_dir / f"{html_path.stem}.css"
    if default_css.exists() and default_css.name not in combined_css:
        with open(default_css, "r", encoding="utf-8", errors="replace") as f:
            combined_css += f"\n--- {default_css.name} ---\n" + f.read()

    # Inline styles
    inline_styles = re.findall(r'<style[^>]*>(.*?)</style>', html_content, re.DOTALL | re.IGNORECASE)
    for idx, inst in enumerate(inline_styles):
        combined_css += f"\n--- inline_style_{idx} ---\n" + inst

    # Check touch-action
    touch_action_css = re.findall(r'touch-action\s*:\s*([^;]+);', combined_css, re.IGNORECASE)
    touch_action_inline = re.findall(r'style=["\'][^"\']*touch-action\s*:\s*([^;"]+)', html_content, re.IGNORECASE)

    # Canvas info
    canvases = re.findall(r'<canvas[^>]*id=["\']([^"\']+)["\'][^>]*>', html_content, re.IGNORECASE)
    all_canvases_tags = re.findall(r'<canvas[^>]*>', html_content, re.IGNORECASE)

    # KaTeX info
    has_katex_link = "katex" in html_content
    has_render_math = "renderMath" in combined_js or "renderMathInElement" in combined_js or "renderMathInElement" in html_content

    # Sliders
    ranges = re.findall(r'<input[^>]*type=["\']range["\'][^>]*>', html_content, re.IGNORECASE)
    dual_sliders = len(re.findall(r'class=["\'][^"\']*sim-dual-slider', html_content, re.IGNORECASE))

    results[name] = {
        "viewport": viewport,
        "css_links": css_links,
        "has_design_system_css": any("design-system.css" in c for c in css_links),
        "has_sim_layout": has_sim_layout,
        "has_sheet_drag_handle": has_sheet_drag_handle,
        "has_sheet_drag_pill": has_sheet_drag_pill,
        "has_controls_panel": has_controls_panel,
        "has_init_bottom_sheet": has_init_bottom_sheet,
        "has_init_sidebar_collapse": has_init_sidebar_collapse,
        "has_three": has_three,
        "has_orbit_controls": has_orbit_controls,
        "touch_action_css": list(set(touch_action_css + touch_action_inline)),
        "has_prevent_default": has_prevent_default,
        "has_touch_events": has_touch_events,
        "canvases": canvases,
        "canvas_count": len(all_canvases_tags),
        "has_katex": has_katex_link,
        "has_render_math": has_render_math,
        "ranges_count": len(ranges),
        "dual_sliders_count": dual_sliders,
        "has_sync_dual_slider": has_sync_dual_slider,
        "scripts": scripts
    }

print("Audit summary:")
for name, data in results.items():
    print(f"\n[{name}]")
    print(f"  Viewport: {data['viewport']}")
    print(f"  DS CSS: {data['has_design_system_css']}, sim-layout: {data['has_sim_layout']}")
    print(f"  Sheet Handle: {data['has_sheet_drag_handle']}, initBottomSheet: {data['has_init_bottom_sheet']}")
    print(f"  Sidebar Collapse: {data['has_init_sidebar_collapse']}")
    print(f"  Three/Orbit: {data['has_three']} / {data['has_orbit_controls']}")
    print(f"  touch-action: {data['touch_action_css']}")
    print(f"  touch events/preventDefault: {data['has_touch_events']} / {data['has_prevent_default']}")
    print(f"  Canvases: {data['canvas_count']} ({data['canvases']})")
    print(f"  Ranges: {data['ranges_count']} (Dual: {data['dual_sliders_count']}, sync: {data['has_sync_dual_slider']})")
    print(f"  KaTeX: {data['has_katex']} (renderMath: {data['has_render_math']})")
