import { NextResponse } from "next/server";
import { isAdminAuthed } from "@/lib/admin-auth";
import { readSpreadsheetBuffer } from "@/lib/sheet";

export const runtime = "nodejs";

export async function GET() {
  if (!(await isAdminAuthed())) {
    return NextResponse.json({ ok: false }, { status: 401 });
  }

  const buffer = await readSpreadsheetBuffer();
  return new NextResponse(new Uint8Array(buffer), {
    headers: {
      "Content-Type":
        "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
      "Content-Disposition": 'attachment; filename="inscritos-live-ccie.xlsx"',
      "Cache-Control": "no-store",
    },
  });
}
