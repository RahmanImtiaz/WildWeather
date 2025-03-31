const WeatherDisplay = ({ data, savedLocations, onSaveLocation, units, activityIndices }) => {
  const currentData = data.current;
  const forecastData = data.forecast;
  const currentDate = new Date().toLocaleDateString('en-US', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });
  const suggestion = data.suggestion;

  const formatTime = (timestamp) => {
    return new Date(timestamp * 1000).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  // Function to save the current location
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

  return (
    <div className="weather-card">
      <h2>{data.current.name.split(",").slice(0, 2).join(", ")}</h2>
      <h3>{currentDate}</h3>
      
      <div className="weather-details">
        <img 
          src={`https://openweathermap.org/img/wn/${currentData.weather[0].icon}@2x.png`} 
          alt={currentData.weather[0].description}
        />
        <div className="main-weather">
          <p className="temperature">{Math.round(currentData.main.temp)}{tempUnit}</p>
          <p>{currentData.weather[0].description}</p>
          <p>Feels like: {Math.round(currentData.main.feels_like)}{tempUnit}</p>
          
        </div>
        
        <div className="weather-metrics">
          <p>Wind Speed <span className="metric-value">{currentData.wind.speed} {windSpeedUnit}</span></p>
          <p>Visibility <span className="metric-value">{visibilityValue} {visibilityUnit}</span></p>
          <p>Humidity <span className="metric-value">{currentData.main.humidity}%</span></p>
          <p>Air Pressure <span className="metric-value">{currentData.main.pressure} hPa</span></p>
          <p>UV Index <span className="metric-value">{forecastData.current.uvi}</span></p>
          <p>Cloudiness <span className="metric-value">{currentData.clouds.all}%</span></p>
        </div>
      </div>

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

      <div className="suggestion">{suggestion}</div>
      
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