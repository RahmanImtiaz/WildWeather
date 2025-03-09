import { useState } from 'react';

const HourlyForecast = ({ hourlyData }) => {
  const [showDetailedChart, setShowDetailedChart] = useState(false);
  
  // Format hourly data for display
  const next24Hours = hourlyData.slice(0, 24);

  return (
    <div className="hourly-forecast">
      <h3>Hourly Forecast</h3>
      <div className="hourly-scrollable">
        {next24Hours.map((hour, index) => (
          <div key={index} className="hourly-item">
            <span>{new Date(hour.dt * 1000).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}</span>
            <img 
              src={`https://openweathermap.org/img/wn/${hour.weather[0].icon}.png`} 
              alt={hour.weather[0].description}
            />
            <span>{Math.round(hour.temp)}°C</span>
          </div>
        ))}
      </div>
    </div>
  );
};

export default HourlyForecast;