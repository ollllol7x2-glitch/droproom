import { products } from "@/data/products";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

type ChatProvider = "groq" | "gemini" | "openai";
type IncomingMessage = { role: "user" | "assistant"; content: string };

const providerLabels: Record<ChatProvider, string> = {
  groq: "Groq",
  gemini: "Gemini",
  openai: "ChatGPT",
};

const recentRequests = new Map<string, number[]>();
const RATE_LIMIT_WINDOW_MS = 10 * 60 * 1000;
const RATE_LIMIT_MAX_REQUESTS = 20;

const productContext = products
  .map((product) => {
    const price = product.salePrice ?? product.price;
    return `- ${product.name} | ${product.brand} | ${product.category} | ${price.toLocaleString("ko-KR")}원 | ${product.stockStatus} | ${product.shortDescription} | /product/${product.slug}`;
  })
  .join("\n");

const systemPrompt = `당신은 디자인 라이프스타일 편집숍 DROP ROOM의 쇼핑 도우미입니다.
항상 자연스러운 한국어로, 짧고 친절하게 답합니다. 아래 카탈로그에 있는 상품과 정보만 근거로 추천하세요.
가격, 재고, 할인 여부를 추측하거나 만들어내지 마세요. 재고 상태는 in_stock=구매 가능, low_stock=재고 소량, sold_out=품절입니다.
각 답변은 최대 4개의 짧은 문단으로 구성하고, 추천할 때는 상품명, 가격, 이유, 상품 경로를 포함하세요.
결제 승인, 배송 현황, 개인정보, 주문 변경은 직접 처리할 수 없으며 고객센터 문의를 안내하세요.

[DROP ROOM 상품 카탈로그]
${productContext}`;

function jsonError(message: string, status: number) {
  return Response.json({ error: message }, { status });
}

function getMessages(value: unknown): IncomingMessage[] | null {
  if (!Array.isArray(value) || value.length === 0 || value.length > 12) return null;

  const messages = value
    .filter(
      (message): message is IncomingMessage =>
        typeof message === "object" &&
        message !== null &&
        (message.role === "user" || message.role === "assistant") &&
        typeof message.content === "string",
    )
    .map((message) => ({ role: message.role, content: message.content.trim().slice(0, 700) }))
    .filter((message) => message.content.length > 0);

  return messages.length ? messages : null;
}

function getProvider(value: unknown): ChatProvider {
  return value === "gemini" || value === "openai" ? value : "groq";
}

function isRateLimited(request: Request) {
  const forwarded = request.headers.get("x-forwarded-for");
  const client = forwarded?.split(",")[0]?.trim() || request.headers.get("x-real-ip") || "anonymous";
  const now = Date.now();
  const timestamps = (recentRequests.get(client) || []).filter(
    (timestamp) => now - timestamp < RATE_LIMIT_WINDOW_MS,
  );

  if (timestamps.length >= RATE_LIMIT_MAX_REQUESTS) return true;
  timestamps.push(now);
  recentRequests.set(client, timestamps);
  return false;
}

async function requestGroq(messages: IncomingMessage[]) {
  const apiKey = process.env.GROQ_API_KEY;
  if (!apiKey) throw new Error("GROQ_API_KEY_MISSING");

  const response = await fetch("https://api.groq.com/openai/v1/chat/completions", {
    method: "POST",
    headers: { Authorization: `Bearer ${apiKey}`, "Content-Type": "application/json" },
    body: JSON.stringify({
      model: process.env.GROQ_CHAT_MODEL || "llama-3.1-8b-instant",
      messages: [{ role: "system", content: systemPrompt }, ...messages],
      temperature: 0.45,
      max_tokens: 500,
    }),
    signal: AbortSignal.timeout(20_000),
  });

  const data = await response.json().catch(() => null);
  if (!response.ok) throw new Error(`UPSTREAM_${response.status}`);
  return typeof data?.choices?.[0]?.message?.content === "string" ? data.choices[0].message.content : null;
}

async function requestOpenAI(messages: IncomingMessage[]) {
  const apiKey = process.env.OPENAI_API_KEY;
  if (!apiKey) throw new Error("OPENAI_API_KEY_MISSING");

  const response = await fetch("https://api.openai.com/v1/chat/completions", {
    method: "POST",
    headers: { Authorization: `Bearer ${apiKey}`, "Content-Type": "application/json" },
    body: JSON.stringify({
      model: process.env.OPENAI_CHAT_MODEL || "gpt-4.1-mini",
      messages: [{ role: "system", content: systemPrompt }, ...messages],
      temperature: 0.45,
      max_tokens: 500,
    }),
    signal: AbortSignal.timeout(20_000),
  });

  const data = await response.json().catch(() => null);
  if (!response.ok) throw new Error(`UPSTREAM_${response.status}`);
  return typeof data?.choices?.[0]?.message?.content === "string" ? data.choices[0].message.content : null;
}

async function requestGemini(messages: IncomingMessage[]) {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) throw new Error("GEMINI_API_KEY_MISSING");

  const model = process.env.GEMINI_CHAT_MODEL || "gemini-2.5-flash";
  const response = await fetch(
    `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent`,
    {
      method: "POST",
      headers: { "Content-Type": "application/json", "x-goog-api-key": apiKey },
      body: JSON.stringify({
        systemInstruction: { parts: [{ text: systemPrompt }] },
        contents: messages.map((message) => ({
          role: message.role === "assistant" ? "model" : "user",
          parts: [{ text: message.content }],
        })),
        generationConfig: { temperature: 0.45, maxOutputTokens: 500 },
      }),
      signal: AbortSignal.timeout(20_000),
    },
  );

  const data = await response.json().catch(() => null);
  if (!response.ok) throw new Error(`UPSTREAM_${response.status}`);
  const parts = data?.candidates?.[0]?.content?.parts;
  return Array.isArray(parts) ? parts.map((part) => part?.text).filter(Boolean).join("\n") : null;
}

export async function POST(request: Request) {
  if (isRateLimited(request)) {
    return jsonError("짧은 시간에 요청이 많습니다. 10분 뒤 다시 시도해 주세요.", 429);
  }

  let body: { provider?: unknown; messages?: unknown };
  try {
    body = await request.json();
  } catch {
    return jsonError("요청 형식이 올바르지 않습니다.", 400);
  }

  if (!body || typeof body !== "object") {
    return jsonError("요청 형식이 올바르지 않습니다.", 400);
  }

  const messages = getMessages(body.messages);
  if (!messages || messages.at(-1)?.role !== "user") {
    return jsonError("질문을 다시 입력해 주세요.", 400);
  }

  const provider = getProvider(body.provider);
  try {
    const reply =
      provider === "gemini"
        ? await requestGemini(messages)
        : provider === "openai"
          ? await requestOpenAI(messages)
          : await requestGroq(messages);

    if (!reply) return jsonError("답변을 만들지 못했습니다. 잠시 후 다시 시도해 주세요.", 502);
    return Response.json({ reply, provider, providerLabel: providerLabels[provider] });
  } catch (error) {
    const code = error instanceof Error ? error.message : "UNKNOWN";
    if (code.endsWith("_MISSING")) {
      return jsonError(`${providerLabels[provider]} API 키가 아직 설정되지 않았습니다.`, 503);
    }
    if (code === "UPSTREAM_429") {
      return jsonError("요청이 많습니다. 잠시 후 다시 시도해 주세요.", 429);
    }
    return jsonError("AI 상담 연결에 실패했습니다. 잠시 후 다시 시도해 주세요.", 502);
  }
}
