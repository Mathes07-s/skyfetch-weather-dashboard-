// ===== PART 4: SkyFetch Weather App – Final Version with localStorage =====

function WeatherApp() {
    // API configuration
    this.API_KEY = 'd5ffb9bd2dd0714857b61ec7ef11e738';  // Replace with your key
    this.BASE_URL = 'https://api.openweathermap.org/data/2.5/weather';
    this.FORECAST_URL = 'https://api.openweathermap.org/data/2.5/forecast';

    // DOM elements
    this.cityEl = document.getElementById('city');
    this.tempEl = document.getElementById('temperature');
    this.descEl = document.getElementById('description');
    this.iconEl = document.getElementById('weather-icon');
    this.cityInput = document.getElementById('city-input');
    this.searchBtn = document.getElementById('search-btn');
    this.loadingSpinner = document.getElementById('loading-spinner');
    this.errorMessage = document.getElementById('error-message');
    this.weatherContent = document.getElementById('weather-content');
    this.forecastSection = document.getElementById('forecast-section');
    this.forecastContainer = document.getElementById('forecast-container');
    this.recentSearchesContainer = document.getElementById('recent-searches-container');
    this.recentSearchesDiv = document.getElementById('recent-searches');
    this.clearHistoryBtn = document.getElementById('clear-history-btn');

    // localStorage data
    this.recentSearches = [];   // array of city names
    this.lastCity = null;        // last searched city
}

// ===== Utility Methods =====
WeatherApp.prototype.showLoading = function(show) {
    if (show) {
        this.loadingSpinner.classList.remove('hidden');
        this.weatherContent.classList.add('hidden');
        if (this.forecastSection) this.forecastSection.classList.add('hidden');
        this.searchBtn.disabled = true;
    } else {
        this.loadingSpinner.classList.add('hidden');
        this.weatherContent.classList.remove('hidden');
        this.searchBtn.disabled = false;
    }
};

WeatherApp.prototype.showError = function(message) {
    this.errorMessage.textContent = message;
    this.errorMessage.classList.remove('hidden');
    this.weatherContent.classList.add('hidden');
    if (this.forecastSection) this.forecastSection.classList.add('hidden');
};

WeatherApp.prototype.hideError = function() {
    this.errorMessage.classList.add('hidden');
};

WeatherApp.prototype.showWelcome = function() {
    this.cityEl.textContent = 'SkyFetch';
    this.tempEl.textContent = '--';
    this.descEl.textContent = 'Enter a city to begin';
    this.iconEl.src = '';
};

// ===== localStorage Methods =====
WeatherApp.prototype.loadRecentSearches = function() {
    const stored = localStorage.getItem('recentSearches');
    this.recentSearches = stored ? JSON.parse(stored) : [];
    this.displayRecentSearches();
};

WeatherApp.prototype.saveRecentSearch = function(city) {
    if (!city) return;
    // Convert to title case (first letter uppercase, rest lowercase)
    const formattedCity = city
        .split(' ')
        .map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
        .join(' ');

    // Remove if already exists (to avoid duplicates and move to front)
    this.recentSearches = this.recentSearches.filter(c => c !== formattedCity);
    // Add to front
    this.recentSearches.unshift(formattedCity);
    // Keep only the last 5
    if (this.recentSearches.length > 5) this.recentSearches.pop();

    // Save to localStorage
    localStorage.setItem('recentSearches', JSON.stringify(this.recentSearches));
    this.displayRecentSearches();
};

WeatherApp.prototype.displayRecentSearches = function() {
    if (this.recentSearches.length === 0) {
        this.recentSearchesContainer.classList.add('hidden');
        return;
    }
    this.recentSearchesContainer.classList.remove('hidden');
    let html = '';
    this.recentSearches.forEach(city => {
        html += `<button class="recent-btn" data-city="${city}">${city}</button>`;
    });
    this.recentSearchesDiv.innerHTML = html;

    // Attach click handlers to each button
    const buttons = this.recentSearchesDiv.querySelectorAll('.recent-btn');
    buttons.forEach(btn => {
        btn.addEventListener('click', () => {
            const city = btn.dataset.city;
            this.cityInput.value = city;
            this.getWeather(city);
        });
    });
};

WeatherApp.prototype.loadLastCity = function() {
    const lastCity = localStorage.getItem('lastCity');
    if (lastCity) {
        this.cityInput.value = lastCity;
        this.getWeather(lastCity);
    } else {
        this.showWelcome();
    }
};

WeatherApp.prototype.clearHistory = function() {
    this.recentSearches = [];
    localStorage.removeItem('recentSearches');
    localStorage.removeItem('lastCity');
    this.displayRecentSearches();
    this.showWelcome();
    this.cityInput.value = '';
};

