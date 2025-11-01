# TechHub - Enhanced Repository Analysis Platform

A powerful, AI-driven platform for discovering, analyzing, and understanding open-source repositories with advanced features including image analysis, predictive analytics, and comprehensive PDF reporting.

## 🚀 New Features

### 📝 AI Proofreading Studio ⭐ NEW & EXPERIMENTAL!
- **Advanced Grammar Checking**: Real-time AI-powered proofreading with Chrome's Proofreader API
- **Side-by-Side Comparison**: Original vs corrected text with color-coded highlighting
- **Detailed Metrics**: Readability score, grammar issues, and style improvements
- **Professional PDF Export**: Generate comprehensive proofreading reports with explanations
- **Privacy-First**: All processing happens locally in your browser
- **Issue Categorization**: Grammar, style, clarity, and word-choice suggestions
- **Learn as You Write**: Detailed explanations for every correction

### 🎨 Smooth Sidebar Navigation
- **Desktop**: Fixed sidebar with collapsible functionality
- **Mobile**: Responsive sheet-based sidebar with smooth animations
- **Quick Access**: Recent searches, bookmarks, and AI tools at your fingertips
- **Speed Optimized**: Fast navigation between different sections

### 🖼️ AI-Powered Image Analysis
- **TensorFlow.js Integration**: Client-side image processing for privacy
- **Object Detection**: Identify objects, people, and elements in images
- **Image Classification**: Categorize images by type and content
- **Technical Analysis**: Extract metadata, dimensions, and format information
- **Privacy First**: All processing happens in your browser

### 🔮 Predictive Analytics
- **Growth Prediction**: Forecast repository star growth and popularity trends
- **Issue Trends**: Predict future issue patterns and resolution rates
- **Contributor Activity**: Analyze and predict contributor engagement
- **Maintenance Health**: Assess long-term project sustainability
- **Interactive Charts**: Visualize predictions with responsive charts

### 📊 Enhanced PDF Reports with Infographics
- **Stunning Visuals**: Professional PDF reports with charts and infographics
- **Comprehensive Analysis**: Detailed repository health assessments
- **Executive Summary**: Key findings and recommendations
- **Technical Insights**: Deep dive into code quality and architecture
- **Predictive Insights**: Include forecasting data in reports

### 🔍 Enhanced Repository Analysis
- **GitHub API Integration**: Fetch comprehensive repository data
- **Issue Analysis**: Deep dive into issue patterns and resolution rates
- **Contributor Insights**: Analyze community engagement and diversity
- **Code Quality Metrics**: Language breakdown and technical debt assessment
- **Health Scoring**: Automated repository health scoring system

### 📱 Mobile-First Design
- **Responsive Layout**: Optimized for all screen sizes
- **Floating Action Button**: Quick access to AI features on mobile
- **Touch-Friendly**: Smooth gestures and interactions
- **Progressive Web App**: Install as a native app experience

## 🛠️ Technology Stack

### Frontend
- **React 18** with TypeScript
- **Vite** for fast development and building
- **Tailwind CSS** for styling
- **Radix UI** for accessible components
- **Framer Motion** for animations
- **React Query** for data fetching

### AI & Machine Learning
- **TensorFlow.js** for client-side image analysis
- **Custom ML Models** for predictive analytics
- **OpenAI Integration** for natural language processing

### Data Visualization
- **Recharts** for interactive charts
- **D3.js** for custom visualizations
- **Chart.js** for PDF report charts

### PDF Generation
- **jsPDF** for PDF creation
- **html2canvas** for capturing visual elements
- **Custom Infographic Engine** for stunning visuals

### APIs & Services
- **GitHub REST API** for repository data
- **Supabase** for backend services
- **Custom Analytics Engine** for insights

## 🚀 Getting Started

### Prerequisites
- Node.js 18+ 
- npm or yarn
- Modern web browser with JavaScript enabled

### Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/your-username/techhub.git
   cd techhub
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Set up environment variables**
   ```bash
   cp .env.example .env.local
   ```
   
   Configure the following variables:
   ```env
   VITE_SUPABASE_URL=your_supabase_url
   VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
   VITE_GITHUB_TOKEN=your_github_token (optional, for higher rate limits)
   ```

4. **Start the development server**
   ```bash
   npm run dev
   ```

5. **Open your browser**
   Navigate to `http://localhost:5173`

