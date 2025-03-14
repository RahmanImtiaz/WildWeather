import React from "react";
import { useState, useEffect } from "react";

const Settings = ({ onSavedLocationsChange, onUnitsChange }) => {
    const [units, setUnits] = useState(() => {
        const savedUnits = localStorage.getItem('units');
        return savedUnits || 'metric';
    });
    const [tempUnits, setTempUnits] = useState(units);
    const [eraseChoice, setEraseChoice] = useState('no');
    const [isSettingsVisible, setIsSettingsVisible] = useState(false);

    useEffect(() => {
        const locations = JSON.parse(localStorage.getItem('locations')) || [];
    }, []);

    const handleSettingsSubmit = (e) => {
        e.preventDefault();
        setIsSettingsVisible(false);
        const newUnits = tempUnits;

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
        
        setEraseChoice('no');
    };

    return (
        <div style={{ marginBottom: '40px' }}>
            {!isSettingsVisible && (
                <button onClick={() => setIsSettingsVisible(true)} id="settingsButton">
                    Settings
                </button>
            )}
            {isSettingsVisible && (
                <div id="settings">
                    <form onSubmit={handleSettingsSubmit}>
                        <label htmlFor="weatherUnits">
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