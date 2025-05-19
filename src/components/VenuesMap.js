'use client';

import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';

delete L.Icon.Default.prototype._getIconUrl;

L.Icon.Default.mergeOptions({
    iconRetinaUrl: 'https://unpkg.com/leaflet@1.7.1/dist/images/marker-icon-2x.png',
    iconUrl: 'https://unpkg.com/leaflet@1.7.1/dist/images/marker-icon.png',
    shadowUrl: 'https://unpkg.com/leaflet@1.7.1/dist/images/marker-shadow.png',
});

export default function VenuesMap({ venues }) {
    if (!venues || venues.length === 0) {
        return <p>No venues to display on map.</p>
    }

    const position = [
        venues[0]?.latitude || -37.840935,
        venues[0]?.longitude || 144.946457,
    ];
    const zoomLevel = venues.length > 0 ? 13 : 7;

    return (
        <MapContainer
            center={position}
            zoom={zoomLevel}
            scrollWheelZoom={true}
            style={{ height: '500px', width: '100%' }}
        >
            <TileLayer
                attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            />
            {venues.map(venue => (
                venue.latitude && venue.longitude ? (
                    <Marker key={venue.id} position={[venue.latitude, venue.longitude]}>
                        <Popup>
                            <strong>{venue.name}</strong><br />
                            Price: {venue.price_value !== null ? venue.price_value : 'N/A'}
                        </Popup> 
                    </Marker> 
                ) : null
            ))}
            </MapContainer>
    );
}
