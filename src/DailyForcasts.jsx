/**
 * DailyForcasts.jsx
 * 
 * This component renders a 5-day weather forecast with expandable details.
 * It processes hourly forecast data into daily groupings and displays them
 * in an interactive format, allowing users to click on any day to view
 * detailed hourly breakdown.
 * 
 * The component follows responsive design principles and implements
 * Gestalt's principle of proximity (Lecture week 8) by grouping related weather information.
 */

import { useState } from 'react';

/**
 * DailyForecast Component
 * 
 * @param {Object} props - Component called props 
 * @param {Array} props.forecastData - Array of hourly forecast data
 * @param {string} props.units - Current temperature units [metric or imperial]
 * @returns {JSX.Element} - Rendered 5-day forecast with expandable daily details
 */
const DailyForecast = ({ forecastData, units }) => {
  /**
   * State variables
   */

  // State to track wich day is selected 
  const [selectedDay, setSelectedDay] = useState(null);
  
  // Get the appropriate temperature unit symbol (based on user's preference - metric or imperial)
  const tempUnit = units === 'metric' ? '°C' : '°F';

  // Group hourly forecast data into daily data 
  // Keys are date strings in ISO format (YYYY-MM-DD)
  // Values are objects containing daily weather data
  const dailyData = {};
  
  /**
   * Iterate through the forecast data and group by date
   * Each entry contains:
   * - day: Short name of the day (e.g., Mon, Tue)
   * - date: Short date format (e.g., Jan 1)
   * - fullDate: Full date object - used for sorting
   * - temps: Array of temperatures for the day
   * - icons: Array of weather icons for the day
   * - descriptions: Array of weather descriptions for the day
   * - items: Array of all hourly data for the day
   * 
   */
  forecastData.forEach(item => {
    const date = new Date(item.dt * 1000);
    const day = date.toLocaleDateString('en-US', { weekday: 'short' });
    const dateKey = date.toISOString().split('T')[0];
    
    // Initialize day data structure if it doesn't exist already
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
    
    // Push data into the respective arrays
    dailyData[dateKey].temps.push(item.temp);
    dailyData[dateKey].icons.push(item.weather[0].icon);
    dailyData[dateKey].descriptions.push(item.weather[0].description);
    dailyData[dateKey].items.push(item);
  });
  
  // Convert the dailyData object to an array and limit to 5 days (sort is also done here implicitly)
  const dailyForecast = Object.values(dailyData).slice(0, 5);
  
  // Handle the day-click selection to toggle the selected day
  const handleDayClick = (day) => {
    setSelectedDay(selectedDay === day ? null : day);
  };

  /**
   * This is to render the daily forecast component
   * It includes a title, a list of daily forecast items, 
   * an expandable section for detailed hourly breakdown (where each day shows the average temperature, weather icon, and date)
   * and when Clicking on a day, it expands to show hourly details
   * 
   * @returns {JSX.Element} - Rendered daily forecast component
   */
  return (
    <div className="daily-forecast">
      <h3>5-Day Forecast</h3>
      
      {/* Container for the 5-day summary items */}
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
            {/* Calculate and display average temperature for the day */}
            <span className="temp">{Math.round(day.temps.reduce((a, b) => a + b, 0) / day.temps.length)}{tempUnit}</span>
          </div>
        ))}
      </div>
      
      {/* Expandable section with hourly details for selected day */}
      {selectedDay !== null && (
        <div className="daily-details">
          <h4>{dailyForecast[selectedDay].day} - {dailyForecast[selectedDay].date}</h4>
          <div className="hourly-breakdown">
            {dailyForecast[selectedDay].items.map((item, idx) => (
              <div key={idx} className="hourly-item">
                {/* Format time to " hour:minute " in local time */}
                <span>{new Date(item.dt * 1000).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}</span>
                <img 
                  src={`https://openweathermap.org/img/wn/${item.weather[0].icon}.png`} 
                  alt={item.weather[0].description}
                />
                <span>{Math.round(item.temp)}{tempUnit}</span>
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
