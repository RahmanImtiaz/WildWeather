/**
 * WeatherDisplay.jsx
 * This component displays the current weather conditions for a selected location.
 * It provides a comprehensive view of weather metrics including temperature, 
 * description, wind speed, visibility, and other important measurements.
 * 
 * This is responsible for:
 * - Rendering the main weather card with current conditions
 * - Formatting and displaying all weather metrics in appropriate units
 * - Converting units between metric and imperial systems
 * - Displaying personalized weather suggestions based on conditions
 * - Handling the saving of locations to local storage
 * - Showing sunrise/sunset information
 */


/**
 * WeatherDisplay Component
 * 
 * @param {Object} props - Component props
 * @param {Object} props.data - Weather data containing current conditions and forecast
 * @param {Array} props.savedLocations - Array of locations saved by the user
 * @param {Function} props.onSaveLocation - Callback function to save current location
 * @param {String} props.units - Temperature units ('metric' or 'imperial')
 * @returns {JSX.Element} The rendered WeatherDisplay component
 */
const WeatherDisplay = ({ data, savedLocations, onSaveLocation, units }) => {
  // Extract required data from props
  const currentData = data.current;
  const forecastData = data.forecast;

  // Format the current date for display
  const currentDate = new Date().toLocaleDateString('en-US', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });

  // Get the suggestion based on the weather conditions
  const suggestion = data.suggestion;

  /**
   * Formats UNIX timestamp to readable time (HH:MM format)
   * Used for sunrise and sunset times in the weather card
   * 
   * @param {Number} timestamp - UNIX timestamp in seconds
   * @returns {String} Formatted time string (e.g., "07:23")
   */
  const formatTime = (timestamp) => {
    return new Date(timestamp * 1000).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  /**
   * Function to handle saving the current location to local storage
   * Calls the parent component's onSaveLocation function with the location name
   */
  const saveLocation = () => {
    if (currentData && currentData.name) {
      onSaveLocation(currentData.name);
    }
  };

  // Get the appropriate temperature unit symbol
  const tempUnit = units === 'metric' ? '°C' : '°F';

  // Get the appropriate wind speed unit
  const windSpeedUnit = units === 'metric' ? 'm/s' : 'mph';

  // Convert visibility to appropriate unit (km or miles)
  const visibilityValue = units === 'metric' 
    ? (currentData.visibility / 1000).toFixed(1)
    : (currentData.visibility / 1609).toFixed(1);
  const visibilityUnit = units === 'metric' ? 'km' : 'mi';

  /**
   * This renders the WeatherDisplay component
   * Displays current weather conditions with all metrics and a customized suggestion
   * Also shows the sunrise/sunset times and a button to save the location
   * 
   * @returns {JSX.Element} - The rendered WeatherDisplay component
   */
  return (
    <div className="weather-card">
      {/* Location name and current date */}
      <h2>{data.current.name.split(",").slice(0, 2).join(", ")}</h2>
      <h3>{currentDate}</h3>
      
      <div className="weather-details">
        {/* Weather icon */}
        <img 
          src={`https://openweathermap.org/img/wn/${currentData.weather[0].icon}@2x.png`} 
          alt={currentData.weather[0].description}
        />
        {/* Main temperature and description */}
        <div className="main-weather">
          <p className="temperature">{Math.round(currentData.main.temp)}{tempUnit}</p>
          <p>{currentData.weather[0].description}</p>
          <p>Feels like: {Math.round(currentData.main.feels_like)}{tempUnit}</p>
        </div>

        {/* Detailed weather metrics grid */}
        <div className="weather-metrics">
          <p>Wind Speed <span className="metric-value">{currentData.wind.speed} {windSpeedUnit}</span></p>
          <p>Visibility <span className="metric-value">{visibilityValue} {visibilityUnit}</span></p>
          <p>Humidity <span className="metric-value">{currentData.main.humidity}%</span></p>
          <p>Air Pressure <span className="metric-value">{currentData.main.pressure} hPa</span></p>
          <p>UV Index <span className="metric-value">{forecastData.current.uvi}</span></p>
          <p>Cloudiness <span className="metric-value">{currentData.clouds.all}%</span></p>
        </div>
      </div>

      {/* Sunrise and sunset information */} 
      <div className="sun-times">
        <div className="sunrise">
          <h4>Sunrise</h4>
          <p>{formatTime(currentData.sys.sunrise)}</p>
        </div>
        <div className="sunset">
          <h4>Sunset</h4>
          <p>{formatTime(currentData.sys.sunset)}</p>
        </div>
      </div>

      {/* Personalized weather suggestion for outdoor activities */}
      <div className="suggestion">{suggestion}</div>
      
      {/* Button to save location, disabled if already saved */}
      <button 
        onClick={saveLocation} 
        disabled={savedLocations.some(location => location.name === currentData.name)}
      >
        {savedLocations.some(location => location.name === currentData.name) ? 'Saved' : 'Save Location'}
      </button>
    </div>
  );
};

export default WeatherDisplay;