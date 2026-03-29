/**
 * SnackTrack AI Worker
 * 
 * Deployment Instructions:
 * 1. Create a new Cloudflare Worker
 * 2. Paste this code into the `worker.js` file
 * 3. Add an AI binding to your worker's `wrangler.toml` file or Settings:
 *    [ai]
 *    binding = "AI"
 * 4. Deploy and copy your worker URL (e.g., https://snacktrack-ai.your-username.workers.dev)
 * 5. Paste that URL into the SnackTrack web app!
 */

export default {
  async fetch(request, env) {
    // 1. Handle CORS preflight requests
    if (request.method === "OPTIONS") {
      return new Response(null, {
        headers: {
          "Access-Control-Allow-Origin": "*",
          "Access-Control-Allow-Methods": "POST, OPTIONS",
          "Access-Control-Allow-Headers": "Content-Type",
          "Access-Control-Max-Age": "86400",
        },
      });
    }

    // 2. Only allow POST requests
    if (request.method !== "POST") {
      return new Response("Method not allowed", { status: 405 });
    }

    try {
      const { text } = await request.json();

      if (!text) {
        return new Response(JSON.stringify({ error: "Missing 'text' in request body" }), { 
          status: 400,
          headers: { "Access-Control-Allow-Origin": "*" }
        });
      }

      // 3. Define the AI prompt
      const systemPrompt = `You are an expert nutritionist AI. Read the provided text extracted from a diet or nutrition PDF.
Extract the daily nutritional targets and create a brief, encouraging summary.
You MUST output ONLY valid JSON in the exact format:
{
  "daily_calories": number,
  "protein_g": number,
  "carbs_g": number,
  "fat_g": number,
  "ai_summary": "A 2-3 sentence summary of the nutritional guidance."
}
If a specific macro is not mentioned, provide a standard estimated default based on the calories using these ratios:
- Protein: 30% of calories (1g protein = 4 kcal)
- Carbs: 40% of calories (1g carbs = 4 kcal)
- Fat: 30% of calories (1g fat = 9 kcal)`;

      // 4. Call Cloudflare AI
      const response = await env.AI.run('@cf/meta/llama-3-8b-instruct', {
          messages: [
              { role: 'system', content: systemPrompt },
              { role: 'user', content: text.substring(0, 4000) } // Prevent token overflow
          ]
      });

      // 5. Return the JSON response with CORS headers
      return new Response(JSON.stringify(response), {
        headers: {
          "Content-Type": "application/json",
          "Access-Control-Allow-Origin": "*"
        }
      });

    } catch (error) {
      return new Response(JSON.stringify({ error: error.message }), { 
        status: 500,
        headers: {
          "Content-Type": "application/json",
          "Access-Control-Allow-Origin": "*"
        }
      });
    }
  }
};
