import './style.css'
import { marked } from 'marked'

// API URL - Production backend on Railway
const API_BASE_URL = import.meta.env.PROD 
  ? 'https://web-production-0b3e.up.railway.app'
  : 'http://localhost:8000';

class MovieReviewApp {
  constructor() {
    this.messagesContainer = document.getElementById('messages');
    this.movieInput = document.getElementById('movieInput');
    this.askButton = document.getElementById('askButton');
    this.exampleButtons = document.querySelectorAll('.example-btn');
    this.movieInfoContainer = document.getElementById('movieInfo');
    this.navLinks = document.querySelectorAll('.nav-link');
    this.pages = document.querySelectorAll('.page');
    this.hamburger = document.querySelector('.hamburger');
    this.navMenu = document.querySelector('.nav-menu');
    
    this.initializeEventListeners();
    this.addWelcomeMessage();
  }

  initializeEventListeners() {
    // Ask button click
    this.askButton.addEventListener('click', () => this.handleAskQuestion());
    
    // Enter key in input
    this.movieInput.addEventListener('keypress', (e) => {
      if (e.key === 'Enter') {
        this.handleAskQuestion();
      }
    });
    
    // Example button clicks
    this.exampleButtons.forEach(btn => {
      btn.addEventListener('click', () => {
        const prompt = btn.getAttribute('data-prompt');
        this.movieInput.value = prompt;
        this.handleAskQuestion();
      });
    });
    
    // Clear background button
    const clearButton = document.getElementById('clearBackground');
    if (clearButton) {
      clearButton.addEventListener('click', () => {
        this.resetBackground();
      });
    }
    
    // Navigation links
    this.navLinks.forEach(link => {
      link.addEventListener('click', (e) => {
        const page = link.getAttribute('data-page');
        if (page) {
          e.preventDefault();
          this.showPage(page);
          this.setActiveNavLink(link);
        }
      });
    });
    
    // Mobile hamburger menu
    if (this.hamburger) {
      this.hamburger.addEventListener('click', () => {
        this.navMenu.classList.toggle('active');
      });
    }
  }

  showPage(pageId) {
    // Hide all pages
    this.pages.forEach(page => {
      page.classList.remove('active');
    });
    
    // Show selected page
    const targetPage = document.getElementById(pageId + 'Page');
    if (targetPage) {
      targetPage.classList.add('active');
    }
    
    // Close mobile menu
    if (this.navMenu) {
      this.navMenu.classList.remove('active');
    }
  }

  setActiveNavLink(activeLink) {
    // Remove active class from all nav links
    this.navLinks.forEach(link => {
      link.classList.remove('active');
    });
    
    // Add active class to clicked link
    activeLink.classList.add('active');
  }

  addWelcomeMessage() {
    this.addMessage(
      "👋 Hi! I'm your AI movie review assistant. Ask me about any movie and I'll help you decide if it's worth watching!",
      'ai'
    );
  }

  addMessage(content, type, isLoading = false) {
    const messageDiv = document.createElement('div');
    messageDiv.className = `message ${type}-message`;
    
    if (isLoading) {
      messageDiv.innerHTML = `<span class="loading"></span>Thinking...`;
    } else {
      // Format the content for better readability
      if (type === 'ai') {
        messageDiv.innerHTML = this.formatAIResponse(content);
      } else {
        messageDiv.textContent = content;
      }
    }
    
    this.messagesContainer.appendChild(messageDiv);
    this.scrollToBottom();
    
    return messageDiv;
  }

