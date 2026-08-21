import { NextResponse } from "next/server";
import {
  ADMIN_COOKIE,
  adminCookieOptions,
  checkAdminPassword,
  isAdminAuthed,
  makeAdminToken,
} from "@/lib/admin-auth";
import { listInscritos } from "@/lib/sheet";

export const runtime = "nodejs";

export async function GET() {
  if (!(await isAdminAuthed())) {
    return NextResponse.json({ ok: false }, { status: 401 });
  }

  const rows = await listInscritos();
  return NextResponse.json({ ok: true, rows });
}

export async function POST(request: Request) {
  let password = "";
  try {
    const body = (await request.json()) as { password?: string };
    password = body.password ?? "";
  } catch {
    return NextResponse.json({ ok: false, message: "Pedido inválido" }, { status: 400 });
  }

  if (!checkAdminPassword(password)) {
    return NextResponse.json({ ok: false, message: "Password incorrecta" }, { status: 401 });
  }

  const response = NextResponse.json({ ok: true });
  response.cookies.set(ADMIN_COOKIE, makeAdminToken(), adminCookieOptions());
  return response;
}

export async function DELETE() {
  const response = NextResponse.json({ ok: true });
  response.cookies.set(ADMIN_COOKIE, "", { ...adminCookieOptions(), maxAge: 0 });
  return response;
}
