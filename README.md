# Brutal Notes AI

Brutal Notes is a task management and scheduling application built with React, TypeScript, and Tailwind CSS. It embraces the Neo-Brutalism design aesthetic—characterized by bold borders, high contrast, and raw functionality—while leveraging the Google Gemini API to provide intelligent features.

# 🚀 Key Features
🎨 Neo-Brutalist UI: A vivid, high-contrast interface with interactive animations, messy rotations, and a "blueprint" grid background.

🧠 AI-Powered Input: Uses Google Gemini to parse natural language. Type "Meeting with Fa next Monday at 2pm" and it automatically extracts the date, creates tags, and schedules the event.

💬 Contextual Updates: The AI understands your existing notes. You can type "Reschedule the meeting with Fa to 4pm" and it will update the existing entry instead of creating a duplicate.

🔥 Productivity Roasts: Includes an "Analysis" dashboard where the AI judges your completion rates and offers a personality profile or "roast" based on your tasks.

🌓 Dark Mode: Fully supported high-contrast dark theme.

📷 Media Support: Upload and attach images to your notes.

🔔 Smart Notifications: Browser-native notifications trigger for scheduled events.

💾 Local First: All data is persisted instantly to LocalStorage.

# 🛠️ Tech Stack
Frontend: React 19, TypeScript, Vite

Styling: Tailwind CSS

AI: Google GenAI SDK (Gemini 2.5 Flash)

APIs: Web Notifications API, LocalStorage

# Run and deploy your AI Studio app

This contains everything you need to run your app locally.

View your app in AI Studio: https://ai.studio/apps/drive/1rRYWqccbX8k50I6dWqW713EQZOeKlSbF

## Run Locally

**Prerequisites:**  Node.js


1. Install dependencies:
   `npm install`
2. Set the `GEMINI_API_KEY` in [.env.local](.env.local) to your Gemini API key
3. Run the app:
   `npm run dev`

   
