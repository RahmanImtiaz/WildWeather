const WeatherDisplay = ({ data, onSave }) => {
  const currentData = data.current;
  const forecastData = data.forecast;
  const currentDate = new Date().toLocaleDateString('en-US', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });

  return (
    <div className="weather-card">
      <h2>{currentData.name}</h2>
      <h3>{currentDate}</h3>
      
      <div className="weather-details">
        <img 
          src={`https://openweathermap.org/img/wn/${currentData.weather[0].icon}@2x.png`} 
          alt={currentData.weather[0].description}
        />
        <div className="main-weather">
          <p className="temperature">{Math.round(currentData.main.temp)}°C</p>
          <p>{currentData.weather[0].description}</p>
          <p>Feels like: {Math.round(currentData.main.feels_like)}°C</p>
          <p>SUGGESTION MESSAGE!!!!</p>
        </div>
        
        <div className="weather-metrics">
          <p>Wind Speed : {currentData.wind.speed}m/s</p>
          <p>Visibility: {(currentData.visibility / 1000).toFixed(1)} km</p>
          <p>Humidity: {currentData.main.humidity}%</p>
          <p>Air Pressure : {currentData.main.pressure}</p>
          <p>UV Index: {forecastData.current.uvi}</p>
          <p>Cloudiness: {currentData.clouds.all}%</p>
        </div>
      </div>
      
      <button onClick={onSave} className="save-button">Save Location</button>
    </div>
  );
};

export default WeatherDisplay; // Ensure default export