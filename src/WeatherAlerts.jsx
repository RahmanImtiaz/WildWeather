import React, { useState, useEffect } from 'react';

const WeatherAlerts = ({ onClose, onSaveAlert, units }) => {
  const [alertType, setAlertType] = useState('temperature');
  const [threshold, setThreshold] = useState('');
  const [comparison, setComparison] = useState('above');
  const [activity, setActivity] = useState('');
  const [alerts, setAlerts] = useState([]);

  useEffect(() => {
    const savedAlerts = localStorage.getItem('weatherAlerts');
    if (savedAlerts) {
      setAlerts(JSON.parse(savedAlerts));
    }
  }, []);

  const handleSubmit = (e) => {
    e.preventDefault();
    const newAlert = {
      id: Date.now(),
      type: alertType,
      threshold: parseFloat(threshold),
      comparison,
      activity,
      enabled: true
    };
    const updatedAlerts = [...alerts, newAlert];
    setAlerts(updatedAlerts);
    localStorage.setItem('weatherAlerts', JSON.stringify(updatedAlerts));
    if (onSaveAlert) onSaveAlert(updatedAlerts);
    setThreshold('');
    setActivity('');
  };

  const handleDeleteAlert = (id) => {
    const updatedAlerts = alerts.filter(alert => alert.id !== id);
    setAlerts(updatedAlerts);
    localStorage.setItem('weatherAlerts', JSON.stringify(updatedAlerts));
    if (onSaveAlert) onSaveAlert(updatedAlerts);
  };

  const toggleAlertState = (id) => {
    const updatedAlerts = alerts.map(alert =>
      alert.id === id ? { ...alert, enabled: !alert.enabled } : alert
    );
    setAlerts(updatedAlerts);
    localStorage.setItem('weatherAlerts', JSON.stringify(updatedAlerts));
    if (onSaveAlert) onSaveAlert(updatedAlerts);
  };

  const getUnitLabel = (type) => {
    switch (type) {
      case 'temperature': return units === 'metric' ? '°C' : '°F';
      case 'wind': return units === 'metric' ? 'm/s' : 'mph';
      case 'visibility': return units === 'metric' ? 'km' : 'mi';
      case 'humidity': return '%';
      case 'pressure': return 'hPa';
      case 'uv': return '';
      case 'clouds': return '%';
      default: return '';
    }
  };

  return (
    <div className="weather-alerts-dropdown">
      <div className="alerts-header">
        <h2>Weather Alerts</h2>
        <button onClick={onClose} className="close-button">×</button>
      </div>
      <form onSubmit={handleSubmit}>
        <div className="form-group">
          <label>Alert me when:</label>
          <div style={{ display: 'flex', gap: '8px' }}>
            <select value={alertType} onChange={(e) => setAlertType(e.target.value)}>
              <option value="temperature">Temperature</option>
              <option value="wind">Wind Speed</option>
              <option value="visibility">Visibility</option>
              <option value="humidity">Humidity</option>
              <option value="pressure">Air Pressure</option>
              <option value="uv">UV Index</option>
              <option value="clouds">Cloudiness</option>
            </select>
            <select value={comparison} onChange={(e) => setComparison(e.target.value)}>
              <option value="above">is above</option>
              <option value="below">is below</option>
            </select>
          </div>
        </div>
        
        <div className="form-group">
          <label>Threshold</label>
          <input
            type="number"
            value={threshold}
            onChange={(e) => setThreshold(e.target.value)}
            placeholder={`Value in ${getUnitLabel(alertType)}`}
            required
          />
        </div>
        
        <div className="form-group">
          <label>Activity</label>
          <input
            type="text"
            value={activity}
            onChange={(e) => setActivity(e.target.value)}
            placeholder="e.g., Cycling, Hiking"
            required
          />
        </div>
        
        <button type="submit">Add Alert</button>
      </form>
      
      <div>
        <h3 style={{ marginBottom: '0.75rem', fontSize: '1.1rem', opacity: '0.9' }}>Your Alerts</h3>
        {alerts.length === 0 ? (
          <p style={{ opacity: '0.7', fontSize: '0.9rem' }}>No alerts set. Add one above!</p>
        ) : (
          <ul>
            {alerts.map(alert => (
              <li key={alert.id}>
                <div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                    <input
                      type="checkbox"
                      checked={alert.enabled}
                      onChange={() => toggleAlertState(alert.id)}
                      style={{ margin: 0 }}
                    />
                    <p>{alert.activity}: {alert.type} {alert.comparison} {alert.threshold} {getUnitLabel(alert.type)}</p>
                  </div>
                  <button onClick={() => handleDeleteAlert(alert.id)} title="Remove alert">×</button>
                </div>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
};

export default WeatherAlerts;