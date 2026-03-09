const API_KEY = 'd5ffb9bd2dd0714857b61ec7ef11e738'; // <-- REPLACE WITH YOUR ACTUAL KEY
// SkyFetch Weather App - Part 2
// OpenWeatherMap API with Async/Await

// API configuration
const BASE_URL = 'https://api.openweathermap.org/data/2.5/weather';

// DOM elements
const cityEl = document.getElementById('city');
const tempEl = document.getElementById('temperature');
const descEl = document.getElementById('description');
const iconEl = document.getElementById('weather-icon');
const cityInput = document.getElementById('city-input');
const searchBtn = document.getElementById('search-btn');
const loadingSpinner = document.getElementById('loading-spinner');
const errorMessage = document.getElementById('error-message');
const weatherContent = document.getElementById('weather-content');

// ===== Utility Functions =====

// Show/hide loading spinner
function showLoading(show) {
    if (show) {
        loadingSpinner.classList.remove('hidden');
        weatherContent.classList.add('hidden');
        searchBtn.disabled = true;
    } else {
        loadingSpinner.classList.add('hidden');
        weatherContent.classList.remove('hidden');
        searchBtn.disabled = false;
    }
}

// Show error message
function showError(message) {
    errorMessage.textContent = message;
    errorMessage.classList.remove('hidden');
    weatherContent.classList.add('hidden');
}

// Hide error message
function hideError() {
    errorMessage.classList.add('hidden');
}

// ===== Main Weather Fetch Function (Async/Await) =====
async function fetchWeather(city) {
    // Validate input
    if (!city || city.trim() === '') {
        showError('Please enter a city name');
        return;
    }

    // Clean the city name
    const cleanCity = city.trim();
    
    // Show loading state
    showLoading(true);
    hideError();
    
    try {
        // Build URL with metric units for Celsius
        const url = `${BASE_URL}?q=${encodeURIComponent(cleanCity)}&units=metric&appid=${API_KEY}`;
        
        console.log('Fetching weather for:', cleanCity);
        
        // Make API call with await
        const response = await axios.get(url);
        
        // If we get here, the request succeeded
        console.log('Weather data received:', response.data);
        
        // Extract data from response
        const data = response.data;
        const cityName = data.name;
        const temperature = Math.round(data.main.temp);
        const description = data.weather[0].description;
        const iconCode = data.weather[0].icon;
        const iconUrl = `https://openweathermap.org/img/wn/${iconCode}@2x.png`;
        
        // Update DOM
        cityEl.textContent = cityName;
        tempEl.textContent = temperature;
        descEl.textContent = description;
        iconEl.src = iconUrl;
        iconEl.alt = description;
        
        // Hide loading, show content
        showLoading(false);
        
    } catch (error) {
        // Handle errors
        console.error('API call failed:', error);
        
        // Hide loading
        showLoading(false);
        
        // Show appropriate error message
        if (error.response) {
            // The request was made and the server responded with a status code
            // that falls out of the range of 2xx
            if (error.response.status === 404) {
                showError(`City "${cleanCity}" not found. Please check the spelling.`);
            } else if (error.response.status === 401) {
                showError('Invalid API key. Please check your OpenWeatherMap API key.');
            } else {
                showError(`Error: ${error.response.data.message || 'Something went wrong'}`);
            }
        } else if (error.request) {
            // The request was made but no response was received
            showError('Network error. Please check your internet connection.');
        } else {
            // Something happened in setting up the request that triggered an Error
            showError('An error occurred. Please try again.');
        }
    }
}

// ===== Event Handlers =====

// Handle search button click
function handleSearch() {
    const city = cityInput.value;
    fetchWeather(city);
}

// Handle Enter key in input
function handleKeyPress(event) {
    if (event.key === 'Enter') {
        handleSearch();
    }
}

// ===== Initialize App =====
function init() {
    // Load default city (London) on page load
    fetchWeather('London');
    
    // Add event listeners
    searchBtn.addEventListener('click', handleSearch);
    cityInput.addEventListener('keypress', handleKeyPress);
    
    console.log('SkyFetch initialized!');
}

// Start the app
init();