import React from 'react';
import {
  MapContainer,
  TileLayer,
  useMap,
} from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';
import 'leaflet.heat'; // The leaflet.heat plugin

// This sub-component actually applies the heat map to the Leaflet map
function HeatMap({ userLocations }) {
  const map = useMap();

  React.useEffect(() => {
    // Remove any existing heat layers to avoid duplicates
    map.eachLayer((layer) => {
      const isHeatLayer = layer.options && layer.options.pane === 'overlayPane';
      if (isHeatLayer) {
        map.removeLayer(layer);
      }
    });

    // Convert { lat, lng } objects to [lat, lng] arrays
    const points = userLocations.map((loc) => [loc.lat, loc.lng]);

    // Add heat layer if we have points
    if (points.length > 0) {
      L.heatLayer(points, {
        radius: 25,
        blur: 1,
        maxZoom: 17,
      }).addTo(map);
    }
  }, [userLocations, map]);

  return null;
}

export default function HeatMapContainer({ userLocations }) {
  // Center on downtown San Diego
  const center = [32.754910, -117.205000];

  return (
    <div className="mb-2 mt-4 p-4 bg-gray-900 rounded-lg shadow-lg text-center w-full max-w-2xl">
      <h2 className="text-md font-bold text-neon-purple mb-2 text-center">
        See Where Other Users are Checked In!
      </h2>

      {/* Map Container */}
      <div className="w-full h-96">
        <MapContainer
          center={center}
          zoom={12}
          className="w-full h-full rounded-lg z-0"
        >
          <TileLayer
            // Using a free OpenStreetMap tile layer
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            attribution='&copy; <a href="https://openstreetmap.org">OpenStreetMap</a> contributors'
          />
          <HeatMap userLocations={userLocations} />
        </MapContainer>
      </div>
    </div>
  );
}