/**
 * MapSearch Component
 * -------------------
 * This component displays an interactive map using React Leaflet that allows users to:
 * - View a default or current location on the map
 * - Search for cities via an input field using the OpenWeather Geocoding API
 * - Click on search results to re-center the map and update weather/location info
 * - Click anywhere on the map to retrieve the location name using OpenStreetMap's Nominatim API
 * - Reset the map to the user's current geolocation using the browser's Geolocation API
 *
 * */

// For component creation and state/effect management
import React, { useState, useEffect} from 'react';

// For rendering the map, layers, markers, and interactivity
import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet';

// Making HTTP requests (used for geolocation and reverse geocoding APIs)
import axios from 'axios';

//For map styling and markers
import 'leaflet/dist/leaflet.css';

// For modifying marker icons
import L from 'leaflet';

// Fix to ensure Leaflet markers display correctly in React (override default icon paths)
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: require('leaflet/dist/images/marker-icon-2x.png'),
  iconUrl: require('leaflet/dist/images/marker-icon.png'),
  shadowUrl: require('leaflet/dist/images/marker-shadow.png'),
});

// Component to update the map view when the position state changes
function ChangeMapView({ position }) {
  const map = useMap(); // Access map instance
  map.setView(position, 13); // Centre map to new position with zoom 13
  return null; // No UI rendering needed
}

const MapSearch = ({ onLocationChange, initialPosition, initialLocationName }) => {
  const [searchInput, setSearchInput] = useState(''); // User input for search
  const [position, setPosition] = useState([51.5074, -0.1278]); // Default position (London)
  const [locationName, setLocationName] = useState('London'); // Displayed location name

  // Update state when parent component provides new position or location name
  useEffect(() => {
    if (initialPosition && initialPosition[0] && initialPosition[1]) {
      setPosition(initialPosition);
    }
    if (initialLocationName) {
      setLocationName(initialLocationName);
    }
  }, [initialPosition, initialLocationName]);

  const [searchResults, setSearchResults] = useState([]); // List of search results from API

  // Handles search form submission and queries OpenWeather geocoding API
  const handleSearch = async (e) => {
    e.preventDefault();
    if (!searchInput) return;

    try {
      const API_KEY = process.env.REACT_APP_API_KEY;
      const response = await axios.get(
        `https://api.openweathermap.org/geo/1.0/direct?q=${searchInput}&limit=5&appid=${API_KEY}`
      );

      // If locations found, update results; else clear
      if (response.data && response.data.length > 0) {
        setSearchResults(response.data);
      } else {
        setSearchResults([]);
      }
    } catch (error) {
      console.error('Error fetching location:', error);
      setSearchResults([]);
    }
  };

  // When a user selects a location from search results
  const handleSelectLocation = (selectedLocation) => {
    setSearchInput(`${selectedLocation.name}, ${selectedLocation.country}`); // Update input field
    updateLocation(selectedLocation); // Update map and state
    setSearchResults([]); // Clear dropdown
  };

  // Update position, location name, and notify parent
  const updateLocation = (selectedLocation) => {
    const newPosition = [selectedLocation.lat, selectedLocation.lon];
    setPosition(newPosition);
    setLocationName(`${selectedLocation.name}, ${selectedLocation.country}`);
    
    if (onLocationChange) {
      onLocationChange(selectedLocation.lat, selectedLocation.lon, selectedLocation.name);
    }
  };

  // Reset map to user's current geolocation using browser API
  const resetToCurrentLocation = async () => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        async (position) => {
          const { latitude, longitude } = position.coords;

          try {
            // Get human-readable address using OpenStreetMap Nominatim reverse geocoding
            const response = await axios.get(
              `https://nominatim.openstreetmap.org/reverse?lat=${latitude}&lon=${longitude}&format=json`
            );

            let detailedLocation = "Unknown Location";
            if (response.data && response.data.display_name) {
              const locationParts = response.data.display_name.split(",");
              detailedLocation = locationParts.slice(0, 2).join(", ").trim(); // Extract top-level location info
            }

            // Update map and state with new location
            setPosition([latitude, longitude]);
            setLocationName(detailedLocation);

            if (onLocationChange) {
              onLocationChange(latitude, longitude, detailedLocation);
            }
          } catch (error) {
            console.error("Error fetching reverse geolocation:", error);
            setLocationName("Unknown Location");
          }
        },
        (error) => {
          console.error("Error getting location:", error);
          alert("Failed to get current location.");
        }
      );
    } else {
      alert("Geolocation is not supported by your browser.");
    }
  };

  // Handles user clicking directly on the map
  function MapClickHandler({ onMapClick }) {
    const map = useMap();

    useEffect(() => {
      // On map click, get coordinates and reverse geocode to location name
      const handleMapClick = async (e) => {
        const lat = e.latlng.lat;
        const lon = e.latlng.lng;

        try {
          const response = await axios.get(
            `https://nominatim.openstreetmap.org/reverse?lat=${lat}&lon=${lon}&format=json`
          );

          if (response.data && response.data.display_name) {
            const detailedLocation = response.data.display_name;
            onMapClick(lat, lon, detailedLocation);
          } else {
            onMapClick(lat, lon, `Lat: ${lat.toFixed(4)}, Lon: ${lon.toFixed(4)}`);
          }
        } catch (error) {
          console.error("Error fetching detailed location:", error);
          onMapClick(lat, lon, `Lat: ${lat.toFixed(4)}, Lon: ${lon.toFixed(4)}`);
        }
      };

      map.on("click", handleMapClick); // Attach listener

      return () => {
        map.off("click", handleMapClick); // Cleanup on unmount
      };
    }, [map, onMapClick]);

    return null;
  }

  return (
    <div className="map-search-container">
      {/* Search bar form for entering city name */}
      <form onSubmit={handleSearch} className="map-search-form" style={{ position: "relative" }}>
        <input
          type="text"
          placeholder="Search city..."
          value={searchInput}
          onChange={(e) => setSearchInput(e.target.value)}
          className="map-search-input"
          style={{ color: "#000" }}
        />
        <button type="submit" className="map-search-button">Search</button>

        {/* Autocomplete dropdown with results */}
        {searchResults.length > 0 && (
          <ul className="autocomplete-dropdown">
            {searchResults.map((result, index) => (
              <li
                key={index}
                className="autocomplete-item"
                onClick={() => handleSelectLocation(result)}
              >
                {result.name}, {result.state ? result.state + ", " : ""}{result.country}
              </li>
            ))}
          </ul>
        )}
      </form>

      <div className="map-container">
        {/* Button to reset view to current location */}
        <div className="map-location-icon" onClick={resetToCurrentLocation} title="Reset to Current Location">
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="24" height="24" fill="white">
            <path d="..."/>
          </svg>
        </div>

        {/* Map rendering with current position and marker */}
        <MapContainer center={position} zoom={13} scrollWheelZoom={true} style={{ height: "300px", width: "100%" }}>
          <TileLayer
            attribution='&copy; <a href="https://www.openstreetmap.org/">OpenStreetMap</a> contributors'
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          />
          <Marker position={position}>
            <Popup>
              <div style={{ color: "#000" }}>{locationName}</div>
            </Popup>
          </Marker>

          {/* Update view if position changes */}
          <ChangeMapView position={position} />

          {/* Allow user to click on map to update location */}
          <MapClickHandler onMapClick={(lat, lon, location) => {
            setPosition([lat, lon]);
            setLocationName(location);

            if (onLocationChange) {
              onLocationChange(lat, lon, location);
            }
          }} />
        </MapContainer>
      </div>
    </div>
  );
};

export default MapSearch; // Export component for use in app

