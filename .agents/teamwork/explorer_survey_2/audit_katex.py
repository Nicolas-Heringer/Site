import os
import re
from pathlib import Path

sim_dir = Path(r"c:\Users\nicol\Documents\GitHub\Site\simulacoes")
html_files = sorted(list(sim_dir.glob("*.html")))

print("=== KATEX MATH AUDIT ACROSS SIMULATIONS ===")

for html_path in html_files:
    name = html_path.name
    with open(html_path, "r", encoding="utf-8", errors="replace") as f:
        html = f.read()

    # Find display math ($$...$$ or \[...\])
    display_math = re.findall(r'(\$\$[\s\S]*?\$\$|\\\[[\s\S]*?\\\])', html)
    # Find inline math ($...$)
    inline_math = re.findall(r'(?<!\$)\$([^\$\n]+)\$(?!\$)', html)

    # Check theory cards or containers holding math
    # Let's check for any display math outside .theory-card
    # Check if there are modals
    has_modal = "sim-modal" in html

    print(f"\n[{name}]")
    print(f"  Display math equations count: {len(display_math)}")
    print(f"  Inline math count: {len(inline_math)}")
    print(f"  Has Theory Modal: {has_modal}")
    
    # Check sample display math lengths
    long_eqs = [eq for eq in display_math if len(eq) > 60]
    if long_eqs:
        print(f"  Long display equations (>60 chars): {len(long_eqs)}")
        for eq in long_eqs[:3]:
            # sanitize single line
            one_line = " ".join(eq.split())
            print(f"    - {one_line[:90]}...")
