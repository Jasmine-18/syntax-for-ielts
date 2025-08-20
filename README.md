# Syntax for IELTS  

[![Website](https://img.shields.io/badge/Live-Demo-blue?style=flat&logo=vercel)](https://syntax-for-ielts.vercel.app/)  
An AI-powered IELTS Speaking test simulator that feels like the real exam — except you can practice anytime, anywhere.

👉 Try it now: [https://syntax-for-ielts.vercel.app/](https://syntax-for-ielts.vercel.app/)

---

## What’s Inside

- Full Speaking Test Flow — Part 1 (Intro), Part 2 (Cue Card), Part 3 (Discussion)  
- Voice Recording + Live Transcription — answers captured in real time with the Web Speech API  
- Animated Timers — practice under real exam pressure  
- AI Evaluation Report — powered by LangChain + Google Gemini  
  - Fluency & Coherence  
  - Lexical Resource  
  - Grammatical Range & Accuracy  
  - Pronunciation (text-inferred)  
- Band Score + Suggestions — actionable feedback to level up your IELTS performance  
- Retry Evaluation — regenerate your report if something goes wrong  

---

## Tech Stack

**Frontend**  
- React (Vite)  
- TailwindCSS  
- Web Speech API (Speech-to-Text)  

**Backend**  
- Node.js + Express  
- MongoDB  
- LangChain  
- Google Generative AI (Gemini)  

---

## Getting Started

### 1. Clone the repo
```bash
git clone https://github.com/your-username/syntax-for-ielts.git
cd syntax-for-ielts
```

### 2. Install dependencies
Frontend:
```bash
cd client
npm install
```

Backend:
```bash
cd server
npm install
```

### 3. Set environment variables
Create a `server/.env` file:
```env
PORT=3000
MONGODB_URI=your_mongodb_connection_string
GOOGLE_API_KEY=your_google_gemini_api_key
```

### 4. Run it locally
Backend:
```bash
cd server
npm start
```

Frontend:
```bash
cd client
npm run dev
```

Visit: [http://localhost:5173](http://localhost:5173)
