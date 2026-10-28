import "dotenv/config";
import fs from "node:fs/promises";
import path from "node:path";
import { connectDatabase } from "../db.js";
import { Food } from "../models/food.js";

type Mapping = {
  chinese: string;
  korean: string;
  source: "json" | "arrow";
  line: number;
};

const REFERENCE_PATH = path.resolve(process.cwd(), "..", "reference.md");

function stripAnnotation(korean: string): string {
  // remove "(...)" trailing annotation, take first segment, trim
  const noParen = korean.split(/\s*\(/)[0];
  // also drop trailing punctuation
  return noParen.replace(/[,;]\s*$/, "").trim();
}

async function parseReference(): Promise<Map<string, Mapping>> {
  const raw = await fs.readFile(REFERENCE_PATH, "utf-8");
  const lines = raw.split(/\r?\n/);
  const map = new Map<string, Mapping>();
  const conflicts: { chinese: string; existing: string; ignored: string; line: number }[] = [];

  // Format 1: `    "中文": "Joseon language",`
  const jsonRe = /^\s*"([^"]+)"\s*:\s*"([^"]+)"\s*,?\s*$/;
  // Format 2: `中文 → Joseon language ...`
  const arrowRe = /^\s*([^\s→]+)\s*→\s*(.+?)\s*$/;

  lines.forEach((line, idx) => {
    const lineNo = idx + 1;
    let chinese = "";
    let korean = "";
    let source: Mapping["source"] | null = null;

    const jm = line.match(jsonRe);
    if (jm) {
      chinese = jm[1].trim();
      korean = stripAnnotation(jm[2]);
      source = "json";
    } else {
      const am = line.match(arrowRe);
      if (am) {
        chinese = am[1].trim();
        korean = stripAnnotation(am[2]);
        source = "arrow";
      }
    }

    if (!chinese || !korean || !source) return;

    const existing = map.get(chinese);
    if (existing) {
      if (existing.korean !== korean) {
        conflicts.push({ chinese, existing: existing.korean, ignored: korean, line: lineNo });
      }
      return; // first occurrence wins
    }
    map.set(chinese, { chinese, korean, source, line: lineNo });
  });

  if (conflicts.length) {
    console.log(`[parse] ${conflicts.length} duplicate Chinese keys with differing Korean — first wins:`);
    for (const c of conflicts.slice(0, 10)) {
      console.log(`  ${c.chinese}: kept "${c.existing}", ignored "${c.ignored}" (line ${c.line})`);
    }
    if (conflicts.length > 10) console.log(`  ... and ${conflicts.length - 10} more`);
  }

  return map;
}

async function main() {
  const apply = process.argv.includes("--apply");
  const limit = Number(process.env.UPDATE_LIMIT ?? 0);

  console.log(`Mode: ${apply ? "APPLY (will write to DB)" : "DRY-RUN (no DB writes)"}`);
  if (limit > 0) console.log(`Update limit: ${limit}`);

  const map = await parseReference();
  console.log(`[parse] ${map.size} unique Chinese→Korean mappings loaded`);

  await connectDatabase();

  const totalWithChinese = await Food.countDocuments({ chineseName: { $exists: true, $ne: "" } });
  console.log(`[db] ${totalWithChinese} foods have a chineseName`);

  let scanned = 0;
  let matched = 0;
  let needsUpdate = 0;
  let updated = 0;
  let unchanged = 0;
  let noMapping = 0;
  const samples: { chinese: string; oldKr: string; newKr: string }[] = [];

  const cursor = Food.find(
    { chineseName: { $exists: true, $ne: "" } },
    { _id: 1, chineseName: 1, koreanName: 1 }
  ).lean().cursor();

  for await (const doc of cursor) {
    scanned++;
    const cn = String(doc.chineseName ?? "").trim();
    if (!cn) continue;
    const m = map.get(cn);
    if (!m) {
      noMapping++;
      continue;
    }
    matched++;
    const oldKr = String(doc.koreanName ?? "").trim();
    if (oldKr === m.korean) {
      unchanged++;
      continue;
    }
    needsUpdate++;
    if (samples.length < 20) samples.push({ chinese: cn, oldKr, newKr: m.korean });

    if (apply) {
      await Food.updateOne({ _id: doc._id }, { $set: { koreanName: m.korean } });
      updated++;
      if (limit > 0 && updated >= limit) {
        console.log(`[apply] reached UPDATE_LIMIT=${limit}, stopping`);
        break;
      }
    }
  }

  console.log("");
  console.log("─── Summary ───");
  console.log(`Scanned (with chineseName): ${scanned}`);
  console.log(`Matched in reference:       ${matched}`);
  console.log(`Already correct:            ${unchanged}`);
  console.log(`Needs update:               ${needsUpdate}`);
  console.log(`No mapping in reference:    ${noMapping}`);
  if (apply) console.log(`Applied updates:            ${updated}`);

  if (samples.length) {
    console.log("");
    console.log("─── Sample changes (first 20) ───");
    for (const s of samples) {
      console.log(`  ${s.chinese.padEnd(8)} : "${s.oldKr}" → "${s.newKr}"`);
    }
  }

  await (await import("mongoose")).default.disconnect();
  console.log("");
  console.log(apply ? "DONE — DB updated." : "DONE — dry-run only. Re-run with --apply to write changes.");
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
