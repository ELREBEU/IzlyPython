import React from 'react';
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import L from 'leaflet';
import { CURRENT_USER, AVAILABLE_SELLERS } from './data/dummyUsers';
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

// Green marker for sellers
const greenSellerIcon = (initial) => L.divIcon({
    className: 'custom-marker-seller',
    html: `
    <div style="background: linear-gradient(135deg, #10b981, #059669); width: 48px; height: 48px; border-radius: 50%; border: 3px solid white; box-shadow: 0 4px 12px rgba(16, 185, 129, 0.5); display: flex; align-items: center; justify-content: center; font-weight: bold; font-size: 18px; color: white; font-family: system-ui;">
      ${initial}
    </div>
  `,
    iconSize: [48, 48],
    iconAnchor: [24, 48],
    popupAnchor: [0, -48]
});

const TradeMap = ({ onMarkerClick }) => {
    return (
        <MapContainer
            center={[CURRENT_USER.lat, CURRENT_USER.lng]}
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
            <Marker
                position={[CURRENT_USER.lat, CURRENT_USER.lng]}
                icon={bluePulseIcon}
            >
                <Popup className="dark-popup">
                    <div className="text-center p-2">
                        <p className="font-bold text-blue-600">Vous êtes ici</p>
                    </div>
                </Popup>
            </Marker>

            {/* Seller markers */}
            {AVAILABLE_SELLERS.map((seller) => (
                <Marker
                    key={seller.id}
                    position={[seller.lat, seller.lng]}
                    icon={greenSellerIcon(seller.initial)}
                    eventHandlers={{
                        click: () => onMarkerClick(seller)
                    }}
                >
                    <Popup className="dark-popup">
                        <div className="text-center p-2">
                            <p className="font-bold text-lg">{seller.name}</p>
                            <p className="text-sm text-gray-600">{seller.price}€ • {seller.time_left}</p>
                            <p className="text-xs text-gray-500 mt-1">{seller.distance}</p>
                        </div>
                    </Popup>
                </Marker>
            ))}
        </MapContainer>
    );
};

export default TradeMap;
