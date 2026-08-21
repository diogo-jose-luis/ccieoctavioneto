import nodemailer from "nodemailer";
import {
  adminNotificationHtml,
  confirmationEmailHtml,
  confirmationEmailText,
} from "@/lib/email-templates";

function getTransport() {
  const host = process.env.MAIL_HOST;
  const port = Number(process.env.MAIL_PORT || 465);
  const user = process.env.MAIL_USERNAME;
  const pass = process.env.MAIL_PASSWORD;

  if (!host || !user || !pass) {
    throw new Error("Configuração de e-mail em falta");
  }

  return nodemailer.createTransport({
    host,
    port,
    secure: port === 465,
    auth: { user, pass },
    connectionTimeout: 25000,
    greetingTimeout: 25000,
    socketTimeout: 25000,
  });
}

function notifyList() {
  return (process.env.NOTIFY_EMAILS ?? "")
    .split(",")
    .map((item) => item.trim())
    .filter(Boolean);
}

export async function sendRegistrationEmails(params: {
  name: string;
  firstName: string;
  email: string;
  phone: string;
  when: string;
}) {
  const transport = getTransport();
  const from =
    process.env.MAIL_FROM ||
    `"Octávio Neto | CCIE #70243" <${process.env.MAIL_USERNAME}>`;

  const userMail = transport.sendMail({
    from,
    to: params.email,
    subject: `${params.firstName}, a sua inscrição está confirmada`,
    html: confirmationEmailHtml(params),
    text: confirmationEmailText(params),
  });

  const admins = notifyList();
  const adminMail =
    admins.length > 0
      ? transport.sendMail({
          from,
          to: admins.join(", "),
          subject: `Nova inscrição: ${params.name}`,
          html: adminNotificationHtml(params),
          text: `Nova inscrição\nNome: ${params.name}\nE-mail: ${params.email}\nTelefone: ${params.phone}\nRegistado em: ${params.when}`,
        })
      : Promise.resolve();

  await Promise.all([userMail, adminMail]);
}
