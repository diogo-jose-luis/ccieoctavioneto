"use client";

import { FormEvent, useEffect, useId, useMemo, useState } from "react";
import Link from "next/link";
import {
  ArrowLeft,
  ChartLine,
  ChevronLeft,
  ChevronRight,
  FileSpreadsheet,
  Loader2,
  Lock,
  LogOut,
  RefreshCw,
  Search,
  Table2,
  Users,
} from "lucide-react";
import InscritosTrendChart from "@/components/InscritosTrendChart";
import { dailyCountsLast31Days } from "@/lib/inscritos-chart";
import { sortInscritosNewestFirst } from "@/lib/sheet-date";
import type { SheetRow } from "@/lib/types";

const PAGE_SIZE_OPTIONS = [25, 50, 100, 200, 500] as const;
const DEFAULT_PAGE_SIZE = 100;

function normalizeSearch(value: string) {
  return value
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "");
}

function rowMatchesQuery(row: SheetRow, query: string) {
  const tokens = normalizeSearch(query).split(/\s+/).filter(Boolean);
  if (tokens.length === 0) return true;
  const haystack = normalizeSearch(
    [row.n, row.date, row.name, row.email, row.phone].join(" "),
  );
  return tokens.every((token) => haystack.includes(token));
}

function pageItems(current: number, total: number) {
  if (total <= 7) return Array.from({ length: total }, (_, i) => i + 1);
  const start = Math.max(2, current - 1);
  const end = Math.min(total - 1, current + 1);
  const items: Array<number | "gap"> = [1];
  if (start > 2) items.push("gap");
  for (let page = start; page <= end; page += 1) items.push(page);
  if (end < total - 1) items.push("gap");
  items.push(total);
  return items;
}

