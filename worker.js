/**
 * SnackTrack AI & Sync Worker
 * 
 * Deployment Instructions:
 * 1. Create a new Cloudflare Worker
 * 2. Paste this code into the `worker.js` file
 * 3. Go to Settings > Variables & Secrets and add TWO bindings:
 *    a) AI Binding:
 *       Variable name: AI
 *       Service: Workers AI
 *    b) KV Namespace Binding:
 *       Variable name: SNACKTRACK_KV
 *       KV Namespace: Create a new one named something like "SnackTrackSync"
 * 4. Deploy and copy your worker URL (e.g., https://snacktrack.your-username.workers.dev)
 * 5. Paste that URL into the SnackTrack web app!
 */

export default {
  async fetch(request, env) {
    const url = new URL(request.url);
    const path = url.pathname;

    // 1. Handle CORS preflight requests
    if (request.method === "OPTIONS") {
      return new Response(null, {
        headers: {
          "Access-Control-Allow-Origin": "*",
          "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
          "Access-Control-Allow-Headers": "Content-Type",
          "Access-Control-Max-Age": "86400",
        },
      });
    }

    const corsHeaders = {
      "Access-Control-Allow-Origin": "*",
      "Content-Type": "application/json"
    };

    try {
      // route: /sync (GET, POST)
      if (path === "/sync" || path === "/sync/") {
        const profileId = url.searchParams.get("profileId");
        if (!profileId) {
          return new Response(JSON.stringify({ error: "Missing profileId" }), { status: 400, headers: corsHeaders });
        }

        if (request.method === "GET") {
          const data = await env.SNACKTRACK_KV.get(profileId, { type: "json" });
          return new Response(JSON.stringify(data || null), { headers: corsHeaders });
        }

        if (request.method === "POST") {
          const data = await request.json();
          await env.SNACKTRACK_KV.put(profileId, JSON.stringify(data));
          return new Response(JSON.stringify({ success: true }), { headers: corsHeaders });
        }
      }

      // route: /summarize (POST)
      if (path === "/summarize" && request.method === "POST") {
        const { text } = await request.json();
        if (!text) return new Response(JSON.stringify({ error: "No text provided" }), { status: 400, headers: corsHeaders });
        
        const response = await env.AI.run('@cf/meta/llama-3-8b-instruct', {
            messages: [
                { role: 'system', content: 'You are an AI assistant. Summarize the following nutritional document/blood test in exactly 3 concise bullet points. Focus only on actionable health metrics.' },
                { role: 'user', content: text.substring(0, 4000) }
            ]
        });
        return new Response(JSON.stringify(response), { headers: corsHeaders });
      }

      // route: /ask (POST)
      if (path === "/ask" && request.method === "POST") {
        const { message, context, documents } = await request.json();
        
        let systemPrompt = "You are a friendly, expert nutritionist and health coach for the SnackTrack app. Answer the user's questions clearly and concisely. Do NOT output JSON. Output normal markdown conversational text.";
        
        let userPrompt = "";
        if (context && context.length > 0) {
            userPrompt += "USER PHYSIOLOGICAL CONTEXT:\n";
            context.forEach(item => { userPrompt += `- ${item.key}: ${item.value}\n`; });
            userPrompt += "\n";
        }
        
        if (documents && documents.length > 0) {
            userPrompt += "UPLOADED USER DOCUMENTS:\n";
            documents.forEach((doc, idx) => {
                userPrompt += `Document ${idx + 1} (${doc.name}):\n${doc.text.substring(0, 2000)}\n\n`;
            });
        }
        
        userPrompt += "USER QUESTION: " + message;

        const response = await env.AI.run('@cf/meta/llama-3-8b-instruct', {
            messages: [
                { role: 'system', content: systemPrompt },
                { role: 'user', content: userPrompt }
            ]
        });

        return new Response(JSON.stringify(response), { headers: corsHeaders });
      }

      // route: /ai (POST)
      // Accept /ai and /
      if ((path === "/ai" || path === "/ai/" || path === "/") && request.method === "POST") {
        const { text, context } = await request.json();

        let systemPrompt = `You are an expert nutritionist AI. 
Extract the daily nutritional targets and create a brief, encouraging summary.
You MUST output ONLY valid JSON in the exact format below, with NO markdown wrappers or extra text:
{
  "daily_calories": 2000,
  "protein_g": 150,
  "carbs_g": 250,
  "fat_g": 65,
  "ai_summary": "A 2-3 sentence summary of the nutritional guidance."
}
If calculating from physical context, use standard metabolic formulas. Ensure the output begins with { and ends with }.`;

        let userPrompt = "";
        
        if (context && context.length > 0) {
            userPrompt += "USER PHYSIOLOGICAL CONTEXT AND GOALS:\n";
            context.forEach(item => {
                userPrompt += `- ${item.key}: ${item.value}\n`;
            });
            userPrompt += "\nBased heavily on the context above, calculate the ideal macronutrients and caloric intake if no direct numbers are provided.\n\n";
        }

        if (text) {
            userPrompt += "ADDITIONAL DOCTOR/NUTRITIONIST DOCUMENT TEXT:\n" + text.substring(0, 4000);
        }

        if (!userPrompt) {
            return new Response(JSON.stringify({ error: "No input provided" }), { status: 400, headers: corsHeaders });
        }

        const response = await env.AI.run('@cf/meta/llama-3-8b-instruct', {
            messages: [
                { role: 'system', content: systemPrompt },
                { role: 'user', content: userPrompt }
            ]
        });

        return new Response(JSON.stringify(response), { headers: corsHeaders });
      }

      return new Response(JSON.stringify({ error: "Not found or invalid method" }), { status: 404, headers: corsHeaders });

    } catch (error) {
      return new Response(JSON.stringify({ error: error.message }), { 
        status: 500,
        headers: corsHeaders
      });
    }
  }
};
