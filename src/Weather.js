import { useState, useEffect } from 'react';
import axios from 'axios';
import WeatherDisplay from './WeatherDisplay';
import './App.css';
import HourlyForecast from './HourlyForecast';



function Weather() {
  const [weatherData, setWeatherData] = useState(null);

  const API_KEY = process.env.REACT_APP_API_KEY;

  // Fetch weather data from OpenWeather API using latitude and longitede <- get this from map
  const fetchWeatherData = async (lat, lon) => {
    try {
      // Current weather data
      console.log(`Fetching weather data for coordinates: ${lat}, ${lon}`);
      const currentResponse = await axios.get(
        `https://api.openweathermap.org/data/2.5/weather?lat=${lat}&lon=${lon}&APPID=${API_KEY}&units=metric`
      );
      console.log("Current weather response:", currentResponse.data);
      
      // Use the 5-day forecast endpoint to get hourly data
      const forecastResponse = await axios.get(
        `https://api.openweathermap.org/data/2.5/forecast?lat=${lat}&lon=${lon}&appid=${API_KEY}&units=metric`
      );
      console.log("Forecast response:", forecastResponse.data);
  
      // Transform the data to match the expected structure
      const hourlyData = forecastResponse.data.list.map(item => ({
        dt: item.dt,
        temp: item.main.temp,
        weather: item.weather,
        // Other data can be added here <---- ASK group memebers
      }));
  
      setWeatherData({
        current: currentResponse.data,
        forecast: {
          hourly: hourlyData,
          current: {
            // Approximate UV index since it's not in the standard API apparently
            uvi: 0
          }
        }
      });
    } catch (error) {
      console.error('Error fetching weather data:', error);
    }
  };
  
  useEffect(() => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          fetchWeatherData(position.coords.latitude, position.coords.longitude);
        },
        (error) => {
          console.error("Error getting location:", error);
          // Fallback to default location
          fetchWeatherData(51.5074, -0.1278);
        }
      );
    } else {
        // Fallback to default location, if geolocation is not supported
        fetchWeatherData(51.5074, -0.1278);
    }
  }, []);

  return (
    <div className="weather-container">
      {weatherData && (
        <>
          <WeatherDisplay 
            data={weatherData} 
          />
          <HourlyForecast hourlyData={weatherData.forecast.hourly} />
        </>
)}

    </div>
  );
}

export default Weather;