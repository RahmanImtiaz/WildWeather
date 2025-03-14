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
                [city]: {
                    temp: Math.round(response.data.main.temp),
                    lat: response.data.coord.lat,
                    lon: response.data.coord.lon
                }
            }));
        } catch (error) {
            console.error('Error fetching temperature:', error);
            setTemperatures(prev => ({ 
                ...prev, 
                [city]: { 
                    temp: 'N/A', 
                    lat: null, 
                    lon: null 
                }
            }));
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
                            <div className="location-info">
                                <span className="location-name">{location}</span>
                                <div className="location-actions">
                                    <button 
                                        onClick={() => onViewLocation(
                                            location, 
                                            temperatures[location]?.lat, 
                                            temperatures[location]?.lon
                                        )}
                                        disabled={!temperatures[location]?.lat}
                                    >
                                        View
                                    </button>
                                    <button onClick={() => onRemoveLocation(location)}>
                                        Remove
                                    </button>
                                </div>
                                <p className="location-temp">
                                    Temperature: {temperatures[location]?.temp || 'Loading...'}°C
                                </p>
                            </div>
                        </li>
                    ))}
                </ul>
            )}
        </div>
    );
};

export default DisplaySavedLocations;