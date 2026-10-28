from __future__ import annotations

import argparse
import json
import re
import unicodedata
from pathlib import Path

import easyocr


CATEGORY_LABELS = {
    "physical": "physical",
    "cognitive": "cognitive",
    "communication": "communication",
    "social & emotional": "social_emotional",
    "social emotional": "social_emotional",
    "social emotlonal": "social_emotional",
}

STOP_LINES = {
    "yes",
    "no",
    "almost",
    "related activities",
    "no related activity found",
    "create report",
    "home",
    "activities",
    "milestones",
    "knowledge",
    "parenting support",
    "check milestone progress",
}

NUMBERED_RE = re.compile(r"^\s*(\d{1,2})(?:\s*[\.\),]\s*(.*)|\s+(.+)|\s*)$")


def clean_text(value: str) -> str:
    value = unicodedata.normalize("NFKD", value).encode("ascii", "ignore").decode("ascii")
    value = value.replace("|", "I")
    value = re.sub(r"\s+", " ", value)
    value = value.strip(" -:;,.")
    return value


def normalized(value: str) -> str:
    return re.sub(r"[^a-z0-9]+", " ", clean_text(value).lower()).strip()


def category_from_line(line: str) -> str | None:
    key = normalized(line)
    return CATEGORY_LABELS.get(key)


def is_stop_line(line: str) -> bool:
    key = normalized(line)
    if key in STOP_LINES:
        return True
    if key.startswith("gain insights into"):
        return True
    if key.startswith("with data of"):
        return True
    if "milestone progress report" in key:
        return True
    if "average range" in key:
        return True
    if "potential" in key and "score" in key:
        return True
    if re.match(r"^\d{1,2}:\d{2}$", key):
        return True
    return False


def sql_quote(value: str | None) -> str:
    if value is None:
        return "NULL"
    return "'" + value.replace("'", "''") + "'"


def extract_records(
    root: Path,
    limit_month: int | None = None,
    from_month: int | None = None,
    to_month: int | None = None,
) -> list[dict]:
    reader = easyocr.Reader(["en"], gpu=False, verbose=False)
    records: dict[tuple[int, str, int], dict] = {}

    month_dirs = sorted(
        [p for p in root.iterdir() if p.is_dir() and p.name.isdigit()],
        key=lambda p: int(p.name),
    )
    if limit_month is not None:
        month_dirs = [p for p in month_dirs if int(p.name) <= limit_month]
    if from_month is not None:
        month_dirs = [p for p in month_dirs if int(p.name) >= from_month]
    if to_month is not None:
        month_dirs = [p for p in month_dirs if int(p.name) <= to_month]

    for month_dir in month_dirs:
        month = int(month_dir.name)
        current_category: str | None = None
        image_paths = sorted(month_dir.glob("*.png"))
        print(f"OCR month {month}: {len(image_paths)} images", flush=True)

        for image_path in image_paths:
            lines = [
                clean_text(t)
                for t in reader.readtext(
                    str(image_path),
                    detail=0,
                    paragraph=False,
                    canvas_size=2000,
                    mag_ratio=1.0,
                )
            ]
            image_text = " ".join(normalized(line) for line in lines)
            if "milestone progress report" in image_text or "average range" in image_text:
                continue
            active: dict | None = None

            for raw_line in lines:
                line = clean_text(raw_line)
                if not line:
                    continue
                if re.match(r"^\d{1,2}\.\d{2}$", line):
                    continue

                cat = category_from_line(line)
                if cat is not None:
                    if active is not None:
                        save_record(records, active)
                        active = None
                    current_category = cat
                    continue

                numbered = NUMBERED_RE.match(line)
                if numbered and current_category:
                    if active is not None:
                        save_record(records, active)
                    active = {
                        "month": month,
                        "milestone_type": current_category,
                        "display_order": int(numbered.group(1)),
                        "question": clean_text(numbered.group(2) or numbered.group(3) or ""),
                        "sources": [str(image_path.relative_to(root))],
                    }
                    continue

                if active is not None:
                    if is_stop_line(line) or category_from_line(line) is not None:
                        save_record(records, active)
                        active = None
                        cat = category_from_line(line)
                        if cat is not None:
                            current_category = cat
                        continue

                    # OCR often splits one milestone across multiple visual lines.
                    active["question"] = clean_text(active["question"] + " " + line)
                    active["sources"].append(str(image_path.relative_to(root)))

            if active is not None:
                save_record(records, active)

    return sorted(records.values(), key=lambda r: (r["month"], r["milestone_type"], r["display_order"]))


