/**
 * Settings.jsx
 * This component manages user preferences for the Wild Weather application including
 * unit selection, theme preference, and saved location management.
 * 
 * This is responsible for:
 * - Managing user preferences for weather units (metric/imperial)
 * - Controlling theme settings (light/dark)
 * - Providing options to manage saved locations
 * - Persisting user preferences to localStorage
 */

import React from "react";
import { useState} from "react";
import "./settings.css";

/**
 * Settings Component
 * 
 * @param {Function} onSavedLocationsChange - Callback function when saved locations are changed
 * @param {Function} .onUnitsChange - Callback function when units preference is changed
 * @param {Function} onThemeChange - Callback function when theme preference is changed
 * @returns {JSX.Element} The Settings component with user preference controls
 */
const Settings = ({ onSavedLocationsChange, onUnitsChange, onThemeChange }) => {
    /**
     * State Variables
     */
    
    // Current units preference (metric/imperial), initialized from localStorage with metric as default
    const [units, setUnits] = useState(() => {
        const savedUnits = localStorage.getItem('units');
        return savedUnits || 'metric';
    });
    
    // Temporary units value used during form editing
    const [tempUnits, setTempUnits] = useState(units);
    
    // User's choice for erasing saved locations (yes/no)
    const [eraseChoice, setEraseChoice] = useState('no');
    
    // Controls visibility of the settings panel
    const [isSettingsVisible, setIsSettingsVisible] = useState(false);
    
    // Current theme preference (dark/light), initialized from localStorage with dark as default
    const [theme, setTheme] = useState(() => {
        const savedTheme = localStorage.getItem('theme');
        return savedTheme || 'dark';
    });
    
    // Temporary theme value used during form editing
    const [tempTheme, setTempTheme] = useState(theme);

    /**
     * Handles the submission of the settings form.
     * This function processes user preference changes and updates localStorage.
     * 
     * @param {Event} e - 
     */
    const handleSettingsSubmit = (e) => {
        e.preventDefault();
        setIsSettingsVisible(false);
        const newUnits = tempUnits;
        const newTheme = tempTheme;

        // Handle erasing saved locations if user selected "yes"
        if (eraseChoice === 'yes') {
            localStorage.setItem('locations', JSON.stringify([]));
            if (onSavedLocationsChange) onSavedLocationsChange();
        }
        
        // Only update if units have changed to avoid unnecessary operations
        if (units !== newUnits) {
            localStorage.setItem('units', newUnits);
            setUnits(newUnits);
            // Call the onUnitsChange callback if provided
            if (onUnitsChange) onUnitsChange(newUnits);
        }
        
        // Only update if theme has changed to avoid unnecessary operations
        if (theme !== newTheme) {
            localStorage.setItem('theme', newTheme);
            setTheme(newTheme);
            if (onThemeChange) onThemeChange(newTheme);
        }
        
        // Reset erase choice to default after submission
        setEraseChoice('no');
    };

    /**
     * Render the Settings component
     * It returns either a setting button (when settings are hidden) or 
     * the settings form (when settings are visible).
     * 
     * @returns {JSX.Element} - The rendered Settings component
     */
    return (
        <div>
            {/* Settings button shown when settings panel is hidden */}
            {!isSettingsVisible && (
                <button onClick={() => setIsSettingsVisible(true)} id="settingsButton">
                    ⚙️
                </button>
            )}
            
            {/* Settings form shown when settings are visible */}
            {isSettingsVisible && (
                <div id="settings">
                    <form onSubmit={handleSettingsSubmit}>
                        {/* Weather units selection (metric/imperial) */}
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

                        {/* Theme selection (dark/light) */}
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

                        {/* Option to erase saved locations */}
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

                        {/* Submit button to save settings */}
                        <button type="submit">Save</button>
                    </form>
                </div>
            )}
        </div>
    );
};

export default Settings;