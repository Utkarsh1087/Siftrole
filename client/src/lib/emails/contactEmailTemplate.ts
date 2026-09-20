interface ContactEmailParams {
  name: string;
  email: string;
  topic: string;
  message: string;
  date: string;
}

export function renderContactEmailHtml({
  name,
  email,
  topic,
  message,
  date,
}: ContactEmailParams): string {
  const firstName = name ? name.split(" ")[0] : "Sender";

  return `
<!DOCTYPE html PUBLIC "-//W3C//DTD XHTML 1.0 Transitional//EN" "http://www.w3.org/TR/xhtml1/DTD/xhtml1-transitional.dtd">
<html dir="ltr" lang="en">
  <head>
    <meta content="text/html; charset=UTF-8" http-equiv="Content-Type" />
    <meta name="x-apple-disable-message-reformatting" />
    <title>Siftrole Developer Update</title>
  </head>
  <body dir="ltr" lang="en" style="background-color: #dbddde; margin: 0; padding: 30px 15px; font-family: -apple-system, BlinkMacSystemFont, 'Inter', 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; -webkit-font-smoothing: antialiased; color: #3c4043;">
    
    <table align="center" width="100%" border="0" cellpadding="0" cellspacing="0" role="presentation" style="max-width: 600px; margin: 0 auto; background-color: #ffffff; border-radius: 6px; overflow: hidden; box-shadow: 0 1px 3px rgba(60,64,67,0.15), 0 1px 2px rgba(60,64,67,0.3);">
      <tbody>
        <tr>
          <td>
            
            <!-- Top Header Logo (Clean Google Style) -->
            <div style="padding: 28px 40px 0;">
              <table cellpadding="0" cellspacing="0" border="0">
                <tr>
                  <td style="vertical-align: middle;">
                    <span style="font-size: 24px; font-weight: 900; letter-spacing: -0.04em; color: #121816; font-family: -apple-system, BlinkMacSystemFont, 'Inter', 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;">
                      Sift<span style="color: #1a422f;">role</span>
                    </span>
                  </td>
                  <td style="vertical-align: middle; padding-left: 12px;">
                    <span style="font-size: 11px; font-weight: 700; color: #5f6368; text-transform: uppercase; letter-spacing: 0.05em; border-left: 1px solid #dadce0; padding-left: 12px;">
                      Feedback Portal
                    </span>
                  </td>
                </tr>
              </table>
            </div>

            <!-- Body Section -->
            <div style="padding: 0 40px;">
              <hr style="border: none; border-top: 1px solid #e8eaed; margin: 20px 0;" />

              <!-- Blue Category Header -->
              <p style="font-size: 14px; line-height: 26px; font-weight: 700; color: #004dcf; margin: 16px 0 12px; text-transform: uppercase; letter-spacing: 0.05em;">
                ${topic.toUpperCase()} UPDATE
              </p>

              <p style="font-size: 14px; line-height: 22px; color: #3c4043; margin: 0 0 16px;">
                Hello Siftrole Team,
              </p>

              <p style="font-size: 14px; line-height: 22px; color: #3c4043; margin: 0 0 16px;">
                A community member has submitted a new ${topic.toLowerCase()} message through the Siftrole feedback portal on <strong>${date}</strong>.
              </p>

              <!-- Sender & Message Summary -->
              <div style="background-color: #f8f9fa; border: 1px solid #e8eaed; border-radius: 6px; padding: 16px 20px; margin: 20px 0; font-size: 14px; line-height: 24px; color: #3c4043;">
                <div><strong>Sender:</strong> ${name || "Anonymous Member"}</div>
                <div><strong>Email:</strong> <a href="mailto:${email}" style="color: #004dcf; text-decoration: none;">${email}</a></div>
                <div><strong>Topic:</strong> ${topic}</div>
              </div>

              <!-- Message Text -->
              <p style="font-size: 13px; font-weight: 700; text-transform: uppercase; letter-spacing: 0.05em; color: #5f6368; margin: 16px 0 8px;">
                User Message:
              </p>

              <div style="background-color: #ffffff; border: 1px solid #dadce0; border-left: 4px solid #004dcf; border-radius: 4px; padding: 16px 20px; font-size: 14px; line-height: 22px; color: #202124; white-space: pre-wrap; word-break: break-word; margin-bottom: 24px;">
${message}
              </div>

              <!-- Google Blue Action Button -->
              <div style="margin: 24px 0 28px;">
                <a href="mailto:${email}?subject=Re: [Siftrole ${encodeURIComponent(topic)}] Message from ${encodeURIComponent(name || email)}" style="display: inline-block; background-color: #004dcf; color: #ffffff; text-decoration: none; font-size: 14px; font-weight: 700; padding: 12px 26px; border-radius: 4px; letter-spacing: 0.01em;">
                  Reply to ${firstName} &rarr;
                </a>
              </div>

              <hr style="border: none; border-top: 1px solid #e8eaed; margin: 24px 0 20px;" />

              <!-- Signoff -->
              <div style="margin-bottom: 28px;">
                <p style="font-size: 14px; line-height: 22px; color: #3c4043; margin: 0 0 4px;">
                  Thank you,
                </p>
                <p style="font-size: 20px; line-height: 24px; font-weight: 400; color: #3c4043; margin: 0;">
                  The Siftrole team
                </p>
              </div>
            </div>

            <!-- Connect Box (Google style) -->
            <div style="margin: 0 40px 30px; background-color: #f0fcff; border: 1px solid #cceeff; border-radius: 6px; padding: 18px 22px;">
              <p style="font-size: 14px; line-height: 22px; font-weight: 700; color: #004dcf; margin: 0 0 6px;">
                Direct Communication
              </p>
              <p style="font-size: 13px; line-height: 20px; color: #3c4043; margin: 0;">
                You can reply directly to this email in your client to respond to <strong>${email}</strong>.
              </p>
            </div>

            <!-- Google Style Footer Disclaimers -->
            <div style="padding: 0 40px 30px; text-align: center; font-size: 11px; line-height: 18px; color: #5f6368;">
              <p style="margin: 0 0 6px;">
                &copy; 2026 Siftrole. All rights reserved.
              </p>
              <p style="margin: 0;">
                You have received this notification regarding an inbound submission on Siftrole.
              </p>
            </div>

          </td>
        </tr>
      </tbody>
    </table>

  </body>
</html>
  `.trim();
}
