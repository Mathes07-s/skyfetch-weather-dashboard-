

// ===== PART 3: SkyFetch Weather App (OOP with Prototypes) =====

function WeatherApp() {
    // API configuration
    this.API_KEY = 'd5ffb9bd2dd0714857b61ec7ef11e738';      // <-- REPLACE WITH YOUR KEY
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
    this.showWelcome();
    this.searchBtn.addEventListener('click', this.handleSearch.bind(this));
    this.cityInput.addEventListener('keypress', this.handleKeyPress.bind(this));
    console.log('WeatherApp initialized (OOP version)');
};

// ===== Start the app =====
const app = new WeatherApp();
app.init();