// ===== Main Weather Fetch =====
WeatherApp.prototype.getWeather = async function(city) {
    if (!city || city.trim() === '') {
        this.showError('Please enter a city name');
        return;
    }

    const cleanCity = city.trim();
    this.showLoading(true);
    this.hideError();

    try {
        const weatherUrl = `${this.BASE_URL}?q=${encodeURIComponent(cleanCity)}&units=metric&appid=${this.API_KEY}`;
        const forecastUrl = `${this.FORECAST_URL}?q=${encodeURIComponent(cleanCity)}&units=metric&appid=${this.API_KEY}`;

        console.log('Fetching weather and forecast for:', cleanCity);

        const [weatherResponse, forecastResponse] = await Promise.all([
            axios.get(weatherUrl),
            axios.get(forecastUrl)
        ]);

        this.displayWeather(weatherResponse.data);
        this.displayForecast(forecastResponse.data);

        // Save to recent searches and last city
        this.saveRecentSearch(cleanCity);
        localStorage.setItem('lastCity', cleanCity);

    } catch (error) {
        console.error('API call failed:', error);
        this.showLoading(false);

        if (error.response) {
            if (error.response.status === 404) {
                this.showError(`City "${cleanCity}" not found. Please check the spelling.`);
            } else if (error.response.status === 401) {
                this.showError('Invalid API key. Check your OpenWeatherMap API key.');
            } else {
                this.showError(`Error: ${error.response.data.message || 'Something went wrong'}`);
            }
        } else if (error.request) {
            this.showError('Network error. Check your internet connection.');
        } else {
            this.showError('An error occurred. Please try again.');
        }
    }
};

// ===== Display Current Weather =====
WeatherApp.prototype.displayWeather = function(data) {
    const cityName = data.name;
    const temperature = Math.round(data.main.temp);
    const description = data.weather[0].description;
    const iconCode = data.weather[0].icon;
    const iconUrl = `https://openweathermap.org/img/wn/${iconCode}@2x.png`;

    this.cityEl.textContent = cityName;
    this.tempEl.textContent = temperature;
    this.descEl.textContent = description;
    this.iconEl.src = iconUrl;
    this.iconEl.alt = description;

    this.showLoading(false);
};

// ===== Process and Display 5‑Day Forecast =====
WeatherApp.prototype.processForecastData = function(forecastData) {
    const dailyForecasts = [];
    const seenDates = new Set();

    for (const item of forecastData.list) {
        const date = item.dt_txt.split(' ')[0];
        if (!seenDates.has(date) && item.dt_txt.includes('12:00:00')) {
            seenDates.add(date);
            dailyForecasts.push(item);
        }
        if (dailyForecasts.length === 5) break;
    }

    if (dailyForecasts.length < 5) {
        const fallbackDates = new Set();
        for (const item of forecastData.list) {
            const date = item.dt_txt.split(' ')[0];
            if (!fallbackDates.has(date)) {
                fallbackDates.add(date);
                if (!dailyForecasts.some(f => f.dt_txt.split(' ')[0] === date)) {
                    dailyForecasts.push(item);
                }
            }
            if (dailyForecasts.length === 5) break;
        }
    }

    return dailyForecasts.slice(0, 5);
};

WeatherApp.prototype.displayForecast = function(forecastData) {
    const daily = this.processForecastData(forecastData);
    this.forecastSection.classList.remove('hidden');

    let html = '';
    daily.forEach(day => {
        const date = new Date(day.dt_txt);
        const dayName = date.toLocaleDateString('en-US', { weekday: 'short' });
        const temp = Math.round(day.main.temp);
        const description = day.weather[0].description;
        const iconCode = day.weather[0].icon;
        const iconUrl = `https://openweathermap.org/img/wn/${iconCode}.png`;

        html += `
            <div class="forecast-card">
                <div class="forecast-day">${dayName}</div>
                <img class="forecast-icon" src="${iconUrl}" alt="${description}">
                <div class="forecast-temp">${temp}°C</div>
                <div class="forecast-desc">${description}</div>
            </div>
        `;
    });

    this.forecastContainer.innerHTML = html;
};

// ===== Event Handlers =====
WeatherApp.prototype.handleSearch = function() {
    const city = this.cityInput.value;
    this.getWeather(city);
};

WeatherApp.prototype.handleKeyPress = function(event) {
    if (event.key === 'Enter') {
        this.handleSearch();
    }
};

// ===== Initialization =====
WeatherApp.prototype.init = function() {
    // Load recent searches from localStorage
    this.loadRecentSearches();
    // Load last searched city (if any)
    this.loadLastCity();

    // Event listeners
    this.searchBtn.addEventListener('click', this.handleSearch.bind(this));
    this.cityInput.addEventListener('keypress', this.handleKeyPress.bind(this));
    this.clearHistoryBtn.addEventListener('click', this.clearHistory.bind(this));

    console.log('WeatherApp initialized with localStorage');
};

// ===== Start the app =====
const app = new WeatherApp();
app.init();