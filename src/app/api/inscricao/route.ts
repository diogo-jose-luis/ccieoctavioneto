import { NextResponse } from "next/server";
import { sendRegistrationEmails } from "@/lib/mail";
import { formatLuandaDate, registerInscrito } from "@/lib/sheet";
import {
  firstNameOf,
  hasErrors,
  validateRegistration,
} from "@/lib/validation";

export const runtime = "nodejs";
export const maxDuration = 60;

export async function POST(request: Request) {
  let payload: unknown;
  try {
    payload = await request.json();
  } catch {
    return NextResponse.json({ ok: false, message: "Pedido inválido" }, { status: 400 });
  }

  const raw = payload as { name?: string; email?: string; phone?: string };
  const { values, errors } = validateRegistration({
    name: raw.name ?? "",
    email: raw.email ?? "",
    phone: raw.phone ?? "",
  });

  if (hasErrors(errors)) {
    return NextResponse.json({ ok: false, errors }, { status: 422 });
  }

  const when = formatLuandaDate();
  const firstName = firstNameOf(values.name);

  try {
    const saved = await registerInscrito(values);
    if (saved.duplicate) {
      return NextResponse.json(
        { ok: false, code: "EMAIL_EXISTS" },
        { status: 409 },
      );
    }
  } catch (error) {
    console.error("Falha ao gravar a planilha", error);
    return NextResponse.json(
      { ok: false, message: "Não foi possível gravar a inscrição. Tente novamente." },
      { status: 500 },
    );
  }

  try {
    await sendRegistrationEmails({ ...values, firstName, when });
  } catch (error) {
    console.error("Falha ao enviar e-mail", error);
    return NextResponse.json(
      {
        ok: false,
        message:
          "A inscrição foi registada, mas o e-mail não foi enviado. Tente novamente ou contacte-nos.",
      },
      { status: 502 },
    );
  }

  return NextResponse.json({ ok: true, firstName });
}
