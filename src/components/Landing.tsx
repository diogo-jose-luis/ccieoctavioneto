"use client";

import type { ComponentType } from "react";
import Image from "next/image";
import { CalendarDays, Clock } from "lucide-react";
import Countdown from "@/components/Countdown";
import ProfileTabs from "@/components/ProfileTabs";
import RegistrationForm from "@/components/RegistrationForm";

const YOUTUBE = "https://www.youtube.com/@ccieoctavioneto";

export default function Landing() {
  return (
    <main className="relative h-dvh w-full overflow-hidden bg-ink text-white">
      <div className="pointer-events-none absolute inset-0 lg:hidden">
        <Image
          src="/octavio-hero.png"
          alt=""
          fill
          priority
          sizes="100vw"
          className="object-cover object-[72%_18%]"
        />
        <div className="absolute inset-0 bg-gradient-to-b from-ink/88 via-ink/70 to-ink/92" />
      </div>

      <div className="relative flex h-full lg:flex-row">
        <section className="relative flex h-full w-full min-w-0 flex-col justify-between px-4 py-4 sm:px-7 sm:py-6 lg:w-[46%] lg:px-10 lg:py-8 short:lg:px-8 short:lg:py-5 xl:px-14">
          <div className="pointer-events-none absolute inset-0 hidden lg:block">
            <Image
              src="/network-infra-bg.png"
              alt=""
              fill
              priority
              sizes="46vw"
              className="object-cover opacity-35"
            />
            <div className="circuit-grid absolute inset-0 opacity-70" />
            <div className="absolute inset-0 bg-gradient-to-r from-ink via-ink/88 to-ink/70" />
          </div>

          <header className="relative fade-up">
            <div className="flex flex-wrap items-center gap-2 text-[10px] font-semibold tracking-[0.22em] uppercase">
              <span className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-2.5 py-1">
                <span className="live-dot size-1.5 rounded-full bg-red-500" />
                Ao vivo
              </span>
              <span className="text-mist">3 noites · YouTube</span>
            </div>

            <p className="mt-3 text-xs font-medium tracking-[0.18em] text-cyan uppercase short:mt-2">
              Masterclass de infraestrutura
            </p>
            <h1 className="font-display mt-1 max-w-[18ch] text-[clamp(1.55rem,3.4vw,3.15rem)] leading-[1.08] font-semibold tracking-tight short:text-[clamp(1.35rem,2.5vw,2.25rem)]">
              Design e Implementação da Infraestrutura de Rede
            </h1>
            <p className="mt-2 max-w-md text-sm text-mist short:mt-1 short:text-[13px] shorter:hidden">
              Projecto para uma instituição bancária — com Octávio Neto, CCIE
              #70243.
            </p>

            <ul className="mt-4 flex flex-wrap gap-2 short:mt-3">
              <MetaChip icon={CalendarDays} label="28, 29 e 30 de Setembro" />
              <MetaChip icon={Clock} label="19h – 22h" />
              <MetaChip
                icon={YoutubeIcon}
                label="@ccieoctavioneto"
                href={YOUTUBE}
              />
            </ul>

            <div className="mt-4 hidden lg:block short:mt-3">
              <Countdown />
            </div>
          </header>

          <div className="relative my-3 min-h-0 lg:hidden shorter:hidden rise-up">
            <ProfileTabs compact />
          </div>

          <div className="relative rise-up-form">
            <div className="mb-3 lg:hidden shorter:hidden">
              <Countdown />
            </div>
            <RegistrationForm />
          </div>
        </section>

        <section className="relative hidden h-full min-w-0 lg:block lg:w-[54%]">
          <Image
            src="/octavio-hero.png"
            alt="Octávio Neto, Senior Network / Cloud Engineer, CCIE #70243"
            fill
            priority
            sizes="54vw"
            className="object-cover object-[70%_center]"
          />
          <div className="absolute inset-y-0 left-0 w-1/3 bg-gradient-to-r from-ink via-ink/50 to-transparent" />
          <div className="absolute inset-x-0 bottom-0 h-[36%] bg-gradient-to-t from-ink via-ink/70 to-transparent" />

          <div className="absolute top-6 right-6 rounded-full border border-gold/40 bg-ink/50 px-3 py-1 font-mono text-[11px] tracking-[0.16em] text-gold-soft backdrop-blur-md">
            CCIE #70243
          </div>

          <div className="absolute right-0 bottom-0 left-0 p-6 xl:p-8 rise-up">
            <ProfileTabs />
          </div>
        </section>
      </div>
    </main>
  );
}

function YoutubeIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" className={className} aria-hidden>
      <path
        fill="currentColor"
        d="M23.5 6.2a3.05 3.05 0 0 0-2.14-2.16C19.4 3.6 12 3.6 12 3.6s-7.4 0-9.36.44A3.05 3.05 0 0 0 .5 6.2 32.2 32.2 0 0 0 0 12a32.2 32.2 0 0 0 .5 5.8 3.05 3.05 0 0 0 2.14 2.16C4.6 20.4 12 20.4 12 20.4s7.4 0 9.36-.44A3.05 3.05 0 0 0 23.5 17.8 32.2 32.2 0 0 0 24 12a32.2 32.2 0 0 0-.5-5.8zM9.75 15.57V8.43L15.84 12l-6.09 3.57z"
      />
    </svg>
  );
}

function MetaChip({
  icon: Icon,
  label,
  href,
}: {
  icon: ComponentType<{ className?: string }>;
  label: string;
  href?: string;
}) {
  const className =
    "inline-flex items-center gap-1.5 rounded-full border border-white/10 bg-white/5 px-2.5 py-1.5 text-xs text-white/90 transition hover:border-cyan/40 hover:bg-cyan/10";

  return (
    <li>
      {href ? (
        <a
          href={href}
          target="_blank"
          rel="noopener noreferrer"
          className={className}
        >
          <Icon className="size-3.5 text-cyan" />
          <span>{label}</span>
        </a>
      ) : (
        <span className={className}>
          <Icon className="size-3.5 text-cyan" />
          <span>{label}</span>
        </span>
      )}
    </li>
  );
}
