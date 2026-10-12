import re
from pathlib import Path

sim_dir = Path(r"c:\Users\nicol\Documents\GitHub\Site\simulacoes")

sims = ['clima.html', 'drude.html', 'estacionarias2d.html', 'movimento.html', 'particulas.html', 'snell.html', 'ui_lab.html']

for f in sims:
    with open(sim_dir / f, "r", encoding="utf-8") as fp:
        content = fp.read()
    
    # Extract modal block
    modal_idx = content.find("sim-modal-container")
    if modal_idx != -1:
        modal_content = content[modal_idx:modal_idx + 8000]
        # find display math in modal
        modal_display = re.findall(r'(\$\$[\s\S]*?\$\$|\\\[[\s\S]*?\\\])', modal_content)
        # Check what classes surround display math
        print(f"\n[{f}] - Found {len(modal_display)} display equations in modal:")
        for eq in modal_display:
            # find index of eq in modal_content
            eq_idx = modal_content.find(eq)
            surrounding = modal_content[max(0, eq_idx - 150):eq_idx]
            classes = re.findall(r'class=["\']([^"\']+)["\']', surrounding)
            last_class = classes[-1] if classes else "none"
            eq_short = " ".join(eq.split())[:50]
            print(f"   Parent class: '{last_class}' | Eq: {eq_short}...")
