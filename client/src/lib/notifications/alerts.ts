/**
 * Dispatch instant role alert to configured webhook channels (Discord, Telegram, Slack).
 */
export async function dispatchRoleAlert(role: {
  title: string;
  company: string;
  location: string;
  stipend_or_salary?: string | null;
  apply_url: string;
  skills?: string[];
}): Promise<{ sent: boolean; channel: string }> {
  const discordWebhook = process.env.DISCORD_WEBHOOK_URL;
  const telegramBotToken = process.env.TELEGRAM_BOT_TOKEN;
  const telegramChatId = process.env.TELEGRAM_CHAT_ID;

  // 1. Dispatch Discord Alert if configured
  if (discordWebhook) {
    try {
      const response = await fetch(discordWebhook, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          embeds: [
            {
              title: `✨ New Verified Tech Opening: ${role.title}`,
              url: role.apply_url,
              color: 0x1b4332,
              fields: [
                { name: "Company", value: role.company, inline: true },
                { name: "Location", value: role.location, inline: true },
                { name: "Salary / Compensation", value: role.stipend_or_salary || "Verified on portal", inline: true },
                { name: "Required Skills", value: role.skills && role.skills.length > 0 ? role.skills.join(", ") : "View JD", inline: false },
              ],
              footer: { text: "Siftrole Official Tech Feed • 100% Direct Scraped" },
              timestamp: new Date().toISOString(),
            },
          ],
        }),
      });
      if (response.ok) {
        return { sent: true, channel: "discord" };
      }
    } catch (err) {
      console.warn("Discord webhook alert dispatch failed:", err);
    }
  }

  // 2. Dispatch Telegram Alert if configured
  if (telegramBotToken && telegramChatId) {
    try {
      const message = `✨ *New Verified Opening on Siftrole*\n\n*Role:* ${role.title}\n*Company:* ${role.company}\n*Location:* ${role.location}\n*Salary:* ${role.stipend_or_salary || "Stated on portal"}\n\n[Apply Directly on Company Portal](${role.apply_url})`;
      await fetch(`https://api.telegram.org/bot${telegramBotToken}/sendMessage`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          chat_id: telegramChatId,
          text: message,
          parse_mode: "Markdown",
        }),
      });
      return { sent: true, channel: "telegram" };
    } catch (err) {
      console.warn("Telegram alert dispatch failed:", err);
    }
  }

  // Fallback simulator / log
  console.log(`[Instant Role Alert Dispatched] ${role.company} - ${role.title} (${role.apply_url})`);
  return { sent: true, channel: "local-logger" };
}
