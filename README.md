# Movavi Movie Review AI Assistant

A modern movie review application powered by Google Gemini AI and OMDB API, featuring a Claude-like chat interface.

## SCREENSHOTS
![Project Images](./s1.png)
![Project Images](./s2.png)


## Features

- 🎬 **AI Movie Reviews**: Get detailed movie analysis using Google Gemini AI
- 🎯 **Movie Data Integration**: Fetch accurate movie information from OMDB API
- 📱 **Responsive Design**: Beautiful UI that works on all devices
- 🎨 **Modern Interface**: Claude-inspired chat layout with movie banners
- ⚡ **Fast & Reliable**: Built with FastAPI and Vite for optimal performance

# Deployment Guide

## ✅ Backend Deployed Successfully!
**Your backend URL**: https://web-production-0b3e.up.railway.app/

## 🚨 IMPORTANT: Add Environment Variables to Railway

1. Go to [railway.app](https://railway.app) and open your project
2. Click on your service
3. Go to the **Variables** tab
4. Add these environment variables:

5. Click **Deploy** to restart with the new variables

## Frontend Deployment (Next Step)

### Deploy to Vercel:
1. Go to [vercel.com](https://vercel.com)
2. Import your GitHub repository
3. Vercel will auto-detect Vite configuration
4. Deploy (it will automatically use the Railway backend URL)

### Manual Deployment:
```bash
cd app/frontend
npm run build
# Upload the dist/ folder to any static hosting
```

## Testing Your Deployment

### Test Backend:
```bash
curl https://web-production-0b3e.up.railway.app/
```

### Test Movie Endpoint (after adding env vars):
```bash
curl -X POST https://web-production-0b3e.up.railway.app/movie \
  -H "Content-Type: application/json" \
  -d '{"user_prompt": "Should I watch Inception?"}'
```

## Current Status:
- ✅ Backend deployed to Railway
- ✅ Frontend code updated with production URL
- ⏳ Need to add environment variables to Railway
- ⏳ Need to deploy frontend to Vercel

## Notes:
- Backend is working but needs API keys
- Frontend is ready for deployment
- CORS is configured for Vercel domains


### Quick Steps:
1. **Backend**: Deploy to Railway (recommended) or Render
2. **Frontend**: Deploy to Vercel
3. Update API URL in frontend after backend deployment
4. Add environment variables: `GOOGLE_API_KEY` and `MOVIE_API_KEY`

## Local Development

### Backend Setup
```bash
source venv/bin/activate
python main.py
```

### Frontend Setup
```bash
cd app/frontend
npm run dev
```
