// src/components/VenuesMap.js
'use client';

import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';
import { useEffect, useState } from 'react'; // useState is not needed here anymore

// --- Fix for default marker icon issue ---
delete L.Icon.Default.prototype._getIconUrl;

L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://unpkg.com/leaflet@1.7.1/dist/images/marker-icon-2x.png',
  iconUrl: 'https://unpkg.com/leaflet@1.7.1/dist/images/marker-icon.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.7.1/dist/images/marker-shadow.png',
});
// --- End fix ---

const userLocationIcon = new L.Icon({
  iconUrl: '/person-icon.png', // Example blue marker
  iconSize: [32, 32],   // A bit smaller, more like a person
  iconAnchor: [16, 32], // Point of the icon which will correspond to marker's location (bottom center)
  popupAnchor: [0, -32]
});



export default function VenuesMap({ venues, center, zoom, onGeolocationSuccess }) {
  
  const [userMarkerPosition, setUserMarkerPosition] = useState(null);

  console.log('VenuesMap rendering. Received props - center:', center, 'zoom:', zoom);
  // console.log('Venues received by VenuesMap:', venues); // You can uncomment if needed for debugging venues prop

  useEffect(() => {
    console.log("VenuesMap: useEffect for geolocation running.");
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const userCoords = {
            latitude: position.coords.latitude,
            longitude: position.coords.longitude,
          };
          console.log("VenuesMap: User location found via geolocation:", userCoords);
          setUserMarkerPosition([userCoords.latitude, userCoords.longitude]);
          if (onGeolocationSuccess) {
            onGeolocationSuccess(userCoords); // Call the callback prop from VenuesPage
          }  
        },
        (error) => { 
          console.error("VenuesMap: Error getting user location:", error.message);
        }
      );
    } else {
      console.log("VenuesMap: Geolocation is not supported by this browser.");
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [onGeolocationSuccess]); // Effect depends on onGeolocationSuccess prop

  // The map will always render if center/zoom are valid.
  // Markers will only render if venues exist and have coordinates.

  if (!Array.isArray(center) || center.length !== 2 || typeof zoom !== 'number') {
    console.error("VenuesMap: Invalid center or zoom prop received.", { center, zoom });
    return <p>Map cannot be displayed due to invalid center/zoom props.</p>;
  }

  return (
    <MapContainer
      center={center}
      zoom={zoom}
      scrollWheelZoom={true}
      style={{ height: '500px', width: '100%' }}
      // Key prop ensures map re-initializes if center or zoom fundamentally changes
      // This can be helpful with Leaflet when props are updated.
      key={`${center.join('_')}-${zoom}`} 
    >
      <TileLayer
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
      />
      {venues && venues.map(venue => (
        venue.latitude && venue.longitude ? (
          <Marker key={venue.id} position={[venue.latitude, venue.longitude]}>
            <Popup>
              <strong>{venue.name}</strong><br />
              Price: {venue.price_value !== null ? venue.price_value : 'N/A'}
            </Popup> 
          </Marker> 
        ) : null
      ))}

{userMarkerPosition && (
        <Marker 
          position={userMarkerPosition} 
          icon={userLocationIcon} // Use the custom blue icon
        >
          <Popup>You are approximately here.</Popup>
        </Marker>
      )}
    </MapContainer>
  );
}