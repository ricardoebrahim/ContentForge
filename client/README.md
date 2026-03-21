# ContentForge

AI-powered content generation tool. Input a topic — get a summary, social media post, and SEO description in seconds.

🔗 **Live Demo:** https://contentforge-ash.netlify.app

## Features

- AI content generation powered by Google Gemini
- Three outputs: Summary, Social Post, SEO Description
- User authentication with JWT
- Generation history with sidebar
- Dark premium UI with animations

## Tech Stack

- **Frontend:** React.js, Vite, Tailwind CSS
- **Backend:** Node.js, Express.js
- **Database:** MongoDB, Mongoose
- **AI:** Google Gemini API
- **Auth:** JWT
- **Deployment:** Netlify (frontend) + Railway (backend)

## Getting Started

Clone the repo and install dependencies:

```bash
git clone https://github.com/ricardoebrahim/contentforge.git
cd server && npm install
cd ../client && npm install
Create server/.env:
PORT=5000
MONGO_URI=your_mongodb_uri
GEMINI_API_KEY=your_gemini_key
JWT_SECRET=your_jwt_secret
Run development servers:
cd server && npm run dev
cd client && npm run dev
Author
Ash Ibrahim — Full Stack Developer & AI Automation Engineer
LinkedIn | GitHub