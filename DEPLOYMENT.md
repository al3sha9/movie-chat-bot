# Deployment Guide

## Backend Deployment (Python FastAPI)

### Option 1: Railway (Recommended)
1. Go to [railway.app](https://railway.app)
2. Sign up with GitHub
3. Create new project → Deploy from GitHub repo
4. Select your repository
5. Add environment variables:
   - `GOOGLE_API_KEY=your_google_api_key`
   - `MOVIE_API_KEY=your_omdb_api_key`
6. Railway will automatically detect and deploy your FastAPI app

### Option 2: Render
1. Go to [render.com](https://render.com)
2. Sign up with GitHub
3. Create new Web Service
4. Connect your GitHub repository
5. Configure:
   - Build Command: `pip install -r requirements.txt`
   - Start Command: `uvicorn main:app --host 0.0.0.0 --port $PORT`
6. Add environment variables in Render dashboard

### Option 3: Heroku
1. Install Heroku CLI
2. Create Heroku app: `heroku create your-app-name`
3. Add environment variables: 
   ```bash
   heroku config:set GOOGLE_API_KEY=your_key
   heroku config:set MOVIE_API_KEY=your_key
   ```
4. Deploy: `git push heroku main`

## Frontend Deployment (Vercel)

### Prepare Frontend for Deployment:
1. Update the API_BASE_URL in your frontend code to point to your deployed backend
2. Build your project: `npm run build`
3. Deploy to Vercel:
   - Connect GitHub repo to Vercel
   - Vercel will auto-detect Vite and deploy

### Update CORS in Backend:
After deploying frontend, update the CORS origins in `main.py` with your Vercel URL:
```python
allow_origins=[
    "https://your-app-name.vercel.app"
]
```

## Environment Variables Needed:
- `GOOGLE_API_KEY`: Your Google Gemini AI API key
- `MOVIE_API_KEY`: Your OMDB API key (80669d80)
- `PORT`: Will be set automatically by hosting platform

## Post-Deployment Steps:
1. Test API endpoints
2. Update frontend API URL
3. Test full application flow
4. Monitor logs for any issues

## Costs:
- Railway: Free tier, then $5/month
- Render: Free tier (sleeps), $7/month for always-on
- Vercel: Free for personal projects
- Heroku: $7/month minimum

## Notes:
- Your current API keys are already configured in the code
- Make sure to keep your API keys secure
- Test thoroughly before going live
