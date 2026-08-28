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

export function parseInscricaoTimestamp(value: string) {
  const trimmed = value.trim();
  if (!trimmed) return 0;

  const slash = trimmed.match(
    /^(\d{1,2})\/(\d{1,2})\/(\d{4})(?:[,\s]+(\d{1,2}):(\d{2})(?::(\d{2}))?)?/,
  );
  if (slash) {
    return Date.UTC(
      Number(slash[3]),
      Number(slash[2]) - 1,
      Number(slash[1]),
      Number(slash[4] ?? 0),
      Number(slash[5] ?? 0),
      Number(slash[6] ?? 0),
    );
  }

  const parsed = Date.parse(trimmed);
  return Number.isNaN(parsed) ? 0 : parsed;
}

export function sortInscritosNewestFirst<T extends { date: string; n: number }>(rows: T[]) {
  return [...rows].sort((a, b) => {
    const delta = parseInscricaoTimestamp(b.date) - parseInscricaoTimestamp(a.date);
    if (delta !== 0) return delta;
    return b.n - a.n;
  });
}
