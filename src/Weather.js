import { useState, useEffect } from 'react';
import axios from 'axios';
import WeatherDisplay from './WeatherDisplay';
import './App.css';
import HourlyForecast from './HourlyForecast';
import DailyForecast from './DailyForcasts';
import MapSearch from './MapSearch';
import Settings from './Settings';
import DisplaySavedLocations from './DisplaySavedLocations';

function Weather() {
  const [weatherData, setWeatherData] = useState(null);
  const [position, setPosition] = useState([51.5074, -0.1278]); // Default London
  const [locationName, setLocationName] = useState('London');
  // for error handling of API calls
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);

  const API_KEY = process.env.REACT_APP_API_KEY;
  const [savedLocations, setSavedLocations] = useState([]);
    // Load saved locations from localStorage when component mounts
    useEffect(() => {
      const storedLocations = localStorage.getItem('locations');
      if (storedLocations) {
        try {
          const parsedLocations = JSON.parse(storedLocations);
          if (Array.isArray(parsedLocations)) {
            setSavedLocations(parsedLocations);
          }
        } catch (e) {
          console.error('Error parsing saved locations:', e);
          localStorage.setItem('locations', JSON.stringify([]));
        }
      }
    }, []);
  
    // Function to save a location
    const saveLocation = (locationName) => {
      if (locationName && !savedLocations.includes(locationName)) {
        const newSavedLocations = [...savedLocations, locationName];
        setSavedLocations(newSavedLocations);
        localStorage.setItem('locations', JSON.stringify(newSavedLocations));
      }
    };
  
    // Function to remove a location
    const removeLocation = (locationName) => {
      const newSavedLocations = savedLocations.filter(loc => loc !== locationName);
      setSavedLocations(newSavedLocations);
      localStorage.setItem('locations', JSON.stringify(newSavedLocations));
    };
  
    // Function to view a saved location
    const viewSavedLocation = (locationName) => {
      setLocationName(locationName);
      fetchWeatherData(position[0], position[1], locationName);
    };
  // Fetch weather data from OpenWeather API using latitude and longitede <- get this from map
  const fetchWeatherData = async (lat, lon, locationName) => {
    setIsLoading(true);
    setError(null);
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
        wind_speed: item.wind.speed,
        visibility: item.visibility,
        humidity: item.main.humidity,
        pressure: item.main.pressure,
        clouds: item.clouds.all,
        // Other data can be added here <---- ASK group memebers
      }));

      const suggestionMsg = getWeatherSuggestion(currentResponse.data.weather[0].description);

       // Get country code from API response
      const countryCode = currentResponse.data.sys.country;

       // Ensure the correct format for the location name
      const formattedLocationName = `${locationName || currentResponse.data.name}, ${countryCode}`;

      // Save the current location name if provided
      if (locationName) {
        setLocationName(locationName);
      }

      setWeatherData({
        current: {
          ...currentResponse.data,
          name: formattedLocationName, // Use formatted name with country code
        },
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
      setError('Failed to fetch weather data. Please try again.');
    } finally {
      setIsLoading(false);
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
    return "Enjoy your day!"; // Default suggestion
  }

   // Logic to update weather data based on location search from the map
   const handleLocationChange = (lat, lon, locationName) => {
    setPosition([lat, lon]); // Update position state on map
    setLocationName(locationName || 'Unknown location');
    fetchWeatherData(lat, lon, locationName);
  };

  useEffect(() => {
    const fetchUserLocation = async () => {
      if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(
          async (position) => {
            const { latitude, longitude } = position.coords;
            console.log("User's Current Location:", latitude, longitude); // Debugging
  
            try {
              // Fetch detailed location using OpenStreetMap's Nominatim API
              const response = await axios.get(
                `https://nominatim.openstreetmap.org/reverse?lat=${latitude}&lon=${longitude}&format=json`
              );
  
              let detailedLocation = "Unknown Location";
              if (response.data && response.data.display_name) {
                const locationParts = response.data.display_name.split(",");
                detailedLocation = locationParts.slice(0, 2).join(", ").trim(); // Get first 2 parts
              }
  
              console.log("Fetched Location:", detailedLocation); // Debugging
  
              // Update state with the user's actual location
              setPosition([latitude, longitude]);
              setLocationName(detailedLocation);
              fetchWeatherData(latitude, longitude, detailedLocation);
            } catch (error) {
              console.error("Error fetching location:", error);
              setLocationName("Unknown Location");
            }
          },
          async (error) => {
            console.error("Geolocation error:", error);
            console.log("Falling back to IP-based location...");
  
            // Use IP-based geolocation if GPS fails
            try {
              const ipResponse = await axios.get("https://ipapi.co/json/");
              const ipLocation = `${ipResponse.data.city}, ${ipResponse.data.country}`;
              setPosition([ipResponse.data.latitude, ipResponse.data.longitude]);
              setLocationName(ipLocation);
              fetchWeatherData(ipResponse.data.latitude, ipResponse.data.longitude, ipLocation);
            } catch (err) {
              console.error("IP Geolocation Error:", err);
              fetchWeatherData(51.5074, -0.1278, "London"); // Final fallback to default
            }
          }
        );
      } else {
        console.log("Geolocation not supported, falling back to default...");
        fetchWeatherData(51.5074, -0.1278, "London");
      }
    };
  
    fetchUserLocation();
  }, []);
  
  return (
    <div className="weather-container">
      <Settings onSavedLocationsChange={() => {
        const storedLocations = localStorage.getItem('locations');
        const parsedLocations = storedLocations ? JSON.parse(storedLocations) : [];
        setSavedLocations(Array.isArray(parsedLocations) ? parsedLocations : []);
      }} />
      <MapSearch 
      onLocationChange={handleLocationChange} 
      initialPosition={position}
      initialLocationName={locationName}
      /> {/* New map and search functionality */}
      {weatherData && (
        <>
          <WeatherDisplay 
            data={weatherData}
            savedLocations={savedLocations}
            onSaveLocation={saveLocation}
          />
          <HourlyForecast hourlyData={weatherData.forecast.hourly} />
          <DailyForecast forecastData={weatherData.forecast.hourly} />
        </>
        
      )}
      <DisplaySavedLocations 
        savedLocations={savedLocations}
        onRemoveLocation={removeLocation}
        onViewLocation={viewSavedLocation}
      />
    </div>
  );
}

export default Weather;