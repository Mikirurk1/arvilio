#!/usr/bin/env python3
"""Patch РГР SoEnglish DOCX: abbreviations + Appendix Г + updateFields on open."""
from __future__ import annotations

import json
import os
import re
import shutil
import sys
import zipfile
from copy import deepcopy
from xml.etree import ElementTree as ET

W = "{http://schemas.openxmlformats.org/wordprocessingml/2006/main}"
XML_NS = "http://www.w3.org/XML/1998/namespace"

# Fixed TOC anchors (must match bookmarkStart on headings in body)
TOC_ANCHOR_ABBREV = "_Toc229965400"
TOC_ANCHOR_APPENDIX_G = "_Toc229965401"
APPENDIX_G_TOC_TITLE = "Додаток Г. Фрагменти програмного коду та опис функцій"


def para_text(p: ET.Element) -> str:
    return "".join(t.text or "" for t in p.findall(f".//{W}t"))


def max_bookmark_id(root: ET.Element) -> int:
    body = root.find(f"{W}body")
    ids = []
    for el in body.iter():
        if el.tag == f"{W}bookmarkStart":
            bid = el.get(f"{W}id")
            if bid and bid.isdigit():
                ids.append(int(bid))
    return max(ids) if ids else 0


def next_toc_name(existing: set[str]) -> str:
    n = 229965400
    while f"_Toc{n}" in existing:
        n += 1
    name = f"_Toc{n}"
    existing.add(name)
    return name


def make_run(text: str, *, bold: bool = False, courier: bool = False) -> ET.Element:
    r = ET.Element(f"{W}r")
    if bold or courier:
        r_pr = ET.SubElement(r, f"{W}rPr")
        if courier:
            fonts = ET.SubElement(
                r_pr,
                f"{W}rFonts",
                {
                    f"{W}ascii": "Courier New",
                    f"{W}hAnsi": "Courier New",
                    f"{W}cs": "Courier New",
                    f"{W}eastAsia": "Courier New",
                },
            )
            _ = fonts
            ET.SubElement(r_pr, f"{W}sz", {f"{W}val": "22"})
            ET.SubElement(r_pr, f"{W}szCs", {f"{W}val": "22"})
        elif bold:
            ET.SubElement(r_pr, f"{W}b")
            ET.SubElement(r_pr, f"{W}bCs")
            ET.SubElement(r_pr, f"{W}sz", {f"{W}val": "28"})
            ET.SubElement(r_pr, f"{W}szCs", {f"{W}val": "28"})
    t = ET.SubElement(r, f"{W}t")
    if text.startswith(" ") or text.endswith(" "):
        t.set(f"{{{XML_NS}}}space", "preserve")
    t.text = text
    return r


def make_paragraph(
    text: str,
    *,
    style: str | None = None,
    justify: str = "both",
    spacing_before: int | None = None,
    spacing_after: int = 120,
    courier: bool = False,
    bookmark_id: int | None = None,
    bookmark_name: str | None = None,
) -> ET.Element:
    p = ET.Element(f"{W}p")
    p_pr = ET.SubElement(p, f"{W}pPr")
    if style:
        ET.SubElement(p_pr, f"{W}pStyle", {f"{W}val": style})
    sp = ET.SubElement(p_pr, f"{W}spacing")
    if spacing_before is not None:
        sp.set(f"{W}before", str(spacing_before))
    sp.set(f"{W}after", str(spacing_after))
    if justify:
        ET.SubElement(p_pr, f"{W}jc", {f"{W}val": justify})

    if bookmark_id is not None and bookmark_name:
        ET.SubElement(
            p,
            f"{W}bookmarkStart",
            {f"{W}id": str(bookmark_id), f"{W}name": bookmark_name},
        )

    bold = style in ("1", "2", "3")
    p.append(make_run(text, bold=bold and not courier, courier=courier))

    if bookmark_id is not None:
        ET.SubElement(p, f"{W}bookmarkEnd", {f"{W}id": str(bookmark_id)})

    return p


def find_insert_after_annotation(body_children: list) -> int:
    for i, child in enumerate(body_children):
        if child.tag == f"{W}p" and para_text(child) == "АНОТАЦІЯ":
            # after last non-empty paragraph before ВСТУП
            j = i + 1
            while j < len(body_children):
                c = body_children[j]
                if c.tag == f"{W}p":
                    t = para_text(c)
                    if t == "ВСТУП":
                        return j
                    if t == "" and j + 1 < len(body_children) and para_text(body_children[j + 1]) == "ВСТУП":
                        return j
                j += 1
    return 24


def find_sect_pr_index(body_children: list) -> int:
    for i, child in enumerate(body_children):
        if child.tag == f"{W}sectPr":
            return i
    return len(body_children)


