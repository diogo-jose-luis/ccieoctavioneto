"use client";

import { useState } from "react";
import {
  Award,
  Building2,
  CirclePlus,
  GitBranch,
  Network,
  ShieldCheck,
  Workflow,
} from "lucide-react";

type Tab = "profile" | "topics";

const topics = [
  { icon: Network, label: "Fundamentos de Redes" },
  { icon: Building2, label: "Arquitectura Enterprise" },
  { icon: GitBranch, label: "Routing & Switching" },
  { icon: ShieldCheck, label: "Network Security" },
  { icon: Workflow, label: "Network Automation" },
  { icon: CirclePlus, label: "E muito mais…" },
];

export default function ProfileTabs({ compact = false }: { compact?: boolean }) {
  const [tab, setTab] = useState<Tab>("profile");

  return (
    <div
      className={`glass hud-corners rounded-2xl ${compact ? "p-3" : "p-4 lg:p-5"}`}
    >
      <div
        role="tablist"
        aria-label="Informação do formador"
        className="relative grid grid-cols-2 rounded-xl bg-white/[0.04] p-1"
      >
        <span
          className="absolute top-1 bottom-1 w-[calc(50%-4px)] rounded-lg bg-cyan/15 ring-1 ring-cyan/40 transition-transform duration-300 ease-out"
          style={{
            transform: tab === "topics" ? "translateX(calc(100% + 4px))" : "translateX(4px)",
          }}
        />
        {(
          [
            ["profile", "Perfil"],
            ["topics", "Tópicos"],
          ] as const
        ).map(([id, label]) => (
          <button
            key={id}
            type="button"
            role="tab"
            aria-selected={tab === id}
            onClick={() => setTab(id)}
            className={`relative z-10 rounded-lg py-2 text-xs font-semibold tracking-[0.18em] uppercase transition ${
              tab === id ? "text-cyan" : "text-mist hover:text-white"
            }`}
          >
            {label}
          </button>
        ))}
      </div>

      <div key={tab} className="fade-up mt-3 short:mt-2">
        {tab === "profile" ? (
          <div className={compact ? "space-y-1.5" : "space-y-2.5"}>
            <div className="flex items-center gap-3">
              <span className="flex size-10 items-center justify-center rounded-full bg-gold/15 text-gold ring-1 ring-gold/40 short:size-8">
                <Award className="size-5 short:size-4" />
              </span>
              <div>
                <p className="font-display text-lg leading-tight font-semibold short:text-base">
                  Octávio Neto
                </p>
                <p className="font-mono text-xs tracking-wide text-gold-soft">
                  CCIE #70243
                </p>
              </div>
            </div>
            <ul className="space-y-1 text-sm text-mist short:text-[13px]">
              <li>Senior Network / Cloud Engineer</li>
              <li>CEO e Founder da Equalizador</li>
              <li>+10 anos de experiência na área de TI</li>
            </ul>
          </div>
        ) : (
          <ul
            className={`grid gap-1.5 ${compact ? "grid-cols-2" : "grid-cols-1 sm:grid-cols-2"}`}
          >
            {topics.map(({ icon: Icon, label }) => (
              <li
                key={label}
                className="flex items-center gap-2 rounded-lg border border-white/5 bg-white/[0.03] px-2.5 py-2 text-[13px] text-white/90 transition hover:border-cyan/30 hover:bg-cyan/5"
              >
                <Icon className="size-3.5 shrink-0 text-cyan" />
                <span className="leading-tight">{label}</span>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}
