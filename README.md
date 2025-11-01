# TechHub - Powered by Open Source

A powerful web application for discovering, analyzing, and exploring GitHub repositories, combined with cutting-edge on-device AI tools powered by Chrome's Gemini Nano.

## 🚀 What Does This Application Do?

TechHub is a comprehensive platform that combines two powerful features:

### 1. **GitHub Repository Search & Analysis**
- **Advanced Search**: Find GitHub repositories with intelligent AI-powered search enhancement
- **Smart Filters**: Filter by language, stars, forks, and custom criteria
- **Repository Analysis**: Deep dive into repository issues, code structure, and health metrics
- **Bookmarks**: Save interesting repositories for later review
- **Comparison**: Compare up to 5 repositories side-by-side
- **PDF Export**: Generate detailed analysis reports in PDF format
- **Search History**: Track your previous searches
- **Image Analysis**: Upload screenshots of GitHub issues for AI-powered analysis

### 2. **Chrome AI-Powered Text Processing Tools**
Revolutionary on-device AI tools that run completely in your browser using Chrome's Gemini Nano:

- **📝 Summarizer**: Convert long text into concise summaries
  - Multiple modes: TL;DR, Key Points, Teaser, Headline
  - Adjustable length: Short, Medium, Long
  - Output formats: Plain text, Markdown

- **✍️ Rewriter**: Rephrase and improve your text
  - Tone control: Formal, Neutral, Casual
  - Maintains original meaning while enhancing clarity

- **🎨 Content Writer**: Generate new content from prompts
  - AI-powered creative writing
  - Context-aware content generation
  - Multiple tone and format options

- **💬 AI Prompt**: General-purpose AI chat interface
  - Ask questions, get explanations
  - Analyze text, solve problems
  - On-device processing for privacy

## ✨ Key Features

### Repository Discovery
- **AI-Enhanced Search**: Automatically optimize search queries using AI
- **Rich Filters**: Language, star count, fork count, update date
- **Real-time Results**: Instant feedback from GitHub API
- **Responsive Design**: Works perfectly on mobile, tablet, and desktop

### AI Text Processing (Chrome Built-in AI)
- **100% On-Device**: All processing happens locally - no data sent to servers
- **Privacy-First**: Your text never leaves your device
- **Fast & Efficient**: Powered by Gemini Nano model
- **No API Keys Required**: Uses Chrome's built-in AI capabilities
- **Mobile-Friendly**: Optimized for touch interfaces

### Analysis & Insights
- **Issue Analysis**: AI-powered analysis of repository issues
- **Screenshot Analysis**: Upload issue screenshots for instant insights
- **Comprehensive Reports**: Generate detailed PDF reports
- **Visual Comparisons**: Side-by-side repository metrics

## 🛠️ Technologies Used

### Frontend
- **React 18** - Modern UI library
- **TypeScript** - Type-safe development
- **Vite** - Lightning-fast build tool
- **Tailwind CSS** - Utility-first CSS framework
- **shadcn/ui** - Beautiful, accessible components

### Backend & Services
- **Supabase** - Backend-as-a-Service (via Lovable Cloud)
- **Edge Functions** - Serverless API endpoints
- **GitHub API** - Repository data
- **Chrome AI APIs** - On-device AI processing

### AI Integration
- **Lovable AI Gateway** - Cloud AI for repository analysis
- **Chrome Gemini Nano** - On-device AI for text processing
  - Summarizer API
  - Rewriter API
  - Writer API
  - Prompt API (Language Model)

## 📋 Prerequisites

### For GitHub Repository Features
- Modern web browser (Chrome, Firefox, Safari, Edge)
- Internet connection for GitHub API

### For Chrome AI Tools (Optional)
- **Chrome Dev or Canary** (version 127+)
- Enable Chrome AI experimental flags (see setup below)

## 🚀 Getting Started

### Installation

```bash
# Clone the repository
git clone <YOUR_GIT_URL>

# Navigate to project directory
cd <YOUR_PROJECT_NAME>

# Install dependencies
npm install

# Start development server
npm run dev
```

The application will open at `http://localhost:5173`

## 🧪 Enabling Chrome AI Features

To use the AI Text Processing tools:

