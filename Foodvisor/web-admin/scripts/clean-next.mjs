import { rmSync } from "node:fs";
import { resolve } from "node:path";

const distDir = process.argv[2] || process.env.NEXT_DIST_DIR || ".next";

rmSync(resolve(distDir), { recursive: true, force: true });