def save_record(records: dict[tuple[int, str, int], dict], candidate: dict) -> None:
    question = clean_text(candidate["question"])
    if len(question) < 8:
        return
    norm_question = normalized(question)
    if norm_question in STOP_LINES:
        return
    if "milestone progress report" in norm_question or "average range" in norm_question:
        return
    if "potential" in norm_question and "score" in norm_question:
        return

    key = (candidate["month"], candidate["milestone_type"], candidate["display_order"])
    candidate = {**candidate, "question": question}
    existing = records.get(key)
    if existing is None or len(candidate["question"]) > len(existing["question"]):
        records[key] = candidate


def title_from_question(question: str) -> str:
    title = question
    title = re.sub(r"^(does|can|is|are|has|have|will|would|do)\s+(your|the)?\s*baby\s+", "", title, flags=re.I)
    title = re.sub(r"\?$", "", title).strip()
    if len(title) > 250:
        title = title[:247].rstrip() + "..."
    return title[:1].upper() + title[1:]


def finalize_records(records: list[dict]) -> list[dict]:
    cleaned = []
    for record in records:
        question = record["question"]
        if "^" in question:
            continue
        if len(re.findall(r"[A-Za-z]", question)) < 8:
            continue
        cleaned.append({**record})

    cleaned.sort(key=lambda r: (r["month"], r["milestone_type"], r["display_order"]))
    current_group: tuple[int, str] | None = None
    next_order = 1
    for record in cleaned:
        group = (record["month"], record["milestone_type"])
        if group != current_group:
            current_group = group
            next_order = 1
        record["display_order"] = next_order
        next_order += 1
    return cleaned


def build_sql(records: list[dict]) -> str:
    lines = [
        "-- Migration 030: Seed milestone definitions extracted from ui/babyG/milestones screenshots",
        "-- Generated by scripts/extract-ui-milestones.py.",
        "",
        "DO $$",
        "BEGIN",
    ]

    for record in records:
        question = record["question"]
        title = title_from_question(question)
        lines.extend(
            [
                "  IF EXISTS (",
                "    SELECT 1 FROM milestone_definitions",
                f"    WHERE month = {record['month']}",
                f"      AND milestone_type = {sql_quote(record['milestone_type'])}",
                f"      AND display_order = {record['display_order']}",
                "  ) THEN",
                "    UPDATE milestone_definitions",
                f"    SET title = {sql_quote(title)},",
                f"        description = {sql_quote(question)},",
                f"        question = {sql_quote(question)},",
                "        related_activity = NULL,",
                "        doctor_verified = false,",
                "        updated_at = CURRENT_TIMESTAMP",
                f"    WHERE month = {record['month']}",
                f"      AND milestone_type = {sql_quote(record['milestone_type'])}",
                f"      AND display_order = {record['display_order']};",
                "  ELSE",
                "    INSERT INTO milestone_definitions",
                "      (month, milestone_type, title, description, question, related_activity, display_order, doctor_verified)",
                "    VALUES",
                f"      ({record['month']}, {sql_quote(record['milestone_type'])}, {sql_quote(title)},",
                f"       {sql_quote(question)}, {sql_quote(question)}, NULL, {record['display_order']}, false);",
                "  END IF;",
                "",
            ]
        )

    lines.extend(["END $$;", ""])
    return "\n".join(lines)


def main() -> None:
    parser = argparse.ArgumentParser()
    parser.add_argument(
        "--root",
        type=Path,
        default=Path(__file__).resolve().parents[2] / "ui" / "babyG" / "milestones",
    )
    parser.add_argument(
        "--out-json",
        type=Path,
        default=Path(__file__).resolve().parents[1] / "database" / "generated-ui-milestones.json",
    )
    parser.add_argument(
        "--out-sql",
        type=Path,
        default=Path(__file__).resolve().parents[1] / "database" / "migrations" / "030_seed_ui_milestones.sql",
    )
    parser.add_argument("--limit-month", type=int)
    parser.add_argument("--from-month", type=int)
    parser.add_argument("--to-month", type=int)
    args = parser.parse_args()

    records = finalize_records(extract_records(args.root, args.limit_month, args.from_month, args.to_month))
    args.out_json.write_text(json.dumps(records, indent=2) + "\n", encoding="utf-8")
    args.out_sql.write_text(build_sql(records), encoding="utf-8")
    print(f"Wrote {len(records)} records to {args.out_json} and {args.out_sql}")


if __name__ == "__main__":
    main()
