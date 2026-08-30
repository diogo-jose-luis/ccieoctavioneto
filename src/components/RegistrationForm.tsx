"use client";

import { FormEvent, useEffect, useState } from "react";
import { createPortal } from "react-dom";
import {
  ArrowRight,
  BadgeInfo,
  CalendarDays,
  CheckCircle2,
  Clock,
  Loader2,
  Mail,
  Phone,
  User,
} from "lucide-react";
import {
  firstNameOf,
  hasErrors,
  type FieldErrors,
  type RegistrationInput,
  validateRegistration,
} from "@/lib/validation";

const initial: RegistrationInput = { name: "", email: "", phone: "" };

export default function RegistrationForm() {
  const [values, setValues] = useState<RegistrationInput>(initial);
  const [errors, setErrors] = useState<FieldErrors>({});
  const [submitting, setSubmitting] = useState(false);
  const [formError, setFormError] = useState("");
  const [done, setDone] = useState(false);
  const [duplicate, setDuplicate] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => setMounted(true), []);

  function update(field: keyof RegistrationInput, value: string) {
    const next = field === "name" && value.length > 30 ? value.slice(0, 30) : value;
    setValues((current) => ({ ...current, [field]: next }));
    if (errors[field]) {
      setErrors((current) => ({ ...current, [field]: undefined }));
    }
    if (formError) setFormError("");
    if (duplicate) setDuplicate(false);
  }

  function validateField(field: keyof RegistrationInput) {
    const { errors: next } = validateRegistration(values);
    setErrors((current) => ({ ...current, [field]: next[field] }));
  }

  async function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const { values: normalized, errors: nextErrors } = validateRegistration(values);
    setValues(normalized);
    setErrors(nextErrors);
    if (hasErrors(nextErrors)) return;

    setSubmitting(true);
    setFormError("");
    try {
      const response = await fetch("/api/inscricao", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(normalized),
      });
      const data = (await response.json()) as {
        ok?: boolean;
        code?: string;
        message?: string;
        errors?: FieldErrors;
      };
      if (response.status === 409 || data.code === "EMAIL_EXISTS") {
        setDuplicate(true);
        return;
      }
      const registeredDespiteEmail =
        data.code === "EMAIL_NOT_SENT" ||
        data.message ===
          "A inscrição foi registada, mas o e-mail não foi enviado. Tente novamente ou contacte-nos.";
      if (registeredDespiteEmail || (response.ok && data.ok)) {
        setDone(true);
        return;
      }
      if (!response.ok || !data.ok) {
        if (data.errors) setErrors(data.errors);
        setFormError(data.message || "Não foi possível concluir a inscrição.");
        return;
      }
    } catch {
      setFormError("Falha de ligação. Verifique a internet e tente novamente.");
    } finally {
      setSubmitting(false);
    }
  }

  function goToWhatsapp() {
    window.location.href =
      "https://chat.whatsapp.com/DeG5opjYV0PEQ0FQ4srVK4?s=cl&p=a&ilr=0";
  }

  const fields = [
    {
      id: "name" as const,
      label: "Nome",
      type: "text",
      autoComplete: "name",
      icon: User,
      placeholder: "Primeiro e último nome",
      maxLength: 30,
    },
    {
      id: "email" as const,
      label: "E-mail",
      type: "email",
      autoComplete: "email",
      icon: Mail,
      placeholder: "nome@email.com",
    },
    {
      id: "phone" as const,
      label: "Telefone",
      type: "tel",
      autoComplete: "tel",
      icon: Phone,
      placeholder: "+244 900 000 000",
    },
  ];

  return (
    <>
      <form
        onSubmit={onSubmit}
        noValidate
        className="glass hud-corners rounded-2xl p-4 short:p-3 lg:p-5"
      >
        <div className="mb-3 flex items-end justify-between gap-3 short:mb-2">
          <div>
            <p className="text-[10px] font-semibold uppercase tracking-[0.22em] text-cyan">
              Inscrição
            </p>
            <h2 className="font-display text-lg font-semibold leading-tight short:text-base">
              Reserve o seu lugar
            </h2>
          </div>
          <span className="hidden text-right text-[11px] leading-tight text-mist sm:block">
            Vagas limitadas
            <br />
            acesso gratuito
          </span>
        </div>

        <div className="grid gap-2.5 short:gap-2">
          {fields.map((field) => {
            const Icon = field.icon;
            const error = errors[field.id];
            return (
              <label key={field.id} className="block" htmlFor={field.id}>
                <span className="sr-only">{field.label}</span>
                <span className="relative block">
                  <Icon className="pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2 text-mist" />
                  <input
                    id={field.id}
                    name={field.id}
                    type={field.type}
                    autoComplete={field.autoComplete}
                    placeholder={field.placeholder}
                    maxLength={field.maxLength}
                    required
                    value={values[field.id]}
                    onBlur={() => validateField(field.id)}
                    onChange={(event) => {
                      const raw = event.target.value;
                      const next =
                        field.id === "phone" ? raw.replace(/[a-zA-ZÀ-ÿ]/g, "") : raw;
                      update(field.id, next);
                    }}
                    className={`h-11 w-full rounded-xl border bg-white/[0.04] pr-3 pl-10 text-sm text-white outline-none transition placeholder:text-white/30 short:h-10 ${
                      error
                        ? "border-red-400/60 focus:border-red-400"
                        : "border-white/10 focus:border-cyan/70 focus:shadow-[0_0_0_3px_rgba(62,224,240,0.15)]"
                    }`}
                  />
                </span>
                {error ? (
                  <span className="mt-1 block text-[11px] text-red-300">{error}</span>
                ) : null}
              </label>
            );
          })}
        </div>

        {formError ? (
          <p className="mt-2 text-[12px] text-red-300">{formError}</p>
        ) : null}

        <button
          type="submit"
          disabled={submitting}
          className="btn-shine relative mt-3 flex h-11 w-full items-center justify-center gap-2 rounded-xl bg-cyan text-sm font-semibold text-ink transition hover:bg-cyan/90 disabled:opacity-70 short:mt-2 short:h-10"
        >
          {submitting ? (
            <>
              <Loader2 className="size-4 animate-spin" />
              A confirmar…
            </>
          ) : (
            <>
              Inscrever-me agora
              <ArrowRight className="size-4" />
            </>
          )}
        </button>
        <p className="mt-2 text-center text-[11px] text-mist/80">
          Recebe um e-mail de confirmação e segue no WhatsApp.
        </p>
      </form>

      {mounted && done
        ? createPortal(
            <ConfirmationModal name={values.name} onConfirm={goToWhatsapp} />,
            document.body,
          )
        : null}
      {mounted && duplicate
        ? createPortal(
            <DuplicateModal
              email={values.email}
              onClose={() => setDuplicate(false)}
              onWhatsapp={goToWhatsapp}
            />,
            document.body,
          )
        : null}
    </>
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

function DuplicateModal({
  email,
  onClose,
  onWhatsapp,
}: {
  email: string;
  onClose: () => void;
  onWhatsapp: () => void;
}) {
  return (
    <div className="fixed inset-0 z-[200] flex items-center justify-center bg-ink/80 p-4 backdrop-blur-md">
      <div className="glass hud-corners modal-in w-full max-w-md rounded-2xl p-6 text-center shadow-[0_0_80px_rgba(212,160,23,0.12)]">
        <div className="mx-auto flex size-14 items-center justify-center rounded-full bg-gold/10 ring-1 ring-gold/40">
          <BadgeInfo className="size-8 text-gold" />
        </div>
        <p className="mt-4 text-[10px] font-semibold tracking-[0.22em] text-gold uppercase">
          E-mail já registado
        </p>
        <h3 className="font-display mt-2 text-2xl font-semibold text-white">
          Esta inscrição já existe.
        </h3>
        <p className="mt-2 text-sm leading-relaxed text-mist">
          O endereço{" "}
          <span className="font-medium text-white">{email}</span> já consta na
          lista da live. Não é necessário inscrever-se outra vez — o lugar
          continua reservado.
        </p>
        <button
          type="button"
          onClick={onClose}
          className="btn-shine relative mt-5 flex h-12 w-full items-center justify-center rounded-xl bg-cyan text-sm font-semibold text-ink transition hover:bg-cyan/90"
        >
          Entendido
        </button>
        <button
          type="button"
          onClick={onWhatsapp}
          className="mt-2 h-10 w-full text-sm text-mist transition hover:text-white"
        >
          Entrar no grupo do WhatsApp
        </button>
      </div>
    </div>
  );
}

function ConfirmationModal({
  name,
  onConfirm,
}: {
  name: string;
  onConfirm: () => void;
}) {
  const first = firstNameOf(name);

  return (
    <div className="fixed inset-0 z-[200] flex items-center justify-center bg-ink/80 p-4 backdrop-blur-md">
      <div className="glass hud-corners modal-in w-full max-w-md rounded-2xl p-6 text-center shadow-[0_0_80px_rgba(62,224,240,0.12)]">
        <div className="mx-auto flex size-14 items-center justify-center rounded-full bg-cyan/10 ring-1 ring-cyan/40">
          <CheckCircle2 className="size-8 text-cyan" />
        </div>
        <p className="mt-4 text-[10px] font-semibold tracking-[0.22em] text-cyan uppercase">
          Inscrição confirmada
        </p>
        <h3 className="font-display mt-2 text-2xl font-semibold text-white">
          Está feito, {first}.
        </h3>
        <p className="mt-2 text-sm leading-relaxed text-mist">
          Enviámos a confirmação para o seu e-mail. A seguir, vamos continuar no
          WhatsApp para receber o acompanhamento da live.
        </p>
        <ul className="mt-4 space-y-2 text-left text-sm text-white/90">
          <li className="flex items-center gap-2 rounded-lg bg-white/[0.04] px-3 py-2">
            <CalendarDays className="size-4 text-cyan" />
            28, 29 e 30 de Setembro
          </li>
          <li className="flex items-center gap-2 rounded-lg bg-white/[0.04] px-3 py-2">
            <Clock className="size-4 text-cyan" />
            19h – 22h · YouTube ao vivo
          </li>
          <li className="flex items-center gap-2 rounded-lg bg-white/[0.04] px-3 py-2">
            <YoutubeIcon className="size-4 text-cyan" />
            @ccieoctavioneto
          </li>
        </ul>
        <button
          type="button"
          onClick={onConfirm}
          className="btn-shine relative mt-5 flex h-12 w-full items-center justify-center gap-2 rounded-xl bg-cyan text-sm font-semibold text-ink transition hover:bg-cyan/90"
        >
          Entendido, entrar no grupo
          <ArrowRight className="size-4" />
        </button>
      </div>
    </div>
  );
}
