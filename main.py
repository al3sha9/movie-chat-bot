import os
import requests
import re
from dotenv import load_dotenv
from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from fastapi.responses import FileResponse
from pydantic import BaseModel
import google.generativeai as genai

# Load environment variables
load_dotenv()

# Create FastAPI instance
app = FastAPI(
    title="Movavi API",
    description="A FastAPI project with Gemini AI integration for Linux troubleshooting",
    version="1.0.0"
)

# Add CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:5173", 
        "http://127.0.0.1:5173",
        "http://localhost:3000",
        "https://your-vercel-app.vercel.app"  # Replace with your actual Vercel URL
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Pydantic model for request body
class UserPrompt(BaseModel):
    user_prompt: str

def extract_movie_title(prompt):
    """Extract movie title from user prompt using common patterns"""
    # Common patterns for movie queries
    patterns = [
        r"(?:about|watch|watching|review|tell me about|what about)\s+['\"]?([^'\"?]+)['\"]?",
        r"['\"]([^'\"]+)['\"]",
        r"movie\s+([^?]+)",
        r"film\s+([^?]+)",
    ]
    
    for pattern in patterns:
        match = re.search(pattern, prompt, re.IGNORECASE)
        if match:
            title = match.group(1).strip()
            # Clean up common words at the end
            title = re.sub(r'\s+(movie|film)$', '', title, flags=re.IGNORECASE)
            return title
    
    # If no pattern matches, return the whole prompt cleaned up
    return re.sub(r'(should i|can i|tell me|about|watch|watching|review)', '', prompt, flags=re.IGNORECASE).strip()

def fetch_movie_data(movie_title):
    """Fetch movie data from OMDB API"""
    try:
        movie_api_key = os.getenv("MOVIE_API_KEY")
        if not movie_api_key:
            return None
            
        url = f"http://www.omdbapi.com/?t={movie_title}&apikey={movie_api_key}"
        response = requests.get(url, timeout=10)
        
        if response.status_code == 200:
            data = response.json()
            if data.get("Response") == "True":
                return data
        return None
    except Exception as e:
        print(f"Error fetching movie data: {e}")
        return None

# System prompt for Movavi (same as your notebook)
system_prompt = """
Identity & Personality
You are a movie review AI assistant designed to help users decide whether to watch a specific movie. Your responses should be engaging, informative, and tailored to the user's preferences. Maintain a professional yet approachable tone, and ensure your reviews are balanced and fair.

Response Format
When movie data is available, ALWAYS start your response with a movie overview section formatted exactly like this:

---MOVIE_OVERVIEW_START---
**Title:** [Movie Title] ([Year])
**Poster:** [Poster URL]
**Rating:** ⭐ [IMDB Rating]/10
**Genre:** [Genre]
**Runtime:** [Runtime]
**Director:** [Director]
**Cast:** [Main Actors]
**Plot:** [Plot Summary]
---MOVIE_OVERVIEW_END---

After the movie overview, structure your review using clean markdown formatting:
- Use ## for main section headers (like ## Movie Information, ## Rating, ## Recommendation)
- Use ### for sub-headers if needed
- Use - for bullet points in lists
- Use **text** for bold emphasis
- Write in clear paragraphs with proper line breaks
- Keep the content well-organized and readable

Core Functions
Movie Information: Provide a brief summary of the movie, including the genre, main characters, and cast.
Rating: Give a rating out of 10 based on various factors such as plot, acting, direction, and overall enjoyment.
Recommendation: Advise whether the user should watch the movie or not, considering their preferences and the movie's strengths and weaknesses.
Detailed Review: Offer a detailed analysis of the movie, including highlights, criticisms, and any notable aspects.

Example Response Format:
---MOVIE_OVERVIEW_START---
**Title:** The Dark Knight (2008)
**Rating:** ⭐ 9.0/10
**Genre:** Action, Crime, Drama
**Runtime:** 152 min
**Director:** Christopher Nolan
**Cast:** Christian Bale, Heath Ledger, Aaron Eckhart
**Plot:** When the menace known as the Joker wreaks havoc and chaos on the people of Gotham...
---MOVIE_OVERVIEW_END---

## Movie Information
[Brief summary with genre, cast, and basic info]

## Rating
**8.5/10** - [Brief explanation of rating]

## Recommendation
[Clear recommendation with reasoning]

## Detailed Review
### Highlights
- [Positive aspects]
- [Strong points]

### Areas for Improvement
- [Criticisms or weak points]

[Additional analysis and final thoughts]

Guardrails
Accuracy: Ensure all information provided is accurate and up-to-date. If you are unsure about a detail, clarify or state that you do not have the information.
Bias: Maintain objectivity in your reviews. Avoid personal biases and present a balanced perspective.
Content Appropriateness: Be mindful of the content's appropriateness for different age groups. Include content warnings if necessary.
User Preferences: Tailor your recommendations based on the user's stated preferences and past interactions.
Professionalism: Maintain a professional and respectful tone. Avoid using offensive language or making inappropriate comments.
Privacy: Do not share personal information about the user or any individuals mentioned in the reviews.

Additional Features
Comparative Analysis: Compare the movie to similar films or other works by the same director or actors.
User Feedback: Encourage users to share their thoughts and opinions after watching the movie to refine future recommendations.
Trending Movies: Provide information on currently trending or highly-rated movies to keep users informed.

Error Handling
Unknown Movies: If the user asks about a movie you do not have information on, politely inform them and suggest similar movies you can review.
Ambiguous Requests: Clarify the user's request if it is unclear or too broad. For example, ask for more specific details about the type of review they are looking for.
"""



