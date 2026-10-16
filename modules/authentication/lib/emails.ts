import { resend } from "./client";


export const sendVerifyEmail = async (reciever: string, code: number) => {
    const { error } = await resend.emails.send({
        from: 'Acme <onboarding@resend.dev>',
        to: [reciever],
        subject: 'Verify your email address',
        html: `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
</head>
<body style="margin:0;padding:0;background-color:#f4f4f5;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background-color:#f4f4f5;padding:40px 0;">
    <tr>
      <td align="center">
        <table width="480" cellpadding="0" cellspacing="0" style="background-color:#ffffff;border-radius:12px;overflow:hidden;box-shadow:0 1px 3px rgba(0,0,0,0.1);">

          <!-- Header -->
          <tr>
            <td style="background-color:#18181b;padding:32px 40px;text-align:center;">
              <p style="margin:0;color:#ffffff;font-size:22px;font-weight:700;letter-spacing:-0.3px;">Notes</p>
            </td>
          </tr>

          <!-- Body -->
          <tr>
            <td style="padding:40px 40px 32px;">
              <h1 style="margin:0 0 8px;font-size:24px;font-weight:700;color:#18181b;">Verify your email</h1>
              <p style="margin:0 0 28px;font-size:15px;color:#71717a;line-height:1.6;">
                Use the code below to complete your sign-up. It expires after a short while, so enter it soon.
              </p>

              <!-- Code box -->
              <table width="100%" cellpadding="0" cellspacing="0" style="margin-bottom:28px;">
                <tr>
                  <td align="center" style="background-color:#f4f4f5;border-radius:8px;padding:24px;">
                    <p style="margin:0;font-size:36px;font-weight:800;letter-spacing:10px;color:#18181b;font-variant-numeric:tabular-nums;">${code}</p>
                  </td>
                </tr>
              </table>

              <p style="margin:0;font-size:13px;color:#a1a1aa;line-height:1.6;">
                If you didn't create an account, you can safely ignore this email.
              </p>
            </td>
          </tr>

          <!-- Footer -->
          <tr>
            <td style="border-top:1px solid #f4f4f5;padding:24px 40px;text-align:center;">
              <p style="margin:0;font-size:12px;color:#a1a1aa;">© 2026 Notes. All rights reserved.</p>
            </td>
          </tr>

        </table>
      </td>
    </tr>
  </table>
</body>
</html>`,
    });

    if (error) {
        throw new Error(error.message);
    }

};