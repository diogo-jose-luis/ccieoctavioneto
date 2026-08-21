import path from "path";
import { mkdir, access } from "fs/promises";
import { constants } from "fs";
import ExcelJS from "exceljs";
import type { SheetRow } from "@/lib/types";

export type { SheetRow } from "@/lib/types";

const FILE_NAME = "inscritos.xlsx";
const SHEET_NAME = "Inscritos";

function filePath() {
  return path.join(process.cwd(), "data", FILE_NAME);
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

async function fileExists(target: string) {
  try {
    await access(target, constants.F_OK);
    return true;
  } catch {
    return false;
  }
}

function styleHeader(sheet: ExcelJS.Worksheet) {
  const row = sheet.getRow(1);
  row.height = 22;
  row.eachCell((cell) => {
    cell.font = { bold: true, color: { argb: "FF3EE0F0" }, name: "Calibri", size: 11 };
    cell.fill = {
      type: "pattern",
      pattern: "solid",
      fgColor: { argb: "FF0C1624" },
    };
    cell.alignment = { vertical: "middle" };
    cell.border = {
      bottom: { style: "thin", color: { argb: "FF1AA8B8" } },
    };
  });
  sheet.views = [{ state: "frozen", ySplit: 1 }];
  sheet.autoFilter = {
    from: { row: 1, column: 1 },
    to: { row: 1, column: 5 },
  };
}

async function loadWorkbook() {
  const target = filePath();
  await mkdir(path.dirname(target), { recursive: true });

  if (await fileExists(target)) {
    const workbook = new ExcelJS.Workbook();
    await workbook.xlsx.readFile(target);
    return workbook;
  }

  const workbook = new ExcelJS.Workbook();
  workbook.creator = "Octávio Neto | CCIE #70243";
  const sheet = workbook.addWorksheet(SHEET_NAME);
  sheet.columns = [
    { header: "N.º", key: "n", width: 8 },
    { header: "Data / Hora", key: "date", width: 24 },
    { header: "Nome", key: "name", width: 28 },
    { header: "E-mail", key: "email", width: 36 },
    { header: "Telefone", key: "phone", width: 20 },
  ];
  styleHeader(sheet);
  await workbook.xlsx.writeFile(target);
  return workbook;
}

function getSheet(workbook: ExcelJS.Workbook) {
  const sheet = workbook.getWorksheet(SHEET_NAME) ?? workbook.worksheets[0];
  if (!sheet) {
    throw new Error("Planilha não encontrada");
  }
  return sheet;
}

export function formatLuandaDate(date = new Date()) {
  return new Intl.DateTimeFormat("pt-PT", {
    timeZone: "Africa/Luanda",
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
  }).format(date);
}

export async function registerInscrito(input: {
  name: string;
  email: string;
  phone: string;
}): Promise<{ duplicate: true } | { duplicate: false; n: number; date: string }> {
  return enqueue(async () => {
    const workbook = await loadWorkbook();
    const sheet = getSheet(workbook);
    const needle = input.email.toLowerCase();
    let duplicate = false;

    sheet.eachRow((row, index) => {
      if (index === 1) return;
      if (String(row.getCell(4).value ?? "").toLowerCase() === needle) {
        duplicate = true;
      }
    });

    if (duplicate) {
      return { duplicate: true as const };
    }

    const n = Math.max(sheet.rowCount - 1, 0) + 1;
    const date = formatLuandaDate();
    const row = sheet.addRow({
      n,
      date,
      name: input.name,
      email: input.email,
      phone: input.phone,
    });
    row.alignment = { vertical: "middle" };
    row.eachCell((cell) => {
      cell.font = { color: { argb: "FF0C1624" }, name: "Calibri", size: 11 };
    });
    await workbook.xlsx.writeFile(filePath());
    return { duplicate: false as const, n, date };
  });
}

export async function listInscritos(): Promise<SheetRow[]> {
  const target = filePath();
  if (!(await fileExists(target))) return [];

  const workbook = new ExcelJS.Workbook();
  await workbook.xlsx.readFile(target);
  const sheet = getSheet(workbook);
  const rows: SheetRow[] = [];

  sheet.eachRow((row, index) => {
    if (index === 1) return;
    rows.push({
      n: Number(row.getCell(1).value ?? index - 1),
      date: String(row.getCell(2).value ?? ""),
      name: String(row.getCell(3).value ?? ""),
      email: String(row.getCell(4).value ?? ""),
      phone: String(row.getCell(5).value ?? ""),
    });
  });

  return rows.reverse();
}

export async function readSpreadsheetBuffer() {
  const workbook = await loadWorkbook();
  const buffer = await workbook.xlsx.writeBuffer();
  return Buffer.from(buffer);
}
