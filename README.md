# 🥗 SnackTrack M3

SnackTrack M3 is a 100% free, self-hosted, mobile-first Single Page Application (SPA) designed to track daily nutritional intake. Built entirely in a single HTML file, it requires no backend database or subscriptions. It utilizes a "Bring Your Own Key" (BYOK) model for Cloudflare AI integration to parse nutritionist PDFs and the OpenFoodFacts API for logging meals.

## ✨ Features

### 📊 Dashboard (Garmin-Style)
* **Calorie Speedometer:** A dynamic visual gauge that changes color (Green → Orange → Red) based on your daily consumption.
* **Macro Tracking:** Individual progress bars for Protein, Carbohydrates, and Fats.
* **Daily Timeline:** View, review, and delete items from your daily food log.

### 🔍 Food Logging
* **Barcode Scanner:** Built-in camera integration to scan food packaging directly from your phone.
* **Text Search:** Search the OpenFoodFacts database (600k+ products) for quick logging.
* **Dynamic Serving Sizes:** Calculate macros based on 100g, standard servings, or custom gram amounts.

### 🤖 AI-Powered Goal Setting
* **PDF Upload:** Upload a meal plan or PDF from your nutritionist.
* **Cloudflare Workers AI:** Uses `llama-3.1-8b-instruct` to automatically extract your daily calorie and macro targets from the document.
* **Encouraging Summaries:** Generates a brief, AI-driven summary of your nutritional guidelines.
* **Manual Override:** Easily edit your goals manually if you prefer.

### 🎨 Material Design 3 (M3)
* Beautiful, modern UI using Material Design 3 color tokens and elevation shadows.
* Mobile-first design with a responsive desktop grid layout.
* Bottom navigation bar for easy, one-handed mobile use.

---

## 🛠️ Architecture & Tech Stack

* **Architecture:** 100% Client-Side. Everything runs in your browser.
* **Storage:** `localStorage`. Your data never leaves your device unless you clear your browser data.
* **Styling:** Vanilla CSS with M3 variables.
* **External APIs & Libraries:**
  * [Cloudflare Workers AI](https://developers.cloudflare.com/workers-ai/) (Llama 3.1)
  * [OpenFoodFacts API](https://world.openfoodfacts.org/data) (Product search & barcodes)
  * [PDF.js](https://mozilla.github.io/pdf.js/) (Local PDF parsing)
  * [HTML5-QRCode](https://github.com/mebjas/html5-qrcode) (Camera scanner)
  * Google Material Icons & Roboto Font

---

## 🚀 Setup & Installation

Because SnackTrack M3 is a single file, there is no build step or server setup required. 

### 1. Get the App
Simply download the `snacktrack-m3.html` file and open it in any modern web browser.

### 2. Configure Cloudflare API (Optional, for AI PDF parsing)
To use the AI goal-extraction features, you need a free Cloudflare account:
1. Sign up or log in at [Cloudflare](https://dash.cloudflare.com/).
2. Locate your **Account ID** in your dashboard URL or side panel.
3. Go to **My Profile > API Tokens**.
4. Create a new token with **Workers AI** read/write permissions.
5. Open SnackTrack M3 and enter your Account ID and API Token on the welcome screen.

### 3. Install as a PWA (Mobile)
For the best experience, install it as an app on your phone:
* **iOS (Safari):** Tap the Share button, then select "Add to Home Screen".
* **Android (Chrome):** Tap the three-dot menu, then select "Add to Home screen".
The app will now launch in full-screen mode like a native application!

---

## 🔒 Privacy & Data

SnackTrack M3 is inherently privacy-preserving. 
* **No Database:** There is no central database. All food logs, custom goals, and API keys are stored locally in your browser's `localStorage`.
* **API Calls:** The only data that leaves your device are search queries to OpenFoodFacts and the parsed text of your uploaded PDFs sent directly to your own Cloudflare AI endpoint.

---

## 📝 License
This project is open-source and free to modify for personal use.
