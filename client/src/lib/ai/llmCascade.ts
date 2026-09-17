/**
 * Robust Multi-Key / Multi-Provider LLM Cascade Engine for Siftrole
 *
 * Supports up to N API keys across Groq, Gemini, OpenAI, and OpenRouter.
 * Features:
 * - 4-second timeout per attempt using AbortController
 * - Automatic failover on HTTP 429 (Rate Limit), 500/503 (Provider Down), network errors, or timeout
 * - Returns structured JSON or text response
 * - Local deterministic fallback is invoked ONLY as the absolute last resort when all keys fail.
 */

export interface LLMRequestOptions {
  systemPrompt: string;
  userPrompt: string;
  temperature?: number;
  responseFormatJson?: boolean;
  timeoutMs?: number;
}

export interface LLMResponseResult {
  success: boolean;
  content: string;
  provider: string;
  keyIndex: number;
}

interface ProviderCandidate {
  name: string;
  type: "groq" | "gemini" | "openai" | "openrouter";
  apiKey: string;
  model: string;
}

/**
 * Dynamically resolves all configured API keys from environment variables.
 * Supports:
 * - GROQ_API_KEY_1, GROQ_API_KEY_2, GROQ_API_KEY_3, GROQ_API_KEY_4, GROQ_API_KEY_5
 * - GROQ_API_KEYS (comma-separated)
 * - GROQ_API_KEY, AI_API_KEY
 * - GEMINI_API_KEY_1, GEMINI_API_KEY_2, GEMINI_API_KEY, GOOGLE_API_KEY
 * - OPENAI_API_KEY_1, OPENAI_API_KEY_2, OPENAI_API_KEY
 * - OPENROUTER_API_KEY
 */
export function getAvailableLLMProviders(): ProviderCandidate[] {
  const candidates: ProviderCandidate[] = [];

  // 1. Groq Keys (Llama 3.3 70B & Llama 3.1 8B)
  const groqNumberedKeys = [
    process.env.GROQ_API_KEY_1,
    process.env.GROQ_API_KEY_2,
    process.env.GROQ_API_KEY_3,
    process.env.GROQ_API_KEY_4,
    process.env.GROQ_API_KEY_5,
  ].filter(Boolean) as string[];

  const groqCsvKeys = (process.env.GROQ_API_KEYS || "")
    .split(",")
    .map((k) => k.trim())
    .filter(Boolean);

  const groqSingleKeys = [process.env.GROQ_API_KEY, process.env.AI_API_KEY].filter(Boolean) as string[];

  const allGroqKeys = Array.from(new Set([...groqNumberedKeys, ...groqCsvKeys, ...groqSingleKeys]));

  allGroqKeys.forEach((key, idx) => {
    candidates.push({
      name: `Groq Key #${idx + 1}`,
      type: "groq",
      apiKey: key,
      model: "llama-3.3-70b-versatile",
    });
  });

  // 2. Google Gemini Keys (Gemini 1.5 Flash)
  const geminiKeys = [
    process.env.GEMINI_API_KEY_1,
    process.env.GEMINI_API_KEY_2,
    process.env.GEMINI_API_KEY,
    process.env.GOOGLE_API_KEY,
  ].filter(Boolean) as string[];

  Array.from(new Set(geminiKeys)).forEach((key, idx) => {
    candidates.push({
      name: `Gemini Key #${idx + 1}`,
      type: "gemini",
      apiKey: key,
      model: "gemini-1.5-flash",
    });
  });

  // 3. OpenAI Keys (GPT-4o-mini)
  const openaiKeys = [
    process.env.OPENAI_API_KEY_1,
    process.env.OPENAI_API_KEY_2,
    process.env.OPENAI_API_KEY,
  ].filter(Boolean) as string[];

  Array.from(new Set(openaiKeys)).forEach((key, idx) => {
    candidates.push({
      name: `OpenAI Key #${idx + 1}`,
      type: "openai",
      apiKey: key,
      model: "gpt-4o-mini",
    });
  });

  // 4. OpenRouter Keys
  const openrouterKeys = [process.env.OPENROUTER_API_KEY].filter(Boolean) as string[];
  Array.from(new Set(openrouterKeys)).forEach((key, idx) => {
    candidates.push({
      name: `OpenRouter Key #${idx + 1}`,
      type: "openrouter",
      apiKey: key,
      model: "meta-llama/llama-3.3-70b-instruct",
    });
  });

  return candidates;
}

