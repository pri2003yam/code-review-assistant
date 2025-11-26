# CodeReview AI - Complete Setup & Troubleshooting Guide

## 🚀 Getting Started (Step-by-Step)

### Prerequisites
- Node.js 18+ (check with `node --version`)
- npm 9+ (check with `npm --version`)
- MongoDB Atlas account (free)
- Anthropic API account (free credits)

### Installation (5 minutes)

All dependencies are already installed, but if you need to reinstall:

```bash
# Install all dependencies
npm install

# Verify installation
npm list next react mongoose
```

---

## 🔧 Configuration Guide

### 1. MongoDB Atlas Setup

#### Creating Account & Cluster
```
1. Visit: https://www.mongodb.com/cloud/atlas
2. Click "Create one for free"
3. Fill in registration form (name, email, password)
4. Click "Create my Atlas account"
5. Choose "Shared" (free) cluster
6. Select region (choose nearest to you)
7. Click "Create Cluster" → Wait 2-3 minutes
```

#### Creating Database User
```
1. In Atlas dashboard: Security → Database Access
2. Click "Add New Database User"
3. Choose "Password" authentication
4. Username: admin
5. Password: Generate Secure Password (save this!)
6. Default privileges selected → "Add User"
```

#### Whitelisting IP Address
```
1. In Atlas dashboard: Security → Network Access
2. Click "Add IP Address"
3. Choose one:
   - "Add My Current IP Address" (for dev only)
   - "0.0.0.0/0" (allows all IPs, less secure)
4. Click "Confirm"
```

#### Getting Connection String
```
1. Click "Databases" → Your cluster
2. Click "Connect"
3. Select "Connect your application"
4. Choose "Node.js" driver
5. Copy the connection string:
   mongodb+srv://admin:PASSWORD@cluster0.xxxxx.mongodb.net/?retryWrites=true&w=majority
6. Keep this safe!
```

#### Format for .env.local
```
Replace in connection string:
- admin → your database username
- PASSWORD → your secure password
- xxx → cluster name (usually cluster0)

Result:
MONGODB_URI=mongodb+srv://admin:MySecurePassword123@cluster0.abcxyz.mongodb.net/code-review?retryWrites=true&w=majority
```

### 2. Anthropic API Setup

#### Get API Key
```
1. Visit: https://console.anthropic.com
2. Sign up or login
3. Click "API Keys" in sidebar
4. Click "Create Key"
5. Give it a name: "CodeReview AI Dev"
6. Copy the key (starts with sk-ant-)
7. **IMPORTANT**: Save this somewhere safe! You won't see it again
```

#### Format for .env.local
```
ANTHROPIC_API_KEY=sk-ant-abc123xyz...
```

#### Check Your Quota
```
1. Visit: https://console.anthropic.com/account/billing/overview
2. View available credits (free accounts get $5)
3. Monitor usage under "Messages & Tokens"
```

### 3. Environment File Setup

#### Create .env.local
```bash
cd code-review-assistant
nano .env.local  # or use any text editor
```

#### Paste These Values
```env
# MongoDB - Replace with your actual credentials
MONGODB_URI=mongodb+srv://admin:YourSecurePassword123@cluster0.abcxyz.mongodb.net/code-review?retryWrites=true&w=majority

# Anthropic - Replace with your actual API key
ANTHROPIC_API_KEY=sk-ant-abc123xyz...

# Optional - keep as is
NEXT_PUBLIC_APP_NAME=CodeReview AI
```

#### Save and Close
- Save file (Ctrl+S or Cmd+S)
- Don't commit this to GitHub!

---

## ▶️ Running the Application

### Start Development Server
```bash
npm run dev
```

Expected output:
```
> code-review-assistant@0.1.0 dev
> next dev

  ▲ Next.js 16.0.3 (Turbopack)

  ✓ Ready in 2.3s

  ➜ Local:        http://localhost:3000
  ➜ Environments: .env.local
```

### Open in Browser
```
Go to: http://localhost:3000
```

You should see the CodeReview AI home page! 🎉

---

## 🧪 Testing the Application

### Method 1: Use Sample Code
1. Home page has sample JavaScript code
2. Click "Analyze Code"
3. Wait for results (~10 seconds)
4. View detailed feedback

### Method 2: Upload Your Own File

Sample files to test:

**test.js** (JavaScript)
```javascript
function getData(arr) {
  var data = [];
  for (var i = 0; i < arr.length; i++) {
    if (arr[i]) {
      data.push(arr[i]);
    }
  }
  return data;
}
```