export default function InscritosClient() {
  const [status, setStatus] = useState<"loading" | "login" | "ready">("loading");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [rows, setRows] = useState<SheetRow[]>([]);
  const [busy, setBusy] = useState(false);
  const [showChart, setShowChart] = useState(false);
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState<number | "all">(DEFAULT_PAGE_SIZE);
  const [query, setQuery] = useState("");
  const chartSectionId = useId();
  const chartPoints = useMemo(
    () => dailyCountsLast31Days(rows.map((row) => row.date)),
    [rows],
  );
  const sortedRows = useMemo(() => sortInscritosNewestFirst(rows), [rows]);
  const filteredRows = useMemo(
    () => sortedRows.filter((row) => rowMatchesQuery(row, query)),
    [query, sortedRows],
  );
  const resolvedPageSize = pageSize === "all" ? Math.max(filteredRows.length, 1) : pageSize;
  const totalPages = Math.max(1, Math.ceil(filteredRows.length / resolvedPageSize) || 1);
  const currentPage = Math.min(page, totalPages);
  const pageStart = filteredRows.length === 0 ? 0 : (currentPage - 1) * resolvedPageSize;
  const pageRows = filteredRows.slice(pageStart, pageStart + resolvedPageSize);
  const pageEnd = pageStart + pageRows.length;

  useEffect(() => {
    const previous = document.body.style.overflow;
    document.body.style.overflow = "auto";
    return () => {
      document.body.style.overflow = previous;
    };
  }, []);

  useEffect(() => {
    setPage((current) => Math.min(current, totalPages));
  }, [totalPages]);

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

  function onPageSizeChange(value: string) {
    setPageSize(value === "all" ? "all" : Number(value));
    setPage(1);
  }

  function onQueryChange(value: string) {
    setQuery(value);
    setPage(1);
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
                <FileSpreadsheet className="size-4" />
                Descarregar Excel
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
          <div>
            <InscritosTrendChart
              points={chartPoints}
              showChart={showChart}
              chartId={chartSectionId}
            />
          </div>
          <section className="glass hud-corners overflow-hidden rounded-2xl">
            <div className="flex flex-wrap items-center justify-between gap-3 border-b border-white/10 px-4 py-3">
              <p className="flex items-center gap-2 text-sm text-mist">
                <Users className="size-4 text-cyan" />
                {query.trim()
                  ? `${filteredRows.length} de ${sortedRows.length} inscrito${sortedRows.length === 1 ? "" : "s"}`
                  : `${sortedRows.length} inscrito${sortedRows.length === 1 ? "" : "s"}`}
              </p>
              <div className="flex min-w-[16rem] flex-1 items-center gap-3 sm:max-w-md">
                <label className="relative w-full">
                  <span className="sr-only">Pesquisar na tabela</span>
                  <Search className="pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2 text-mist" />
                  <input
                    type="search"
                    value={query}
                    onChange={(event) => onQueryChange(event.target.value)}
                    placeholder="Pesquisar na tabela…"
                    className="h-9 w-full rounded-lg border border-white/10 bg-white/[0.04] pr-3 pl-9 text-sm outline-none focus:border-cyan/70"
                  />
                </label>
              </div>
              <div className="flex items-center gap-3">
                <label className="flex items-center gap-2 text-sm text-mist">
                  Por página
                  <select
                    value={String(pageSize)}
                    onChange={(event) => onPageSizeChange(event.target.value)}
                    className="rounded-lg border border-white/10 bg-ink px-2 py-1 text-sm text-white outline-none focus:border-cyan/70"
                  >
                    {PAGE_SIZE_OPTIONS.map((size) => (
                      <option key={size} value={size}>
                        {size}
                      </option>
                    ))}
                    <option value="all">Todos</option>
                  </select>
                </label>
                <Table2 className="size-4 text-gold" />
              </div>
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
                  {sortedRows.length === 0 ? (
                    <tr>
                      <td colSpan={5} className="px-4 py-10 text-center text-mist">
                        Ainda não há inscrições.
                      </td>
                    </tr>
                  ) : filteredRows.length === 0 ? (
                    <tr>
                      <td colSpan={5} className="px-4 py-10 text-center text-mist">
                        Nenhum inscrito corresponde à pesquisa.
                      </td>
                    </tr>
                  ) : (
                    pageRows.map((row, offset) => {
                      const index = pageStart + offset + 1;
                      return (
                        <tr key={`${row.n}-${row.email}-${index}`} className="border-t border-white/5">
                          <td className="px-4 py-3 font-mono text-mist">{index}</td>
                          <td className="px-4 py-3 text-mist">{row.date}</td>
                          <td className="px-4 py-3 font-medium">{row.name}</td>
                          <td className="px-4 py-3">{row.email}</td>
                          <td className="px-4 py-3 font-mono">{row.phone}</td>
                        </tr>
                      );
                    })
                  )}
                </tbody>
              </table>
            </div>
            {filteredRows.length > 0 ? (
              <div className="flex flex-wrap items-center justify-between gap-3 border-t border-white/10 px-4 py-3">
                <p className="text-sm text-mist">
                  A mostrar {pageStart + 1}–{pageEnd} de {filteredRows.length}
                </p>
                <div className="flex flex-wrap items-center gap-1">
                  <button
                    type="button"
                    disabled={currentPage <= 1}
                    onClick={() => setPage(currentPage - 1)}
                    className="inline-flex items-center gap-1 rounded-lg border border-white/10 px-2 py-1.5 text-sm text-mist hover:text-white disabled:opacity-40"
                  >
                    <ChevronLeft className="size-4" />
                    Anterior
                  </button>
                  {pageItems(currentPage, totalPages).map((item, i) =>
                    item === "gap" ? (
                      <span key={`gap-${i}`} className="px-1 text-mist">
                        …
                      </span>
                    ) : (
                      <button
                        key={item}
                        type="button"
                        onClick={() => setPage(item)}
                        className={`min-w-8 rounded-lg px-2 py-1.5 text-sm ${
                          item === currentPage
                            ? "bg-cyan font-semibold text-ink"
                            : "border border-white/10 text-mist hover:text-white"
                        }`}
                      >
                        {item}
                      </button>
                    ),
                  )}
                  <button
                    type="button"
                    disabled={currentPage >= totalPages}
                    onClick={() => setPage(currentPage + 1)}
                    className="inline-flex items-center gap-1 rounded-lg border border-white/10 px-2 py-1.5 text-sm text-mist hover:text-white disabled:opacity-40"
                  >
                    Seguinte
                    <ChevronRight className="size-4" />
                  </button>
                </div>
              </div>
            ) : null}
          </section>
          </>
        ) : null}
      </div>
    </main>
  );
}
