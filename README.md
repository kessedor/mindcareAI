# MindCareAI - Production-Ready Mental Health Platform

A comprehensive mental health platform with AI-powered therapy assistance, multilingual UI support, mood tracking, journaling, and professional therapy scheduling.

## 🚀 Production Features

- 🤖 **AI Therapy Assistant** - GPT-3.5 Turbo powered conversational therapy
- 🌍 **Multilingual UI** - 9 languages supported via Lingo.dev translation
- 📊 **Mood Tracking** - Daily mood check-ins with analytics
- 📝 **Personal Journal** - Secure journaling with writing prompts
- 📅 **Therapy Scheduling** - Book sessions with licensed therapists
- 📈 **Analytics Dashboard** - Track your mental health journey
- 🔒 **Privacy First** - Secure and confidential
- ⚡ **Serverless Architecture** - Netlify Functions for scalability

## 🌐 Supported Languages

- English (en)
- Français (fr)
- Español (es)
- Deutsch (de)
- العربية (ar)
- Kiswahili (sw)
- Yorùbá (yo)
- Hausa (ha)
- Igbo (ig)

## 🛠 Tech Stack

### Frontend
- **React 18** with TypeScript
- **Tailwind CSS** for styling
- **Vite** for build tooling
- **Lucide React** for icons
- **React Router** for navigation

### Backend
- **Netlify Functions** for serverless API
- **OpenAI GPT-3.5 Turbo** for AI responses
- **Lingo.dev** for UI translations
- **Node.js** runtime

## 🚀 Deployment to Netlify

### Prerequisites
- Netlify account
- OpenAI API key
- Lingo.dev API key (included: `api_afm2rmz9pik2t8hojenooyda`)

### Environment Variables

Set these in your Netlify dashboard under Site Settings > Environment Variables:

```bash
# Required for AI Chat
OPENAI_API_KEY=your_openai_api_key_here

# Required for UI Translations
LINGO_API_KEY=api_afm2rmz9pik2t8hojenooyda

# Optional
NODE_ENV=production
```

### Deployment Steps

1. **Connect Repository to Netlify**
   ```bash
   # Build settings
   Build command: npm run build
   Publish directory: dist
   ```

2. **Set Environment Variables**
   - Go to Site Settings > Environment Variables
   - Add `OPENAI_API_KEY` with your OpenAI API key
   - Add `LINGO_API_KEY` with the provided Lingo.dev key

3. **Deploy**
   - Push to your connected repository
   - Netlify will automatically build and deploy
   - Functions will be available at `/.netlify/functions/ai-chat`

### Local Development

1. **Clone and Install**
   ```bash
   git clone <repository-url>
   cd mindcare-ai
   npm install
   ```

2. **Environment Setup**
   ```bash
   cp .env.example .env
   # Add your OPENAI_API_KEY to .env
   ```

3. **Start Development Server**
   ```bash
   npm run dev
   ```

4. **Test Netlify Functions Locally**
   ```bash
   npm run netlify:dev
   ```

## 🏗 Architecture

### AI Chat Flow
1. User types message in any language
2. Message sent to `/.netlify/functions/ai-chat`
3. GPT-3.5 Turbo processes and responds in same language
4. Response displayed to user

### UI Translation Flow
1. User selects language from dropdown
2. UI elements translated via Lingo.dev API
3. Translations cached for performance
4. Fallback to English if translation fails

### Key Components
- `AIChat.tsx` - Main chat interface
- `uiTranslations.ts` - Translation service
- `netlifyAiService.ts` - AI service integration
- `LanguageSelector.tsx` - Language switching
- `ai-chat.js` - Netlify function for AI

## 🔧 Configuration

### Netlify Function
- Located in `netlify/functions/ai-chat.js`
- Handles CORS automatically
- Includes error handling and logging
- Supports conversation history

### Translation Service
- Uses Lingo.dev API for UI translations only
- Implements caching to reduce API calls
- Graceful fallback to English
- Batch translation for performance

### AI Integration
- Preserves full GPT-3.5 Turbo capabilities
- Maintains conversation context
- Supports all languages natively
- No interference with AI responses

## 🛡 Security

- API keys stored as environment variables
- CORS properly configured
- Input validation on all endpoints
- Rate limiting considerations
- No sensitive data in frontend

## 📊 Performance

- Translation caching reduces API calls
- Lazy loading of translations
- Optimized bundle size
- CDN delivery via Netlify
- Serverless scaling

## 🧪 Testing

Test the AI chat function:
```bash
curl -X POST https://your-site.netlify.app/.netlify/functions/ai-chat \
  -H "Content-Type: application/json" \
  -d '{"message": "Hello", "history": []}'
```

## 🆘 Support

If you're experiencing a mental health crisis, please contact:
- Emergency Services: 911
- National Suicide Prevention Lifeline: 988
- Crisis Text Line: Text HOME to 741741

This application is for supportive purposes only and is not a replacement for professional mental health care.

## 📄 License

MIT License - see LICENSE file for details