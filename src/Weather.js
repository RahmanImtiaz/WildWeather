import { useState, useEffect } from 'react';
import axios from 'axios';
import WeatherDisplay from './WeatherDisplay';
import './App.css';
import HourlyForecast from './HourlyForecast';
import DailyForecast from './DailyForcasts';


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

      const suggestionMsg = getWeatherSuggestion(currentResponse.data.weather[0].description);

      setWeatherData({
        current: currentResponse.data,
        forecast: {
          hourly: hourlyData,
          current: {
            // Approximate UV index since it's not in the standard API apparently
            uvi: 0
          }
        },
        suggestion: suggestionMsg
      });
    } catch (error) {
      console.error('Error fetching weather data:', error);
    }
  };

  // Logic to get a weather suggestion based on weather conditions
  const getWeatherSuggestion = (description) => {
    if (description.includes("rain")) {
      return "Grab an umbrella!";
    }else if (description.includes("snow")) {
      return "It's snowing! stay warm and enjoy the atmosphere!";
    }else if (description.includes("storm")) {
      return "Thunderstorms are rolling in! Stay inside if possible, and avoid tall trees and open fields.";
    }else if (description === "clear sky") {
      return "It's nice day for a jog!";
    } else if (description === "few clouds") {
      return "Perfect weather for a walk or a trip in the park!"
    } else if (description.includes("cloud")) {
      return "It's a great time for indoor activities, or a adventurous walk outside!";
    } else if (description === "mist") {
      return "Perfect for a quiet walk, but be mindful of lower visibility!";
    }
  }

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
          <DailyForecast forecastData={weatherData.forecast.hourly} />
        </>
)}

    </div>
  );
}

export default Weather;