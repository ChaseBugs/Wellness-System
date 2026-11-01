import { readFile } from "fs/promises";
import path from "path";
import { NextResponse } from "next/server";

// Foodvisor's mobile design screens (mobile/Foodvisor/design/ui), shown on /foodvisor/ui-workflows.
const designUiDir = path.resolve(process.cwd(), "..", "mobile", "Foodvisor", "design", "ui");

export async function GET(_request: Request, context: { params: Promise<{ file: string }> }) {
  const { file } = await context.params;
  const safeFile = path.basename(decodeURIComponent(file));

  if (!safeFile.endsWith(".png")) {
    return new NextResponse("Unsupported file", { status: 400 });
  }

  const filePath = path.resolve(designUiDir, safeFile);

  if (!filePath.startsWith(designUiDir + path.sep)) {
    return new NextResponse("Invalid file", { status: 400 });
  }

  try {
    const image = await readFile(filePath);
    return new NextResponse(image, {
      headers: {
        "Cache-Control": "public, max-age=3600",
        "Content-Type": "image/png"
      }
    });
  } catch {
    return new NextResponse("Not found", { status: 404 });
  }
}
