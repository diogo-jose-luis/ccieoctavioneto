import ExcelJS from "exceljs";
import { listInscritos } from "@/lib/inscricao-api";
import { sortInscritosNewestFirst } from "@/lib/sheet-date";

export async function buildInscritosExcel() {
  const rows = sortInscritosNewestFirst(await listInscritos());
  const workbook = new ExcelJS.Workbook();
  workbook.creator = "CCIE Octávio Neto";
  workbook.created = new Date();

  const sheet = workbook.addWorksheet("Inscritos", {
    views: [{ state: "frozen", ySplit: 1 }],
  });

  sheet.columns = [
    { header: "N.º", key: "index", width: 10 },
    { header: "Data / Hora", key: "date", width: 22 },
    { header: "Nome", key: "name", width: 36 },
    { header: "E-mail", key: "email", width: 38 },
    { header: "Telefone", key: "phone", width: 18 },
  ];

  rows.forEach((row, index) => {
    sheet.addRow({
      index: index + 1,
      date: row.date,
      name: row.name,
      email: row.email,
      phone: row.phone,
    });
  });

  const header = sheet.getRow(1);
  header.font = { bold: true, color: { argb: "FF070B12" } };
  header.fill = {
    type: "pattern",
    pattern: "solid",
    fgColor: { argb: "FF3EE0F0" },
  };
  header.alignment = { vertical: "middle" };
  header.height = 20;

  sheet.autoFilter = {
    from: { row: 1, column: 1 },
    to: { row: 1, column: 5 },
  };

  return workbook.xlsx.writeBuffer();
}
