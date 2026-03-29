# 🥗 SnackTrack M3

SnackTrack M3 is a 100% free, self-hosted, mobile-first Single Page Application (SPA) designed to track daily nutritional intake. Built entirely in a single HTML file, it requires no backend database or subscriptions. It utilizes a "Bring Your Own Key" (BYOK) model for Cloudflare AI integration to parse nutritionist PDFs and the OpenFoodFacts API for logging meals.

## ✨ Features

### 📊 Dashboard & Social
* **Calorie Speedometer:** A dynamic visual gauge that changes color (Green → Orange → Red) based on your daily consumption.
* **Macro Tracking:** Individual progress bars for Protein, Carbohydrates, and Fats.
* **Daily Timeline:** View, review, edit, and delete items from your daily food log.
* **History Navigator:** Seamlessly switch between past history dates and today.
* **Share Daily Recap:** Instantly generate a summary of your day's success and share it via your phone's native Share Sheet (text, tweet, etc.) for accountability!
* **Smart Reminders:** Local browser push notifications at 8 PM remind you to log your food!

### 🔍 Food Logging
* **Barcode Scanner:** Built-in camera integration to scan food packaging directly from your phone.
* **Text Search:** Search the OpenFoodFacts database (600k+ products) for quick logging.
* **Dynamic Serving Sizes & Editing:** Calculate macros based on 100g, standard servings, or custom gram amounts. Instantly edit existing logs without recreating them.

### 🤖 AI-Powered Goal Setting & Cloud Sync
* **Cross-Device Sync:** Set up a Cloudflare KV namespace and use a "Sync ID" to automatically push/pull your data across your laptop and phone seamlessly!
* **Dynamic AI Context:** Build custom Data Fields (e.g. "Weight: 180lbs", "Goal: Fat Loss") that physically ground the AI's math.
* **PDF Upload:** Upload a meal plan or PDF from your nutritionist to work *alongside* your custom context.
* **Cloudflare Workers AI:** Uses `@cf/meta/llama-3-8b-instruct` on your personal Worker to extract and calculate your perfect daily calorie and macro targets.

### 🎨 Material Design 3 (M3)
* Beautiful, modern UI using Material Design 3 color tokens, elevation shadows, and micro-animations.
* Auto-switching **Dark Mode** support aligned with your system preferences.
* Mobile-first design that elegantly scales up to a desktop side-navigation rail layout.
* Bottom navigation bar for easy, one-handed mobile use.

---

## 🛠️ Architecture & Tech Stack

* **Architecture:** Edge-Routed SPA (`index.html` + `worker.js`)
* **Storage:** Local `localStorage` + secure Cloud Sync via Cloudflare KV.
* **Styling:** Vanilla CSS with M3 variables.
* **External APIs & Libraries:**
  * [Cloudflare Workers AI](https://developers.cloudflare.com/workers-ai/) (@cf/meta/llama-3-8b-instruct)
  * [Cloudflare KV Node](https://developers.cloudflare.com/kv/)
  * [OpenFoodFacts API](https://us.openfoodfacts.org/data) (Product search & barcodes)
  * Web Share API (`navigator.share`) & Notification API
  * [PDF.js](https://mozilla.github.io/pdf.js/) (Local PDF parsing)
  * [HTML5-QRCode](https://github.com/mebjas/html5-qrcode) (Camera scanner)

---

## 🚀 Setup & Installation

Because SnackTrack M3 is a single file, there is no build step or server setup required. 

### 1. Get the App
Simply download the `snacktrack-m3.html` file and open it in any modern web browser.

### 2. Configure Cloudflare Worker (AI + KV Sync)
To unlock cross-device syncing and smart AI goals:
1. Sign up or log in at [Cloudflare](https://dash.cloudflare.com/).
2. Go to **Workers & Pages > Overview** and create a new Worker.
3. Replace the default worker code with the contents of `worker.js` (included in this repository).
4. Go to **Workers & Pages > KV** and create a new Namespace (e.g. `SnackTrackSync`).
5. Go back to your worker's **Settings > Variables & Secrets** and add TWO bindings:
   * **AI**: Variable Name = `AI`, Service = `Workers AI`
   * **KV**: Variable Name = `SNACKTRACK_KV`, Namespace = your new KV namespace.
6. Deploy the worker and copy its URL (e.g., `https://snacktrack.your-username.workers.dev`).
7. Open SnackTrack M3, paste this Worker URL, and invent a **Unique Sync Profile ID** (e.g. "MySecretKey123"). Do this on all your devices to link them together!

### 3. Install as a PWA (Mobile)
For the best experience, install it as an app on your phone:
* **iOS (Safari):** Tap the Share button, then select "Add to Home Screen".
* **Android (Chrome):** Tap the three-dot menu, then select "Add to Home screen".
The app will now launch in full-screen mode like a native application!

---

## 🔒 Privacy & Data

SnackTrack M3 is inherently privacy-preserving. 
* **No Database:** There is no central database. All food logs, custom goals, and the worker URL are stored locally in your browser's `localStorage`.
* **API Calls:** The only data that leaves your device are search queries to OpenFoodFacts and the parsed text of your uploaded PDFs sent securely to your own personal Cloudflare Worker.

---

## 📝 License
This project is open-source and free to modify for personal use.
