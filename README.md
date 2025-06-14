# MindCareAI - Full-Stack Mental Health Platform

A comprehensive mental health platform with AI-powered therapy assistance, mood tracking, journaling, and professional therapy scheduling.

## Features

- 🤖 **AI Therapy Assistant** - GPT-3.5 powered conversational therapy
- 📊 **Mood Tracking** - Daily mood check-ins with analytics
- 📝 **Personal Journal** - Secure journaling with writing prompts
- 📅 **Therapy Scheduling** - Book sessions with licensed therapists
- 📈 **Analytics Dashboard** - Track your mental health journey
- 🔒 **Privacy First** - Secure and confidential

## Tech Stack

### Frontend
- **React 18** with TypeScript
- **Tailwind CSS** for styling
- **Vite** for build tooling
- **Lucide React** for icons
- **React Router** for navigation

### Backend
- **Netlify Functions** for serverless API
- **OpenAI GPT-3.5 Turbo** for AI responses
- **Node.js** runtime

## Getting Started

### Prerequisites
- Node.js 18+ 
- OpenAI API key

### Installation

1. Clone the repository
```bash
git clone <repository-url>
cd mindcare-ai
```

2. Install dependencies
```bash
npm install
```

3. Set up environment variables
```bash
cp .env.example .env
```

Add your OpenAI API key to the `.env` file:
```
OPENAI_API_KEY=your_openai_api_key_here
```

4. Start the development server
```bash
npm run dev
```

### Deployment

This project is configured for Netlify deployment:

1. Connect your repository to Netlify
2. Set the environment variable `OPENAI_API_KEY` in Netlify dashboard
3. Deploy!

The Netlify function will be available at `/.netlify/functions/ai-chat`

## AI Chat Integration

The AI chat uses a Netlify serverless function that:
- Accepts POST requests to `/.netlify/functions/ai-chat`
- Integrates with OpenAI GPT-3.5 Turbo
- Maintains conversation context
- Provides trauma-informed mental health support

### API Usage

```javascript
const response = await fetch("/.netlify/functions/ai-chat", {
  method: "POST",
  headers: { "Content-Type": "application/json" },
  body: JSON.stringify({
    message: "I'm feeling anxious today",
    history: [
      { role: "assistant", content: "Hello! How are you feeling?" },
      { role: "user", content: "I've been stressed about work" }
    ]
  })
});

const data = await response.json();
console.log(data.reply); // AI response
```

## Environment Variables

### Frontend (.env)
- `VITE_OPENAI_PUBLIC_KEY` - For direct OpenAI calls (development only)

### Netlify Functions
- `OPENAI_API_KEY` - Your OpenAI API key (set in Netlify dashboard)

## Project Structure

```
src/
├── components/          # Reusable UI components
├── pages/              # Page components
├── services/           # API services
├── utils/              # Utility functions
└── routes/             # Route configuration

netlify/
└── functions/          # Serverless functions
    └── ai-chat.js      # AI chat endpoint

backend/                # Legacy backend (not used in production)
```

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Submit a pull request

## License

MIT License - see LICENSE file for details

## Support

If you're experiencing a mental health crisis, please contact:
- Emergency Services: 911
- National Suicide Prevention Lifeline: 988
- Crisis Text Line: Text HOME to 741741

This application is for supportive purposes only and is not a replacement for professional mental health care.