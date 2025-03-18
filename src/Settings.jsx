import React from "react";
import { useState, useEffect } from "react";
import "./settings.css";
const Settings = ({ onSavedLocationsChange, onUnitsChange, onThemeChange }) => {
    const [units, setUnits] = useState(() => {
        const savedUnits = localStorage.getItem('units');
        return savedUnits || 'metric';
    });
    const [tempUnits, setTempUnits] = useState(units);
    const [eraseChoice, setEraseChoice] = useState('no');
    const [isSettingsVisible, setIsSettingsVisible] = useState(false);
    const [theme, setTheme] = useState(() => {
        const savedTheme = localStorage.getItem('theme');
        return savedTheme || 'dark';
    });
    const [tempTheme, setTempTheme] = useState(theme);

    useEffect(() => {
        const locations = JSON.parse(localStorage.getItem('locations')) || [];
    }, []);

    const handleSettingsSubmit = (e) => {
        e.preventDefault();
        setIsSettingsVisible(false);
        const newUnits = tempUnits;
        const newTheme = tempTheme;

        if (eraseChoice === 'yes') {
            localStorage.setItem('locations', JSON.stringify([]));
            if (onSavedLocationsChange) onSavedLocationsChange();
        }
        
        // Only update if units have changed
        if (units !== newUnits) {
            localStorage.setItem('units', newUnits);
            setUnits(newUnits);
            // Notify parent component about the units change
            if (onUnitsChange) onUnitsChange(newUnits);
        }
        
        // Only update if theme has changed
        if (theme !== newTheme) {
            localStorage.setItem('theme', newTheme);
            setTheme(newTheme);
            if (onThemeChange) onThemeChange(newTheme);
        }
        
        setEraseChoice('no');
    };

    return (
        <div>
            {!isSettingsVisible && (
                <button onClick={() => setIsSettingsVisible(true)} id="settingsButton">
                    ⚙️
                </button>
            )}
            {isSettingsVisible && (
                <div id="settings">
                    <form onSubmit={handleSettingsSubmit}>
                        <label>
                            Weather Units:
                        </label>
                        <select
                            id="weatherUnits"
                            value={tempUnits}
                            onChange={(e) => setTempUnits(e.target.value)}
                        >
                            <option value="metric">Metric</option>
                            <option value="imperial">Imperial</option>
                        </select>

                        <label>
                            Theme:
                        </label>
                        <select
                            id="themeChoice"
                            value={tempTheme}
                            onChange={(e) => setTempTheme(e.target.value)}
                        >
                            <option value="dark">Dark</option>
                            <option value="light">Light</option>
                        </select>

                        <label>
                            Erase saved locations:
                        </label>
                        <select
                            id="eraseLocations"
                            value={eraseChoice}
                            onChange={(e) => setEraseChoice(e.target.value)}
                        >
                            <option value="no">No</option>
                            <option value="yes">Yes</option>
                        </select>

                        <button type="submit">Save</button>
                    </form>
                </div>
            )}
        </div>
    );
};

export default Settings;