  formatAIResponse(text) {
    // Check if the response contains movie overview
    const overviewMatch = text.match(/---MOVIE_OVERVIEW_START---([\s\S]*?)---MOVIE_OVERVIEW_END---/);
    
    let formattedResponse = '';
    
    if (overviewMatch) {
      const overviewContent = overviewMatch[1].trim();
      const restOfResponse = text.replace(/---MOVIE_OVERVIEW_START---[\s\S]*?---MOVIE_OVERVIEW_END---/, '').trim();
      
      // Parse movie overview data
      const titleMatch = overviewContent.match(/\*\*Title:\*\*\s*([^\n]+)/);
      const posterMatch = overviewContent.match(/\*\*Poster:\*\*\s*([^\n]+)/);
      const ratingMatch = overviewContent.match(/\*\*Rating:\*\*\s*([^\n]+)/);
      const genreMatch = overviewContent.match(/\*\*Genre:\*\*\s*([^\n]+)/);
      const runtimeMatch = overviewContent.match(/\*\*Runtime:\*\*\s*([^\n]+)/);
      const directorMatch = overviewContent.match(/\*\*Director:\*\*\s*([^\n]+)/);
      const castMatch = overviewContent.match(/\*\*Cast:\*\*\s*([^\n]+)/);
      const plotMatch = overviewContent.match(/\*\*Plot:\*\*\s*([^\n]+)/);
      
      const posterUrl = posterMatch ? posterMatch[1].trim() : '';
      const title = titleMatch ? titleMatch[1] : 'Unknown Movie';
      
      // Create movie overview banner with poster
      formattedResponse += `
        <div class="movie-overview-banner">
          <div class="movie-overview-content">
            <div class="movie-banner-layout">
              ${posterUrl && posterUrl !== 'N/A' ? 
                `<div class="movie-poster-container">
                   <img src="${posterUrl}" alt="${title} Poster" class="movie-banner-poster" />
                 </div>` : 
                `<div class="movie-poster-container">
                   <div class="movie-banner-poster no-poster">
                     <span>🎬</span>
                   </div>
                 </div>`
              }
              <div class="movie-info-content">
                <h2 class="movie-title">${title}</h2>
                <div class="movie-rating">${ratingMatch ? ratingMatch[1] : 'No Rating'}</div>
                <div class="movie-meta-row">
                  <span class="meta-badge">${genreMatch ? genreMatch[1] : 'Unknown Genre'}</span>
                  <span class="meta-badge">${runtimeMatch ? runtimeMatch[1] : 'Unknown Runtime'}</span>
                </div>
                <p class="movie-director"><strong>Director:</strong> ${directorMatch ? directorMatch[1] : 'Unknown'}</p>
                <p class="movie-cast"><strong>Cast:</strong> ${castMatch ? castMatch[1] : 'Unknown'}</p>
                ${plotMatch ? `<p class="movie-plot">${plotMatch[1]}</p>` : ''}
              </div>
            </div>
          </div>
        </div>
      `;
      
      // Process the rest of the response with markdown
      if (restOfResponse) {
        marked.setOptions({
          breaks: true,
          gfm: true,
          headerIds: false,
          mangle: false
        });
        formattedResponse += marked.parse(restOfResponse);
      }
    } else {
      // No movie overview, just process as regular markdown
      marked.setOptions({
        breaks: true,
        gfm: true,
        headerIds: false,
        mangle: false
      });
      formattedResponse = marked.parse(text);
    }
    
    return formattedResponse;
  }

  addErrorMessage(error) {
    const messageDiv = document.createElement('div');
    messageDiv.className = 'message error-message';
    messageDiv.textContent = `Sorry, something went wrong: ${error}`;
    this.messagesContainer.appendChild(messageDiv);
    this.scrollToBottom();
  }

  displayMovieInfo(movieData) {
    if (!movieData) {
      this.movieInfoContainer.classList.remove('visible');
      return;
    }

    const { Title, Year, Rated, Genre, Director, Actors, imdbRating, Runtime, Plot, Poster } = movieData;
    
    this.movieInfoContainer.innerHTML = `
      <div class="movie-card">
        ${Poster && Poster !== 'N/A' ? 
          `<img src="${Poster}" alt="${Title} Poster" class="movie-poster" />` : 
          `<div class="movie-poster" style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); display: flex; align-items: center; justify-content: center; color: white; font-size: 18px; text-align: center;">No Image Available</div>`
        }
        <div class="movie-details">
          <h3>${Title} (${Year})</h3>
          <div class="rating">⭐ ${imdbRating !== 'N/A' ? imdbRating + '/10' : 'No Rating'}</div>
          
          <div class="movie-meta">
            <span class="meta-item"><strong>Genre:</strong> ${Genre}</span>
            <span class="meta-item"><strong>Runtime:</strong> ${Runtime}</span>
            <span class="meta-item"><strong>Rated:</strong> ${Rated}</span>
          </div>
          
          <p><strong>Director:</strong> ${Director}</p>
          <p><strong>Cast:</strong> ${Actors}</p>
          
          ${Plot !== 'N/A' ? `<div class="plot-text">"${Plot}"</div>` : ''}
        </div>
      </div>
    `;
    
    this.movieInfoContainer.classList.add('visible');
  }

  setBackgroundImage(posterUrl) {
    // Remove the background image functionality
    // The poster will now be displayed as a thumbnail in the movie card
  }

  resetBackground() {
    // Just hide the movie info container
    this.movieInfoContainer.classList.remove('visible');
  }

  scrollToBottom() {
    this.messagesContainer.scrollTop = this.messagesContainer.scrollHeight;
  }

  async handleAskQuestion() {
    const question = this.movieInput.value.trim();
    
    if (!question) {
      return;
    }

    // Add user message
    this.addMessage(question, 'user');
    
    // Clear input and disable button
    this.movieInput.value = '';
    this.askButton.disabled = true;
    this.askButton.textContent = 'Thinking...';
    
    // Add loading message
    const loadingMessage = this.addMessage('', 'ai', true);
    
    try {
      const response = await fetch(`${API_BASE_URL}/movie`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          user_prompt: question
        })
      });

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }

      const data = await response.json();
      
      // Remove loading message
      loadingMessage.remove();
      
      // Add AI response (movie overview will be included in the response)
      this.addMessage(data.ai_response, 'ai');
      
    } catch (error) {
      console.error('Error:', error);
      
      // Remove loading message
      loadingMessage.remove();
      
      // Add error message
      this.addErrorMessage(error.message);
    } finally {
      // Re-enable button
      this.askButton.disabled = false;
      this.askButton.textContent = 'Ask';
      this.movieInput.focus();
    }
  }
}

// Initialize the app when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
  new MovieReviewApp();
});
