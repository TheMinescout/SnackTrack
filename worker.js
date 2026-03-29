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
    const hasKV = !!env.SNACKTRACK_KV;
    const hasAI = !!env.AI;

    const hasKnownSyncShape = (data) => (
      !!data &&
      typeof data === "object" &&
      (
        Object.prototype.hasOwnProperty.call(data, "goals") ||
        Object.prototype.hasOwnProperty.call(data, "foodLogs") ||
        Object.prototype.hasOwnProperty.call(data, "contextFields") ||
        Object.prototype.hasOwnProperty.call(data, "documents") ||
        Object.prototype.hasOwnProperty.call(data, "chatHistory")
      )
    );

    const normalizeSyncPayload = (data) => ({
      lastUpdated: Number(data?.lastUpdated) || Date.now(),
      goals: (data?.goals && typeof data.goals === "object") ? data.goals : {},
      foodLogs: Array.isArray(data?.foodLogs) ? data.foodLogs : [],
      contextFields: Array.isArray(data?.contextFields) ? data.contextFields : [],
      documents: Array.isArray(data?.documents) ? data.documents : [],
      chatHistory: Array.isArray(data?.chatHistory) ? data.chatHistory : []
    });

    const safeKVGet = async (key) => {
      if (!hasKV) return null;
      try {
        const jsonValue = await env.SNACKTRACK_KV.get(key, { type: "json" });
        if (jsonValue && typeof jsonValue === "object") return jsonValue;
        const rawValue = await env.SNACKTRACK_KV.get(key);
        if (!rawValue) return null;
        return JSON.parse(rawValue);
      } catch {
        return null;
      }
    };

    const safeKVPut = async (key, value) => {
      if (!hasKV) return false;
      try {
        await env.SNACKTRACK_KV.put(key, JSON.stringify(value));
        return true;
      } catch {
        return false;
      }
    };

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
          const primaryData = await safeKVGet(profileId);
          if (hasKnownSyncShape(primaryData)) {
            return new Response(JSON.stringify(normalizeSyncPayload(primaryData)), { headers: corsHeaders });
          }

          const backupData = await safeKVGet(`${profileId}:backup`);
          if (hasKnownSyncShape(backupData)) {
            return new Response(JSON.stringify(normalizeSyncPayload(backupData)), { headers: corsHeaders });
          }

          return new Response(JSON.stringify(null), { headers: corsHeaders });
        }

        if (request.method === "POST") {
          let data;
          try {
            data = await request.json();
          } catch {
            return new Response(JSON.stringify({ error: "Invalid JSON body" }), { status: 400, headers: corsHeaders });
          }

          if (!hasKnownSyncShape(data)) {
            return new Response(JSON.stringify({ error: "Invalid sync payload shape" }), { status: 400, headers: corsHeaders });
          }

          const normalized = normalizeSyncPayload(data);
          const primarySaved = await safeKVPut(profileId, normalized);
          const backupSaved = await safeKVPut(`${profileId}:backup`, normalized);

          if (!primarySaved && !backupSaved) {
            return new Response(JSON.stringify({ success: false, fallback: "local_save_only" }), { status: 503, headers: corsHeaders });
          }

          return new Response(JSON.stringify({ success: true, backupSaved }), { headers: corsHeaders });
        }
      }

      // route: /summarize (POST)
      if (path === "/summarize" && request.method === "POST") {
        if (!hasAI) {
          return new Response(JSON.stringify({ error: "AI binding is not configured" }), { status: 503, headers: corsHeaders });
        }
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
        if (!hasAI) {
          return new Response(JSON.stringify({ error: "AI binding is not configured" }), { status: 503, headers: corsHeaders });
        }
        const { message, context, documents, historyLogs } = await request.json();
        
        let systemPrompt = "You are a friendly, expert nutritionist and health coach for the SnackTrack app. Answer the user's questions clearly and concisely. Format responses in Markdown.";
        systemPrompt += "\n\nIf the user specifies they ate or drank something, estimate the macronutrients and append the following EXACT format invisibly at the end of your message so the app can log it:\n";
        systemPrompt += `<log_action>{"food": "Name of food", "cals": 300, "protein": 15, "carbs": 30, "fat": 10}</log_action>`;
        systemPrompt += "\nOnly output the log_action tag if they explicitly state they consumed something.";
        
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

        if (historyLogs && historyLogs.length > 0) {
            userPrompt += "USER PAST 7 DAYS FOOD LOG RECENT HISTORY:\n";
            historyLogs.forEach(log => {
                userPrompt += `- ${log.date_string}: ${log.food_name} (${log.calories} cals)\n`;
            });
            userPrompt += "\n";
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

      // route: /recap (POST)
      if (path === "/recap" && request.method === "POST") {
        if (!hasAI) {
          return new Response(JSON.stringify({ error: "AI binding is not configured" }), { status: 503, headers: corsHeaders });
        }
        const { date, goals, logs } = await request.json();
        
        const systemPrompt = "You are an AI Dietitian for the SnackTrack app. The user is sharing their daily macros recap with their friends. Write a highly enthusiastic, incredibly short (max 2 sentences) custom message celebrating or analyzing their progress for the day based on their logs and goals. Include emojis.";
        
        const userPrompt = `
        Date: ${date}
        Goals: ${goals.daily_calories} kcal, ${goals.protein_g}g protein
        Total Eaten: ${logs.reduce((c,l)=>c+l.calories,0)} kcal, ${logs.reduce((p,l)=>p+l.protein_g,0)}g protein
        Notable foods: ${logs.map(l=>l.food_name).join(", ")}
        `;

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
        if (!hasAI) {
          return new Response(JSON.stringify({ error: "AI binding is not configured" }), { status: 503, headers: corsHeaders });
        }
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
