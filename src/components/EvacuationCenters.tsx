import { useEffect, useMemo, useState } from 'react'
import { motion } from 'framer-motion'
import { MapContainer, Marker, TileLayer, useMap } from 'react-leaflet'
import type { LatLngExpression } from 'leaflet'
import L from 'leaflet'
import 'leaflet/dist/leaflet.css'
import { fetchEvacuationCenters, type EvacuationCenter } from '../lib/evacuation'

const markerIcon = new L.Icon({
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon.png',
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon-2x.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-shadow.png',
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41],
})

function MapCenter({ center }: { center: LatLngExpression }) {
  const map = useMap()
  useEffect(() => {
    map.setView(center, 11)
  }, [center, map])
  return null
}

export default function EvacuationCenters() {
  const [centers, setCenters] = useState<EvacuationCenter[]>([])
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    async function loadCenters() {
      setLoading(true)
      const { data, error } = await fetchEvacuationCenters()
      setLoading(false)
      if (!error && data) {
        setCenters(data)
      }
    }

    void loadCenters()
  }, [])

  const mapCenter = useMemo<LatLngExpression>(() => {
    if (centers.length === 0) return [14.5995, 120.9842]
    const avgLat = centers.reduce((sum, center) => sum + center.latitude, 0) / centers.length
    const avgLon = centers.reduce((sum, center) => sum + center.longitude, 0) / centers.length
    return [avgLat, avgLon]
  }, [centers])

  return (
    <section className="evacuation-center-panel">
      <div className="section-header">
        <div>
          <p className="report-subtitle">Evacuation centers</p>
          <h2>Nearby shelters and capacity</h2>
          <p>Monitor current occupancy and get directions for the nearest evacuation centers.</p>
        </div>
      </div>

      <div className="evacuation-grid">
        <div className="evacuation-list">
          {loading ? (
            <div className="alert-empty">Loading centers…</div>
          ) : centers.length === 0 ? (
            <div className="alert-empty">No evacuation center data available.</div>
          ) : (
            centers.map((center) => {
              const ratio = Math.min(center.current_occupancy / center.capacity, 1)
              const occupancyText = `${center.current_occupancy} / ${center.capacity}`
              const directionsUrl = `https://www.google.com/maps/dir/?api=1&destination=${center.latitude},${center.longitude}`

              return (
                <motion.article
                  key={center.id}
                  className="evacuation-card"
                  initial={{ opacity: 0, y: 16 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.25 }}
                >
                  <div className="evacuation-card-top">
                    <div>
                      <h3>{center.name}</h3>
                      <p>{center.address ?? 'No address provided'}</p>
                    </div>
                    <span className="contact-pill">{center.contact_number}</span>
                  </div>

                  <div className="occupancy-row">
                    <span>Occupancy</span>
                    <strong>{occupancyText}</strong>
                  </div>

                  <div className="progress-bar">
                    <motion.div
                      className="progress-fill"
                      initial={{ width: 0 }}
                      animate={{ width: `${ratio * 100}%` }}
                      transition={{ duration: 0.65, ease: 'easeOut' }}
                    />
                  </div>

                  <p className="progress-label">{Math.round(ratio * 100)}% full</p>

                  <div className="evacuation-card-footer">
                    <a className="directions-link" href={directionsUrl} target="_blank" rel="noreferrer">
                      Get directions
                    </a>
                    <span>{center.latitude.toFixed(4)}, {center.longitude.toFixed(4)}</span>
                  </div>
                </motion.article>
              )
            })
          )}
        </div>

        <div className="evacuation-map-card">
          <MapContainer center={mapCenter} zoom={11} className="evacuation-map">
            <MapCenter center={mapCenter} />
            <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
            {centers.map((center) => (
              <Marker
                key={center.id}
                position={[center.latitude, center.longitude]}
                icon={markerIcon}
              />
            ))}
          </MapContainer>
        </div>
      </div>
    </section>
  )
}
