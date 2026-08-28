const LUANDA_TZ = "Africa/Luanda";
export const INSCRITOS_CHART_DAYS = 31;

export type DailyCount = {
  key: string;
  label: string;
  count: number;
};

function ymdInLuanda(date: Date) {
  return new Intl.DateTimeFormat("en-CA", {
    timeZone: LUANDA_TZ,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).format(date);
}

function formatDayLabel(ymd: string) {
  const [, month, day] = ymd.split("-");
  return `${day}/${month}`;
}

export function rowDateKey(value: string) {
  const trimmed = value.trim();
  if (!trimmed) return null;

  const slash = trimmed.match(/^(\d{1,2})\/(\d{1,2})\/(\d{4})/);
  if (slash) {
    const day = slash[1].padStart(2, "0");
    const month = slash[2].padStart(2, "0");
    return `${slash[3]}-${month}-${day}`;
  }

  const parsed = Date.parse(trimmed);
  if (!Number.isNaN(parsed)) return ymdInLuanda(new Date(parsed));

  return null;
}

export function dailyCountsLast31Days(dates: string[], now = new Date()): DailyCount[] {
  const today = ymdInLuanda(now);
  const [year, month, day] = today.split("-").map(Number);
  const cursor = new Date(Date.UTC(year, month - 1, day, 12, 0, 0));

  const days: DailyCount[] = [];
  for (let offset = INSCRITOS_CHART_DAYS - 1; offset >= 0; offset -= 1) {
    const point = new Date(cursor);
    point.setUTCDate(cursor.getUTCDate() - offset);
    const key = `${point.getUTCFullYear()}-${String(point.getUTCMonth() + 1).padStart(2, "0")}-${String(
      point.getUTCDate(),
    ).padStart(2, "0")}`;
    days.push({ key, label: formatDayLabel(key), count: 0 });
  }

  const index = new Map(days.map((item, i) => [item.key, i]));
  for (const date of dates) {
    const key = rowDateKey(date);
    if (!key) continue;
    const i = index.get(key);
    if (i == null) continue;
    days[i].count += 1;
  }

  return days;
}
