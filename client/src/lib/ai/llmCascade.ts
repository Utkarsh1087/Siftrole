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
  maxTokens?: number;
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
// In-memory cache for common requests (30-minute TTL)
const responseCache = new Map<string, { content: string; provider: string; expiresAt: number }>();

function getCacheKey(systemPrompt: string, userPrompt: string): string {
  let hash = 0;
  const str = `${systemPrompt}::${userPrompt}`;
  for (let i = 0; i < str.length; i++) {
    hash = (hash << 5) - hash + str.charCodeAt(i);
    hash |= 0;
  }
  return `llm_cache_${hash}`;
}

let rotationIndex = 0;

/**
 * Dynamically resolves all configured API keys from environment variables.
 * Supports:
 * - GROQ_API_KEY_1, GROQ_API_KEY_2, GROQ_API_KEY_3, GROQ_API_KEY_4, GROQ_API_KEY_5
 * - GROQ_API_KEYS (comma-separated)
 * - GROQ_API_KEY, AI_API_KEY
 * - GEMINI_API_KEY_1, GEMINI_API_KEY_2, GEMINI_API_KEY_3, GEMINI_API_KEY, GOOGLE_API_KEY
 * - OPENAI_API_KEY_1, OPENAI_API_KEY_2, OPENAI_API_KEY
 * - OPENROUTER_API_KEY
 */
export function getAvailableLLMProviders(): ProviderCandidate[] {
  const candidates: ProviderCandidate[] = [];

  // 1. Groq Keys (Llama 3.1 8B Instant for speed/high quotas + Llama 3.3 70B for deep reasoning)
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
    // Ultra-fast Qwen 3.8 27B (High speed, versatile)
    candidates.push({
      name: `Groq Qwen-3.8 27B #${idx + 1}`,
      type: "groq",
      apiKey: key,
      model: "qwen/qwen3.8-27b",
    });
    // High-capacity GPT-OSS 120B
    candidates.push({
      name: `Groq GPT-OSS 120B #${idx + 1}`,
      type: "groq",
      apiKey: key,
      model: "openai/gpt-oss-120b",
    });
  });

  // 2. Google Gemini Keys (Gemini 3.6 Flash & 3.8 Flash)
  const geminiNumberedKeys = [
    process.env.GEMINI_API_KEY_1,
    process.env.GEMINI_API_KEY_2,
    process.env.GEMINI_API_KEY_3,
    process.env.GEMINI_API_KEY_4,
  ].filter(Boolean) as string[];

  const geminiSingleKeys = [
    process.env.GEMINI_API_KEY,
    process.env.GOOGLE_API_KEY,
  ].filter(Boolean) as string[];

  const allGeminiKeys = Array.from(new Set([...geminiNumberedKeys, ...geminiSingleKeys]));

  allGeminiKeys.forEach((key, idx) => {
    candidates.push({
      name: `Gemini 3.6 Flash #${idx + 1}`,
      type: "gemini",
      apiKey: key,
      model: "gemini-3.6-flash",
    });
    candidates.push({
      name: `Gemini 3.8 Flash #${idx + 1}`,
      type: "gemini",
      apiKey: key,
      model: "gemini-3.8-flash",
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
    maxTokens,
    responseFormatJson = false,
    timeoutMs = 4200,
  } = options;

  // 1. Instant Cache Check (5ms Response, 0 Token Cost)
  const cacheKey = getCacheKey(systemPrompt, userPrompt);
  const cached = responseCache.get(cacheKey);
  if (cached && cached.expiresAt > Date.now()) {
    return {
      success: true,
      content: cached.content,
      provider: `${cached.provider} (Cached ⚡)`,
      keyIndex: 0,
    };
  }

  const providers = getAvailableLLMProviders();

  if (providers.length === 0) {
    console.warn("[LLM Cascade] No external API keys found in environment. Using local fallback.");
    return null;
  }

  // 2. Round-Robin Rotation across all incoming requests
  const total = providers.length;
  const startOffset = rotationIndex++ % total;
  const rotatedProviders = [
    ...providers.slice(startOffset),
    ...providers.slice(0, startOffset),
  ];

  for (let i = 0; i < rotatedProviders.length; i++) {
    const provider = rotatedProviders[i];
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

        if (maxTokens) {
          payload.max_tokens = maxTokens;
        }

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

          if (response.status === 429 || errText.toLowerCase().includes("rate limit") || errText.toLowerCase().includes("quota")) {
            const { notifyAdminApiLimitReached } = await import("@/lib/alerts/notifyAdmin");
            notifyAdminApiLimitReached({
              provider: provider.name,
              model: provider.model,
              statusCode: response.status,
              errorMessage: errText.slice(0, 200),
            }).catch(() => null);
          }

          continue;
        }

        const data = await response.json();
        content = data.choices?.[0]?.message?.content || "";
      } else if (provider.type === "gemini") {
        const endpoint = `https://generativelanguage.googleapis.com/v1beta/models/${provider.model}:generateContent?key=${provider.apiKey}`;

        const payload: any = {
          contents: [
            {
              role: "user",
              parts: [{ text: `${systemPrompt}\n\n${userPrompt}` }],
            },
          ],
          generationConfig: {
            temperature,
            responseMimeType: responseFormatJson ? "application/json" : "text/plain",
            ...(maxTokens ? { maxOutputTokens: maxTokens } : {}),
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

          if (response.status === 429 || errText.toLowerCase().includes("rate limit") || errText.toLowerCase().includes("quota") || errText.toLowerCase().includes("resource_exhausted")) {
            const { notifyAdminApiLimitReached } = await import("@/lib/alerts/notifyAdmin");
            notifyAdminApiLimitReached({
              provider: provider.name,
              model: provider.model,
              statusCode: response.status,
              errorMessage: errText.slice(0, 200),
            }).catch(() => null);
          }

          continue;
        }

        const data = await response.json();
        content = data.candidates?.[0]?.content?.parts?.[0]?.text || "";
      }

      if (content && content.trim().length > 0) {
        const cleanContent = content.trim();

        // Cache valid responses for 30 minutes
        responseCache.set(cacheKey, {
          content: cleanContent,
          provider: provider.name,
          expiresAt: Date.now() + 30 * 60 * 1000,
        });

        // Limit cache size to 500 entries
        if (responseCache.size > 500) {
          const oldestKey = responseCache.keys().next().value;
          if (oldestKey) responseCache.delete(oldestKey);
        }

        return {
          success: true,
          content: cleanContent,
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
