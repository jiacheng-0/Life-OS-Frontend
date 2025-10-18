# 🧠 Life OS MVP — Personalized Voice Coach

A web app that speaks with you (via ElevenLabs voice), understands your life goals (GPT-4o), optimizes and syncs your calendar (Google Calendar API), and remembers context (Supabase memory).

## 🚀 Quick Start

### 1. Clone and Install

```bash
git clone <your-repo>
cd Life-OS-MVP
npm install
```

### 2. Environment Setup

Copy `.env.local.example` to `.env.local` and fill in your API keys:

```bash
cp .env.local.example .env.local
```

### 3. Database Setup

1. Create a new project at [Supabase](https://supabase.com/dashboard)
2. Go to SQL Editor and run the contents of `supabase-schema.sql`
3. Copy your Supabase URL and anon key to `.env.local`

### 4. API Keys Setup

#### OpenAI API Key
1. Go to [OpenAI Platform](https://platform.openai.com/api-keys)
2. Create a new API key
3. Add to `.env.local` as `OPENAI_API_KEY`

#### ElevenLabs API Key
1. Go to [ElevenLabs](https://elevenlabs.io/app/settings/api-keys)
2. Create a new API key
3. Add to `.env.local` as `ELEVENLABS_API_KEY`
4. Optionally, get a voice ID and add as `ELEVENLABS_VOICE_ID`

#### Google OAuth (for Authentication)
1. Go to [Google Cloud Console](https://console.developers.google.com/)
2. Create a new project or select existing
3. Enable Google+ API
4. Create OAuth 2.0 credentials
5. Add authorized redirect URI: `http://localhost:3000/api/auth/callback/google`
6. Copy Client ID and Secret to `.env.local`

#### Google Calendar API (for Calendar Integration)
1. In the same Google Cloud project, enable Calendar API
2. Create a Service Account
3. Download the JSON credentials
4. Add the entire JSON as a string to `.env.local` as `GOOGLE_APPLICATION_CREDENTIALS_JSON`
5. Share your Google Calendar with the service account email

#### NextAuth Secret
Generate a random secret:
```bash
openssl rand -base64 32
```
Add to `.env.local` as `NEXTAUTH_SECRET`

### 5. Run the Application

```bash
npm run dev
```

Visit `http://localhost:3000` and sign in with Google!

## 🏗️ Architecture

### Tech Stack
- **Frontend:** Next.js 15 (App Router), TypeScript, TailwindCSS, shadcn/ui
- **AI:** OpenAI GPT-4o for conversation and goal extraction
- **Voice:** ElevenLabs API for TTS + real-time voice chat, browser Speech Recognition for voice input
- **Calendar:** Google Calendar API with service account
- **Database:** Supabase with custom schema
- **Auth:** NextAuth.js with Google OAuth

### Key Features

1. **Conversational Interface**
   - Voice or text input
   - AI extracts goals, constraints, and key intents
   - Response delivered as synthesized ElevenLabs voice + text

2. **Calendar Sync**
   - AI generates 2-week time-block plans
   - Reads, creates, and modifies Google Calendar events
   - Real-time calendar updates

3. **Memory Layer**
   - Stores user context (goals, routines, preferences)
   - Each conversation updates memory context
   - Persistent personalization over sessions

4. **Dashboard UI**
   - Two-column layout: chat/voice on left, calendar on right
   - Responsive, minimalist design inspired by Motion.app

## 📁 Project Structure

```
life-os-mvp/
├─ app/
│  ├─ api/
│  │  ├─ auth/[...nextauth]/route.ts    # NextAuth configuration
│  │  ├─ chat/route.ts                  # GPT-4o conversation endpoint
│  │  ├─ voice/route.ts                 # ElevenLabs TTS endpoint
│  │  ├─ calendar/route.ts              # Google Calendar CRUD
│  │  └─ memory/route.ts                # Supabase context read/write
│  ├─ page.tsx                          # Main dashboard
│  ├─ layout.tsx                        # Global layout
│  └─ globals.css                       # Global styles
├─ components/
│  ├─ ui/                               # shadcn/ui components
│  ├─ ChatPanel.tsx                     # Chat interface
│  ├─ VoiceButton.tsx                   # Voice input/output controls
│  ├─ CalendarView.tsx                  # Calendar display
│  ├─ GoalSummary.tsx                   # Goals and preferences display
│  └─ SessionProvider.tsx               # NextAuth session provider
├─ lib/
│  ├─ openai.ts                         # OpenAI GPT-4o client
│  ├─ elevenlabs.ts                     # ElevenLabs TTS functions
│  ├─ gcal.ts                           # Google Calendar API client
│  ├─ supabaseClient.ts                 # Supabase client
│  └─ utils.ts                          # Common utilities
├─ supabase-schema.sql                  # Database schema
└─ .env.local.example                   # Environment variables template
```

## 🎯 Usage

1. **Sign in** with your Google account
2. **Start chatting** with your AI life coach via text or voice
3. **Set goals** by telling the AI what you want to achieve
4. **Schedule events** by asking the AI to help with your calendar
5. **Track progress** as the AI remembers your preferences and goals

### Example Conversations

- "Help me sleep earlier and see my kids more"
- "Schedule 2 hours of focused work every morning"
- "Move my dinner to 6 PM tomorrow"
- "What are my current goals?"

## 🔧 Development

### Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run start` - Start production server
- `npm run lint` - Run ESLint

### Environment Variables

See `.env.local.example` for all required environment variables and setup instructions.

## 🚀 Deployment

### Vercel (Recommended)

1. Push your code to GitHub
2. Connect your repository to Vercel
3. Add all environment variables in Vercel dashboard
4. Deploy!

### Other Platforms

The app can be deployed to any platform that supports Next.js:
- Netlify
- Railway
- DigitalOcean App Platform
- AWS Amplify

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

## 📄 License

This project is licensed under the MIT License.

## 🆘 Troubleshooting

### Common Issues

1. **Speech Recognition not working**: Ensure you're using HTTPS in production
2. **Calendar API errors**: Check that your service account has calendar access
3. **Authentication issues**: Verify Google OAuth redirect URIs match your domain
4. **Voice synthesis failing**: Check ElevenLabs API key and voice ID

### Getting Help

- Check the [Issues](https://github.com/your-repo/issues) page
- Review the setup instructions above
- Ensure all environment variables are correctly set

---

Built with ❤️ for better life organization and AI-powered productivity.