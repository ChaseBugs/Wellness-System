import { mkdir, writeFile } from "fs/promises";
import path from "path";
import type { IMediaStorage } from "../domain/IMediaStorage.js";

export const STATIC_URL_PREFIX = "/static";

export function staticRoot(): string {
  return path.join(process.cwd(), "public", "static");
}

/** Writes under public/static/<folder>/, served by app.ts at /static. */
export class LocalDiskStorage implements IMediaStorage {
  async save(folder: string, fileName: string, content: Buffer): Promise<string> {
    const directory = path.join(staticRoot(), ...folder.split("/"));
    await mkdir(directory, { recursive: true });
    await writeFile(path.join(directory, fileName), content);
    return `${STATIC_URL_PREFIX}/${folder}/${fileName}`;
  }
}
