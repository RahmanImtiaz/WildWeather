import React, { useState, useEffect } from 'react';
import axios from 'axios';

const DisplaySavedLocations = ({ savedLocations, onRemoveLocation, onViewLocation }) => {
    const API_KEY = process.env.REACT_APP_API_KEY;
    const [temperatures, setTemperatures] = useState({});

    const fetchTemperature = async (city) => {
        try {
            const response = await axios.get(
                `https://api.openweathermap.org/data/2.5/weather?q=${city}&units=metric&appid=${API_KEY}`
            );
            setTemperatures(prev => ({ 
                ...prev, 
                [city]: Math.round(response.data.main.temp) // Rounded here
            }));
        } catch (error) {
            console.error('Error fetching temperature:', error);
            setTemperatures(prev => ({ ...prev, [city]: 'N/A' }));
        }
    };

    useEffect(() => {
        savedLocations.forEach(location => {
            if (!temperatures[location]) {
                fetchTemperature(location);
            }
        });
    }, [savedLocations]);

    return (
        <div className="saved-locations">
            <h2>Saved Locations</h2>
            {savedLocations.length === 0 ? (
                <p>No saved locations yet.</p>
            ) : (
                <ul>
                    {savedLocations.map((location, index) => (
                        <li key={index}>
                            {location}
                            <button onClick={() => onViewLocation(location)}>
                                View
                            </button>
                            <button onClick={() => onRemoveLocation(location)}>
                                Remove
                            </button>
                            <p>Temperature: {temperatures[location] || 'Loading...'}°C</p>
                        </li>
                    ))}
                </ul>
            )}
        </div>
    );
};

export default DisplaySavedLocations;