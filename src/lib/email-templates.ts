export function confirmationEmailHtml(params: {
  name: string;
  firstName: string;
  email: string;
  phone: string;
}) {
  const { name, firstName } = params;

  return `<!DOCTYPE html>
<html lang="pt">
  <head>
    <meta charset="utf-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1" />
    <title>Inscrição confirmada</title>
  </head>
  <body style="margin:0;padding:0;background:#070b12;color:#f4f7fb;font-family:Arial,Helvetica,sans-serif;">
    <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:#070b12;padding:28px 12px;">
      <tr>
        <td align="center">
          <table role="presentation" width="560" cellpadding="0" cellspacing="0" style="max-width:560px;width:100%;background:#0c1624;border:1px solid #1b4d57;border-radius:18px;">
            <tr>
              <td style="padding:28px 28px 12px 28px;">
                <p style="margin:0 0 8px 0;font-size:11px;letter-spacing:3px;text-transform:uppercase;color:#3ee0f0;font-weight:bold;">Inscrição confirmada</p>
                <h1 style="margin:0;font-size:26px;line-height:1.2;color:#ffffff;">Olá, ${escapeHtml(firstName)}.</h1>
                <p style="margin:12px 0 0 0;font-size:15px;line-height:1.6;color:#9aadc4;">
                  A sua vaga na live de <strong style="color:#ffffff;">Design e Implementação da Infraestrutura de Rede</strong> para uma instituição bancária está reservada.
                </p>
              </td>
            </tr>
            <tr>
              <td style="padding:8px 28px 20px 28px;">
                <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:#101b2c;border:1px solid #1b4d57;border-radius:14px;">
                  <tr>
                    <td style="padding:18px 20px;">
                      ${row("Participante", name)}
                      ${row("Datas", "28, 29 e 30 de Setembro")}
                      ${row("Horário", "19h – 22h")}
                      ${row("Local", "YouTube ao vivo · @ccieoctavioneto")}
                      ${row("Formador", "Octávio Neto · CCIE #70243")}
                    </td>
                  </tr>
                </table>
              </td>
            </tr>
            <tr>
              <td style="padding:0 28px 28px 28px;">
                <a href="https://www.youtube.com/@ccieoctavioneto" style="display:inline-block;background:#3ee0f0;color:#070b12;text-decoration:none;font-weight:bold;padding:12px 18px;border-radius:10px;">
                  Abrir o canal no YouTube
                </a>
                <p style="margin:16px 0 0 0;font-size:13px;line-height:1.6;color:#9aadc4;">
                  Guarde este e-mail. No dia da live, entre no canal
                  <a href="https://www.youtube.com/@ccieoctavioneto" style="color:#3ee0f0;text-decoration:none;">@ccieoctavioneto</a>
                  alguns minutos antes das 19h.
                </p>
              </td>
            </tr>
          </table>
          <p style="margin:16px 0 0 0;font-size:11px;color:#6d7f94;">Equalizador · Octávio Neto · CCIE #70243</p>
        </td>
      </tr>
    </table>
  </body>
</html>`;
}

export function confirmationEmailText(params: {
  name: string;
  firstName: string;
}) {
  return `Olá, ${params.firstName}.

A sua inscrição na live "Design e Implementação da Infraestrutura de Rede" está confirmada.

Datas: 28, 29 e 30 de Setembro
Horário: 19h – 22h
Local: YouTube ao vivo · @ccieoctavioneto
Formador: Octávio Neto · CCIE #70243

Canal: https://www.youtube.com/@ccieoctavioneto
`;
}

export function adminNotificationHtml(params: {
  name: string;
  email: string;
  phone: string;
  when: string;
}) {
  return `<!DOCTYPE html>
<html lang="pt">
  <body style="margin:0;padding:0;background:#070b12;color:#f4f7fb;font-family:Arial,Helvetica,sans-serif;">
    <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:#070b12;padding:24px 12px;">
      <tr>
        <td align="center">
          <table role="presentation" width="560" cellpadding="0" cellspacing="0" style="max-width:560px;width:100%;background:#0c1624;border:1px solid #1b4d57;border-radius:18px;">
            <tr>
              <td style="padding:24px 28px;">
                <p style="margin:0 0 8px 0;font-size:11px;letter-spacing:3px;text-transform:uppercase;color:#d4a017;font-weight:bold;">Nova inscrição</p>
                <h1 style="margin:0 0 16px 0;font-size:22px;color:#ffffff;">Um novo participante entrou na lista.</h1>
                <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:#101b2c;border-radius:12px;">
                  <tr>
                    <td style="padding:16px 18px;">
                      ${row("Nome", params.name)}
                      ${row("E-mail", params.email)}
                      ${row("Telefone", params.phone)}
                      ${row("Registado em", params.when)}
                    </td>
                  </tr>
                </table>
              </td>
            </tr>
          </table>
        </td>
      </tr>
    </table>
  </body>
</html>`;
}

function row(label: string, value: string) {
  return `<p style="margin:0 0 10px 0;font-size:13px;color:#9aadc4;"><span style="display:block;font-size:10px;letter-spacing:1.5px;text-transform:uppercase;color:#3ee0f0;">${escapeHtml(label)}</span><strong style="color:#ffffff;font-size:15px;">${escapeHtml(value)}</strong></p>`;
}

function escapeHtml(value: string) {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}
