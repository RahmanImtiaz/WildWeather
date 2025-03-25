# WildWeather

A comprehensive weather application designed for outdoor enthusiasts that provides real-time weather data, forecasts, and location-based weather information with an interactive map interface. This have additional features suited for outdoor enthusiasts, like an interactive map, other weather data to help plan activities, the option to save desired location (for future routes or activities) and a more detailed chart to view hourly data.


## Features
LIST THEM OUT - HAVENT DONE

## Prerequisites

Before you begin, ensure you have:
- [Node.js](https://nodejs.org/) (v14 or higher)
- npm (v6 or higher)
- An OpenWeatherMap API key ([Get one here](https://openweathermap.org/api))

## Installation

1. Clone the repository:
   ```
   git clone <repository-url>
   cd weather-app
   ```

2. Install dependencies:
   ```
   npm install
   ```

3. Set up environment variables:
   ```
   cp .env.example .env
   ```

4. Edit the `.env` file and add your OpenWeatherMap API key:
   ```
   REACT_APP_API_KEY=your_openweathermap_api_key_here
   ```

5. Start the development server:
   ```
   npm start
   ```

6. Open [http://localhost:3000](http://localhost:3000) to view the app in your browser

## Dependencies

This project relies on the following key dependencies:

- **React v19.0.0**: Core UI framework
- **axios v1.8.2**: HTTP client for API requests
- **chart.js v4.4.8**: Charting library for visualizing weather data
- **react-chartjs-2 v5.3.0**: React components for Chart.js
- **leaflet v1.9.4**: Interactive mapping library
- **react-leaflet v5.0.0**: React components for Leaflet maps
- **react-select v5.10.1**: Enhanced select inputs for location search

For a complete list of dependencies, see the `package.json` file.

## Usage Guide

### Current Weather
The main dashboard displays:


### Finding Weather by Location


### Interactive Charts for other data (such as wind speed etc)


### 5-Day Forecast


### Saving Locations


### Settings & Customization



## API Usage

This application uses the following APIs:
- [OpenWeatherMap API](https://openweathermap.org/api) for weather data
- [OpenStreetMap/Nominatim API](https://nominatim.org/) for geocoding and reverse geocoding
- [ipapi.co](https://ipapi.co/) as a fallback for location data

## Browser Support

WildWeather supports all modern browsers, including:
- Google Chrome (latest 2 versions)
- Mozilla Firefox (latest 2 versions)
- Safari (latest 2 versions)
- Microsoft Edge (latest 2 versions)


## Troubleshooting

### API Key Issues
- Make sure your OpenWeatherMap API key is correctly set in the `.env` file
- Ensure you have an active subscription if you're using premium API features

### Geolocation Problems
- Check that you've allowed location permissions in your browser
- If geolocation fails, the app will fall back to IP-based location detection

### Map Loading Issues
- Ensure your internet connection is stable
- If the map fails to load, try refreshing the page or clearing your browser cache

## Acknowledgements

- Weather data provided by [OpenWeatherMap](https://openweathermap.org/)
- Map data from [OpenStreetMap](https://www.openstreetmap.org/)
- Icons and design inspiration from various sources

