#!/usr/bin/env python3
"""Rebuild public/data/voters.json + stats.json from the COV master workbook.

Imports every useful column from GEORGE-26-01234 and the neighborhood tabs,
tags the four walk-sheet neighborhoods, and assigns every remaining voter to
a street-based city region so the field book has no leftover bucket.
"""
from __future__ import annotations

import json
import re
from collections import Counter, defaultdict
from datetime import date, datetime
from pathlib import Path

import openpyxl

SRC = Path("/workspace/attachments/COV Master List (3).xlsx")
OUT_V = Path("/workspace/public/data/voters.json")
OUT_S = Path("/workspace/public/data/stats.json")
OUT_S2 = Path("/workspace/src/lib/stats.json")

SHEET_NB = {
    "River Forest": "River Forest",
    "Oak Alley": "Oak Alley",
    "Oak Alley Pt.2": "Oak Alley",
    "Barkley Park": "Barkley Park",
    "Dist.D S.W.": "District D SW",
}

# Streets taken from the neighborhood walk sheets, plus adjoining same-subdivision streets.
RIVER_FOREST = {
    "LURLINE DR", "KAREN DR", "BETH DR", "ELLEN DR", "KATHLEEN DR", "SPRUCE DR",
    "HICKORY DR", "MICHELLE DR", "S DIVISION DR", "WILLOW DR", "ROSEMARY DR",
    "BEECH DR", "REDWOOD DR", "PATRICIA DR", "SAMANTHA DR", "CLEVELAND ST",
    "S CLEVELAND ST", "MAPLE LN",
}
OAK_ALLEY = {
    "DOMINIC DR", "ORCHARD DR", "DARLENE DR", "THOMAS DR", "OAK ALLEY BLVD",
    "BRYCE DR", "JUSTIN DR", "CAMRON DR", "DIXIE DR", "BUCK DR", "SAM CT",
    "MARGARET DR", "ESTELLE COURT", "SNOWFINCH LN", "CATHERINE CT", "ORCHARD WAY",
}
BARKLEY = {
    "WOODSPRINGS CT", "AUTUMN WOODS DR", "WOODBURNE LP", "SOMERSET CT",
    "MILLSTONE CT", "BARKLEY BLVD", "PINE AIR DR",
}
COVINGTON_POINT = {
    "KNOLL PINE CIR", "BRANCH CROSSING DR", "COVINGTON POINT DR",
    "CARRIAGE PINES LN", "PINEY PLAINS LN", "COTTAGE GREEN LN",
    "MEADOW SPRING PL", "WILD MEADOW WAY", "OAK BRANCH DR", "ST ANNE CIR",
    "GRATITUDE DR", "ST THOMAS WAY", "PINEWOOD DR", "OZONE PARK DR",
    "SHADY POND LN", "E 34TH AVE", "E 35TH AVE", "MOORSTONE DR", "TRECHEL DR",
    "S PARK LN", "BUCKTHORNE PL", "ST GEORGE CIR", "GILMORE CIR", "ST JOHN CIR",
    "MALLARD GLEN DR", "RIVER RD",
}
FAIRGROUNDS = {
    "SUMNER ST", "WHARTON ST", "ST WILLIAMS ST", "MARTIN LUTHER KING DR",
    "E MAGEE ST", "E HORNSBY ST", "DRUM ST", "N HOSMER ST", "E JESSE JONES ST",
    "OX LOT SQ", "SULPHUR SPRINGS LN", "HWY 437", "RUE ST LOUIS LOOP",
    "RUE ST JOHN BLVD", "E GIBSON ST", "E LOCKWOOD ST", "E TATE ST",
    "E KIRKLAND ST", "VOSS DR", "VOSS ST", "N BRIGGS ST", "N BAKER ST",
    "COHN ST", "ANITA ST", "ALFORD ST", "VILLAGE WALK", "CHEROKEE LN",
    "E 31ST AVE", "E 33RD AVE", "E 32ND AVE", "E 24TH AVE", "E 25TH AVE",
    "REVERE DR", "N VERMONT ST",
}
NATCHEZ = {
    "NATCHEZ LOOP", "SAVANNAH ST", "DARLINGTON ST", "INSPIRATION LN",
    "W ST MARY DR", "LAKEWOOD NORTHSHORE DR", "E ST MARY DR", "PECAN GROVE CT",
}
OLD_LANDING = {
    "OLD LANDING RD", "CYPRESS RD", "RIVERBEND DR", "RIVERBEND LN",
    "BOGUE FALAYA DR", "CYPRESS COVE PL", "RIVERVIEW DR", "BENNETT RD",
}
PINE_CREST = {
    "PINE CREST AVE", "PARKVIEW BLVD", "EMILY DIAMOND WAY", "LOBELIA ALY",
    "ARDESIA ALY", "GREEN ASH ALY", "POLDERS LN", "BUCKEYE LN", "HOPE LN",
    "PURSLANE DR", "PHILIP DR", "SCHOULTZ DR", "MOSSY ST", "JOES DR",
    "CHAMPAGNE ST", "ARTHUR RD", "W HALL AVE",
}
MILE_BRANCH = {
    "MILE BRANCH CT", "BROOKE HOLLOW LN", "HUMMUCK LN",
}
NORTH_NAMED = {
    "N FLORIDA ST", "N LEE RD", "N CLAIBORNE ST", "N TYLER ST", "N TAYLOR ST",
    "N POLK ST", "N BUCHANAN ST", "N FILMORE ST", "N PIERCE ST", "N VAN BUREN ST",
    "N JACKSON ST", "N MONROE ST", "N COLUMBIA ST", "N HARRISON ST",
    "N MADISON ST", "N JEFFERSON AVE", "N THEARD ST", "DUTCH ALY", "DUTCH ALLEY",
    "SUE ALY", "W MORGAN ST", "W JESSE JONES ST", "N COLLINS BLVD", "N VOSS ALY",
    "W EDWARDS ST", "E SHARP ST", "E CLARK ST", "BARBEE RD",
}
WEST_NAMED = {
    "W PRESIDENTS DR", "S MADISON ST", "S FILMORE ST", "S HARRISON ST",
    "S JOHNSON ST", "S BUCHANAN ST", "LEGACY OAKS DR", "LEGACY FOREST DR",
    "GLOCKNER LN", "W MAGNOLIA ST", "S TAYLOR ST", "S VAN BUREN ST",
    "S MONROE ST", "S PIERCE ST", "S POLK ST", "S JACKSON ST", "S LINCOLN ST",
    "N LINCOLN ST",
}
REAGAN = {
    "RONALD REAGAN HWY", "RUE ST MARTIN", "GARDEN AVE", "RUTH DR",
    "SNAKE JENKINS RD", "WINONA DR", "LAZY CREEK DR", "TAVERNY CT", "HWY 190 E",
}

