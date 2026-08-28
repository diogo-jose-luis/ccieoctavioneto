import { NextResponse } from "next/server";
import { isAdminAuthed } from "@/lib/admin-auth";
import { buildInscritosExcel } from "@/lib/sheet";

export const runtime = "nodejs";

export async function GET() {
  if (!(await isAdminAuthed())) {
    return NextResponse.json({ ok: false }, { status: 401 });
  }

  const buffer = await buildInscritosExcel();
  return new NextResponse(Buffer.from(buffer), {
    headers: {
      "Content-Type":
        "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
      "Content-Disposition": 'attachment; filename="inscritos-live-ccie.xlsx"',
      "Cache-Control": "no-store",
    },
  });
}
