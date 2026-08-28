"use client";

import { FormEvent, useEffect, useId, useMemo, useState } from "react";
import Link from "next/link";
import {
  ArrowLeft,
  ChartLine,
  Download,
  Loader2,
  Lock,
  LogOut,
  RefreshCw,
  Table2,
  Users,
} from "lucide-react";
import InscritosTrendChart from "@/components/InscritosTrendChart";
import { dailyCountsLast31Days } from "@/lib/inscritos-chart";
import type { SheetRow } from "@/lib/types";

export default function InscritosClient() {
  const [status, setStatus] = useState<"loading" | "login" | "ready">("loading");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [rows, setRows] = useState<SheetRow[]>([]);
  const [busy, setBusy] = useState(false);
  const [showChart, setShowChart] = useState(false);
  const chartSectionId = useId();
  const chartPoints = useMemo(
    () => dailyCountsLast31Days(rows.map((row) => row.date)),
    [rows],
  );

  useEffect(() => {
    const previous = document.body.style.overflow;
    document.body.style.overflow = "auto";
    return () => {
      document.body.style.overflow = previous;
    };
  }, []);

  async function loadRows() {
    const response = await fetch("/api/inscritos", { cache: "no-store" });
    if (response.status === 401) {
      setStatus("login");
      return;
    }
    const data = (await response.json()) as { rows?: SheetRow[] };
    setRows(data.rows ?? []);
    setStatus("ready");
  }

  useEffect(() => {
    void loadRows();
  }, []);

  async function onLogin(event: FormEvent) {
    event.preventDefault();
    setBusy(true);
    setError("");
    try {
      const response = await fetch("/api/inscritos", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ password }),
      });
      if (!response.ok) {
        setError("Password incorrecta");
        return;
      }
      setPassword("");
      await loadRows();
    } finally {
      setBusy(false);
    }
  }

  async function onLogout() {
    await fetch("/api/inscritos", { method: "DELETE" });
    setRows([]);
    setStatus("login");
  }

  return (
    <main className="min-h-dvh bg-ink px-4 py-8 text-white sm:px-8">
      <div className="mx-auto max-w-5xl">
        <header className="mb-6 flex flex-wrap items-end justify-between gap-3">
          <div>
            <Link
              href="/"
              className="mb-3 inline-flex items-center gap-2 text-sm text-mist transition hover:text-cyan"
            >
              <ArrowLeft className="size-4" />
              Voltar à inscrição
            </Link>
            <p className="text-[10px] font-semibold tracking-[0.22em] text-cyan uppercase">
              Área reservada
            </p>
            <h1 className="font-display text-3xl font-semibold">Inscritos da live</h1>
            <p className="mt-1 text-sm text-mist">
              Lista da API · visível apenas com password
            </p>
          </div>
          {status === "ready" ? (
            <div className="flex flex-wrap gap-2">
              <button
                type="button"
                onClick={() => setShowChart((open) => !open)}
                aria-expanded={showChart}
                aria-controls={chartSectionId}
                className={`inline-flex items-center gap-2 rounded-xl border px-3 py-2 text-sm ${
                  showChart
                    ? "border-cyan/40 bg-cyan/10 text-cyan"
                    : "border-white/10 bg-white/5 text-white/90 hover:border-cyan/40"
                }`}
              >
                <ChartLine className="size-4" />
                {showChart ? "Ocultar gráfico" : "Gráfico"}
              </button>
              <button
                type="button"
                onClick={() => void loadRows()}
                className="inline-flex items-center gap-2 rounded-xl border border-white/10 bg-white/5 px-3 py-2 text-sm text-white/90 hover:border-cyan/40"
              >
                <RefreshCw className="size-4" />
                Actualizar
              </button>
              <a
                href="/api/inscritos/download"
                className="inline-flex items-center gap-2 rounded-xl bg-cyan px-3 py-2 text-sm font-semibold text-ink"
              >
                <Download className="size-4" />
                Descarregar TXT
              </a>
              <button
                type="button"
                onClick={() => void onLogout()}
                className="inline-flex items-center gap-2 rounded-xl border border-white/10 px-3 py-2 text-sm text-mist hover:text-white"
              >
                <LogOut className="size-4" />
                Sair
              </button>
            </div>
          ) : null}
        </header>

        {status === "loading" ? (
          <p className="flex items-center gap-2 text-mist">
            <Loader2 className="size-4 animate-spin" /> A verificar acesso…
          </p>
        ) : null}

        {status === "login" ? (
          <form
            onSubmit={onLogin}
            className="glass hud-corners mx-auto max-w-md rounded-2xl p-6"
          >
            <div className="mx-auto mb-4 flex size-12 items-center justify-center rounded-full bg-gold/10 text-gold ring-1 ring-gold/40">
              <Lock className="size-5" />
            </div>
            <h2 className="font-display text-center text-xl font-semibold">
              Acesso à lista
            </h2>
            <p className="mt-1 mb-4 text-center text-sm text-mist">
              Só o organizador consegue abrir esta lista.
            </p>
            <label className="block">
              <span className="sr-only">Password</span>
              <input
                type="password"
                autoComplete="current-password"
                placeholder="Password"
                value={password}
                onChange={(event) => setPassword(event.target.value)}
                className="h-11 w-full rounded-xl border border-white/10 bg-white/[0.04] px-3 text-sm outline-none focus:border-cyan/70"
              />
            </label>
            {error ? <p className="mt-2 text-sm text-red-300">{error}</p> : null}
            <button
              type="submit"
              disabled={busy}
              className="mt-4 flex h-11 w-full items-center justify-center gap-2 rounded-xl bg-cyan text-sm font-semibold text-ink disabled:opacity-70"
            >
              {busy ? <Loader2 className="size-4 animate-spin" /> : "Entrar"}
            </button>
          </form>
        ) : null}

        {status === "ready" ? (
          <>
          <div id={chartSectionId} hidden={!showChart}>
            <InscritosTrendChart points={chartPoints} />
          </div>
          <section className="glass hud-corners overflow-hidden rounded-2xl">
            <div className="flex items-center justify-between border-b border-white/10 px-4 py-3">
              <p className="flex items-center gap-2 text-sm text-mist">
                <Users className="size-4 text-cyan" />
                {rows.length} inscrito{rows.length === 1 ? "" : "s"}
              </p>
              <Table2 className="size-4 text-gold" />
            </div>
            <div className="overflow-x-auto">
              <table className="min-w-full text-left text-sm">
                <thead className="bg-white/[0.03] text-[11px] tracking-[0.16em] text-cyan uppercase">
                  <tr>
                    <th className="px-4 py-3 font-medium">N.º</th>
                    <th className="px-4 py-3 font-medium">Data / Hora</th>
                    <th className="px-4 py-3 font-medium">Nome</th>
                    <th className="px-4 py-3 font-medium">E-mail</th>
                    <th className="px-4 py-3 font-medium">Telefone</th>
                  </tr>
                </thead>
                <tbody>
                  {rows.length === 0 ? (
                    <tr>
                      <td colSpan={5} className="px-4 py-10 text-center text-mist">
                        Ainda não há inscrições.
                      </td>
                    </tr>
                  ) : (
                    rows.map((row) => (
                      <tr key={`${row.n}-${row.email}`} className="border-t border-white/5">
                        <td className="px-4 py-3 font-mono text-mist">{row.n}</td>
                        <td className="px-4 py-3 text-mist">{row.date}</td>
                        <td className="px-4 py-3 font-medium">{row.name}</td>
                        <td className="px-4 py-3">{row.email}</td>
                        <td className="px-4 py-3 font-mono">{row.phone}</td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </section>
          </>
        ) : null}
      </div>
    </main>
  );
}