NORTH_AVE = re.compile(r"^W 2[4-9]TH AVE$|^W 3[0-4]TH AVE$|^W 27TH AVE$")
WEST_CENTRAL_AVE = re.compile(r"^W 1[2-9]TH AVE$|^W 2[0-3]RD AVE$|^W 21ST AVE$")
HISTORIC_E_AVE = re.compile(r"^E \d+(ST|ND|RD|TH) AVE$")
HISTORIC_W_AVE = re.compile(r"^W (5TH|6TH|7TH|8TH|9TH|10TH|11TH) AVE$")
HISTORIC_S = re.compile(
    r"^S (JAHNCKE AVE|NEW HAMPSHIRE ST|VERMONT ST|JEFFERSON AVE|JEFFERSON PKY|"
    r"MASSACHUSETTS ST|AMERICA ST|ADAMS ST|WASHINGTON ST|LOUISIANA ST)$"
)


def nid(v) -> str:
    if v is None or v == "":
        return ""
    if isinstance(v, float):
        return str(int(v)) if v.is_integer() else str(v)
    s = str(v).strip()
    if s.endswith(".0"):
        s = s[:-2]
    return s


def cell(v) -> str:
    if v is None:
        return ""
    if isinstance(v, datetime):
        return v.date().isoformat()
    if isinstance(v, date):
        return v.isoformat()
    if isinstance(v, float):
        return str(int(v)) if v.is_integer() else str(v)
    return str(v).strip()