**test.py** (Python)
```python
def process_data(data):
    result = []
    for i in range(len(data)):
        if data[i] != None:
            result.append(data[i])
    return result
```

---

## ❌ Troubleshooting

### Problem: "Cannot find module '.env.local'"
**Solution**: Environment variables loaded automatically; check they exist:
```bash
# Verify .env.local exists
ls -la .env.local

# Or on Windows PowerShell
Test-Path .env.local
```

### Problem: MongoDB Connection Error
```
Error: querySrv ENOTFOUND _mongodb._tcp.cluster.mongodb.net
```

**Causes & Solutions**:
1. **Wrong connection string**
   - [ ] Copy entire string from MongoDB Atlas
   - [ ] Check username is correct
   - [ ] Check password has no special chars that need escaping

2. **IP not whitelisted**
   - [ ] Go to MongoDB Atlas → Security → Network Access
   - [ ] Click "Add IP Address"
   - [ ] Add your current IP or use 0.0.0.0/0
   - [ ] Wait 1-2 minutes for changes to take effect

3. **Cluster not ready**
   - [ ] Go to MongoDB Atlas → Databases
   - [ ] Check cluster status shows green checkmark
   - [ ] Wait if it shows "Creating"

4. **Internet connection**
   - [ ] Check you can access https://www.mongodb.com
   - [ ] Try pinging: `ping 8.8.8.8`

**Quick Fix**:
```bash
# Restart dev server after fixing
npm run dev
```

### Problem: "Invalid ANTHROPIC_API_KEY"
```
Error: Unauthorized. Check that your API key is correct.
```

**Solutions**:
1. **Verify API key format**
   - Should start with `sk-ant-`
   - Should be ~100+ characters long
   - No spaces or line breaks

2. **Get fresh API key**
   - Visit https://console.anthropic.com/account/api_keys
   - Delete old key
   - Create new key
   - Copy entire string without modification

3. **Check environment variable**
   ```bash
   # Verify it's set
   echo $env:ANTHROPIC_API_KEY  # PowerShell
   echo $ANTHROPIC_API_KEY      # Bash
   ```

4. **Restart dev server**
   ```bash
   npm run dev
   ```

### Problem: File Upload Fails
```
"Unsupported file type" or "File size exceeds limit"
```

**Solutions**:
1. **Check file type**
   - Supported: .js, .ts, .jsx, .tsx, .py, .java, .cpp, .c, .go, .rs
   - NOT supported: .java (typo for .java), .txt, .md

2. **Check file size**
   - Max size: 100KB
   - Check with: `ls -lh filename` or Windows Explorer properties
   - Large files? Reduce or split them

3. **Check file encoding**
   - Should be UTF-8
   - Not binary or image files

**Example valid upload**:
```bash
# Create test file
echo 'console.log("test");' > test.js

# Check size
ls -lh test.js  # Should be < 100KB

# Upload it
# Drag and drop into browser or click upload
```

### Problem: Monaco Editor Not Loading
```
Error: Failed to load Monaco Editor
```

**Solutions**:
1. **Clear browser cache**
   - Ctrl+Shift+Del (Chrome/Firefox)
   - Cmd+Shift+Del (Safari)
   - Select "All time" and clear

2. **Check network tab**
   - Open DevTools (F12)
   - Go to Network tab
   - Look for failed requests
   - Check if monaco files are loading

3. **Reinstall monaco**
   ```bash
   npm install @monaco-editor/react --save
   npm install monaco-editor --save
   ```

4. **Rebuild**
   ```bash
   rm -rf .next
   npm run build
   npm run dev
   ```

### Problem: Port 3000 Already in Use
```
Error: Port 3000 is already in use
```

**Solutions**:
1. **Use different port**
   ```bash
   PORT=3001 npm run dev
   # Then visit http://localhost:3001
   ```

2. **Kill existing process**
   ```bash
   # On Windows PowerShell
   Get-Process -Id (Get-NetTCPConnection -LocalPort 3000).OwningProcess | Stop-Process -Force
   
   # On macOS/Linux
   lsof -ti:3000 | xargs kill -9
   ```

### Problem: Build Fails with TypeScript Errors
```
Error: Type error found
```

**Solutions**:
1. **Check error message**
   - Read the full error (usually helpful)
   - Look for file path and line number

2. **Common type errors**
   - Missing type imports
   - Wrong parameter types
   - Missing required properties

3. **Debug**
   ```bash
   # Run type checker manually
   npm run lint
   
   # This shows all issues at once
   ```

