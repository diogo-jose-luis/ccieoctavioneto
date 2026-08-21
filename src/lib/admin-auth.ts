import { createHash, createHmac, timingSafeEqual } from "crypto";
import { cookies } from "next/headers";

export const ADMIN_COOKIE = "on_sheet";

function secret() {
  return process.env.ADMIN_SECRET || process.env.ADMIN_PASSWORD || "dev-secret";
}

export function makeAdminToken() {
  return createHmac("sha256", secret()).update("inscritos-access-v1").digest("hex");
}

export function isValidAdminToken(token: string | undefined) {
  if (!token) return false;
  const expected = Buffer.from(makeAdminToken());
  const received = Buffer.from(token);
  if (expected.length !== received.length) return false;
  return timingSafeEqual(expected, received);
}

export function checkAdminPassword(input: string) {
  const expected = process.env.ADMIN_PASSWORD ?? "";
  const left = createHash("sha256").update(input).digest();
  const right = createHash("sha256").update(expected).digest();
  return timingSafeEqual(left, right) && expected.length > 0;
}

export async function isAdminAuthed() {
  const store = await cookies();
  return isValidAdminToken(store.get(ADMIN_COOKIE)?.value);
}

export function adminCookieOptions() {
  return {
    httpOnly: true,
    sameSite: "lax" as const,
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: 60 * 60 * 24 * 7,
  };
}