# Root endpoint
@app.get("/")
def read_root():
    """
    Root endpoint that returns a welcome message
    """
    return {"message": "Welcome to Movavi API", "status": "success"}

# Health check endpoint
@app.get("/health")
def health_check():
    """
    Health check endpoint
    """
    return {"status": "healthy", "service": "Movavi API"}

# POST endpoint for AI assistance (using same logic as your notebook)
@app.post("/movie")
def ask_Movavi(prompt: UserPrompt):
    """
    POST endpoint that takes user input and returns AI response using Gemini
    Also fetches movie data from OMDB API if a movie title is detected
    """
    try:
        # Read API key from environment variable
        api_key = os.getenv("GOOGLE_API_KEY")
        if not api_key:
            raise HTTPException(status_code=500, detail="GOOGLE_API_KEY environment variable not set")
        
        # Extract movie title and fetch OMDB data
        movie_title = extract_movie_title(prompt.user_prompt)
        movie_data = fetch_movie_data(movie_title) if movie_title else None
        
        # Configure Gemini API
        genai.configure(api_key=api_key)
        
        # Enhance system prompt with movie data if available
        enhanced_prompt = system_prompt
        if movie_data:
            enhanced_prompt += f"""

Current Movie Data from OMDB:
- Title: {movie_data.get('Title', 'N/A')}
- Year: {movie_data.get('Year', 'N/A')}
- Poster: {movie_data.get('Poster', 'N/A')}
- Rating: {movie_data.get('Rated', 'N/A')}
- Genre: {movie_data.get('Genre', 'N/A')}
- Director: {movie_data.get('Director', 'N/A')}
- Cast: {movie_data.get('Actors', 'N/A')}
- Plot: {movie_data.get('Plot', 'N/A')}
- IMDB Rating: {movie_data.get('imdbRating', 'N/A')}
- Runtime: {movie_data.get('Runtime', 'N/A')}

Use this accurate information in your review. Focus on providing insights about the movie quality, recommendations, and detailed analysis based on this data.
"""
        
        # Create the model
        model = genai.GenerativeModel(
            model_name="gemini-1.5-flash",
            system_instruction=enhanced_prompt
        )
        
        # Generate response using Gemini
        response = model.generate_content(prompt.user_prompt)
        
        # Return JSON response with movie data
        return {
            "status": "success",
            "user_prompt": prompt.user_prompt,
            "ai_response": response.text,
            "movie_data": movie_data,
            "model": "gemini-1.5-flash"
        }
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error generating response: {str(e)}")

# Mount static files (for production)
# app.mount("/static", StaticFiles(directory="frontend/dist"), name="static")

# @app.get("/")
# def serve_frontend():
#     return FileResponse("frontend/dist/index.html")

if __name__ == "__main__":
    import uvicorn
    port = int(os.environ.get("PORT", 8000))
    uvicorn.run(app, host="0.0.0.0", port=port)