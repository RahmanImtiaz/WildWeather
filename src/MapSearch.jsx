import React, { useState, useEffect} from 'react';
import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet';
import axios from 'axios';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';

// Fix for default marker icon (required for React-Leaflet)
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: require('leaflet/dist/images/marker-icon-2x.png'),
  iconUrl: require('leaflet/dist/images/marker-icon.png'),
  shadowUrl: require('leaflet/dist/images/marker-shadow.png'),
});

// This function watches for position changes and updates the map view <- fixes the repositioning of map
function ChangeMapView({ position }) {
  const map = useMap();
  map.setView(position, 13);
  return null;
}

const MapSearch = ({ onLocationChange, initialPosition, initialLocationName }) => {
  const [searchInput, setSearchInput] = useState('');
  const [position, setPosition] = useState([51.5074, -0.1278]); // Default position (London)
  const [locationName, setLocationName] = useState('London');

  // Update local state when props change <- fixes the repositioning of map based on intiail geolocation
  useEffect(() => {
    if (initialPosition && initialPosition[0] && initialPosition[1]) {
      setPosition(initialPosition);
    }
    if (initialLocationName) {
      setLocationName(initialLocationName);
    }
  }, [initialPosition, initialLocationName]);

const [searchResults, setSearchResults] = useState([]);

const handleSearch = async (e) => {
  e.preventDefault();
  if (!searchInput) return;

  try {
    const API_KEY = process.env.REACT_APP_API_KEY;
    const response = await axios.get(
      `https://api.openweathermap.org/geo/1.0/direct?q=${searchInput}&limit=5&appid=${API_KEY}`
    );

    if (response.data && response.data.length > 0) {
      setSearchResults(response.data); // Store multiple results
    } else {
      setSearchResults([]); // Clear results if nothing is found
    }
  } catch (error) {
    console.error('Error fetching location:', error);
    setSearchResults([]);
  }
};

const handleSelectLocation = (selectedLocation) => {
  setSearchInput(`${selectedLocation.name}, ${selectedLocation.country}`);
  updateLocation(selectedLocation);
  setSearchResults([]); // Clears dropdown after selection
};

const updateLocation = (selectedLocation) => {
  const newPosition = [selectedLocation.lat, selectedLocation.lon];
  setPosition(newPosition);
  setLocationName(`${selectedLocation.name}, ${selectedLocation.country}`);
  
  if (onLocationChange) {
    onLocationChange(selectedLocation.lat, selectedLocation.lon, selectedLocation.name);
  }
};

const resetToCurrentLocation = async () => {
  if (navigator.geolocation) {
    navigator.geolocation.getCurrentPosition(
      async (position) => {
        const { latitude, longitude } = position.coords;

        try {
          // Fetch detailed location from OpenStreetMap's Nominatim API
          const response = await axios.get(
            `https://nominatim.openstreetmap.org/reverse?lat=${latitude}&lon=${longitude}&format=json`
          );

          let detailedLocation = "Unknown Location";
          if (response.data && response.data.display_name) {
            const locationParts = response.data.display_name.split(",");
            detailedLocation = locationParts.slice(0, 2).join(", ").trim(); // Get first 2 parts
          }

          // Update state with the shortened location
          setPosition([latitude, longitude]);
          setLocationName(detailedLocation);

          // Update Weather Data
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


function MapClickHandler({ onMapClick }) {
  const map = useMap();

  useEffect(() => {
    const handleMapClick = async (e) => {
      const lat = e.latlng.lat;
      const lon = e.latlng.lng;

      try {
        // Fetch detailed location info from OpenStreetMap's Nominatim API
        const response = await axios.get(
          `https://nominatim.openstreetmap.org/reverse?lat=${lat}&lon=${lon}&format=json`
        );

        if (response.data && response.data.display_name) {
          const detailedLocation = response.data.display_name; // Full location string
          onMapClick(lat, lon, detailedLocation);
        } else {
          onMapClick(lat, lon, `Lat: ${lat.toFixed(4)}, Lon: ${lon.toFixed(4)}`);
        }
      } catch (error) {
        console.error("Error fetching detailed location:", error);
        onMapClick(lat, lon, `Lat: ${lat.toFixed(4)}, Lon: ${lon.toFixed(4)}`);
      }
    };

    map.on("click", handleMapClick);

    return () => {
      map.off("click", handleMapClick);
    };
  }, [map, onMapClick]);

  return null;
}

  return (
    <div className="map-search-container">
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

    {/* Dropdown directly below the input field */}
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
    <div className="map-location-icon" onClick={resetToCurrentLocation} title="Reset to Current Location">
      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="24" height="24" fill="white">
       <path d="M12 2C11.4477 2 11 2.44772 11 3V4.07107C7.61142 4.51355 4.51355 7.61142 4.07107 11H3C2.44772 11 2 11.4477 2 12C2 12.5523 2.44772 13 3 13H4.07107C4.51355 16.3886 7.61142 19.4865 11 19.9289V21C11 21.5523 11.4477 22 12 22C12.5523 22 13 21.5523 13 21V19.9289C16.3886 19.4865 19.4865 16.3886 19.9289 13H21C21.5523 13 22 12.5523 22 12C22 11.4477 21.5523 11 21 11H19.9289C19.4865 7.61142 16.3886 4.51355 13 4.07107V3C13 2.44772 12.5523 2 12 2ZM12 6C15.3137 6 18 8.68629 18 12C18 15.3137 15.3137 18 12 18C8.68629 18 6 15.3137 6 12C6 8.68629 8.68629 6 12 6ZM12 8C9.79086 8 8 9.79086 8 12C8 14.2091 9.79086 16 12 16C14.2091 16 16 14.2091 16 12C16 9.79086 14.2091 8 12 8Z">
       </path>
      </svg>
    </div>
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
      <ChangeMapView position={position} />

      {/* Click Handler for Interactive Map */}
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

export default MapSearch;
