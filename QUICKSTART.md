# Quick Start Guide - CodeReview AI

## What's been built

A complete full-stack Code Review Assistant application with:
- ✅ Next.js 14 App Router frontend
- ✅ AI-powered code analysis via Claude API
- ✅ MongoDB database integration
- ✅ Beautiful UI with Tailwind CSS + shadcn/ui
- ✅ File upload with Monaco Editor preview
- ✅ Review dashboard with history and statistics
- ✅ PDF/Markdown export functionality
- ✅ Full TypeScript type safety

## 3-Step Setup

### Step 1: Set Up MongoDB (5 minutes)

1. Go to https://www.mongodb.com/cloud/atlas
2. Create account → Create Free Cluster
3. Click "Security" → "Database Access" → "Add New Database User"
   - Username: `admin`
   - Password: `YourSecurePassword123`
   - Click "Add User"
4. Click "Network Access" → "Add IP Address" → "Add Current IP Address"
   - Or use `0.0.0.0/0` for development
5. Click "Databases" → Your cluster → "Connect" 
6. Select "Connect your application"
7. Copy the connection string: `mongodb+srv://admin:YourSecurePassword123@cluster0.xxx.mongodb.net/code-review?retryWrites=true&w=majority`

### Step 2: Get Anthropic API Key (2 minutes)

1. Go to https://console.anthropic.com
2. Sign up or log in
3. Click "API Keys" → "Create Key"
4. Copy your API key (starts with `sk-ant-...`)

### Step 3: Configure Environment (1 minute)

1. Open `.env.local` in the project root
2. Replace with your credentials:

```env
MONGODB_URI=mongodb+srv://admin:YourSecurePassword123@cluster0.xxx.mongodb.net/code-review?retryWrites=true&w=majority
ANTHROPIC_API_KEY=sk-ant-...
```

## Run the App

```bash
# Install dependencies (already done)
npm install

# Start development server
npm run dev

# Open http://localhost:3000
```

## Test It Out

1. **Upload test code**: Try the sample code on the home page
2. **Analyze**: Click "Analyze Code"
3. **View results**: See AI-powered feedback
4. **Export**: Download as PDF or Markdown

## Project File Organization

```
code-review-assistant/
├── src/
│   ├── app/              # Pages & API routes
│   ├── components/       # React components
│   ├── lib/              # Utilities (MongoDB, Claude, etc)
│   ├── types/            # TypeScript types
│   ├── hooks/            # Custom React hooks
│   └── models/           # Mongoose schemas
├── .env.local            # ← YOUR CREDENTIALS GO HERE
├── README.md             # Full documentation
└── package.json          # Dependencies
```

## Key Features

✨ **Code Upload**: Drag-drop or click to upload code files
✨ **AI Analysis**: Claude reviews code for:
  - Bugs and security issues
  - Code quality and readability
  - Performance problems
  - Best practices
  
✨ **Beautiful UI**: Modern interface with:
  - Syntax-highlighted code viewer
  - Expandable issue cards
  - Score visualization
  - Responsive design

✨ **Dashboard**: Track all reviews with:
  - Statistics overview
  - Review history with pagination
  - Quick filters by language
  - Delete functionality

✨ **Export Reports**: Download as:
  - Markdown (.md files)
  - PDF documents

## Supported Languages

JavaScript, TypeScript, JSX, TSX, Python, Java, C++, C, Go, Rust

## API Endpoints

- `POST /api/upload` - Upload code file
- `POST /api/review` - Analyze code with Claude
- `GET /api/reports` - Fetch reviews with pagination
- `GET /api/reports/[id]` - Get single review
- `DELETE /api/reports/[id]` - Delete review

## Troubleshooting

### "Cannot connect to MongoDB"
- [ ] Check `.env.local` has `MONGODB_URI`
- [ ] Verify IP is whitelisted in MongoDB Atlas
- [ ] Restart dev server with `npm run dev`

### "Invalid API Key"
- [ ] Get fresh key from console.anthropic.com
- [ ] Update `.env.local`
- [ ] Restart dev server

### "File upload fails"
- [ ] Check file size < 100KB
- [ ] Verify file extension (.js, .ts, .py, etc)
- [ ] Try different file type

## Next Steps

1. **Customize**: Update branding in `src/components/layout/Header.tsx`
2. **Add Features**: Implement GitHub integration, team features, etc
3. **Deploy**: Push to GitHub and connect to Vercel
4. **Scale**: Your app is ready for production!

## Commands

```bash
npm run dev      # Start development server
npm run build    # Build for production
npm run start    # Start production server
npm run lint     # Run linter
```

## Built With

- Next.js 14 - React framework
- TypeScript - Type safety
- Tailwind CSS - Styling
- shadcn/ui - UI components
- Claude AI - Code analysis
- MongoDB - Database
- Mongoose - ODM
- Monaco Editor - Code preview

---

🎉 Your Code Review Assistant is ready to use!

Questions? Check README.md for detailed documentation.
