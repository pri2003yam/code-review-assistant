# 🚀 Code Review Assistant

> An intelligent, AI-powered code review platform that analyzes your source code and provides actionable insights using Claude AI. Get professional code reviews in seconds.

![Next.js](https://img.shields.io/badge/Next.js-16.0-black?logo=next.js)
![React](https://img.shields.io/badge/React-19.2-blue?logo=react)
![TypeScript](https://img.shields.io/badge/TypeScript-5.0-blue?logo=typescript)
![Tailwind CSS](https://img.shields.io/badge/Tailwind-4.0-38B2AC?logo=tailwindcss)
![MongoDB](https://img.shields.io/badge/MongoDB-Latest-green?logo=mongodb)

## ✨ Key Features

### 🎯 Core Functionality
- **Multi-Language Support**: JavaScript, TypeScript, Python, Java, C++, C#, Go, Rust, and more
- **AI-Powered Analysis**: Claude 3.5 Sonnet delivers comprehensive code reviews with contextual understanding
- **Real-Time Feedback**: Instant analysis with detailed categorized issues
- **Code Preview**: Built-in Monaco Editor with syntax highlighting and code formatting

### 📊 Advanced Analytics
- **Smart Dashboard**: Visual analytics of code review trends over time
- **Severity Tracking**: Issues categorized as Critical, Warning, or Suggestion
- **Language Breakdown**: Analyze code quality metrics by programming language
- **Recurring Issues**: Identify and track patterns across all your reviews
- **Trend Analysis**: Visualize code quality improvements over 90 days

### 💾 Report Management
- **Full Review History**: Maintain a complete audit trail of all code reviews
- **Export Options**: Download reports as PDF or Markdown
- **Detailed Metrics**: Lines of code complexity, analysis time, and issue counts
- **Persistent Storage**: All reviews securely saved to MongoDB

### 🎨 Beautiful UI/UX
- **Modern Dark Theme**: Elegant gradient-based design with smooth animations
- **Responsive Layout**: Seamless experience on desktop, tablet, and mobile
- **Interactive Components**: Real-time updates and smooth transitions
- **Accessibility**: Built with inclusive design principles

## 🛠️ Tech Stack

| Layer | Technology |
|-------|-----------|
| **Framework** | Next.js 16.0.3 (Turbopack) + React 19.2 + TypeScript 5 |
| **Styling** | Tailwind CSS 4.0 + shadcn/ui Components |
| **Editor** | Monaco Editor with syntax highlighting |
| **Backend** | Next.js API Routes (serverless) |
| **Database** | MongoDB Atlas + Mongoose ODM |
| **AI Engine** | Google Gemini API (Multi-model support) |
| **UI Library** | Radix UI + Lucide Icons |
| **Export** | jsPDF + AutoTable for report generation |
Create a `.env.local` file in the project root with:

```env
# MongoDB Connection String (from MongoDB Atlas)
MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/code-review?retryWrites=true&w=majority

# Google Gemini API Key (from console.cloud.google.com)
GEMINI_API_KEY=AIzaSy...

# Optional: Application settings
NEXT_PUBLIC_APP_NAME=CodeReview AI
```

#### 3. MongoDB Atlas Setup

1. Go to [MongoDB Atlas](https://www.mongodb.com/cloud/atlas)
2. Create a free account
3. Create a new cluster (leave defaults as-is)
4. Create a database user with a password
5. Add your IP to IP Access List (or use 0.0.0.0/0 for development)
6. Click "Connect" → "Connect your application" and copy the connection string
7. Replace `username`, `password`, and `cluster` in your `.env.local`

#### 4. Get Google Gemini API Key

1. Go to [Google AI Studio](https://aistudio.google.com/app/apikey)
2. Sign in with your Google account
3. Click "Create API Key" or go to [Google Cloud Console](https://console.cloud.google.com/)
4. Enable the "Generative Language API"
5. Create an API key
6. Copy and paste into `.env.local` as `GEMINI_API_KEY`

**Note**: The Gemini API provides free tier usage for code review tasks with multiple model options (Gemini 2.5 Pro, Flash, Flash Lite, etc.)

#### 5. Run Development Server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

## 📁 Project Structure

```
src/
├── app/
│   ├── layout.tsx              # Root layout with Header/Footer
│   ├── page.tsx                # Home page (upload & review)
│   ├── dashboard/page.tsx       # Dashboard with analytics
│   ├── review/[id]/page.tsx     # Individual report view
│   ├── api/
│   │   ├── upload/route.ts      # File upload endpoint
│   │   ├── review/route.ts      # Code review endpoint
│   │   ├── reports/route.ts     # List/fetch reports
│   │   └── analytics/...        # Analytics endpoints
│   └── globals.css
├── components/
│   ├── layout/
│   │   ├── Header.tsx           # Navigation & branding
│   │   └── Footer.tsx           # Footer section
│   ├── upload/
│   │   ├── FileUploader.tsx      # Drag-drop upload widget
│   │   ├── CodePreview.tsx       # Monaco editor
│   │   └── LanguageSelector.tsx  # Language picker
│   ├── review/
│   │   ├── ReviewCard.tsx        # Main review display
│   │   ├── IssueItem.tsx         # Issue component
│   │   └── SeverityBadge.tsx     # Severity indicator
│   ├── dashboard/
│   │   ├── ReportCard.tsx        # Report list item
│   │   ├── ReportsList.tsx       # Reports list
│   │   ├── StatsOverview.tsx     # Stats cards
│   │   ├── SeverityDistribution.tsx
│   │   ├── AnalysisTimeTrend.tsx
│   │   ├── RecurringIssues.tsx
│   │   └── [more analytics...]
│   └── ui/                       # shadcn/ui components
├── lib/
│   ├── mongodb.ts               # MongoDB connection
│   ├── claude.ts                # Claude API client
│   ├── prompts.ts               # Review prompt template
│   └── utils.ts                 # Utilities
├── models/
│   └── Report.ts                # Mongoose schema
├── types/
│   └── index.ts                 # TypeScript interfaces
├── hooks/
│   ├── useFileUpload.ts         # Upload state
│   └── useReview.ts             # Review state
└── public/                       # Static assets
```

## 🎯 How It Works

```
User Flow:
1. 📤 Upload code file
2. 👀 Preview with syntax highlighting
3. 🚀 Click "Analyze Code"
4. 🤖 Gemini AI analyzes in real-time
5. 📊 View detailed report with issues
6. 💾 Results saved to MongoDB
7. 📥 Export as PDF or Markdown
8. 📈 Track metrics in dashboard
```

### Backend Process

1. **File Validation**: Check extension, size, content type
2. **Gemini Analysis**: Send code to Google Gemini API with intelligent model selection
3. **Parsing**: Extract and categorize feedback
4. **Storage**: Save to MongoDB with metadata
5. **Response**: Return structured report to frontend

## 🔌 API Endpoints

### POST `/api/upload`
Upload a code file
```json
{
  "success": true,
  "file": { "name": "app.js", "size": 2048, "language": "javascript" }
}
```

### POST `/api/review`
Analyze code with Claude
```json
{
  "success": true,
  "report": {
    "_id": "...",
    "fileName": "app.js",
    "language": "javascript",
    "issues": [...],
    "positives": [...],
    "createdAt": "2024-01-15T..."
  }
}
```

### GET `/api/reports?page=1&limit=10`
Fetch reports with pagination
```json
{
  "reports": [...],
  "total": 42,
  "page": 1,
  "totalPages": 5
}
```

### GET/DELETE `/api/reports/[id]`
Get or delete specific report

## 📋 Supported Languages

| Language | Extension | Status |
|----------|-----------|--------|
| JavaScript | .js | ✅ |
| TypeScript | .ts | ✅ |
| JSX | .jsx | ✅ |
| TSX | .tsx | ✅ |
| Python | .py | ✅ |
| Java | .java | ✅ |
| C++ | .cpp, .cc | ✅ |
| C | .c | ✅ |
| Go | .go | ✅ |
| Rust | .rs | ✅ |

## 🏷️ Issue Categories

The AI analyzes code across 6 key dimensions:

| Category | Focus |
|----------|-------|
| **Readability** | Naming, formatting, comments, clarity |
| **Modularity** | Function size, separation of concerns |
| **Bugs** | Logic errors, edge cases, null checks |
| **Performance** | Inefficiency, memory leaks, optimization |
| **Security** | Input validation, vulnerabilities |
| **Best Practices** | Patterns, idioms, conventions |

## 🎨 Issue Severity

- **🔴 Critical** - Security vulnerabilities, logic bugs, must fix
- **🟡 Warning** - Code quality, maintainability issues
- **🔵 Suggestion** - Improvements, optimizations, nice-to-have

## 🚢 Deployment

### Vercel (Recommended - 1 minute)

```bash
# Push to GitHub, then:
# 1. Go to vercel.com
# 2. Import repository
# 3. Add environment variables
# 4. Deploy
```

### Manual Deployment

Supports: AWS, Railway, Fly.io, DigitalOcean, Heroku

```bash
npm run build
npm run start
```

Environment variables required:
- `MONGODB_URI`
- `ANTHROPIC_API_KEY`

## 🐛 Troubleshooting

| Issue | Solution |
|-------|----------|
| "MONGODB_URI not found" | Add to `.env.local`, restart dev server |
| "Invalid GEMINI_API_KEY" | Verify key from console.cloud.google.com, ensure "Generative Language API" is enabled |
| File upload fails | Check file size < 100KB, extension supported |
| MongoDB connection error | Verify IP whitelisted in Atlas, check connection string |
| Monaco editor not loading | Check browser console, verify npm dependencies installed |

## 📚 Scripts

```bash
npm run dev      # Start development server
npm run build    # Build for production
npm run start    # Start production server
npm run lint     # Run ESLint
```

## 🤝 Contributing

We welcome contributions! Areas to help:

- 🆕 Multiple file batch uploads
- 📊 Advanced filtering/sorting in dashboard
- 🎨 Custom review templates
- 🌙 Light/dark theme toggle
- 🌍 i18n support
- 📱 Mobile app version

Feel free to open issues and pull requests!

## 📄 License

MIT License - feel free to use this project for any purpose.

## 💬 Support

- 📧 Questions? Open an issue
- 🐛 Found a bug? Report it on GitHub
- 💡 Feature request? Let us know!

## 🙏 Acknowledgments

- [Claude AI](https://claude.ai) for code analysis
- [Next.js](https://nextjs.org) for the framework
- [shadcn/ui](https://ui.shadcn.com) for components
- [MongoDB](https://mongodb.com) for the database
- [Tailwind CSS](https://tailwindcss.com) for styling

---

<div align="center">

**Built with ❤️ by developers, for developers**

[Star ⭐](https://github.com) — [Fork 🍴](https://github.com) — [Contribute 🚀](https://github.com/issues)

</div>
- [ ] GitHub integration
- [ ] VS Code extension
- [ ] Real-time collaboration features

## License

MIT License - feel free to use for personal or commercial projects.

## Support

For issues or questions:
1. Check this README
2. Review API error messages
3. Check browser console for client-side errors
4. Check server logs in terminal

---

Built with ❤️ using Next.js and Claude AI