### Problem: Slow Initial Load
- First startup compiles code (~30 seconds OK)
- Monaco Editor loads (~5 seconds OK)
- Analysis takes 10-20 seconds (API calls)

**To speed up**:
- Close unused browser tabs
- Restart dev server: `npm run dev`
- Check internet connection

---

## 📊 Monitoring

### Check Database
```
1. MongoDB Atlas dashboard
2. Click "Databases"
3. Click "Browse Collections"
4. Should see "code-review" database
5. Click to see all reviews stored
```

### Check API Usage
```
1. Anthropic Console: https://console.anthropic.com
2. Click "Usage"
3. See tokens used and remaining credits
4. Check for any errors in "Messages"
```

### View Logs
```bash
# Terminal shows all logs
# Look for:
# - MongoDB connection messages
# - API response times
# - Any errors (red text)
```

---

## 🚀 Production Deployment

### Before Deploying

1. **Test everything locally**
   ```bash
   npm run build
   npm run start
   # Visit http://localhost:3000
   ```

2. **Check environment variables**
   ```bash
   # Verify they're set
   echo $env:MONGODB_URI
   echo $env:ANTHROPIC_API_KEY
   ```

3. **Test with production database** (optional)
   - Use same MongoDB instance
   - Or create separate production cluster

### Deploy to Vercel

1. **Push to GitHub**
   ```bash
   git add .
   git commit -m "Initial commit"
   git push origin main
   ```

2. **Connect to Vercel**
   - Visit https://vercel.com
   - Click "New Project"
   - Select GitHub repo
   - Click "Import"

3. **Configure environment variables**
   - Click "Environment Variables"
   - Add `MONGODB_URI`
   - Add `ANTHROPIC_API_KEY`
   - Click "Save"

4. **Deploy**
   - Click "Deploy"
   - Wait for deployment (2-3 minutes)
   - Visit your deployed URL

### Configure MongoDB for Production

In MongoDB Atlas:

1. **IP Whitelist**
   - Add Vercel IPs: `0.0.0.0/0` for production
   - Or use Vercel IP ranges (more secure)

2. **Connection String**
   - Should already be secure
   - Use same string as development

3. **Backups**
   - Enable automatic backups
   - Configure retention period

---

## 💡 Tips & Best Practices

### Development
- Use `npm run dev` for development (hot reload)
- Use `npm run build` to check for errors before commit
- Keep `.env.local` private (add to .gitignore)
- Test locally before deploying

### Security
- Never commit `.env.local` to Git
- Don't share API keys
- Use strong database passwords
- Rotate API keys periodically
- Set IP whitelist restrictions in MongoDB

### Performance
- Monitor API usage and credits
- Cache Claude responses if same code
- Optimize database queries with indexes
- Use CDN for static assets (Vercel does this)

### Debugging
- Open DevTools (F12) for client errors
- Check terminal for server errors
- Use MongoDB Atlas console to inspect data
- Check Anthropic console for API issues

---

## 📞 Getting Help

### Resources
- **Documentation**: See README.md
- **Quick Start**: See QUICKSTART.md
- **Implementation Details**: See IMPLEMENTATION_REPORT.md
- **Next.js Docs**: https://nextjs.org/docs
- **MongoDB Docs**: https://docs.mongodb.com
- **Claude API Docs**: https://docs.anthropic.com

### Common Errors & Solutions

| Error | Cause | Solution |
|-------|-------|----------|
| ENOTFOUND | Network issue | Check internet, whitelist IP |
| ECONNREFUSED | MongoDB down | Check cluster status |
| 401 Unauthorized | Bad API key | Get fresh key from Anthropic |
| 403 Forbidden | Rate limited | Wait a bit, check quota |
| ENOMEM | Out of memory | Reduce file size or restart |

---

## ✅ Verification Checklist

Before using in production:

- [ ] MongoDB Atlas cluster created and running
- [ ] Database user created with strong password
- [ ] Current IP whitelisted in MongoDB
- [ ] Anthropic API key created and saved
- [ ] `.env.local` file created with credentials
- [ ] `npm install` completed without errors
- [ ] `npm run build` completes successfully
- [ ] `npm run dev` starts without errors
- [ ] Home page loads at http://localhost:3000
- [ ] Sample code upload works
- [ ] Claude analysis completes
- [ ] Results display correctly
- [ ] Dashboard shows reviews
- [ ] Export to PDF works
- [ ] Export to Markdown works
- [ ] Delete review works

---

## 🎉 You're All Set!

Your CodeReview AI is ready to use. Happy reviewing! 🚀

Questions? Check the documentation files or create an issue on GitHub.
