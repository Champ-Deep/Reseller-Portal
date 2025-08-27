# 🚀 Deployment Guide

## Method 1: Direct Vercel Deployment (Manual Login Required)

### Step 1: Login to Vercel
```bash
cd "/Users/champion/Desktop/LakeB2B Reseller Portal/Reseller Portal/apps/web"
vercel login
```
Follow the browser login process.

### Step 2: Deploy
```bash
vercel
```
Accept all defaults, you'll get a live URL.

## Method 2: GitHub + Vercel (Automatic)

### Step 1: Create GitHub Repository
1. Go to https://github.com
2. Create new repository: `lakeb2b-reseller-portal`
3. Don't initialize with README

### Step 2: Push to GitHub
```bash
cd "/Users/champion/Desktop/LakeB2B Reseller Portal/Reseller Portal/apps/web"
git init
git add .
git commit -m "Initial commit"
git branch -M main
git remote add origin https://github.com/YOURUSERNAME/lakeb2b-reseller-portal.git
git push -u origin main
```

### Step 3: Connect Vercel to GitHub
1. Go to https://vercel.com
2. Sign up/login with GitHub
3. Import your repository
4. Deploy automatically

## Method 3: One-Click Deploy Button

I can create a deploy button that works instantly:

[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new/clone?repository-url=https://github.com/yourusername/lakeb2b-reseller-portal)

## Environment Variables for Vercel

After deployment, add these in Vercel dashboard:
- `DATABASE_URL`: Your cloud database URL
- `AUTH_SECRET`: Random secret key
- `LAKE_B2B_API_KEY`: Your API key

## 🎯 Recommended: Use Method 1 (Direct)
It's the fastest and simplest for getting started.