/**
 * Execute LLM call with sequential failover across all configured keys.
 * Returns LLMResponseResult if any key succeeds, or null if all keys fail.
 */
export async function executeLLMCascade(
  options: LLMRequestOptions
): Promise<LLMResponseResult | null> {
  const {
    systemPrompt,
    userPrompt,
    temperature = 0.65,
    responseFormatJson = false,
    timeoutMs = 4200,
  } = options;

  const providers = getAvailableLLMProviders();

  if (providers.length === 0) {
    console.warn("[LLM Cascade] No external API keys found in environment. Using local fallback.");
    return null;
  }

  for (let i = 0; i < providers.length; i++) {
    const provider = providers[i];
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), timeoutMs);

    try {
      let content = "";

      if (provider.type === "groq" || provider.type === "openai" || provider.type === "openrouter") {
        const endpoint =
          provider.type === "groq"
            ? "https://api.groq.com/openai/v1/chat/completions"
            : provider.type === "openrouter"
            ? "https://openrouter.ai/api/v1/chat/completions"
            : "https://api.openai.com/v1/chat/completions";

        const payload: any = {
          model: provider.model,
          temperature,
          messages: [
            { role: "system", content: systemPrompt },
            { role: "user", content: userPrompt },
          ],
        };

        if (responseFormatJson && provider.type !== "openrouter") {
          payload.response_format = { type: "json_object" };
        }

        const response = await fetch(endpoint, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${provider.apiKey}`,
          },
          body: JSON.stringify(payload),
          signal: controller.signal,
        });

        clearTimeout(timeoutId);

        if (!response.ok) {
          const errText = await response.text().catch(() => "");
          console.warn(
            `[LLM Cascade] ${provider.name} returned HTTP ${response.status}: ${errText.slice(0, 100)}. Trying next key...`
          );
          continue;
        }

        const data = await response.json();
        content = data.choices?.[0]?.message?.content || "";
      } else if (provider.type === "gemini") {
        const endpoint = `https://generativelanguage.googleapis.com/v1beta/models/${provider.model}:generateContent?key=${provider.apiKey}`;

        const payload = {
          contents: [
            {
              role: "user",
              parts: [{ text: `${systemPrompt}\n\n${userPrompt}` }],
            },
          ],
          generationConfig: {
            temperature,
            responseMimeType: responseFormatJson ? "application/json" : "text/plain",
          },
        };

        const response = await fetch(endpoint, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
          signal: controller.signal,
        });

        clearTimeout(timeoutId);

        if (!response.ok) {
          const errText = await response.text().catch(() => "");
          console.warn(
            `[LLM Cascade] ${provider.name} returned HTTP ${response.status}: ${errText.slice(0, 100)}. Trying next key...`
          );
          continue;
        }

        const data = await response.json();
        content = data.candidates?.[0]?.content?.parts?.[0]?.text || "";
      }

      if (content && content.trim().length > 0) {
        return {
          success: true,
          content: content.trim(),
          provider: provider.name,
          keyIndex: i + 1,
        };
      }
    } catch (err: any) {
      clearTimeout(timeoutId);
      const isAbort = err?.name === "AbortError" || err?.message?.includes("aborted");
      console.warn(
        `[LLM Cascade] ${provider.name} failed (${isAbort ? "Timeout > " + timeoutMs + "ms" : err?.message}). Immediately failing over to next candidate...`
      );
    }
  }

  console.warn(`[LLM Cascade] All ${providers.length} configured API keys failed or timed out. Executing local fallback engine.`);
  return null;
}
