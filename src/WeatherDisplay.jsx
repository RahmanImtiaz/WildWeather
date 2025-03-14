const WeatherDisplay = ({ data, savedLocations, onSaveLocation, units }) => {
  const currentData = data.current;
  const forecastData = data.forecast;
  const currentDate = new Date().toLocaleDateString('en-US', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });
  const suggestion = data.suggestion;
  
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
          <p>{suggestion}</p>
        </div>
        
        <div className="weather-metrics">
          <p>Wind Speed: {currentData.wind.speed} {windSpeedUnit}</p>
          <p>Visibility: {visibilityValue} {visibilityUnit}</p>
          <p>Humidity: {currentData.main.humidity}%</p>
          <p>Air Pressure: {currentData.main.pressure} hPa</p>
          <p>UV Index: {forecastData.current.uvi}</p>
          <p>Cloudiness: {currentData.clouds.all}%</p>
        </div>
      </div>
      
      <button 
        onClick={saveLocation} 
        disabled={savedLocations.includes(currentData.name)}
      >
        {savedLocations.includes(currentData.name) ? 'Saved' : 'Save Location'}
      </button>
    </div>
  );
};

export default WeatherDisplay; // Ensure default export
// currentData.name