def build_abbreviation_paragraphs(payload: dict, bm_id: int, toc_names: set[str]) -> list[ET.Element]:
    out: list[ET.Element] = []
    bid = bm_id
    toc = TOC_ANCHOR_ABBREV
    toc_names.add(toc)
    out.append(
        make_paragraph(
            payload["abbrevTitle"],
            style="1",
            spacing_before=240,
            spacing_after=180,
            bookmark_id=bid,
            bookmark_name=toc,
        )
    )
    bid += 1
    out.append(make_paragraph(payload["abbrevIntro"], spacing_after=120))
    for abbr, meaning in payload["abbreviations"]:
        out.append(make_paragraph(f"{abbr} — {meaning}", spacing_after=80))
    out.append(make_paragraph("", spacing_after=120))
    return out


def build_appendix_paragraphs(payload: dict, bm_id: int, toc_names: set[str]) -> list[ET.Element]:
    out: list[ET.Element] = []
    bid = bm_id
    toc = TOC_ANCHOR_APPENDIX_G
    toc_names.add(toc)
    out.append(
        make_paragraph(
            APPENDIX_G_TOC_TITLE,
            style="2",
            spacing_before=200,
            spacing_after=120,
            bookmark_id=bid,
            bookmark_name=toc,
        )
    )
    bid += 1
    for chunk in payload["appendixIntro"].split("\n"):
        if chunk.strip():
            out.append(make_paragraph(chunk.strip(), spacing_after=120))

    for entry in payload["appendix"]:
        toc_h = next_toc_name(toc_names)
        title = f"{entry['id']}. {entry['title']}"
        out.append(
            make_paragraph(
                title,
                style="3",
                spacing_before=160,
                spacing_after=100,
                bookmark_id=bid,
                bookmark_name=toc_h,
            )
        )
        bid += 1
        out.append(make_paragraph(f"Файл: {entry['file']}", spacing_after=80))
        out.append(make_paragraph(entry["description"], spacing_after=100))
        for line in entry["code"].split("\n"):
            out.append(
                make_paragraph(line if line else " ", courier=True, spacing_after=40, justify=None)
            )
        out.append(make_paragraph("", spacing_after=120))

    return out


def clone_toc_entry(template: str, anchor: str, title: str) -> str:
    """Clone a TOC line (hyperlink + PAGEREF) for a heading bookmark."""
    entry = re.sub(r'ns2:paraId="[^"]+"', 'ns2:paraId="7F3A9B2C"', template, count=1)
    entry = re.sub(r'anchor="_Toc\d+"', f'anchor="{anchor}"', entry)
    entry = re.sub(
        r"PAGEREF _Toc\d+ \\h",
        lambda _m: f"PAGEREF {anchor} \\h",
        entry,
    )
    entry = re.sub(r"(<ns0:t>)[^<]+(</ns0:t>)", rf"\1{title}\2", entry, count=1)
    # Drop cached page number so Word recalculates on update
    entry = re.sub(
        r'(<ns0:fldChar ns0:fldCharType="separate" />)'
        r'\s*<ns0:r[^>]*>\s*<ns0:rPr><ns0:noProof /></ns0:rPr>\s*<ns0:t>\d+</ns0:t>\s*</ns0:r>',
        r"\1",
        entry,
        count=1,
    )
    return entry


def patch_toc_entries(xml_str: str, abbrev_title: str) -> str:
    """Insert ПЕРЕЛІК and Додаток Г into the TOC field (static entries)."""
    if f'anchor="{TOC_ANCHOR_APPENDIX_G}"' in xml_str:
        sdt_start = xml_str.find("<ns0:sdt><ns0:sdtPr><ns0:alias")
        sdt_end = xml_str.find("</ns0:sdt>", sdt_start) + len("</ns0:sdt>")
        if f'anchor="{TOC_ANCHOR_APPENDIX_G}"' in xml_str[sdt_start:sdt_end]:
            return xml_str

    sdt_start = xml_str.find("<ns0:sdt><ns0:sdtPr><ns0:alias")
    if sdt_start < 0:
        return xml_str
    sdt_end = xml_str.find("</ns0:sdt>", sdt_start) + len("</ns0:sdt>")
    sdt = xml_str[sdt_start:sdt_end]

    paras = re.findall(r"<ns0:p [^>]*>.*?</ns0:p>", sdt, re.DOTALL)
    if len(paras) < 10:
        return xml_str

    h1_template = paras[1]
    h2_template = next((p for p in paras if "_Toc229965365" in p), paras[-1])

    new_paras = list(paras)
    if f'anchor="{TOC_ANCHOR_ABBREV}"' not in sdt:
        abbrev_entry = clone_toc_entry(h1_template, TOC_ANCHOR_ABBREV, abbrev_title)
        new_paras = paras[:1] + [abbrev_entry] + paras[1:]

    v_idx = next(
        (i for i, p in enumerate(new_paras) if "_Toc229965365" in p),
        len(new_paras) - 1,
    )
    if f'anchor="{TOC_ANCHOR_APPENDIX_G}"' not in "".join(new_paras):
        g_entry = clone_toc_entry(h2_template, TOC_ANCHOR_APPENDIX_G, APPENDIX_G_TOC_TITLE)
        new_paras = new_paras[: v_idx + 1] + [g_entry] + new_paras[v_idx + 1 :]

    content_match = re.match(
        r"(<ns0:sdt><ns0:sdtPr>.*?</ns0:sdtPr><ns0:sdtContent>)",
        sdt,
        re.DOTALL,
    )
    if not content_match:
        return xml_str
    new_sdt = content_match.group(1) + "".join(new_paras) + "</ns0:sdtContent></ns0:sdt>"
    return xml_str[:sdt_start] + new_sdt + xml_str[sdt_end:]


