export type RegistrationInput = {
  name: string;
  email: string;
  phone: string;
};

export type FieldErrors = Partial<RegistrationInput>;

const EMAIL_RE = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
const NAME_RE = /^[\p{L}]+(?:[ '\-][\p{L}]+)+$/u;

export function normalizeName(value: string) {
  return value.trim().replace(/\s+/g, " ");
}

export function firstNameOf(name: string) {
  return normalizeName(name).split(" ")[0] ?? "";
}

export function validateRegistration(raw: RegistrationInput): {
  values: RegistrationInput;
  errors: FieldErrors;
} {
  const values: RegistrationInput = {
    name: normalizeName(raw.name ?? ""),
    email: (raw.email ?? "").trim().toLowerCase(),
    phone: (raw.phone ?? "").trim(),
  };
  const errors: FieldErrors = {};

  if (!values.name) {
    errors.name = "O nome é obrigatório";
  } else if (values.name.length > 30) {
    errors.name = "O nome não pode ter mais de 30 caracteres";
  } else if (values.name.split(" ").length < 2) {
    errors.name = "Indique o primeiro e o último nome";
  } else if (!NAME_RE.test(values.name)) {
    errors.name = "Use apenas letras no primeiro e último nome";
  }

  if (!values.email) {
    errors.email = "O e-mail é obrigatório";
  } else if (!EMAIL_RE.test(values.email)) {
    errors.email = "Indique um e-mail válido";
  }

  if (!values.phone) {
    errors.phone = "O telefone é obrigatório";
  } else if (/[a-zA-ZÀ-ÿ]/.test(values.phone)) {
    errors.phone = "O telefone não pode conter letras";
  } else if (!/^[+\d\s().-]+$/.test(values.phone)) {
    errors.phone = "Use apenas números no telefone";
  } else if (values.phone.replace(/\D/g, "").length < 9) {
    errors.phone = "Indique um número de telefone válido";
  }

  return { values, errors };
}

export function hasErrors(errors: FieldErrors) {
  return Object.keys(errors).length > 0;
}
