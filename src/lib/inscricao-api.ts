import type { SheetRow } from "@/lib/types";
import { formatLuandaDate, sortInscritosNewestFirst } from "@/lib/sheet-date";

const API_BASE =
  process.env.INSCRICAO_API_BASE?.trim() ||
  "https://apsm-api.altrad-prezioso.ao/api/inscricao-ccie-evento";

type UnknownRecord = Record<string, unknown>;

export type InscricaoDebug = {
  step: string;
  message: string;
  status?: number;
  url?: string;
  body?: unknown;
};

class InscricaoApiError extends Error {
  step: string;
  status: number;
  url: string;
  body: unknown;

  constructor(input: {
    step: string;
    message: string;
    status?: number;
    url?: string;
    body?: unknown;
  }) {
    super(input.message);
    this.name = "InscricaoApiError";
    this.step = input.step;
    this.status = input.status ?? 0;
    this.url = input.url ?? "";
    this.body = input.body ?? null;
  }
}

export function toInscricaoDebug(error: unknown): InscricaoDebug {
  if (error instanceof InscricaoApiError) {
    return {
      step: error.step,
      message: error.message,
      status: error.status || undefined,
      url: error.url || undefined,
      body: error.body,
    };
  }
  if (error instanceof Error) {
    return { step: "desconhecido", message: error.message };
  }
  return { step: "desconhecido", message: String(error) };
}

function asRecord(value: unknown): UnknownRecord {
  return value && typeof value === "object" ? (value as UnknownRecord) : {};
}

function pick(record: UnknownRecord, keys: string[]) {
  for (const key of keys) {
    const value = record[key];
    if (value != null && String(value).trim()) return String(value).trim();
  }
  return "";
}

function formatMaybeDate(value: string) {
  if (!value) return "";
  const parsed = Date.parse(value);
  if (Number.isNaN(parsed)) return value;
  return formatLuandaDate(new Date(parsed));
}

function toRow(item: unknown, index: number): SheetRow {
  const record = asRecord(item);
  return {
    n: Number(pick(record, ["n", "id", "N.º"])) || index + 1,
    date: formatMaybeDate(
      pick(record, ["created_at", "data", "date", "Data / Hora", "registado_em"]),
    ),
    name: pick(record, ["nome", "name", "Nome"]),
    email: pick(record, ["email", "e-mail", "E-mail"]),
    phone: pick(record, ["telefone", "phone", "telemovel", "Telefone"]),
  };
}

function isDuplicateResponse(status: number, body: UnknownRecord) {
  if (status === 409) return true;
  const blob = JSON.stringify(body).toLowerCase();
  return (
    blob.includes("já") && blob.includes("email")
  ) || blob.includes("already") || blob.includes("duplicate") || blob.includes("existe");
}

function errorMessage(body: UnknownRecord, fallback: string) {
  const message = body.message;
  return typeof message === "string" && message.trim() ? message : fallback;
}

async function fetchJson(url: string, step: string, init?: RequestInit) {
  let response: Response;
  try {
    response = await fetch(url, {
      ...init,
      cache: "no-store",
      headers: {
        Accept: "application/json",
        "Content-Type": "application/json",
        ...(init?.headers ?? {}),
      },
    });
  } catch (error) {
    throw new InscricaoApiError({
      step,
      url,
      message:
        error instanceof Error
          ? `Falha de ligação à API (${step}): ${error.message}`
          : `Falha de ligação à API (${step})`,
    });
  }

  const text = await response.text();
  let body: unknown = {};
  try {
    body = text ? JSON.parse(text) : {};
  } catch {
    body = { raw: text.slice(0, 2000) };
  }
  return { response, body: asRecord(body), url };
}

export async function listInscritos(): Promise<SheetRow[]> {
  const collected: unknown[] = [];
  let page = 1;
  let lastPage = 1;

  do {
    const { response, body, url } = await fetchJson(
      `${API_BASE}/listar?page=${page}`,
      "listar",
    );
    if (!response.ok) {
      throw new InscricaoApiError({
        step: "listar",
        url,
        status: response.status,
        body,
        message: errorMessage(body, `Falha ao listar inscrições (HTTP ${response.status})`),
      });
    }
    const items = Array.isArray(body.inscritos)
      ? body.inscritos
      : Array.isArray(body.data)
        ? body.data
        : [];
    collected.push(...items);
    lastPage = Number(asRecord(body.meta).last_page) || 1;
    page += 1;
  } while (page <= lastPage);

  return sortInscritosNewestFirst(
    collected
      .map((item, index) => toRow(item, index))
      .filter((row) => row.email),
  );
}

export async function registerInscrito(input: {
  name: string;
  email: string;
  phone: string;
}): Promise<{ duplicate: true } | { duplicate: false; n: number; date: string }> {
  const existing = await listInscritos();
  if (existing.some((row) => row.email.toLowerCase() === input.email.toLowerCase())) {
    return { duplicate: true };
  }

  const { response, body, url } = await fetchJson(`${API_BASE}/registar`, "registar", {
    method: "POST",
    body: JSON.stringify({
      nome: input.name,
      email: input.email,
      telefone: input.phone,
    }),
  });

  if (isDuplicateResponse(response.status, body)) {
    return { duplicate: true };
  }

  if (!response.ok) {
    throw new InscricaoApiError({
      step: "registar",
      url,
      status: response.status,
      body,
      message: errorMessage(body, `Falha ao registar inscrição (HTTP ${response.status})`),
    });
  }

  return {
    duplicate: false,
    n: existing.length + 1,
    date: formatLuandaDate(),
  };
}
