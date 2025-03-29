/**
 * Weather.js
 * This is the main component for the Wild Weather application that handles weather data fetching,
 * state management, and rendering all sub-components.
 * 
 * This is responsible for:
 * - Fetching and managing weather data from the OpenWeatherMap API,
 * - Handling geolocation and location searches etc.
 * - Managing theme and unit preferences. 
 * - Controlling the application's layout and display.
 */


import { useState, useEffect } from 'react';
import axios from 'axios';
import WeatherDisplay from './WeatherDisplay';
import HourlyForecast from './HourlyForecast';
import DailyForecast from './DailyForcasts';
import MapSearch from './MapSearch';
import Settings from './Settings';
import DisplaySavedLocations from './DisplaySavedLocations';


/**
 * Weather Component
 * 
 * @returns {JSX.Element} The main Weather component that fetches and displays weather data.
 */
function Weather() {
  /**
   * State Variables
   */
  
  // Stores current weather and forecast data retrieved from API
  const [weatherData, setWeatherData] = useState(null);

  // Stores the current position of the map [latitude, longitude] with London as a default for fallback
  const [position, setPosition] = useState([51.5074, -0.1278]);

  // Stores the name of the location to be displayed
  const [locationName, setLocationName] = useState('London');

  // for error handling of API calls
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);

  // The users selected unit [metric, imperial] in settings, found in localStorage
  const [units, setUnits] = useState(() => {
    return localStorage.getItem('units') || 'metric';
  });
  // The users selected theme [light, dark] in settings, found in localStorage
  const [theme, setTheme] = useState(() => {
    return localStorage.getItem('theme') || 'dark';
  });

  // The API key for OpenWeatherMap, stored in .env file (for security)
  // Note: Make sure to add your API key in a .env file in the root of your project
  const API_KEY = process.env.REACT_APP_API_KEY;

  // The users saved locations, stored in localStorage
  const [savedLocations, setSavedLocations] = useState([]);
  
  /**
   * useEffect Hook
   * This hook runs when the component mounts.
   * It loads saved locations from localStorage on initial render.
   */
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

  /**
   * useEffect Hook
   * This hook runs when the theme changes.
   * It applies the selected theme (css) to the document body based on selected theme.
   */
  useEffect(() => {
    if (theme === 'light') {
      document.body.classList.add('light-theme');
    } else {
      document.body.classList.remove('light-theme');
    }
  }, [theme]);

  /**
   * This saves the current location to the saved locations section.
   * It also checks if the location name already exists in the saved locations section.
   * 
   * @param {string} locationName - The name of the location to save.
   */
  const saveLocation = (locationName) => {
    // Get current coordinates
    const lat = position[0];
    const lon = position[1];
    
    // Check if location with this name already exists
    if (locationName && !savedLocations.some(loc => loc.name === locationName)) {
      const newLocation = { name: locationName, lat, lon };
      const newSavedLocations = [...savedLocations, newLocation];
      setSavedLocations(newSavedLocations);
      localStorage.setItem('locations', JSON.stringify(newSavedLocations));
    }
  };

  /**
   * This removes a location from the saved locations section.
   * This updates the saved locations in the state and localStorage.
   * 
   * @param {Object} locationToRemove - The location object to remove from saved locations.
   */
  const removeLocation = (locationToRemove) => {
    const newSavedLocations = savedLocations.filter(loc => loc.name !== locationToRemove.name);
    setSavedLocations(newSavedLocations);
    localStorage.setItem('locations', JSON.stringify(newSavedLocations));
  };

  /**
   * This function views a saved location.
   * This then updates the map position and fetches the weather data for the new selected location.
   * 
   * @param {string} locationName - The name of the saved location that we want to view.
   * @param {number} lat - The locations latitude.
   * @param {number} lon - The locations longitude.
   */
  const viewSavedLocation = (locationName, lat, lon) => {
    if (lat && lon) {
      setPosition([lat, lon]); // Update map position
      setLocationName(locationName);
      fetchWeatherData(lat, lon, locationName);
    }
  };
  
  /**
   * This updates the theme, based on users setting choices.
   * 
   * @param {string} newTheme - The selected theme from settings. Its either light or dark mode.
   */
  const handleThemeChange = (newTheme) => {
    setTheme(newTheme);
  };

  /**
   * This function fetches weather data from the OpenWeatherMap API.
   * It takes in the longitude and latitude, which can be from the map or search (also geolocation give lat and long).
   * 
   * @param {number} lat 
   * @param {number} lon 
   * @param {string} locationName 
   */
  const fetchWeatherData = async (lat, lon, locationName,unitsParam=units) => {
    setIsLoading(true);
    setError(null);
    try {
      // Current weather data
      console.log(`Fetching weather data for coordinates: ${lat}, ${lon}`);
      const currentResponse = await axios.get(
        `https://api.openweathermap.org/data/2.5/weather?lat=${lat}&lon=${lon}&APPID=${API_KEY}&units=${unitsParam}`
      );
      console.log("Current weather response:", currentResponse.data);
      
      // Use the 5-day forecast endpoint to get hourly data
      const forecastResponse = await axios.get(
        `https://api.openweathermap.org/data/2.5/forecast?lat=${lat}&lon=${lon}&appid=${API_KEY}&units=${unitsParam}`
      );
      console.log("Forecast response:", forecastResponse.data);
  
      // Transform the data to match the expected structure (application friendly), also extracting the (3hr) hourly data
      const hourlyData = forecastResponse.data.list.map(item => ({
        dt: item.dt, // Unix timestamp
        temp: item.main.temp, // Temperature
        weather: item.weather,// Weather conditions
        wind_speed: item.wind.speed, // Wind speed
        visibility: item.visibility, // Visibility
        humidity: item.main.humidity, // Humidity
        pressure: item.main.pressure, // Atmospheric/Air pressure
        clouds: item.clouds.all, // Cloudiness - i.e. cloud cover
      }));

      // Get a suggestion based on the current weather description
      const suggestionMsg = getWeatherSuggestion(
        currentResponse.data.weather[0].description,
        currentResponse.data.main.temp,
        currentResponse.data.wind.speed,
        currentResponse.data.main.humidity
      );

      // Get country code from API response for the display
      const countryCode = currentResponse.data.sys.country;

      // Ensure the correct format for the location name with country code
      const formattedLocationName = `${locationName || currentResponse.data.name}, ${countryCode}`;

      // Save/update the current location name if provided
      if (locationName) {
        setLocationName(locationName);
      }

      // Set the final weather data object that will be used in the web app
      setWeatherData({
        current: {
          ...currentResponse.data,
          name: formattedLocationName, // Use formatted name with country code
        },
        forecast: {
          hourly: hourlyData,
          current: {
            uvi: 0 // Approximate UV index since it's not in the standard API from the student plans
          }
        },
        suggestion: suggestionMsg,
        units: units 
      });
    } catch (error) {
      console.error('Error fetching weather data:', error);
      setError('Failed to fetch weather data. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  /**
   * Provides weather-appropriate activity suggestions based on current conditions
   * @param {string} description - Weather description from API
   * @param {number} temp - Current temperature
   * @param {number} windSpeed - Current wind speed
   * @param {number} humidity - Current humidity percentage
   * @returns {string} Activity suggestion tailored to weather conditions
   */
  const getWeatherSuggestion = (description, temp, windSpeed, humidity) => {
    const isHot = temp > 30; // 30°C / 86°F
    const isWarm = temp > 20; // 20°C / 68°F
    const isCold = temp < 10; // 10°C / 50°F
    const isWindy = windSpeed > 20; // 20 km/h or 12 mph
    const isHumid = humidity > 80; // 80% humidity

    if (description.includes("rain")) {
      if (description.includes("light")) {
        return "Light rain - perfect for a quick trail run if you don't mind getting a bit wet!";
      }
      return "Rainy conditions - consider indoor climbing or check out waterproof hiking trails. Don't forget rain gear!";
    } else if (description.includes("snow")) {
      if (isCold) {
        return "Snow day! Excellent conditions for skiing, snowboarding, or snowshoeing adventures.";
      }
      return "Light snow - great for winter hiking with proper footwear. The trails will be beautiful!";
    } else if (description.includes("storm")) {
      return "Stormy weather alert! Indoor activities recommended today. Use the time to plan your next outdoor adventure.";
    } else if (description === "clear sky") {
      if (isHot) {
        return "Clear and hot! Perfect for water activities - swimming, kayaking, or paddleboarding.";
      } else if (isWarm) {
        return "Beautiful clear day! Ideal conditions for hiking, cycling, or rock climbing.";
      } else {
        return "Clear skies and cooler temperatures make this perfect for a challenging hike or trail run.";
      }
    } else if (description === "few clouds" || description.includes("scattered clouds")) {
      if (isWindy) {
        return "Partly cloudy and breezy - excellent conditions for paragliding, sailing, or kite flying!";
      }
      return "Partly cloudy - ideal weather for mountain biking, hiking, or outdoor photography.";
    } else if (description.includes("cloud")) {
      if (isHumid) {
        return "Cloudy and humid - consider a shorter hike today and bring extra water.";
      }
      return "Overcast conditions provide good protection from the sun for longer expeditions.";
    } else if (description === "mist" || description.includes("fog")) {
      return "Misty conditions add mystery to forest trails, but stick to familiar paths and bring navigation tools.";
    }

    if (isHot) {
      return "Stay hydrated and seek shaded trails during your outdoor activities today!";
    } else if (isCold) {
      return "Layer up and enjoy the crisp weather - perfect for a brisk hike without summer crowds.";
    }

    return "Great outdoor conditions today! Enjoy your adventure!";
  };

  /**
   * This function handles the location change event from the map search/selection
   * 
   * @param {number} lat - Latitude of location
   * @param {number} lon - Longitude of location
   * @param {string} locationName - selected Location name
   */
  const handleLocationChange = (lat, lon, locationName) => {
    setPosition([lat, lon]); // Update position state on map
    setLocationName(locationName || 'Unknown location');
    fetchWeatherData(lat, lon, locationName);
  };

  /**
   * This function handles the units change event from the settings.
   * It updates the units state and refetches the weather data if we have position data.
   * 
   * @param {string} newUnits - Selected units from settings - metric or imperial
   */
  const handleUnitsChange = (newUnits) => {
    setUnits(newUnits);
    
    // Refetch weather data with new units if we have position data
    if (position && position.length === 2) {
      fetchWeatherData(position[0], position[1], locationName, newUnits);
    }
  };
  
  /**
   * Effect Hook (runs when the component mounts)
   * 
   * This fetches the user's location using the Geolocation API.
   * If the Geolocation API fails, it falls back to IP-based geolocation.
   * It also fetches the weather data for the user's location (by passing in lat and long gotten).
   * 
   * 
   */
  useEffect(() => {
    const fetchUserLocation = async () => {
      if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(
          // Success callback - if geolocation is successful (user presses "Accept")
          async (position) => {
            const { latitude, longitude } = position.coords;
            console.log("User's Current Location:", latitude, longitude); // Debugging
  
            try {
              // Fetch detailed location using OpenStreetMap's Nominatim API (thats the one we are using)
              const response = await axios.get(
                `https://nominatim.openstreetmap.org/reverse?lat=${latitude}&lon=${longitude}&format=json`
              );
  
              // Check if the response contains a valid location, then extract the display name
              // and split it to get the first two parts (road name and city)
              let detailedLocation = "Unknown Location";
              if (response.data && response.data.display_name) {
                const locationParts = response.data.display_name.split(",");
                detailedLocation = locationParts.slice(0, 2).join(", ").trim(); // Get first 2 parts (road name and city)
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
          // Error callback - if geolocation fails (user presses "Deny" or an error occurs)
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
              fetchWeatherData(51.5074, -0.1278, "London"); // Final fallback to default (whch is London)
            }
          }
        );
      } else {
        console.log("Geolocation not supported, falling back to default...");
        fetchWeatherData(51.5074, -0.1278, "London");
      }
    };
  
    fetchUserLocation();
  }, []); // this is an empty dependency array to run only on mount
  
  /**
   * This is to Render the Weather component
   * It returns the main layout of the application.
   * It includes the header, map search, weather display, hourly and daily forecasts, and saved location displau
   * 
   * @returns {JSX.Element} - The rendered Weather component
   */
  return (
    <div className="weather-container">
      {/* Loading and error messages */}
      {isLoading && <div className="loading">Loading weather data...</div>}
      {error && <div className="error-message">{error}</div>}
      {/* The web-apps header with title and settings button */}
      <header>
        <h1>Wild Weather</h1>
        <Settings 
        onSavedLocationsChange={() => {
          const storedLocations = localStorage.getItem('locations');
          const parsedLocations = storedLocations ? JSON.parse(storedLocations) : [];
          setSavedLocations(Array.isArray(parsedLocations) ? parsedLocations : []);
        }}
        onUnitsChange={handleUnitsChange}
        onThemeChange={handleThemeChange}
      />
      </header>
      {/* The Map with search functionality etc. */}
      <MapSearch 
        onLocationChange={handleLocationChange} 
        initialPosition={position}
        initialLocationName={locationName}
      />
      {/* render the weather components when data is available */}
      {weatherData && (
        <>
         {/* The main weather display with the current weather conditions */}
          <WeatherDisplay 
            data={weatherData}
            savedLocations={savedLocations}
            onSaveLocation={saveLocation}
            units={units}
          />
          {/* THE Hourly forecast for the current location, also has interactive charts */}
          <HourlyForecast 
            hourlyData={weatherData.forecast.hourly} 
            units={units}
          />
          {/* The 5-day forecast with expandable details (like the (3) hourly data) */}
          <DailyForecast 
            forecastData={weatherData.forecast.hourly} 
            units={units}
          />
        </>
      )}
      {/* The saved locations */}
      <DisplaySavedLocations 
        savedLocations={savedLocations}
        onRemoveLocation={removeLocation}
        onViewLocation={viewSavedLocation}
        units={units}  // Pass units to DisplaySavedLocations
      />
    </div>
  );
}

export default Weather;