export default {
	async fetch(req: Request, env: Env): Promise<Response> {
	  try {
		// 1) Handle CORS preflight first
		if (req.method === "OPTIONS") {
		  return new Response(null, { headers: cors().headers, status: 204 });
		}
  
		// 2) Only allow POST after preflight
		if (req.method !== "POST") {
		  return json({ error: "Method not allowed" }, 405, cors());
		}
  
		// 3) MVP shared-secret guard
		const hdrSecret = req.headers.get("x-dayzero-secret");
		if (!hdrSecret || hdrSecret !== env.DAYZERO_COACH_SECRET) {
		  return json({ error: "Unauthorized" }, 401, cors());
		}
  
		// 4) Safely parse & type the body
		interface CoachBody { prompt?: string }
		const body = (await req.json().catch(() => ({}))) as CoachBody;
		const prompt = (body.prompt ?? "").toString().trim();
  
		if (!prompt) {
		  return json({ error: "Invalid prompt" }, 400, cors());
		}
  
		// 5) Fast off-topic guard
		const OFF_TOPIC = /(^|\b)(crypto|stocks?|politics?|celebrity|gossip)\b/i;
		if (OFF_TOPIC.test(prompt)) {
		  return json({
			answer:
			  "I can only help with habits, goals, routines, and reflection. Try asking about your plan for today.",
		  }, 200, cors());
		}
  
		const system =
		  "You are Day Zero's tiny habit coach. Only answer about habits, goals, motivation, reflection, and routines. Refuse unrelated questions briefly and kindly. Keep answers under 150 words.";
  
		// 6) Call Anthropic Messages
		const resp = await fetch("https://api.anthropic.com/v1/messages", {
		  method: "POST",
		  headers: {
			"content-type": "application/json",
			"x-api-key": env.ANTHROPIC_API_KEY,
			"anthropic-version": "2023-06-01",
		  },
		  body: JSON.stringify({
			model: "claude-3-haiku-20240307", // fast + inexpensive
			max_tokens: 350,
			system,
			messages: [{ role: "user", content: prompt }],
		  }),
		});
  
		const data: any = await resp.json();
  
		if (!resp.ok) {
		  return json({ error: "Model error", detail: data }, 500, cors());
		}
  
		const text = (data?.content?.[0]?.text ?? "").trim();
		return json({ answer: clipTo150(text) }, 200, cors());
	  } catch (err: any) {
		return json({ error: "Server error", detail: String(err?.message ?? err) }, 500, cors());
	  }
	},
  };
  
  function clipTo150(s: string) {
	const words = s.trim().split(/\s+/);
	return words.length <= 150 ? s.trim() : words.slice(0, 150).join(" ") + "…";
  }
  
  function cors() {
	return {
	  headers: {
		"Access-Control-Allow-Origin": "*", // tighten later
		"Access-Control-Allow-Headers": "content-type,x-dayzero-secret",
		"Access-Control-Allow-Methods": "POST,OPTIONS",
	  },
	};
  }
  
  function json(
	obj: unknown,
	status = 200,
	init: { headers?: Record<string, string> } = {}
  ) {
	return new Response(JSON.stringify(obj), {
	  status,
	  headers: { "content-type": "application/json", ...(init.headers || {}) },
	});
  }
  
  interface Env {
	ANTHROPIC_API_KEY: string;
	DAYZERO_COACH_SECRET: string;
  }
  