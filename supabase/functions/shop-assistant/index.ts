import "jsr:@supabase/functions-js/edge-runtime.d.ts";

type ChatProvider = "groq" | "gemini" | "openai";
type IncomingMessage = { role: "user" | "assistant"; content: string };

const providerLabels: Record<ChatProvider, string> = {
  groq: "Groq",
  gemini: "Gemini",
  openai: "ChatGPT",
};

const catalog = [
  "1,000원 테스트 결제 스티커 | OFFSET CLUB | 문구 | 1,000원 | 구매 가능 | 테스트 결제 전용 | 토스페이먼츠 테스트 결제 확인용 | one-thousand-won-test-sticker",
  "코발트 스파이럴 노트 | PAPERWEIGHT | 문구 | 7,800원 | 구매 가능 | 코발트 표지 스프링 노트 | cobalt-spiral-note",
  "클리어 라임 클릭 펜 | MUNMUN | 문구 | 3,200원 | 구매 가능 | 투명 라임 젤 펜 | clear-lime-click-pen",
  "크롬 와이드 클립 2개 세트 | FORME | 문구 | 4,900원 | 구매 가능 | 넓은 금속 클립 | chrome-wide-clip",
  "소프트 프레임 폰 케이스 | SUNDAY OBJECT | 디지털 | 15,300원 | 재고 소량 | 무광 크림 폰 케이스 | soft-frame-phone-case",
  "케이블 루프 4개 세트 | DEAR BYTE | 디지털 | 6,500원 | 구매 가능 | 실리콘 케이블 정리 루프 | cable-loop-set",
  "네이비 태블릿 슬리브 | MORNING SERVICE | 디지털 | 29,000원 | 구매 가능 | 나일론 태블릿 슬리브 | navy-tablet-sleeve",
  "미니 머시룸 램프 | GLOW DEPT. | 룸 | 34,000원 | 재고 소량 | 체리 레드 충전식 조명 | mini-mushroom-lamp",
  "코발트 월 프린트 | OFFSET CLUB | 룸 | 12,000원 | 구매 가능 | 무광 포스터 | cobalt-wall-print",
  "크롬 미니 테이블 램프 | GLOW DEPT. | 룸 | 68,000원 | 구매 가능 | 돔 형태 테이블 조명 | chrome-mini-table-lamp",
  "네이비 포켓 미니백 | WEEKEND UNIT | 패션 | 35,100원 | 구매 가능 | 나일론 미니백 | navy-pocket-bag",
  "블루 스트라이프 삭스 | ODD PAIR | 패션 | 9,000원 | 구매 가능 | 도톰한 골지 양말 | blue-stripe-socks",
  "크롬 루프 키링 | FORME | 패션 | 11,000원 | 구매 가능 | 회전형 실버 키링 | chrome-loop-keyring",
  "빈 캐치올 트레이 | SMALL HOURS | 리빙 | 26,000원 | 구매 가능 | 스테인리스 트레이 | bean-catchall-tray",
  "데일리 세라믹 머그 | SMALL HOURS | 리빙 | 19,000원 | 구매 가능 | 무광 머그 | daily-ceramic-mug",
  "클리어 테이프 디스펜서 | PAPERWEIGHT | 리빙 | 13,500원 | 구매 가능 | 투명 아크릴 테이프 커터 | clear-tape-dispenser",
  "파이브 미닛 데스크 타이머 | MUNMUN | 취미 | 22,000원 | 재고 소량 | 아날로그 타이머 | five-minute-desk-timer",
  "포켓 블루 퍼즐 | AFTER CLASS | 취미 | 16,000원 | 구매 가능 | 코발트 미니 퍼즐 | pocket-blue-puzzle",
  "스몰 드로잉 키트 | AFTER CLASS | 취미 | 24,000원 | 구매 가능 | 스케치북과 연필 세트 | small-drawing-kit",
].map((item) => `- ${item}`).join("\n");

const systemPrompt = `당신은 디자인 라이프스타일 편집숍 DROP ROOM의 쇼핑 도우미입니다.
항상 자연스러운 한국어로, 짧고 친절하게 답합니다. 아래 카탈로그의 상품 정보만 근거로 추천하세요.
가격, 재고, 할인 여부를 추측하거나 만들어내지 마세요.
테스트 결제 전용 상품은 사용자가 테스트 결제나 1,000원 테스트 상품을 직접 물어볼 때만 안내하세요.
각 답변은 최대 4개의 짧은 문단으로 구성하고, 추천할 때는 상품명, 가격, 이유, /droproom/product/상품슬러그/ 경로를 포함하세요.
결제 승인, 배송 현황, 개인정보, 주문 변경은 직접 처리할 수 없으며 고객센터 문의를 안내하세요.

[DROP ROOM 상품 카탈로그]
${catalog}`;

const allowedOrigins = new Set([
  "https://ollllol7x2-glitch.github.io",
  "http://localhost:3200",
  "http://127.0.0.1:3200",
]);
const recentRequests = new Map<string, number[]>();
const RATE_LIMIT_WINDOW_MS = 10 * 60 * 1000;
const RATE_LIMIT_MAX_REQUESTS = 20;

