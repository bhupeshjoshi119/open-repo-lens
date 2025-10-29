# TechHub - GitHub Repository Finder

> Discover, analyze, and compare open-source projects with AI-powered insights


[![License](https://img.shields.io/badge/license-BSD%203--Clause-blue.svg)](LICENSE)

## 🚀 Features

- **Smart Search**: Find GitHub repositories with natural language queries
- **AI-Enhanced Search**: Leverage AI to improve search results and relevance
- **Advanced Filtering**: Filter by programming language, star count, and more
- **Repository Analysis**: Get AI-powered insights on repository quality and activity
- **Bookmark Management**: Save your favorite repositories for quick access
- **Repository Comparison**: Compare up to 5 repositories side by side
- **Search History**: Track your previous searches
- **Responsive Design**: Beautiful UI that works on all devices

## 🛠️ Technology Stack

- **Frontend**: React 18, TypeScript, Vite
- **Styling**: Tailwind CSS, shadcn/ui components
- **Backend**: Supabase (Edge Functions, Database)
- **AI Integration**: Google Gemini 2.5 Flash via Lovable AI Gateway
- **API**: GitHub REST API
- **State Management**: TanStack Query (React Query)

## 📋 Prerequisites

- Node.js 18+ and npm
- A Supabase account (or Lovable Cloud)
- GitHub account (no API key needed - uses public API)

## 🔧 Installation

1. **Clone the repository**
   ```bash
   git clone <your-repository-url>
   cd <project-name>
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Set up environment variables**
   
   Create a `.env` file in the root directory:
   ```env
   VITE_SUPABASE_URL=your_supabase_url
   VITE_SUPABASE_PUBLISHABLE_KEY=your_supabase_anon_key
   VITE_SUPABASE_PROJECT_ID=your_project_id
   ```

4. **Set up Supabase Edge Functions**
   
   Configure the `LOVABLE_API_KEY` secret in your Supabase project:
   - Go to your Supabase project settings
   - Navigate to Edge Functions → Secrets
   - Add `LOVABLE_API_KEY` with your Lovable AI API key

5. **Deploy Edge Functions** (if using your own Supabase)
   ```bash
   supabase functions deploy analyze-repository
   supabase functions deploy enhance-search
   ```

6. **Run the development server**
   ```bash
   npm run dev
   ```

   The app will be available at `http://localhost:8080`

## 📁 Project Structure

```
├── src/
│   ├── components/          # React components
│   │   ├── ui/             # shadcn/ui components
│   │   ├── SearchBar.tsx   # Main search interface
│   │   ├── RepositoryCard.tsx
│   │   └── ...
│   ├── hooks/              # Custom React hooks
│   │   ├── useAISearch.ts
│   │   ├── useRepositoryAnalysis.ts
│   │   └── ...
│   ├── pages/              # Page components
│   │   └── Index.tsx       # Main application page
│   ├── integrations/       # External service integrations
│   │   └── supabase/       # Supabase client (auto-generated)
│   └── lib/                # Utility functions
├── supabase/
│   └── functions/          # Supabase Edge Functions
│       ├── analyze-repository/
│       └── enhance-search/
└── public/                 # Static assets
```

## 🔐 Environment Variables

| Variable | Description | Required |
|----------|-------------|----------|
| `VITE_SUPABASE_URL` | Your Supabase project URL | Yes |
| `VITE_SUPABASE_PUBLISHABLE_KEY` | Supabase anonymous/public key | Yes |
| `VITE_SUPABASE_PROJECT_ID` | Supabase project ID | Yes |

**Note**: The `LOVABLE_API_KEY` is stored securely in Supabase Edge Function secrets and is NOT committed to the repository.

## 🎯 Usage

1. **Search Repositories**: Enter keywords in the search bar to find GitHub repositories
2. **Enable AI Search**: Toggle AI-enhanced search for smarter query interpretation
3. **Filter Results**: Use language and star filters to narrow down results
4. **Bookmark**: Click the bookmark icon to save repositories
5. **Analyze**: Click on any repository to view detailed AI-powered analysis
6. **Compare**: Select up to 5 repositories to compare them side by side

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## 📄 License

This project is open source and available under the [BSD 3-Clause License](LICENSE).

## 🏆 Hackathon Submission

This project was created for [Hackathon Name]. It demonstrates:
- Modern React development practices
- AI integration for enhanced user experience
- Clean, maintainable code architecture
- Responsive and accessible UI design

## 🙏 Acknowledgments

- Built with [Lovable](https://lovable.dev)
- UI components from [shadcn/ui](https://ui.shadcn.com)
- AI powered by Google Gemini
- Data from [GitHub API](https://docs.github.com/en/rest)

## 📞 Support

For support, please open an issue in the GitHub repository.

---

**Note for Judges**: To run this project, you'll need to set up your own Supabase instance or Lovable Cloud connection with the required environment variables. The source code is fully available for review.
