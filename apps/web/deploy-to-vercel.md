# 🚀 Deploy to Vercel (Always Works)

## Why Vercel?
- **Always accessible** - no localhost issues
- **Automatic SSL** - https by default
- **Free tier** - costs nothing
- **One-click deploy** - works every time
- **Global CDN** - fast worldwide

## Quick Deploy Steps:

### 1. Install Vercel CLI
```bash
npm install -g vercel
```

### 2. Deploy Your App
```bash
cd "/Users/champion/Desktop/LakeB2B Reseller Portal/Reseller Portal/apps/web"
vercel
```

### 3. Follow Prompts
- Link to existing project? **No**
- Project name: `lakeb2b-reseller-portal`
- Directory: **Enter** (current directory)
- Override settings? **No**

### 4. Get Live URL
After deployment, you'll get a URL like:
```
https://lakeb2b-reseller-portal-abc123.vercel.app
```

## Environment Variables on Vercel:
```bash
# Set your database URL (use cloud database)
vercel env add DATABASE_URL
# Paste: postgresql://user:pass@host:port/db

# Set other required variables
vercel env add AUTH_SECRET
vercel env add LAKE_B2B_API_KEY
```

## Benefits:
✅ **Always accessible** - no connection refused errors  
✅ **HTTPS by default** - secure  
✅ **Global CDN** - fast loading  
✅ **Automatic deployments** - push to update  
✅ **Free for personal use**