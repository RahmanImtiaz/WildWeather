import { useState } from 'react';

const DailyForecast = ({ forecastData }) => {
  const [selectedDay, setSelectedDay] = useState(null);
  
  // Group forecast data by day
  const dailyData = {};
  
  forecastData.forEach(item => {
    const date = new Date(item.dt * 1000);
    const day = date.toLocaleDateString('en-US', { weekday: 'short' });
    const dateKey = date.toISOString().split('T')[0];
    
    if (!dailyData[dateKey]) {
      dailyData[dateKey] = {
        day,
        date: date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
        fullDate: date,
        temps: [],
        icons: [],
        descriptions: [],
        items: []
      };
    }
    
    dailyData[dateKey].temps.push(item.temp);
    dailyData[dateKey].icons.push(item.weather[0].icon);
    dailyData[dateKey].descriptions.push(item.weather[0].description);
    dailyData[dateKey].items.push(item);
  });
  
  // Convert to array and take only first 5 days
  const dailyForecast = Object.values(dailyData).slice(0, 5);
  
  // Handle day selection
  const handleDayClick = (day) => {
    setSelectedDay(selectedDay === day ? null : day);
  };
  
  return (
    <div className="daily-forecast">
      <h3>5-Day Forecast</h3>
      
      <div className="daily-container">
        {dailyForecast.map((day, index) => (
          <div key={index} className={`daily-item ${selectedDay === index ? 'selected' : ''}`} 
               onClick={() => handleDayClick(index)}>
            <span className="day">{day.day}</span>
            <span className="date">{day.date}</span>
            <img 
            // finds the icon for the middle of the day - ie. avg icon or most common time - midday
              src={`https://openweathermap.org/img/wn/${day.icons[Math.floor(day.icons.length / 2)]}.png`} 
              alt={day.descriptions[Math.floor(day.descriptions.length / 2)]}
            />
            <span className="temp">{Math.round(day.temps.reduce((a, b) => a + b, 0) / day.temps.length)}°C</span>
          </div>
        ))}
      </div>
      
      
      {selectedDay !== null && (
        <div className="daily-details">
          <h4>{dailyForecast[selectedDay].day} - {dailyForecast[selectedDay].date}</h4>
          <div className="hourly-breakdown">
            {dailyForecast[selectedDay].items.map((item, idx) => (
              <div key={idx} className="hourly-item">
                <span>{new Date(item.dt * 1000).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}</span>
                <img 
                  src={`https://openweathermap.org/img/wn/${item.weather[0].icon}.png`} 
                  alt={item.weather[0].description}
                />
                <span>{Math.round(item.temp)}°C</span>
                <span className="description">{item.weather[0].description}</span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default DailyForecast;