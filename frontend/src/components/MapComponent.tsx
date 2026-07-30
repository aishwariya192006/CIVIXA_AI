import React from 'react';
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import L from 'leaflet';

// Fix for default marker icons in React-Leaflet
import icon from 'leaflet/dist/images/marker-icon.png';
import iconShadow from 'leaflet/dist/images/marker-shadow.png';

let DefaultIcon = L.icon({
    iconUrl: icon,
    shadowUrl: iconShadow,
    iconSize: [25, 41],
    iconAnchor: [12, 41]
});
L.Marker.prototype.options.icon = DefaultIcon;

interface MapComponentProps {
  complaints: any[];
  center?: [number, number];
  zoom?: number;
}

export const MapComponent: React.FC<MapComponentProps> = ({ complaints, center = [20.5937, 78.9629], zoom = 5 }) => {
  return (
    <div className="h-[400px] w-full rounded-2xl overflow-hidden border border-gray-200 shadow-md">
      <MapContainer center={center} zoom={zoom} scrollWheelZoom={false} style={{ height: '100%', width: '100%' }}>
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        {complaints.filter(c => c.locationLat && c.locationLng).map(comp => (
          <Marker key={comp.id} position={[comp.locationLat, comp.locationLng]}>
            <Popup>
              <div className="font-sans">
                <p className="font-bold text-sm mb-1">{comp.title}</p>
                <p className="text-xs text-gray-600 mb-1">{comp.categoryName}</p>
                <span className={`text-[10px] px-2 py-0.5 rounded-full font-bold ${
                  comp.status === 'RESOLVED' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'
                }`}>
                  {comp.status}
                </span>
              </div>
            </Popup>
          </Marker>
        ))}
      </MapContainer>
    </div>
  );
};