1. **Install Chrome Dev or Canary**
   - Download from [Chrome Dev](https://www.google.com/chrome/dev/) or [Chrome Canary](https://www.google.com/chrome/canary/)

2. **Enable AI Flags**
   - Navigate to `chrome://flags`
   - Search and enable these flags:
     - `Prompt API for Gemini Nano`
     - `Summarization API for Gemini Nano`
     - `Writer API for Gemini Nano`
     - `Rewriter API for Gemini Nano`

3. **Restart Chrome**
   - Restart the browser for changes to take effect

4. **Download AI Model** (First Use)
   - The first time you use AI features, Chrome will download Gemini Nano
   - This is a one-time download (~1-2GB)

## 📱 Usage

### Searching Repositories

1. **Navigate to Home Page** (`/`)
2. Enter search query (e.g., "react typescript", "user:facebook")
3. Toggle AI enhancement for smarter queries
4. Apply filters (language, stars, etc.)
5. Click on repositories to analyze them

### Analyzing Repositories

1. Click "Analyze" on any repository card
2. Ask custom questions about the repository
3. Run comprehensive issue analysis
4. Upload screenshots of issues for AI insights
5. Export analysis as PDF

### Using AI Text Tools

1. **Navigate to AI Tools** (`/ai-tools`)
2. Select a tool tab:
   - **Summarize**: Paste text, choose options, get summary
   - **Rewrite**: Enter text, select tone, get improved version
   - **Write**: Provide prompt, generate new content
   - **Prompt**: Ask AI anything
3. Copy results with one click

## 🎯 Use Cases

### For Developers
- Discover popular libraries and frameworks
- Analyze repository health before contributing
- Compare competing solutions
- Track trending projects

### For Content Creators
- Summarize long articles or documentation
- Rewrite content in different tones
- Generate blog post outlines
- Polish social media posts

### For Students & Researchers
- Find educational repositories
- Summarize research papers
- Generate study notes
- Analyze code repositories for learning

### For Business
- Evaluate open-source solutions
- Generate product descriptions
- Create executive summaries
- Research competitor projects

## 🔐 Privacy & Security

- **Repository Search**: Public GitHub API, no authentication required
- **Chrome AI Tools**: 
  - 100% on-device processing
  - No data sent to external servers
  - Text never leaves your browser
  - No API keys or accounts needed



### Custom Domain

To connect a custom domain:
1. Navigate to Project > Settings > Domains
2. Click Connect Domain
3. Follow the setup instructions

Read more: [Custom Domain Guide](https://docs.lovable.dev/features/custom-domain)

## 📊 Project Structure

```
src/
├── components/          # React components
│   ├── ui/             # shadcn/ui components
│   ├── Header.tsx      # Navigation header
│   ├── SearchBar.tsx   # Repository search
│   └── ...
├── pages/              # Route pages
│   ├── Index.tsx       # Home/Search page
│   ├── AITools.tsx     # AI text processing page
│   └── Auth.tsx        # Authentication
├── hooks/              # Custom React hooks
├── lib/                # Utilities and helpers
└── integrations/       # External service integrations
    └── supabase/       # Supabase client
```

## 🤝 Contributing

This project is built with [Lovable](https://lovable.dev), an AI-powered development platform.

### Development Workflow

1. Make changes via Lovable or your preferred IDE
2. Test locally with `npm run dev`
3. Push changes to GitHub
4. Changes auto-sync with Lovable

## 🐛 Troubleshooting

### Chrome AI Not Working
- Ensure you're using Chrome Dev/Canary 127+
- Verify all AI flags are enabled in `chrome://flags`
- Restart Chrome after enabling flags
- Wait for Gemini Nano model download on first use

### Repository Search Issues
- Check internet connection
- Verify GitHub API rate limits haven't been exceeded
- Try simpler search queries

### Build Errors
- Clear node_modules: `rm -rf node_modules && npm install`
- Clear build cache: `npm run build -- --force`
- Update dependencies: `npm update`

## 📚 Resources

- [Lovable Documentation](https://docs.lovable.dev)
- [GitHub API Docs](https://docs.github.com/en/rest)
- [Chrome AI Docs](https://developer.chrome.com/docs/ai/built-in)
- [Supabase Documentation](https://supabase.com/docs)
  
## 📚 Deployed:
[scanrepo](https://scanrepo.vercel.app/)
## 📄 License

Built with [Lovable](https://lovable.dev) - AI-powered development platform

---

**Built with ❤️ using Lovable, React, and Chrome AI**