## 📖 Usage Guide

### Basic Repository Search
1. Enter a search query in the main search bar
2. Use filters to narrow down results by language, stars, etc.
3. Click on any repository to view detailed analysis

### AI Image Analysis
1. Click the "Image Analysis" button in the sidebar or floating action button
2. Upload an image (PNG, JPG, GIF up to 10MB)
3. Click "Analyze with AI" to get comprehensive insights
4. View object detection, classification, and technical details

### Predictive Analytics
1. Select a repository or enter a repository name
2. Choose analysis type (Growth, Issues, Contributors, Maintenance)
3. Set prediction timeframe (3 months to 2 years)
4. Run analysis to see trends and forecasts

### PDF Report Generation
1. Analyze a repository first
2. Click "Generate PDF Report" in the analysis dialog
3. Wait for the report to be generated with infographics
4. Download the comprehensive PDF report

### Mobile Usage
- Use the hamburger menu (☰) to access the sidebar on mobile
- Tap the floating action button (✨) for quick access to AI features
- All features are fully responsive and touch-optimized

## 🎯 Key Features

### Repository Analysis
- **Health Scoring**: Automated assessment of repository health
- **Issue Pattern Analysis**: Identify common issues and resolution patterns
- **Contributor Insights**: Community engagement and diversity metrics
- **Code Quality Assessment**: Language breakdown and technical metrics
- **Maintenance Indicators**: Activity levels and update frequency

### AI-Powered Insights
- **Natural Language Processing**: Convert complex data into readable insights
- **Pattern Recognition**: Identify trends and anomalies in repository data
- **Predictive Modeling**: Forecast future trends and outcomes
- **Image Understanding**: Analyze screenshots, diagrams, and documentation images

### User Experience
- **Fast Search**: Instant results with intelligent filtering
- **Bookmarking**: Save repositories for later analysis
- **Search History**: Quick access to previous searches
- **Comparison Tools**: Side-by-side repository comparison
- **Export Options**: PDF reports, CSV data, and more

## 🔧 Configuration

### GitHub API Setup
For enhanced features and higher rate limits, configure a GitHub personal access token:

1. Go to GitHub Settings > Developer settings > Personal access tokens
2. Generate a new token with `public_repo` scope
3. Add the token to your `.env.local` file as `VITE_GITHUB_TOKEN`

### Supabase Configuration
Set up Supabase for backend services:

1. Create a new Supabase project
2. Configure the database schema (see `supabase/migrations/`)
3. Deploy the edge functions (see `supabase/functions/`)
4. Update environment variables with your Supabase credentials

## 🤝 Contributing

We welcome contributions! Please see our [Contributing Guide](CONTRIBUTING.md) for details.

### Development Workflow
1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Make your changes
4. Run tests (`npm test`)
5. Commit your changes (`git commit -m 'Add amazing feature'`)
6. Push to the branch (`git push origin feature/amazing-feature`)
7. Open a Pull Request

## 📝 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- **TensorFlow.js** team for client-side ML capabilities
- **GitHub** for providing comprehensive repository data
- **Supabase** for backend infrastructure
- **Radix UI** for accessible component primitives
- **Tailwind CSS** for utility-first styling
- **Open Source Community** for inspiration and feedback

## 📞 Support

- **Documentation**: [docs.techhub.dev](https://docs.techhub.dev)
- **Issues**: [GitHub Issues](https://github.com/your-username/techhub/issues)
- **Discussions**: [GitHub Discussions](https://github.com/your-username/techhub/discussions)
- **Email**: support@techhub.dev

## 🗺️ Roadmap

### Upcoming Features
- [ ] **Real-time Collaboration**: Share analyses with team members
- [ ] **Custom ML Models**: Train models on your specific use cases
- [ ] **API Access**: RESTful API for programmatic access
- [ ] **Integrations**: Slack, Discord, and other platform integrations
- [ ] **Advanced Visualizations**: 3D charts and interactive dashboards
- [ ] **Multi-language Support**: Internationalization for global users

### Performance Improvements
- [ ] **Caching Layer**: Redis-based caching for faster responses
- [ ] **CDN Integration**: Global content delivery for better performance
- [ ] **Lazy Loading**: Optimize initial page load times
- [ ] **Service Workers**: Offline functionality and background sync

---

**Built with ❤️ by the TechHub team**

*Discover, Analyze, and Understand the Open Source World*