def enable_update_fields(settings_xml: bytes) -> bytes:
    root = ET.fromstring(settings_xml)
    if root.find(f"{W}updateFields") is None:
        ET.SubElement(root, f"{W}updateFields", {f"{W}val": "true"})
    else:
        root.find(f"{W}updateFields").set(f"{W}val", "true")
    return ET.tostring(root, encoding="utf-8", xml_declaration=True)


def patch_document_xml(xml: bytes, payload: dict) -> bytes:
    root = ET.fromstring(xml)
    body = root.find(f"{W}body")
    children = list(body)

    existing_toc = set(re.findall(r'name="(_Toc\d+)"', xml.decode("utf-8")))
    bm = max_bookmark_id(root) + 1

    abbrev_paras = build_abbreviation_paragraphs(payload, bm, existing_toc)
    bm += len([p for p in abbrev_paras if p.find(f"{W}bookmarkStart") is not None])

    insert_at = find_insert_after_annotation(children)
    for offset, para in enumerate(abbrev_paras):
        body.insert(insert_at + offset, para)

    children = list(body)
    sect_idx = find_sect_pr_index(children)

    appendix_paras = build_appendix_paragraphs(payload, bm, existing_toc)
    for offset, para in enumerate(appendix_paras):
        body.insert(sect_idx + offset, para)

    xml_str = ET.tostring(root, encoding="utf-8", xml_declaration=True).decode("utf-8")
    xml_str = patch_toc_entries(xml_str, payload["abbrevTitle"])
    return xml_str.encode("utf-8")


def patch_toc_only(src: str, dst: str, abbrev_title: str = "ПЕРЕЛІК УМОВНИХ СКОРОЧЕНЬ") -> None:
    if os.path.abspath(src) != os.path.abspath(dst):
        shutil.copy2(src, dst)
    with zipfile.ZipFile(dst, "r") as zin:
        names = zin.namelist()
        files = {name: zin.read(name) for name in names}
    xml = files["word/document.xml"].decode("utf-8")
    files["word/document.xml"] = patch_toc_entries(xml, abbrev_title).encode("utf-8")
    if "word/settings.xml" in files:
        files["word/settings.xml"] = enable_update_fields(files["word/settings.xml"])
    with zipfile.ZipFile(dst, "w", compression=zipfile.ZIP_DEFLATED) as zout:
        for name in names:
            zout.writestr(name, files[name])
    print(f"TOC patched: {dst}")


def main() -> None:
    if len(sys.argv) >= 2 and sys.argv[1] == "--toc-only":
        if len(sys.argv) < 4:
            print("Usage: patch_rgr_docx.py --toc-only <input.docx> <output.docx>")
            sys.exit(1)
        patch_toc_only(sys.argv[2], sys.argv[3])
        return

    if len(sys.argv) < 4:
        print("Usage: patch_rgr_docx.py <source.docx> <output.docx> <payload.json>")
        sys.exit(1)

    src, dst, payload_path = sys.argv[1], sys.argv[2], sys.argv[3]
    payload = json.loads(open(payload_path, encoding="utf-8").read())

    shutil.copy2(src, dst)

    with zipfile.ZipFile(dst, "r") as zin:
        names = zin.namelist()
        files = {name: zin.read(name) for name in names}

    files["word/document.xml"] = patch_document_xml(files["word/document.xml"], payload)

    if "word/settings.xml" in files:
        files["word/settings.xml"] = enable_update_fields(files["word/settings.xml"])

    with zipfile.ZipFile(dst, "w", compression=zipfile.ZIP_DEFLATED) as zout:
        for name in names:
            zout.writestr(name, files[name])

    print(f"Patched: {dst}")
    print("Open in Word — зміст оновлено (ПЕРЕЛІК + Додаток Г).")
    print("Якщо номери сторінок порожні: правий клік по змісту → Оновити поле → Оновити всю таблицю.")


if __name__ == "__main__":
    main()
