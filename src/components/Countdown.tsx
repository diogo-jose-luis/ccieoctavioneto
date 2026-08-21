"use client";

import { useEffect, useMemo, useState } from "react";
import { Radio } from "lucide-react";

const START = new Date("2026-09-28T19:00:00+01:00").getTime();
const END = new Date("2026-09-30T22:00:00+01:00").getTime();

type Parts = { days: string; hours: string; minutes: string; seconds: string };

function pad(value: number) {
  return String(Math.max(0, value)).padStart(2, "0");
}

function getParts(now: number): Parts {
  const diff = Math.max(0, START - now);
  const days = Math.floor(diff / 86_400_000);
  const hours = Math.floor((diff % 86_400_000) / 3_600_000);
  const minutes = Math.floor((diff % 3_600_000) / 60_000);
  const seconds = Math.floor((diff % 60_000) / 1000);
  return {
    days: pad(days),
    hours: pad(hours),
    minutes: pad(minutes),
    seconds: pad(seconds),
  };
}

export default function Countdown() {
  const [now, setNow] = useState(() => Date.now());

  useEffect(() => {
    const id = window.setInterval(() => setNow(Date.now()), 1000);
    return () => window.clearInterval(id);
  }, []);

  const status = now >= END ? "ended" : now >= START ? "live" : "soon";
  const parts = useMemo(() => getParts(now), [now]);

  if (status === "live") {
    return (
      <div className="flex items-center gap-2 rounded-lg border border-red-500/30 bg-red-500/10 px-3 py-2 text-sm text-red-100">
        <Radio className="size-4 animate-pulse" />
        A live está a decorrer — entre agora no YouTube
      </div>
    );
  }

  if (status === "ended") {
    return (
      <p className="text-sm text-mist">
        Evento concluído. Siga @ccieoctavioneto para as próximas sessões.
      </p>
    );
  }

  const cells: { label: string; value: string }[] = [
    { label: "Dias", value: parts.days },
    { label: "Horas", value: parts.hours },
    { label: "Min", value: parts.minutes },
    { label: "Seg", value: parts.seconds },
  ];

  return (
    <div className="flex items-end gap-2 short:gap-1.5">
      {cells.map((cell, index) => (
        <div key={cell.label} className="flex items-end gap-2">
          <div className="min-w-[3.4rem] rounded-lg border border-white/10 bg-white/[0.04] px-2 py-1.5 text-center short:min-w-[2.8rem] short:px-1.5 short:py-1">
            <div className="font-mono text-xl font-semibold leading-none tracking-wider text-white short:text-lg">
              {cell.value}
            </div>
            <div className="mt-1 text-[9px] font-medium uppercase tracking-[0.18em] text-mist">
              {cell.label}
            </div>
          </div>
          {index < cells.length - 1 ? (
            <span className="mb-4 font-mono text-cyan/80 short:mb-3">:</span>
          ) : null}
        </div>
      ))}
    </div>
  );
}
