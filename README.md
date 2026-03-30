# 🥗 [SnackTrack M3](https://theminescout.github.io/SnackTrack/)

SnackTrack M3 is a 100% free, hosted, mobile-first Single Page Application (SPA) designed to track daily nutritional intake. Built entirely in a single HTML file, it requires no backend database or subscriptions. It utilizes a "Bring Your Own Key" (BYOK) model for Cloudflare AI integration to parse nutritionist PDFs, chat with an AI dietitian, and log meals using the OpenFoodFacts API.

> [!TIP]
> **🚀 Use it now:** You can access the app immediately at **[https://theminescout.github.io/SnackTrack/](https://theminescout.github.io/SnackTrack/)**. It's free, hosted for you, and requires no downloads or installation!

## ✨ Features

### 📊 Dashboard & Social
- **Calorie Speedometer:** A dynamic visual gauge that changes color (Green → Orange → Red) based on your daily consumption.
- **Macro Tracking:** Individual progress bars for Protein, Carbohydrates, and Fats.
- **Daily Timeline:** View, review, edit, and delete items from your daily food log.
- **History Navigator:** Seamlessly switch between past history dates and today.
- **Share Daily Recap:** Instantly generate a summary of your day's success and share it via your phone's native Share Sheet (text, tweet, etc.) for accountability!
- **Smart Reminders:** Local browser push notifications at 8 PM remind you to log your food!

### 🔍 Food Logging
- **AI-Enhanced Search:** Type natural language queries (e.g., "3 homemade tacos and a small bag of chips") and the AI will automatically separate them, fix typos, and generate distinct logging buttons for each item!
- **Photo Analysis (Beta):** Snap a picture of your food using your device's camera, and the AI Vision model will identify the meal and estimate the macros.
- **Barcode Scanner:** Built-in camera integration to scan food packaging directly from your phone.
- **Standard Text Search:** Search the global OpenFoodFacts database for quick, exact-match logging.
- **Dynamic Serving Sizes & Editing:** Calculate macros based on 100g, standard servings, or custom gram amounts. Instantly edit existing logs without recreating them.

### 🤖 AI Dietitian & Smart Cloud Sync
- **Ask AI Interface:** A dedicated chat tab where you can ask nutritional questions. The AI is aware of your timezone, your recent food logs, and can format beautiful Markdown tables for meal plans!
- **Bulletproof Cross-Device Sync:** Set up a Cloudflare KV namespace and use a "Sync ID" to intelligently merge your data across your laptop and phone. Uses a "tombstone" system so deleted items stay deleted across all devices without accidental data loss.
- **Dynamic AI Context:** Build custom Data Fields (e.g., "Sport: Soccer", "Goal: Build Muscle") that physically ground the AI's math and advice.
- **PDF Upload:** Upload a meal plan or PDF from your nutritionist to work alongside your custom context.

### 🎨 Material Design 3 (M3)
- Beautiful, modern UI using Material Design 3 color tokens, elevation shadows, and micro-animations.
- Auto-switching Dark Mode support aligned with your system preferences.
- Mobile-first design that elegantly scales up to a desktop side-navigation rail layout.
- Bottom navigation bar for easy, one-handed mobile use.

## 🛠️ Architecture & Tech Stack
- **Architecture:** Edge-Routed SPA (index.html + worker.js)
- **Storage:** Local localStorage + secure Cloud Sync via Cloudflare KV.
- **Styling:** Vanilla CSS with M3 variables.
- **External APIs & Libraries:**
  - Cloudflare Workers AI (@cf/meta/llama-3-8b-instruct & @cf/meta/llama-3.2-11b-vision-instruct)
  - Cloudflare KV Node
  - OpenFoodFacts API (Product search & barcodes)
  - Web Share API (navigator.share) & Notification API
  - PDF.js (Local PDF parsing)
  - HTML5-QRCode (Camera scanner)
  - Marked.js (Markdown & table rendering)

## 🚀 Setup & Installation
Because SnackTrack M3 is a single file, there is no build step or server setup required.

### 1. Get the App
The easiest way to use SnackTrack is to visit the hosted version:
**[https://theminescout.github.io/SnackTrack/](https://theminescout.github.io/SnackTrack/)**

Alternatively, you can download the `index.html` file from this repository and open it in any modern web browser.

### 2. Configure Cloudflare Worker (AI + KV Sync)
To unlock cross-device syncing and smart AI goals:
1. Sign up or log in at Cloudflare.
2. Go to Workers & Pages > Overview and create a new Worker.
3. Replace the default worker code with the contents of `worker.js` (included in this repository).
4. Go to Workers & Pages > KV and create a new Namespace (e.g. SnackTrackSync).
5. Go back to your worker's Settings > Variables & Secrets and add TWO bindings:
   - AI: Variable Name = AI, Service = Workers AI
   - KV: Variable Name = SNACKTRACK_KV, Namespace = your new KV namespace.
6. Deploy the worker and copy its URL (e.g., `https://snacktrack.your-username.workers.dev`).
7. Open SnackTrack M3, open Settings (the gear icon), paste this Worker URL, and invent a Unique Sync Profile ID (e.g. "MySecretKey123"). Do this on all your devices to link them together!

### 3. Install as a PWA (Mobile)
For the best experience, install it as an app on your phone:
- **iOS (Safari):** Tap the Share button, then select "Add to Home Screen".
- **Android (Chrome):** Tap the three-dot menu, then select "Add to Home screen".
The app will now launch in full-screen mode like a native application!

## 🔒 Privacy & Data
SnackTrack M3 is inherently privacy-preserving.
- **No Central Database:** There is no corporate database. All food logs, custom goals, and the worker URL are stored locally in your browser's localStorage.
- **API Calls:** The only data that leaves your device are search queries to OpenFoodFacts and the parsed text/images sent securely to your own personal Cloudflare Worker.

**Disclaimer:** SnackTrack is a tool for logging and estimating nutritional intake. AI estimates are generated for convenience and should not replace professional medical advice.

## 📝 License
This project is open-source and free to modify for personal use.