function corsHeaders(request: Request) {
  const origin = request.headers.get("origin") || "";
  return {
    "Access-Control-Allow-Origin": allowedOrigins.has(origin) ? origin : "https://ollllol7x2-glitch.github.io",
    "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
    "Access-Control-Allow-Methods": "POST, OPTIONS",
    "Vary": "Origin",
  };
}

function json(request: Request, body: unknown, status = 200) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { ...corsHeaders(request), "Content-Type": "application/json; charset=utf-8" },
  });
}

function getMessages(value: unknown): IncomingMessage[] | null {
  if (!Array.isArray(value) || value.length === 0 || value.length > 12) return null;
  const messages = value
    .filter((message): message is IncomingMessage =>
      typeof message === "object" && message !== null &&
      (message.role === "user" || message.role === "assistant") &&
      typeof message.content === "string")
    .map((message) => ({ role: message.role, content: message.content.trim().slice(0, 700) }))
    .filter((message) => message.content.length > 0);
  return messages.length ? messages : null;
}

function getProvider(value: unknown): ChatProvider {
  return value === "gemini" || value === "openai" ? value : "groq";
}

function isRateLimited(request: Request) {
  const client = request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() || "anonymous";
  const now = Date.now();
  const timestamps = (recentRequests.get(client) || []).filter((time) => now - time < RATE_LIMIT_WINDOW_MS);
  if (timestamps.length >= RATE_LIMIT_MAX_REQUESTS) return true;
  timestamps.push(now);
  recentRequests.set(client, timestamps);
  return false;
}

async function requestGroq(messages: IncomingMessage[]) {
  const apiKey = Deno.env.get("GROQ_API_KEY");
  if (!apiKey) throw new Error("GROQ_API_KEY_MISSING");
  const response = await fetch("https://api.groq.com/openai/v1/chat/completions", {
    method: "POST",
    headers: { Authorization: `Bearer ${apiKey}`, "Content-Type": "application/json" },
    body: JSON.stringify({
      model: Deno.env.get("GROQ_CHAT_MODEL") || "llama-3.1-8b-instant",
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
  const apiKey = Deno.env.get("OPENAI_API_KEY");
  if (!apiKey) throw new Error("OPENAI_API_KEY_MISSING");
  const response = await fetch("https://api.openai.com/v1/chat/completions", {
    method: "POST",
    headers: { Authorization: `Bearer ${apiKey}`, "Content-Type": "application/json" },
    body: JSON.stringify({
      model: Deno.env.get("OPENAI_CHAT_MODEL") || "gpt-4.1-mini",
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
  const apiKey = Deno.env.get("GEMINI_API_KEY");
  if (!apiKey) throw new Error("GEMINI_API_KEY_MISSING");
  const model = Deno.env.get("GEMINI_CHAT_MODEL") || "gemini-2.5-flash";
  const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent`, {
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
  });
  const data = await response.json().catch(() => null);
  if (!response.ok) throw new Error(`UPSTREAM_${response.status}`);
  const parts = data?.candidates?.[0]?.content?.parts;
  return Array.isArray(parts) ? parts.map((part: { text?: string }) => part?.text).filter(Boolean).join("\n") : null;
}

Deno.serve(async (request: Request) => {
  if (request.method === "OPTIONS") return new Response("ok", { headers: corsHeaders(request) });
  if (request.method !== "POST") return json(request, { error: "허용되지 않은 요청입니다." }, 405);
  if (!allowedOrigins.has(request.headers.get("origin") || "")) {
    return json(request, { error: "허용되지 않은 요청입니다." }, 403);
  }
  if (Number(request.headers.get("content-length") || 0) > 20_000) {
    return json(request, { error: "요청이 너무 큽니다." }, 413);
  }
  if (isRateLimited(request)) {
    return json(request, { error: "짧은 시간에 요청이 많습니다. 10분 뒤 다시 시도해 주세요." }, 429);
  }

  let body: { provider?: unknown; messages?: unknown };
  try {
    body = await request.json();
  } catch {
    return json(request, { error: "요청 형식이 올바르지 않습니다." }, 400);
  }

  const messages = getMessages(body?.messages);
  if (!messages || messages.at(-1)?.role !== "user") {
    return json(request, { error: "질문을 다시 입력해 주세요." }, 400);
  }

  const provider = getProvider(body?.provider);
  try {
    const reply = provider === "gemini"
      ? await requestGemini(messages)
      : provider === "openai"
        ? await requestOpenAI(messages)
        : await requestGroq(messages);
    if (!reply) return json(request, { error: "답변을 만들지 못했습니다. 잠시 후 다시 시도해 주세요." }, 502);
    return json(request, { reply, provider, providerLabel: providerLabels[provider] });
  } catch (error) {
    const code = error instanceof Error ? error.message : "UNKNOWN";
    if (code.endsWith("_MISSING")) {
      return json(request, { error: `${providerLabels[provider]} API 키가 아직 설정되지 않았습니다.` }, 503);
    }
    if (code === "UPSTREAM_429") {
      return json(request, { error: "요청이 많습니다. 잠시 후 다시 시도해 주세요." }, 429);
    }
    return json(request, { error: "AI 상담 연결에 실패했습니다. 잠시 후 다시 시도해 주세요." }, 502);
  }
});