def parse_addr(a: str):
    a = (a or "").strip().upper()
    if not a:
        return "", "", ""
    if a.startswith("PO BOX") or a.startswith("P.O.") or a.startswith("P O BOX") or a.startswith("PO BO "):
        return "", "PO BOX", ""
    unit = ""
    if "," in a:
        main, rest = a.split(",", 1)
        unit = rest.strip()
        a = main.strip()
    m = re.match(r"^(\d+(?:/\d+)?[A-Z]?)\s+(.+)$", a)
    if m:
        return m.group(1), m.group(2).strip(), unit
    return "", a, unit


def parse_specials(s: str) -> dict:
    out = {}
    for part in (s or "").split(";"):
        part = part.strip()
        if ":" not in part:
            continue
        k, val = part.split(":", 1)
        val = val.strip().strip("/")
        if val and val != "/":
            out[k.strip()] = val
    return out


def city_dist(v) -> str:
    s = cell(v).upper().replace(".0", "")
    if s.startswith("1") and len(s) >= 2:
        return s[-1]
    return s


def norm_street(s: str) -> str:
    s = (s or "").upper().replace(".", "").replace("#", " ")
    s = re.sub(r"\s+", " ", s).strip()
    s = re.sub(r"^1/2\s+", "", s)
    s = re.sub(r"\s+(APT|STE|SUITE|UNIT|PMB|BOX)\s+.+$", "", s)
    return s.strip(" ,")


def rec_from_row(r):
    if not r:
        return None
    vals = list(r) + [None] * 36
    prec = cell(vals[0]).replace(".0", "")
    fn = cell(vals[1]).upper()
    ln = cell(vals[3]).upper()
    if prec == "Jurisdiction_Precinct" or fn == "PERSONAL_FIRSTNAME":
        return None
    if not prec and not fn and not ln:
        return None
    house, street, unit = parse_addr(cell(vals[4]))
    phone = cell(vals[31])
    if phone.endswith(".0"):
        phone = phone[:-2]
    age = vals[27]
    try:
        age = int(float(age)) if age not in (None, "") else None
    except Exception:
        age = None
    walk = vals[33]
    try:
        walk = int(float(walk)) if walk not in (None, "") else None
    except Exception:
        walk = None
    specs = parse_specials(cell(vals[35]))
    zip5 = cell(vals[8])
    zip4 = cell(vals[9])
    return {
        "id": nid(vals[30]) or f"{fn}-{ln}-{cell(vals[4])}",
        "fn": fn,
        "mn": cell(vals[2]).upper(),
        "ln": ln,
        "addr": cell(vals[4]).upper(),
        "addr2": cell(vals[5]).upper(),
        "city": cell(vals[6]).upper() or "COVINGTON",
        "st": cell(vals[7]).upper() or "LA",
        "zip": zip5.zfill(5)[:5] if zip5 else "",
        "zip4": zip4.zfill(4)[:4] if zip4 else "",
        "pct": prec,
        "dist": city_dist(vals[13]),
        "party": cell(vals[26]).upper() or "NOPTY",
        "age": age,
        "sex": cell(vals[24]).upper(),
        "race": cell(vals[25]).upper(),
        "phone": phone,
        "lv": cell(vals[32])[:10],
        "rd": cell(vals[29])[:10],
        "status": cell(vals[28]).upper() or "A",
        "walk": walk,
        "house": house,
        "street": street,
        "unit": unit,
        "pj": cell(vals[17]),
        "sb": cell(vals[20]),
        "hd": cell(vals[19]),
        "sen": cell(vals[21]),
        "cd": cell(vals[14]),
        "bese": cell(vals[12]),
        "ac": cell(vals[11]),
        "dc": cell(vals[15]),
        "jp": cell(vals[16]),
        "psc": cell(vals[18]),
        "sc": cell(vals[22]),
        "tw": cell(vals[23]),
        "rscc": specs.get("RSCC", ""),
        "dscc": specs.get("DSCC", ""),
        "taxc": specs.get("TAX", ""),
        "rec": specs.get("REC", ""),
        "fir": specs.get("FIR", ""),
        "nb": [],
        "region": "",
    }


