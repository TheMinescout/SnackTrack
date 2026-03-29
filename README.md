🍏 SnackTrack M3

A 100% free, self-hosted, mobile-first Single Page Application (SPA) for daily nutrition tracking.

SnackTrack M3 is designed to look and feel like a premium fitness app (inspired by Garmin Connect) but operates entirely within a single HTML file. It uses your device's local storage to save your food logs and leverages Cloudflare's free Workers AI to read and summarize PDFs from your nutritionist.

No subscriptions, no servers, no ads. Just pure, fast, client-side tracking.

✨ Features

Garmin-Style Dashboard: Beautiful Material Design 3 (M3) "speedometer" gauges and progress bars to track Calories, Protein, Carbs, and Fats.

Smart Food Logging: * 🔍 Text Search: Search over 600,000+ products via the free OpenFoodFacts database.

📷 Barcode Scanner: Use your phone's camera to scan product barcodes instantly.

⚖️ Flexible Serving Sizes: Log by 100g, standard serving size, or custom gram amounts.

AI-Powered Nutritionist (BYOK): Upload a diet/nutrition PDF. The app extracts the text locally and securely sends it to Cloudflare's Llama 3.1 AI to automatically extract your daily macro goals and summarize the rules.

100% Client-Side: Everything is contained in one index.html file. Data is saved to your browser's localStorage.

PWA-Ready: Add the page to your iOS or Android home screen for a full-screen, native app experience.

🛠️ Tech Stack

Frontend: Vanilla HTML5, CSS3, and JavaScript (Zero build step required).

UI Design: Custom CSS utilizing the Material Design 3 color token system and elevation shadows. Google Material Icons.

PDF Parsing: pdf.js (Extracts text directly in the browser).

Barcode Scanning: html5-qrcode (Processes camera feed locally).

Food Database: OpenFoodFacts API (Free, open-source).

AI Engine: Cloudflare Workers AI (@cf/meta/llama-3.1-8b-instruct).

🚀 Getting Started

Because SnackTrack M3 uses a "Bring Your Own Key" (BYOK) model to remain 100% free, you will need to provide your own Cloudflare API credentials to enable the AI PDF Reading feature.

(Note: You can still use the app for manual food tracking without Cloudflare credentials, but the AI PDF upload feature will not work).

Step 1: Get Your Free Cloudflare Credentials

Create a free account at Cloudflare.

Once logged in, look at the URL in your browser. It will look like dash.cloudflare.com/YOUR_ACCOUNT_ID/... Copy that string of letters and numbers—this is your Account ID.

Go to My Profile (top right icon) -> API Tokens.

Click Create Token -> Create Custom Token.

Give it a name (e.g., "SnackTrack AI").

Under Permissions, choose: Account -> Workers AI -> Edit.

Click Continue to summary and then Create Token.

Copy the API Token immediately (it will only be shown once!).

Step 2: Run the App

Download the snacktrack-m3.html file (you can rename it to index.html if you are hosting it).

You can open the file directly in your web browser, or host it for free using GitHub Pages, Vercel, or Cloudflare Pages.

Upon opening the app, you will be greeted by the Login Screen.

Enter your Cloudflare Account ID and API Token.

Start tracking!

Step 3: Install on Your Phone (Recommended)

To get the native app feel:

iOS (Safari): Open the hosted website, tap the "Share" icon at the bottom, and select "Add to Home Screen".

Android (Chrome): Open the hosted website, tap the three-dot menu at the top right, and select "Add to Home screen".

🔒 Privacy & Data Storage

No External Databases: Your daily food logs, goals, and credentials are saved entirely in your browser's localStorage.

Complete Ownership: No developer or third party has access to your dietary data.

Clearing Data: If you clear your browser's cache or tap the "Settings" gear in the top right of the app to log out, your data will be permanently deleted.

🤝 Contributing

This is a single-file project meant to be simple, hackable, and free. Feel free to fork the repository, tweak the Material 3 colors in the :root CSS variables, or add new features!

📄 License

This project is open-source and available under the MIT License. You are free to copy, modify, and distribute it.
