#!/usr/bin/env python3
"""Static audit: English UI chrome still hardcoded in Campus TSX."""
import json
import re
from pathlib import Path

root = Path("apps/campus/src")
catalog = Path("packages/shared/types/src/lib/campus-ui-catalog.ts").read_text()
catalog_en = set(re.findall(r"en:\s*'((?:\\'|[^'])*)'", catalog))
catalog_en |= set(re.findall(r'en:\s*"((?:\\"|[^"])*)"', catalog))
catalog_en = {s.replace("\\'", "'").replace('\\"', '"') for s in catalog_en}

patterns = [
    re.compile(r"""(?:title|subtitle|label|placeholder|aria-label|heading|loadingLabel)=\{?["']([^"']{3,})["']"""),
    re.compile(r""">([A-Z][^<>{\n]{2,80})</"""),
    re.compile(r"""["']([A-Z][a-z]+(?: [A-Za-z0-9%,.'’\-]*){1,10})["']"""),
]

skip_name = re.compile(r"\.(test|spec)\.")
hits = {}

for p in sorted(root.rglob("*.tsx")):
    if skip_name.search(p.name):
        continue
    rel = str(p.relative_to(root))
    if not (
        rel.startswith("app/")
        or rel.startswith("features/")
        or rel.startswith("components/")
    ):
        continue
    txt = p.read_text(errors="ignore")
    txt2 = re.sub(r"/\*.*?\*/", "", txt, flags=re.S)
    txt2 = re.sub(r"//.*?$", "", txt2, flags=re.M)
    found = set()
    for pat in patterns:
        for m in pat.finditer(txt2):
            s = m.group(1).strip()
            if len(s) < 3 or len(s) > 120:
                continue
            if any(x in s for x in ("http", "className", "data-", "/", "\\", "${", "=>", "#", "@", "{")):
                continue
            if re.fullmatch(r"[A-Z0-9_]+", s):
                continue
            if not re.search(r"[A-Za-z]", s):
                continue
            if s in catalog_en:
                continue
            if re.fullmatch(r"[a-z0-9]+(?:\.[a-z0-9]+)+", s):
                continue
            # skip if only used inside t('...') as key - already filtered
            found.add(s)
    if not found:
        continue
    wired = ("useCampusT" in txt) or ("useCampusI18n" in txt)
    hits[rel] = {
        "wired": wired,
        "count": len(found),
        "samples": sorted(found),
    }

items = sorted(hits.items(), key=lambda kv: (kv[1]["wired"], -kv[1]["count"]))
out = [
    {
        "file": rel,
        "wired": meta["wired"],
        "count": meta["count"],
        "samples": meta["samples"][:30],
    }
    for rel, meta in items
]

Path("docs/tmp-i18n-static-audit.json").write_text(
    json.dumps(out, indent=2, ensure_ascii=False) + "\n"
)
unwired = [x for x in out if not x["wired"]]
print(f"files_with_leftovers={len(out)} unwired={len(unwired)}")
print("\n=== UNWIRED (no useCampusT) ===")
for x in unwired[:40]:
    print(f"{x['count']:3d}  {x['file']}")
    print("     " + " | ".join(x["samples"][:6]))
print("\n=== WIRED but still many hardcoded ===")
for x in out:
    if x["wired"] and x["count"] >= 8:
        print(f"{x['count']:3d}  {x['file']}")
        print("     " + " | ".join(x["samples"][:8]))
