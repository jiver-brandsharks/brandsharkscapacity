// Cloudflare Pages Function: POST /api/ask
// Proxies the dashboard's copilot to the Claude API so the key never reaches the browser.
// Set ANTHROPIC_API_KEY (and optionally ANTHROPIC_MODEL) in the Pages project → Settings → Environment variables.
// Cloudflare Access in front of the site protects this route the same way it protects the page.

const SYSTEM = `You are the capacity copilot inside Brand Sharks' capacity dashboard, used by the founder before sales calls and by creative directors, editors, PPM and social media managers.

Answer in English, plainly and briefly. Lead with the answer, then the two or three numbers that support it. Use short paragraphs or a short list; no headings, no preamble, no emojis.

Rules:
- Use only the DATA block below. It is the live state of the dashboard. Never invent clients, people, dates or figures. If the data cannot answer the question, say so in one sentence and say where the answer would live.
- Units are tier-weighted: tier A video = 2, tier B = 1, tier C = 0.5. Utilization = assigned / capacity. Past 85% a new client starts pushing delivery dates; past 100% is over capacity.
- A hire must be opened by (saturation week − lead time). If that date is in the past, say the search is late and by how many weeks.
- When asked whether a client can be signed, check every department's headroom, name the bottleneck, and give a yes / tight / no verdict.
- Keep answers under 120 words unless the user asks for a briefing or a plan.`;

export async function onRequestPost({ request, env }) {
  if (!env.ANTHROPIC_API_KEY) {
    return json({ error: "not_configured", message: "ANTHROPIC_API_KEY is not set on this Pages project." }, 503);
  }
  let body;
  try { body = await request.json(); } catch { return json({ error: "bad_request" }, 400); }
  const messages = Array.isArray(body.messages) ? body.messages.slice(-12) : [];
  if (!messages.length) return json({ error: "bad_request" }, 400);

  const upstream = await fetch("https://api.anthropic.com/v1/messages", {
    method: "POST",
    headers: {
      "content-type": "application/json",
      "x-api-key": env.ANTHROPIC_API_KEY,
      "anthropic-version": "2023-06-01",
      "anthropic-beta": "server-side-fallback-2026-07-01"
    },
    body: JSON.stringify({
      model: env.ANTHROPIC_MODEL || "claude-opus-5",
      max_tokens: 1500,
      stream: true,
      fallbacks: "default",
      output_config: { effort: "medium" },
      system: [
        { type: "text", text: SYSTEM, cache_control: { type: "ephemeral" } },
        { type: "text", text: "DATA:\n" + JSON.stringify(body.context || {}) }
      ],
      messages
    })
  });

  if (!upstream.ok) {
    const detail = await upstream.text();
    return json({ error: "upstream", status: upstream.status, detail: detail.slice(0, 500) }, 502);
  }
  return new Response(upstream.body, {
    status: 200,
    headers: { "content-type": "text/event-stream", "cache-control": "no-cache", "x-accel-buffering": "no" }
  });
}

const json = (obj, status = 200) => new Response(JSON.stringify(obj), { status, headers: { "content-type": "application/json" } });
