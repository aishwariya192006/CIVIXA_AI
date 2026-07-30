import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { MapContainer, TileLayer, Marker, useMap } from 'react-leaflet'
import { MapPin, X, Check, Loader2 } from 'lucide-react'
import L from 'leaflet'
import toast from 'react-hot-toast'

// Fix Leaflet's default icon path issues
delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
});

function MapUpdater({ center }: { center: [number, number] }) {
  const map = useMap()
  useEffect(() => {
    map.flyTo(center, 15, { animate: true, duration: 1.5 })
  }, [center, map])
  return null
}

interface LocationPickerModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSelect: (location: string) => void;
}

export default function LocationPickerModal({ isOpen, onClose, onSelect }: LocationPickerModalProps) {
  const [position, setPosition] = useState<[number, number] | null>(null)
  const [address, setAddress] = useState<string>('')
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (isOpen) {
      setLoading(true)
      setAddress('')
      if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(
          async (pos) => {
            const lat = pos.coords.latitude
            const lon = pos.coords.longitude
            setPosition([lat, lon])

            try {
              // Reliable free API with no CORS
              const res = await fetch(`https://api.bigdatacloud.net/data/reverse-geocode-client?latitude=${lat}&longitude=${lon}&localityLanguage=en`)
              const data = await res.json()
              const placeName = [data.locality, data.city, data.principalSubdivision].filter(Boolean).join(', ')
              setAddress(placeName || `${lat.toFixed(4)}, ${lon.toFixed(4)}`)
              setLoading(false)
            } catch (err) {
              setAddress(`${lat.toFixed(4)}, ${lon.toFixed(4)}`)
              setLoading(false)
            }
          },
          (err) => {
            toast.error('Unable to retrieve your location')
            setLoading(false)
            onClose()
          },
          { enableHighAccuracy: true, timeout: 10000, maximumAge: 0 }
        )
      } else {
        toast.error('Geolocation is not supported by your browser')
        setLoading(false)
        onClose()
      }
    }
  }, [isOpen, onClose])

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4">
        {/* Backdrop */}
        <motion.div 
          className="absolute inset-0 bg-[#06131f]/80 backdrop-blur-sm"
          initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
          onClick={onClose}
        />

        {/* Modal */}
        <motion.div 
          className="relative w-full max-w-2xl rounded-2xl overflow-hidden flex flex-col shadow-2xl"
          style={{ background: 'rgba(9,28,47,0.95)', border: '1px solid rgba(0,212,255,0.2)', boxShadow: '0 20px 40px rgba(0,0,0,0.5)' }}
          initial={{ opacity: 0, scale: 0.95, y: 20 }} animate={{ opacity: 1, scale: 1, y: 0 }} exit={{ opacity: 0, scale: 0.95, y: 20 }}
        >
          {/* Header */}
          <div className="px-6 py-4 border-b border-[rgba(255,255,255,0.05)] flex items-center justify-between bg-black/20">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full flex items-center justify-center" style={{ background: 'rgba(0,212,255,0.1)' }}>
                <MapPin size={20} style={{ color: '#00D4FF' }} />
              </div>
              <div>
                <h3 className="font-bold text-lg text-white leading-tight">Detect Location</h3>
                <p className="text-xs text-slate-400">Finding your exact coordinates on the map</p>
              </div>
            </div>
            <button onClick={onClose} className="p-2 rounded-full hover:bg-white/5 transition-colors text-slate-400 hover:text-white">
              <X size={20} />
            </button>
          </div>

          {/* Map Area */}
          <div className="relative w-full h-[350px] bg-[#0a1929]">
            {loading ? (
              <div className="absolute inset-0 flex flex-col items-center justify-center bg-[#0a1929]/80 z-10 backdrop-blur-sm">
                <Loader2 size={40} className="animate-spin text-[#00D4FF] mb-4" />
                <div className="text-sm font-semibold tracking-wide text-[#00D4FF] uppercase">Locating satellites...</div>
              </div>
            ) : position ? (
              <MapContainer center={position} zoom={13} style={{ width: '100%', height: '100%' }} zoomControl={false}>
                <TileLayer
                  url="https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png"
                  attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/attributions">CARTO</a>'
                />
                <Marker position={position} />
                <MapUpdater center={position} />
              </MapContainer>
            ) : null}
          </div>

          {/* Footer */}
          <div className="p-6 bg-black/20 border-t border-[rgba(255,255,255,0.05)]">
            <div className="flex items-center gap-4">
              <div className="flex-1 bg-black/40 rounded-xl px-4 py-3 border border-white/5">
                <div className="text-[10px] uppercase font-bold text-slate-500 mb-1 tracking-wider">Detected Address</div>
                <div className="text-[15px] font-semibold text-white truncate">
                  {loading ? 'Searching...' : address || 'Unknown Location'}
                </div>
              </div>
              <button 
                disabled={loading || !address}
                onClick={() => { onSelect(address); onClose() }}
                className="h-[60px] px-8 rounded-xl font-bold flex items-center gap-2 transition-all disabled:opacity-50 disabled:cursor-not-allowed hover:scale-105 cursor-pointer"
                style={{ background: 'linear-gradient(135deg, #00D4FF, #00C853)', color: '#071B2E' }}
              >
                <Check size={20} /> Use Location
              </button>
            </div>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  )
}
