import { NextResponse } from "next/server";
import { isAdminAuthed } from "@/lib/admin-auth";
import { readInscritosText } from "@/lib/sheet";

export const runtime = "nodejs";

export async function GET() {
  if (!(await isAdminAuthed())) {
    return NextResponse.json({ ok: false }, { status: 401 });
  }

  const content = await readInscritosText();
  return new NextResponse(content, {
    headers: {
      "Content-Type": "text/plain; charset=utf-8",
      "Content-Disposition": 'attachment; filename="inscritos-live-ccie.txt"',
      "Cache-Control": "no-store",
    },
  });
}
