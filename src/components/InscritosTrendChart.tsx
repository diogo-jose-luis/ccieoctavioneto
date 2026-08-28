"use client";

import { useId, useMemo, useState, type PointerEvent } from "react";
import { Activity } from "lucide-react";
import {
  INSCRITOS_CHART_DAYS,
  type DailyCount,
} from "@/lib/inscritos-chart";

type Props = {
  points: DailyCount[];
};

const WIDTH = 800;
const HEIGHT = 240;
const PAD = { top: 18, right: 18, bottom: 36, left: 40 };

function niceMax(value: number) {
  if (value <= 4) return 4;
  const magnitude = 10 ** Math.floor(Math.log10(value));
  const normalized = value / magnitude;
  const nice =
    normalized <= 1 ? 1 : normalized <= 2 ? 2 : normalized <= 5 ? 5 : 10;
  return nice * magnitude;
}

export default function InscritosTrendChart({ points }: Props) {
  const reactId = useId();
  const gradientId = `inscritos-fill-${reactId.replace(/:/g, "")}`;
  const [hover, setHover] = useState<number | null>(null);

  const innerW = WIDTH - PAD.left - PAD.right;
  const innerH = HEIGHT - PAD.top - PAD.bottom;
  const yMax = niceMax(Math.max(0, ...points.map((point) => point.count)));

  const coords = useMemo(
    () =>
      points.map((point, index) => {
        const x =
          PAD.left +
          (points.length <= 1 ? innerW / 2 : (index / (points.length - 1)) * innerW);
        const y = PAD.top + innerH - (point.count / yMax) * innerH;
        return { ...point, x, y };
      }),
    [innerH, innerW, points, yMax],
  );

  const linePath = coords
    .map((point, index) => `${index === 0 ? "M" : "L"} ${point.x.toFixed(2)} ${point.y.toFixed(2)}`)
    .join(" ");
  const first = coords[0];
  const last = coords[coords.length - 1];
  const areaPath =
    first && last
      ? `${linePath} L ${last.x.toFixed(2)} ${PAD.top + innerH} L ${first.x.toFixed(2)} ${PAD.top + innerH} Z`
      : "";

  const ticks = [0, 0.5, 1].map((ratio) => Math.round(yMax * ratio));
  const xLabels = [0, 10, 20, points.length - 1].filter(
    (index, i, list) => index >= 0 && index < points.length && list.indexOf(index) === i,
  );

  const total = points.reduce((sum, point) => sum + point.count, 0);
  const peak = points.reduce(
    (best, point) => (point.count > best.count ? point : best),
    points[0] ?? { key: "", label: "—", count: 0 },
  );
  const active = hover != null ? coords[hover] : null;

  function onMove(event: PointerEvent<SVGSVGElement>) {
    const rect = event.currentTarget.getBoundingClientRect();
    const svgX = ((event.clientX - rect.left) / rect.width) * WIDTH;
    const nearest = coords.reduce((best, point, index) => {
      const distance = Math.abs(point.x - svgX);
      return distance < best.distance ? { index, distance } : best;
    }, { index: 0, distance: Infinity });
    setHover(nearest.index);
  }

  return (
    <section className="glass hud-corners mb-4 overflow-hidden rounded-2xl">
      <div className="flex flex-wrap items-end justify-between gap-3 border-b border-white/10 px-4 py-3">
        <div>
          <p className="flex items-center gap-2 text-sm text-mist">
            <Activity className="size-4 text-cyan" />
            Inscrições nos últimos {INSCRITOS_CHART_DAYS} dias
          </p>
          <p className="mt-1 text-xs text-mist/80">
            {total} no período
            {peak.count > 0 ? ` · pico ${peak.count} em ${peak.label}` : ""}
          </p>
        </div>
        {active ? (
          <p className="rounded-lg border border-cyan/30 bg-cyan/10 px-3 py-1.5 font-mono text-xs text-cyan">
            {active.label} · {active.count} inscrição{active.count === 1 ? "" : "ões"}
          </p>
        ) : null}
      </div>
      <div className="px-2 py-3 sm:px-4">
        <svg
          viewBox={`0 0 ${WIDTH} ${HEIGHT}`}
          className="h-[220px] w-full"
          role="img"
          aria-label={`Gráfico de linha com o número de inscrições por dia nos últimos ${INSCRITOS_CHART_DAYS} dias`}
          onPointerMove={onMove}
          onPointerLeave={() => setHover(null)}
        >
          <defs>
            <linearGradient id={gradientId} x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#3ee0f0" stopOpacity="0.35" />
              <stop offset="100%" stopColor="#3ee0f0" stopOpacity="0" />
            </linearGradient>
          </defs>

          {ticks.map((tick) => {
            const y = PAD.top + innerH - (tick / yMax) * innerH;
            return (
              <g key={tick}>
                <line
                  x1={PAD.left}
                  x2={WIDTH - PAD.right}
                  y1={y}
                  y2={y}
                  stroke="rgba(255,255,255,0.08)"
                />
                <text
                  x={PAD.left - 8}
                  y={y + 4}
                  textAnchor="end"
                  className="fill-mist"
                  fontSize="11"
                >
                  {tick}
                </text>
              </g>
            );
          })}

          {areaPath ? <path d={areaPath} fill={`url(#${gradientId})`} /> : null}
          {linePath ? (
            <path
              d={linePath}
              fill="none"
              stroke="#3ee0f0"
              strokeWidth="2.5"
              strokeLinejoin="round"
              strokeLinecap="round"
            />
          ) : null}

          {active ? (
            <>
              <line
                x1={active.x}
                x2={active.x}
                y1={PAD.top}
                y2={PAD.top + innerH}
                stroke="rgba(62,224,240,0.35)"
                strokeDasharray="4 4"
              />
              <circle cx={active.x} cy={active.y} r="5" fill="#070b12" stroke="#3ee0f0" strokeWidth="2" />
            </>
          ) : null}

          {xLabels.map((index) => {
            const point = coords[index];
            if (!point) return null;
            return (
              <text
                key={point.key}
                x={point.x}
                y={HEIGHT - 10}
                textAnchor="middle"
                className="fill-mist"
                fontSize="11"
              >
                {point.label}
              </text>
            );
          })}
        </svg>
      </div>
    </section>
  );
}
