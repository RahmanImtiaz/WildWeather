/**
 * DisplaySavedLocations.jsx
 * This component is responsible for displaying the uses saved locations
 * fetching and showing current temperatures for each location,
 * and having  options to view or remove saved locations.
 * 
 */
import React, { useState, useEffect, useCallback } from 'react';
import axios from 'axios';

/**
 * DisplaySavedLocations Component
 * 
 * @param {Array} savedLocations - Array of saved location objects
 * @param {Function} onRemoveLocation - Callback function to remove a location
 * @param {Function} onViewLocation - Callback function to view a location
 * @param {String} units - Temperature units ('metric' or 'imperial')
 * @returns {JSX.Element} The saved locations component
 */
const DisplaySavedLocations = ({ savedLocations, onRemoveLocation, onViewLocation, units }) => {
  // The API key for OpenWeatherMap, stored in .env file (for security)
  // Note: Make sure to add your API key in a .env file in the root of your project
    const API_KEY = process.env.REACT_APP_API_KEY;
    
    // Stores temperature for each location
    const [temperatures, setTemperatures] = useState({});

    /**
     * This function fetches the current temperature for a saved location.
     * It uses coordinates if available, or falls back to querying by name.
     * 
     * @param {Object} location - The location object containing name and coordinates
     */
    const fetchTemperature =useCallback (async (location) => {
        try {
            // Use coordinates if available
            let url;
            if (location.lat && location.lon) {
                url = `https://api.openweathermap.org/data/2.5/weather?lat=${location.lat}&lon=${location.lon}&units=${units}&appid=${API_KEY}`;
            } else {
                // Fallback to query by name if no coordinates
                url = `https://api.openweathermap.org/data/2.5/weather?q=${location.name}&units=${units}&appid=${API_KEY}`;
            }
            
            // Fetch weather data from OpenWeatherMap API
            const response = await axios.get(url);
            
            // Update temperatures state with the fetched data
            setTemperatures(prev => ({ 
                ...prev, 
                [location.name]: {
                    temp: Math.round(response.data.main.temp),
                    lat: response.data.coord.lat,
                    lon: response.data.coord.lon
                }
            }));
        } catch (error) {
            console.error('Error fetching temperature:', error);
            // Set temperature to 'N/A' if fetch for some reason fails
            setTemperatures(prev => ({ 
                ...prev, 
                [location.name]: { 
                    temp: 'N/A', 
                    lat: null, 
                    lon: null 
                }
            }));
        }
    }, [units, API_KEY]);

    /**
     * useEffect Hook
     * This hook runs when the units change or fetchTemperature function changes.
     * It refetches temperature data for all saved locations with the new units.
     */
    useEffect(() => {
        // When units change, we need to refetch all temperatures
        if (savedLocations.length > 0) {
            console.log("Units changed, refetching temperatures with units:", units);
            savedLocations.forEach(location => {
                fetchTemperature(location);
            });
        }
    }, [units, fetchTemperature, savedLocations]);

    /**
     * useEffect Hook
     * This hook runs when the savedLocations array changes or fetchTemperature function changes.
     * It fetches temperature data for any new locations that don't have data yet.
     */
    useEffect(() => {
        savedLocations.forEach(location => {
            if (!temperatures[location.name]) {
                fetchTemperature(location);
            }
        });
    }, [savedLocations, fetchTemperature, temperatures]);

    // Get the appropriate temperature unit symbol based on the current units set by the user(it is metric by default)
    const tempUnit = units === 'metric' ? '°C' : '°F';

    /**
     * This renders the saved locations component.
     * It displays a list of saved locations with their temperatures
     * and buttons to view or remove each location.
     * 
     * @returns {JSX.Element} The rendered DisplaySavedLocations component
     */
    return (
        <div id="saved-locations-container">
            <h2 id="saved-locations-title">Saved Locations</h2>
            <div id="saved-locations-list">
                {savedLocations.length === 0 ? (
                    <p>No saved locations yet.</p>
                ) : (
                    <ul>
                        {savedLocations.map((location, index) => (
                            <li key={index}>
                                <div>
                                    {/* Location name */}
                                    <p>{location.name}</p>
                                    <div id="buttons">
                                        {/* View button */}
                                        <button 
                                            onClick={() => onViewLocation(
                                                location.name, 
                                                location.lat || temperatures[location.name]?.lat, 
                                                location.lon || temperatures[location.name]?.lon
                                            )}
                                            disabled={!location.lat && !temperatures[location.name]?.lat}
                                        >
                                            🔎
                                        </button>
                                        {/* Remove button  */}
                                        <button onClick={() => onRemoveLocation(location)}>
                                            ❌
                                        </button>
                                    </div>
                                    {/* Display current temperature with appropriate unit */}
                                    <p>
                                        {temperatures[location.name]?.temp}{tempUnit}
                                    </p>
                                </div>
                            </li>
                        ))}
                    </ul>
                )}
            </div>
        </div>
    );
};

export default DisplaySavedLocations;