import React from 'react';
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';

// Fix Leaflet default icon paths
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
    iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
    iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
    shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
});

// Custom blue pulsating marker for current user
const bluePulseIcon = L.divIcon({
    className: 'custom-marker-user',
    html: `
    <div style="position: relative; width: 24px; height: 24px;">
      <div style="position: absolute; inset: 0; background: #3b82f6; border-radius: 50%; animation: ping 1.5s cubic-bezier(0, 0, 0.2, 1) infinite; opacity: 0.75;"></div>
      <div style="position: relative; background: #2563eb; width: 16px; height: 16px; border-radius: 50%; border: 3px solid white; margin: 4px; box-shadow: 0 4px 6px rgba(0,0,0,0.3);"></div>
    </div>
  `,
    iconSize: [24, 24],
    iconAnchor: [12, 12]
});

// Pulsing meal bubble markers for sellers (UBER STYLE!)
const greenMealBubble = (price) => L.divIcon({
    className: 'custom-marker-seller',
    html: `
    <div style="
        position: relative;
        width: 60px;
        height: 60px;
    ">
      <!-- Pulse ring -->
      <div style="
        position: absolute;
        inset: 0;
        background: radial-gradient(circle, rgba(39, 196, 104, 0.4), transparent 70%);
        border-radius: 50%;
        animation: ping 2s cubic-bezier(0, 0, 0.2, 1) infinite;
      "></div>
      
      <!-- Main bubble -->
      <div style="
        position: relative;
        width: 60px;
        height: 60px;
        background: linear-gradient(135deg, #27C468, #059669);
        border-radius: 50%;
        border: 3px solid white;
        box-shadow: 0 0 20px rgba(39, 196, 104, 0.5), 0 4px 12px rgba(0, 0, 0, 0.3);
        display: flex;
        align-items: center;
        justify-content: center;
        font-weight: bold;
        font-size: 16px;
        color: white;
        font-family: system-ui, -apple-system, sans-serif;
        animation: pulse-glow 2s ease-in-out infinite;
      ">
        ${price}€
      </div>
    </div>
  `,
    iconSize: [60, 60],
    iconAnchor: [30, 30],
    popupAnchor: [0, -30]
});

const TradeMap = ({ user, offers, onMarkerClick }) => {
    // Default center if user location not available (e.g. Paris)
    const center = user?.lat && user?.lng ? [user.lat, user.lng] : [48.8566, 2.3522];

    return (
        <MapContainer
            center={center}
            zoom={15}
            className="h-full w-full"
            zoomControl={false}
            style={{ background: '#121212' }}
        >
            {/* Dark tile layer - CartoDB Dark Matter */}
            <TileLayer
                url="https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png"
                attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> | <a href="https://carto.com/attributions">CARTO</a>'
            />

            {/* Current user marker */}
            {user?.lat && user?.lng && (
                <Marker
                    position={[user.lat, user.lng]}
                    icon={bluePulseIcon}
                >
                    <Popup className="dark-popup">
                        <div className="text-center p-2">
                            <p className="font-bold text-blue-600">Vous êtes ici</p>
                        </div>
                    </Popup>
                </Marker>
            )}

            {/* Seller markers - NOW WITH PULSING PRICE BUBBLES! */}
            {offers.map((seller) => (
                <Marker
                    key={seller.id}
                    position={[seller.lat || 48.8566, seller.lng || 2.3522]} // Fallback if no lat/lng
                    icon={greenMealBubble(seller.price)}
                    eventHandlers={{
                        click: () => onMarkerClick(seller)
                    }}
                >
                    <Popup className="dark-popup">
                        <div className="text-center p-2">
                            <p className="font-bold text-lg">{seller.name}</p>
                            <p className="text-sm text-gray-400">{seller.price}€ • {seller.time_left}</p>
                            <p className="text-xs text-gray-500 mt-1">{seller.distance}</p>
                        </div>
                    </Popup>
                </Marker>
            ))}
        </MapContainer>
    );
};

export default TradeMap;
