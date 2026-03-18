export interface Env {
  // Add KV, D1, R2 bindings here later
}

const CORS_HEADERS = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type",
};

function json(data: unknown, status = 200) {
  return new Response(JSON.stringify(data), {
    status,
    headers: { "Content-Type": "application/json", ...CORS_HEADERS },
  });
}

async function handlePrompt(req: Request, env: Env): Promise<Response> {
  const url = new URL(req.url);
  const userId = url.searchParams.get("userId") ?? "anonymous";

  // TODO: pull from KV/D1 per-user or per-region
  const npcPrompts = [
    "Welcome back. 60 seconds. Focus.",
    "One ritual. One shield. Begin.",
    "Your streak is alive. Don't break it.",
    "Breathe. Then move.",
    "The dojo is open. Step in.",
  ];

  const npcText = npcPrompts[Math.floor(Math.random() * npcPrompts.length)];

  return json({
    npcText,
    sessionId: crypto.randomUUID(),
    lowInternetMode: false,
  });
}

async function handleLog(req: Request, env: Env): Promise<Response> {
  try {
    const body: any = await req.json();
    const events = body.events ?? [body];

    for (const evt of events) {
      console.log("nexora-log", JSON.stringify(evt));
      // TODO: write to D1 or KV
    }

    return json({ ok: true, logged: events.length });
  } catch {
    return json({ ok: false, error: "invalid json" }, 400);
  }
}

async function handleStats(req: Request, env: Env): Promise<Response> {
  const url = new URL(req.url);
  const userId = url.searchParams.get("userId") ?? "anonymous";

  // TODO: compute real stats from D1/KV
  return json({
    shieldDelta: Math.floor(Math.random() * 10) + 1,
    streak: 1,
    belt: "White",
  });
}

export default {
  async fetch(request: Request, env: Env, ctx: ExecutionContext): Promise<Response> {
    if (request.method === "OPTIONS") {
      return new Response(null, { headers: CORS_HEADERS });
    }

    const url = new URL(request.url);
    const path = url.pathname;

    if (request.method === "GET" && path === "/api/prompt") {
      return handlePrompt(request, env);
    }
    if (request.method === "POST" && path === "/api/nexora/log") {
      return handleLog(request, env);
    }
    if (request.method === "GET" && path === "/api/nexora/stats") {
      return handleStats(request, env);
    }

    return json({ error: "not found" }, 404);
  },
};