def assign_region(v) -> str:
    street = norm_street(v.get("street") or "")
    dist = v.get("dist") or ""
    pct = v.get("pct") or ""
    city = v.get("city") or ""
    nbs = v.get("nb") or []

    if street == "PO BOX":
        return "PO Box / mail"
    if city not in ("", "COVINGTON"):
        return "Out of town"

    if "River Forest" in nbs:
        return "River Forest"
    if "Oak Alley" in nbs:
        return "Oak Alley"
    if "Barkley Park" in nbs:
        return "Barkley Park"
    if "District D SW" in nbs:
        return "District D SW"

    if street in RIVER_FOREST:
        return "River Forest"
    if street in OAK_ALLEY:
        return "Oak Alley"
    if street in BARKLEY:
        return "Barkley Park"
    if street == "MENETRE DR" and dist == "D":
        return "District D SW"
    if street == "MENETRE DR":
        return "River Forest"
    if street in COVINGTON_POINT:
        return "Covington Point"
    if street in FAIRGROUNDS:
        return "Fairgrounds / east side"
    if street in REAGAN or "RONALD REAGAN" in street or street.startswith("HWY 190"):
        return "Reagan / Hwy 190"
    if street in NATCHEZ:
        return "Natchez / Lakewood"
    if street in OLD_LANDING:
        return "Old Landing / river"
    if street in PINE_CREST:
        return "Pine Crest / Parkview"
    if street in MILE_BRANCH:
        return "Mile Branch"
    if street in {"E BOSTON ST", "LEE LN", "JOHNSTON AVE", "N MASSACHUSETTS ST"}:
        return "Historic core"
    if NORTH_AVE.match(street) or street in NORTH_NAMED:
        return "North grid"
    if WEST_CENTRAL_AVE.match(street) or street in WEST_NAMED:
        return "West-central avenues"
    if HISTORIC_S.match(street) or HISTORIC_E_AVE.match(street) or HISTORIC_W_AVE.match(street):
        return "Historic core"
    if street.startswith("S ") and dist == "E":
        return "Historic core"
    if street.startswith("E ") and dist in ("E", "B"):
        return "Historic core" if dist == "E" else "Fairgrounds / east side"

    # precinct / district fallback so every remaining street is placed
    if dist == "A":
        return "North grid"
    if dist == "B" and pct == "C09":
        return "Covington Point"
    if dist == "B" and pct == "C11":
        return "Reagan / Hwy 190"
    if dist == "B":
        return "Fairgrounds / east side"
    if dist == "C" and pct == "C01":
        return "River Forest"
    if dist == "C" and pct == "C11":
        return "Oak Alley"
    if dist == "C":
        return "Barkley Park"
    if dist == "D" and pct == "C03":
        return "Natchez / Lakewood"
    if dist == "D":
        return "West-central avenues"
    if dist == "E":
        return "Historic core"
    return "Other"


def bucket_age(a):
    if a is None:
        return "unk"
    if a < 25:
        return "18-24"
    if a < 35:
        return "25-34"
    if a < 45:
        return "35-44"
    if a < 55:
        return "45-54"
    if a < 65:
        return "55-64"
    if a < 75:
        return "65-74"
    return "75+"


