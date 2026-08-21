import ExcelJS from "exceljs";
import type { SheetRow } from "@/lib/types";
import { formatLuandaDate } from "@/lib/sheet-date";

export const REMOTE_XLSX_URL =
  process.env.REMOTE_XLSX_URL?.trim() ||
  "https://api-manpower.idsolucoes.ao/ccie-octavio.xlsx";

const XLSX_TYPE =
  "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet";

const COL = {
  n: 1,
  date: 2,
  name: 3,
  email: 4,
  phone: 5,
} as const;

const HEADERS = ["N.º", "Data / Hora", "Nome", "E-mail", "Telefone"] as const;

function styleHeader(sheet: ExcelJS.Worksheet) {
  const row = sheet.getRow(1);
  HEADERS.forEach((header, index) => {
    const cell = row.getCell(index + 1);
    cell.value = header;
    cell.font = { bold: true, color: { argb: "FF3EE0F0" }, name: "Calibri", size: 11 };
    cell.fill = {
      type: "pattern",
      pattern: "solid",
      fgColor: { argb: "FF0C1624" },
    };
    cell.alignment = { vertical: "middle" };
  });
  sheet.getColumn(1).width = 8;
  sheet.getColumn(2).width = 24;
  sheet.getColumn(3).width = 28;
  sheet.getColumn(4).width = 36;
  sheet.getColumn(5).width = 20;
}

function cellText(value: ExcelJS.CellValue): string {
  if (value == null) return "";
  if (typeof value === "string" || typeof value === "number") return String(value);
  if (value instanceof Date) return formatLuandaDate(value);
  if (typeof value === "object" && "text" in value) return String(value.text ?? "");
  if (typeof value === "object" && "result" in value) return String(value.result ?? "");
  return String(value);
}

async function loadWorkbook() {
  const response = await fetch(REMOTE_XLSX_URL, { cache: "no-store" });
  if (!response.ok) {
    throw new Error(`Não foi possível ler o Excel remoto (HTTP ${response.status})`);
  }

  const workbook = new ExcelJS.Workbook();
  await workbook.xlsx.load(Buffer.from(await response.arrayBuffer()));

  const sheet = workbook.worksheets[0] ?? workbook.addWorksheet("Inscritos");
  const first = cellText(sheet.getRow(1).getCell(COL.email).value).toLowerCase();
  if (!first.includes("mail") && !first.includes("e-mail")) {
    sheet.spliceRows(1, 0, []);
    styleHeader(sheet);
  }
  return { workbook, sheet };
}

function readRows(sheet: ExcelJS.Worksheet): SheetRow[] {
  const rows: SheetRow[] = [];
  sheet.eachRow((row, index) => {
    if (index === 1) return;
    const email = cellText(row.getCell(COL.email).value).trim();
    if (!email) return;
    rows.push({
      n: Number(cellText(row.getCell(COL.n).value)) || rows.length + 1,
      date: cellText(row.getCell(COL.date).value),
      name: cellText(row.getCell(COL.name).value),
      email,
      phone: cellText(row.getCell(COL.phone).value),
    });
  });
  return rows;
}

async function saveWorkbook(workbook: ExcelJS.Workbook) {
  const bytes = new Uint8Array(await workbook.xlsx.writeBuffer());
  const attempts: RequestInit[] = [
    {
      method: "PUT",
      headers: { "Content-Type": XLSX_TYPE },
      body: bytes,
    },
    {
      method: "POST",
      headers: { "Content-Type": XLSX_TYPE },
      body: bytes,
    },
  ];

  const form = new FormData();
  form.append("file", new Blob([bytes], { type: XLSX_TYPE }), "ccie-octavio.xlsx");
  attempts.push({ method: "POST", body: form });

  let lastStatus = 0;
  let lastBody = "";
  for (const init of attempts) {
    const response = await fetch(REMOTE_XLSX_URL, { ...init, cache: "no-store" });
    lastStatus = response.status;
    if (response.ok) return;
    lastBody = await response.text().catch(() => "");
  }

  throw new Error(
    `Não foi possível gravar o Excel remoto (HTTP ${lastStatus})${lastBody ? `: ${lastBody.slice(0, 180)}` : ""}`,
  );
}

let queue: Promise<unknown> = Promise.resolve();

function enqueue<T>(work: () => Promise<T>) {
  const run = queue.then(work, work);
  queue = run.then(
    () => undefined,
    () => undefined,
  );
  return run;
}

export async function registerInscrito(input: {
  name: string;
  email: string;
  phone: string;
}): Promise<{ duplicate: true } | { duplicate: false; n: number; date: string }> {
  return enqueue(async () => {
    const { workbook, sheet } = await loadWorkbook();
    const rows = readRows(sheet);
    const needle = input.email.toLowerCase();
    if (rows.some((row) => row.email.toLowerCase() === needle)) {
      return { duplicate: true as const };
    }

    const date = formatLuandaDate();
    const n = rows.length + 1;
    const added = sheet.addRow([n, date, input.name, input.email, input.phone]);
    added.alignment = { vertical: "middle" };
    await saveWorkbook(workbook);
    return { duplicate: false as const, n, date };
  });
}

export async function listInscritos(): Promise<SheetRow[]> {
  const { sheet } = await loadWorkbook();
  return readRows(sheet).reverse();
}

export async function readSpreadsheetBuffer() {
  const response = await fetch(REMOTE_XLSX_URL, { cache: "no-store" });
  if (!response.ok) {
    throw new Error(`Não foi possível descarregar o Excel remoto (HTTP ${response.status})`);
  }
  return Buffer.from(await response.arrayBuffer());
}
