const API_KEY = 'd5ffb9bd2dd0714857b61ec7ef11e738'; // <-- REPLACE WITH YOUR ACTUAL KEY
// SkyFetch Weather App - Part 1

// API configuration
const BASE_URL = 'https://api.openweathermap.org/data/2.5/weather';

// DOM elements
const cityEl = document.getElementById('city');
const tempEl = document.getElementById('temperature');
const descEl = document.getElementById('description');
const iconEl = document.getElementById('weather-icon');

// Function to fetch weather data
function fetchWeather(city) {
    const url = `${BASE_URL}?q=${city}&units=metric&appid=${API_KEY}`;

    // Show loading state
    descEl.textContent = 'Loading weather data...';

    // Make API call with Axios
    axios.get(url)
        .then(function(response) {
            // Success - extract data
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

            console.log('Weather data received:', data);
        })
        .catch(function(error) {
            // Error handling
            console.error('API call failed:', error);
            descEl.textContent = 'Failed to load weather data. Please try again.';
            cityEl.textContent = 'Error';
            tempEl.textContent = '--';
            iconEl.src = '';
        });
}

// Fetch weather for a default city (London)
fetchWeather('London');