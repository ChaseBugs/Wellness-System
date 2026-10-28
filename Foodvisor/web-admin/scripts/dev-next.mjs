import { spawn } from "node:child_process";
import { rmSync } from "node:fs";
import { resolve } from "node:path";

const distDir = ".next-dev";
const nextBin = process.platform === "win32"
  ? resolve("node_modules", ".bin", "next.cmd")
  : resolve("node_modules", ".bin", "next");
const command = process.platform === "win32" ? "cmd.exe" : nextBin;
const args = process.platform === "win32" ? ["/d", "/c", nextBin, "dev"] : ["dev"];

rmSync(resolve(distDir), { recursive: true, force: true });

const child = spawn(command, args, {
  stdio: "inherit",
  env: {
    ...process.env,
    NEXT_DIST_DIR: distDir
  }
});

child.on("exit", (code, signal) => {
  if (signal) {
    process.kill(process.pid, signal);
    return;
  }
  process.exit(code ?? 0);
});
