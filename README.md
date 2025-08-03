# Movavi Movie Review AI Assistant

A modern movie review application powered by Google Gemini AI and OMDB API, featuring a Claude-like chat interface.

## Features

- 🎬 **AI Movie Reviews**: Get detailed movie analysis using Google Gemini AI
- 🎯 **Movie Data Integration**: Fetch accurate movie information from OMDB API
- 📱 **Responsive Design**: Beautiful UI that works on all devices
- 🎨 **Modern Interface**: Claude-inspired chat layout with movie banners
- ⚡ **Fast & Reliable**: Built with FastAPI and Vite for optimal performance

## Deployment

See [DEPLOYMENT.md](DEPLOYMENT.md) for detailed deployment instructions.

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