def agg(rows):
    parties = Counter(v["party"] for v in rows)
    precincts = Counter(v["pct"] for v in rows)
    ages = [v["age"] for v in rows if v["age"]]
    races = Counter(v["race"] for v in rows if v["race"])
    return {
        "n": len(rows),
        "parties": dict(parties),
        "precincts": dict(precincts),
        "avgAge": round(sum(ages) / len(ages), 1) if ages else None,
        "phones": sum(1 for v in rows if v["phone"]),
        "voted2024": sum(1 for v in rows if (v["lv"] or "").startswith("2024-11")),
        "ageBuckets": dict(Counter(bucket_age(v["age"]) for v in rows)),
        "sex": dict(Counter(v["sex"] for v in rows)),
        "race": dict(races),
        "nb": dict(Counter(n for v in rows for n in v["nb"])),
        "regions": dict(Counter(v["region"] for v in rows)),
        "streets": len({(v["street"], v["zip"]) for v in rows if v["street"]}),
        "households": len({(v["zip"], v["house"], v["street"]) for v in rows}),
    }


def main():
    wb = openpyxl.load_workbook(SRC, read_only=True, data_only=True)
    by_id = {}
    order = []

    def add(rec, nb=None):
        if not rec:
            return
        if nb and nb not in rec["nb"]:
            rec["nb"].append(nb)
        existing = by_id.get(rec["id"])
        if existing:
            if nb and nb not in existing["nb"]:
                existing["nb"].append(nb)
            return
        by_id[rec["id"]] = rec
        order.append(rec["id"])

    ws = wb["GEORGE-26-01234 (1).xls"]
    first = True
    for r in ws.iter_rows(values_only=True):
        if first:
            first = False
            continue
        rec = rec_from_row(r)
        if rec:
            if rec["id"] in by_id:
                rec["id"] = f"{rec['id']}-{rec.get('walk') or rec.get('house') or len(order)}"
            add(rec)

    for sheet, nb in SHEET_NB.items():
        for r in wb[sheet].iter_rows(values_only=True):
            rec = rec_from_row(r)
            if rec:
                add(rec, nb)
    wb.close()

    voters = [by_id[i] for i in order]
    for v in voters:
        v["region"] = assign_region(v)

    by_d = defaultdict(list)
    by_p = defaultdict(list)
    by_n = defaultdict(list)
    by_r = defaultdict(list)
    for v in voters:
        by_d[v["dist"]].append(v)
        by_p[v["pct"]].append(v)
        by_r[v["region"]].append(v)
        for n in v["nb"]:
            by_n[n].append(v)

    stats = {
        "total": len(voters),
        "generated": date.today().isoformat(),
        "source": "COV Master List — all 36 columns, all 6 sheets",
        "city": agg(voters),
        "districts": {k: agg(vs) for k, vs in sorted(by_d.items())},
        "precincts": {k: agg(vs) for k, vs in sorted(by_p.items())},
        "neighborhoods": {k: agg(vs) for k, vs in sorted(by_n.items())},
        "regions": {k: agg(vs) for k, vs in sorted(by_r.items(), key=lambda x: -len(x[1]))},
    }

    OUT_V.parent.mkdir(parents=True, exist_ok=True)
    OUT_V.write_text(json.dumps(voters, separators=(",", ":")))
    text = json.dumps(stats, indent=2)
    OUT_S.write_text(text)
    OUT_S2.write_text(text)
    print("voters", len(voters), "bytes", OUT_V.stat().st_size)
    print("nb", Counter(n for v in voters for n in v["nb"]))
    print("regions", Counter(v["region"] for v in voters))
    print("untagged region Other", sum(1 for v in voters if v["region"] == "Other"))
    print("with race", sum(1 for v in voters if v["race"]))
    print("with dscc", sum(1 for v in voters if v["dscc"]))
    print("sample keys", sorted(voters[0].keys()))
    print("sample", {k: voters[0][k] for k in ("fn", "ln", "addr", "region", "sb", "hd", "sen", "rscc", "dscc", "cd")})


if __name__ == "__main__":
    main()
