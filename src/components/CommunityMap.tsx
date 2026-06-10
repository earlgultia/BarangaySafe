import { useEffect, useMemo, useState } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import {
  CircleMarker,
  LayerGroup,
  LayersControl,
  MapContainer,
  Marker,
  Polygon,
  Popup,
  TileLayer,
  useMap,
} from 'react-leaflet'
import type { LatLngExpression } from 'leaflet'
import L from 'leaflet'
import 'leaflet/dist/leaflet.css'
import {
  fetchAssemblyPoints,
  fetchFloodAreas,
  fetchIncidentReportsForMap,
  fetchLandslideAreas,
  type AssemblyPoint,
  type GeoArea,
  type IncidentMapReport,
} from '../lib/mapData'
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

const floodAreaStyle = {
  fillColor: '#3b82f6',
  color: '#1d4ed8',
  fillOpacity: 0.2,
  weight: 2,
}

const landslideAreaStyle = {
  fillColor: '#f97316',
  color: '#c2410c',
  fillOpacity: 0.2,
  weight: 2,
}

function MapCenter({ center }: { center: LatLngExpression }) {
  const map = useMap()

  useEffect(() => {
    map.setView(center, 11)
  }, [center, map])

  return null
}

type SelectedItem =
  | { kind: 'evac'; center: EvacuationCenter }
  | { kind: 'assembly'; point: AssemblyPoint }
  | { kind: 'incident'; report: IncidentMapReport }
  | { kind: 'area'; area: GeoArea; category: 'Flood' | 'Landslide' }

export default function CommunityMap() {
  const [centers, setCenters] = useState<EvacuationCenter[]>([])
  const [assemblyPoints, setAssemblyPoints] = useState<AssemblyPoint[]>([])
  const [floodAreas, setFloodAreas] = useState<GeoArea[]>([])
  const [landslideAreas, setLandslideAreas] = useState<GeoArea[]>([])
  const [incidentReports, setIncidentReports] = useState<IncidentMapReport[]>([])
  const [selectedItem, setSelectedItem] = useState<SelectedItem | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    async function load() {
      setLoading(true)
      const [evacuation, assembly, floods, landslides, incidents] = await Promise.all([
        fetchEvacuationCenters(),
        fetchAssemblyPoints(),
        fetchFloodAreas(),
        fetchLandslideAreas(),
        fetchIncidentReportsForMap(),
      ])

      if (evacuation.error || assembly.error || floods.error || landslides.error || incidents.error) {
        setError('Unable to load mapping data. Please refresh.')
        setLoading(false)
        return
      }

      setCenters(evacuation.data ?? [])
      setAssemblyPoints(assembly.data ?? [])
      setFloodAreas(floods.data ?? [])
      setLandslideAreas(landslides.data ?? [])
      setIncidentReports(incidents.data ?? [])
      setLoading(false)
    }

    void load()
  }, [])

  const mapCenter = useMemo<LatLngExpression>(() => {
    const points: LatLngExpression[] = []
    centers.forEach((item) => points.push([item.latitude, item.longitude]))
    assemblyPoints.forEach((item) => points.push([item.latitude, item.longitude]))
    incidentReports.forEach((item) => points.push([item.latitude, item.longitude]))

    if (points.length === 0) {
      return [14.5995, 120.9842]
    }

    const avgLat = points.reduce((sum, point) => sum + (point[0] as number), 0) / points.length
    const avgLng = points.reduce((sum, point) => sum + (point[1] as number), 0) / points.length
    return [avgLat, avgLng]
  }, [assemblyPoints, centers, incidentReports])

  return (
    <section className="map-panel">
      <div className="panel-header">
        <div>
          <p className="report-subtitle">Community map</p>
          <h2>Layered hazard and shelter map</h2>
          <p>Toggle evacuation centers, flood areas, landslide zones, assembly points, and incident reports.</p>
        </div>
      </div>

      <div className="map-panel-inner">
        <div className="map-card">
          {loading ? (
            <div className="alert-empty">Loading map layers…</div>
          ) : error ? (
            <div className="alert-empty">{error}</div>
          ) : (
            <MapContainer center={mapCenter} zoom={11} className="community-map">
              <MapCenter center={mapCenter} />
              <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
              <LayersControl position="topright">
                <LayersControl.Overlay checked name="Evacuation Centers">
                  <LayerGroup>
                    {centers.map((center) => (
                      <Marker
                        key={`evac-${center.id}`}
                        position={[center.latitude, center.longitude]}
                        icon={markerIcon}
                        eventHandlers={{
                          click: () => setSelectedItem({ kind: 'evac', center }),
                        }}
                      >
                        <Popup>
                          <strong>{center.name}</strong>
                          <p>{center.address ?? 'No address provided'}</p>
                          <p>
                            Occupancy {center.current_occupancy} / {center.capacity}
                          </p>
                        </Popup>
                      </Marker>
                    ))}
                  </LayerGroup>
                </LayersControl.Overlay>

                <LayersControl.Overlay checked name="Assembly Points">
                  <LayerGroup>
                    {assemblyPoints.map((point) => (
                      <Marker
                        key={`assembly-${point.id}`}
                        position={[point.latitude, point.longitude]}
                        icon={markerIcon}
                        eventHandlers={{
                          click: () => setSelectedItem({ kind: 'assembly', point }),
                        }}
                      >
                        <Popup>
                          <strong>{point.name}</strong>
                          <p>{point.description ?? 'Assembly point location'}</p>
                        </Popup>
                      </Marker>
                    ))}
                  </LayerGroup>
                </LayersControl.Overlay>

                <LayersControl.Overlay checked name="Incident Reports">
                  <LayerGroup>
                    {incidentReports.map((report) => (
                      <CircleMarker
                        key={`incident-${report.id}`}
                        center={[report.latitude, report.longitude]}
                        pathOptions={{ color: '#db2777', fillColor: '#fb7185', fillOpacity: 0.6 }}
                        radius={10}
                        eventHandlers={{
                          click: () => setSelectedItem({ kind: 'incident', report }),
                        }}
                      >
                        <Popup>
                          <strong>Incident</strong>
                          <p>{report.description}</p>
                          <p>Status: {report.status}</p>
                        </Popup>
                      </CircleMarker>
                    ))}
                  </LayerGroup>
                </LayersControl.Overlay>

                <LayersControl.Overlay checked name="Flood Areas">
                  <LayerGroup>
                    {floodAreas.map((area) => (
                      <Polygon
                        key={`flood-${area.id}`}
                        pathOptions={floodAreaStyle}
                        positions={area.coordinates.map((coord) => [coord.latitude, coord.longitude] as LatLngExpression)}
                        eventHandlers={{
                          click: () => setSelectedItem({ kind: 'area', area, category: 'Flood' }),
                        }}
                      >
                        <Popup>
                          <strong>{area.name}</strong>
                          <p>{area.description ?? 'Flood-prone area'}</p>
                        </Popup>
                      </Polygon>
                    ))}
                  </LayerGroup>
                </LayersControl.Overlay>

                <LayersControl.Overlay checked name="Landslide Areas">
                  <LayerGroup>
                    {landslideAreas.map((area) => (
                      <Polygon
                        key={`landslide-${area.id}`}
                        pathOptions={landslideAreaStyle}
                        positions={area.coordinates.map((coord) => [coord.latitude, coord.longitude] as LatLngExpression)}
                        eventHandlers={{
                          click: () => setSelectedItem({ kind: 'area', area, category: 'Landslide' }),
                        }}
                      >
                        <Popup>
                          <strong>{area.name}</strong>
                          <p>{area.description ?? 'Landslide-prone area'}</p>
                        </Popup>
                      </Polygon>
                    ))}
                  </LayerGroup>
                </LayersControl.Overlay>
              </LayersControl>
            </MapContainer>
          )}
        </div>

        <AnimatePresence>
          {selectedItem ? (
            <motion.article
              className="map-popup-card"
              initial={{ opacity: 0, y: 18 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 12 }}
              transition={{ duration: 0.25 }}
            >
              <div className="popup-header">
                <div>
                  <p className="report-subtitle">Layer detail</p>
                  <h3>
                    {selectedItem.kind === 'evac' && selectedItem.center.name}
                    {selectedItem.kind === 'assembly' && selectedItem.point.name}
                    {selectedItem.kind === 'incident' && 'Incident report'}
                    {selectedItem.kind === 'area' && `${selectedItem.category} zone: ${selectedItem.area.name}`}
                  </h3>
                </div>
                <button className="close-popup" onClick={() => setSelectedItem(null)}>
                  Close
                </button>
              </div>

              {selectedItem.kind === 'evac' && (
                <div className="popup-content">
                  <p>{selectedItem.center.address ?? 'No address provided.'}</p>
                  <p>
                    Capacity: {selectedItem.center.current_occupancy} / {selectedItem.center.capacity}
                  </p>
                  <p>Contact: {selectedItem.center.contact_number}</p>
                </div>
              )}

              {selectedItem.kind === 'assembly' && (
                <div className="popup-content">
                  <p>{selectedItem.point.description ?? 'Assembly point details not available.'}</p>
                  <p>Lat: {selectedItem.point.latitude.toFixed(4)}</p>
                  <p>Lng: {selectedItem.point.longitude.toFixed(4)}</p>
                </div>
              )}

              {selectedItem.kind === 'incident' && (
                <div className="popup-content">
                  <p>{selectedItem.report.description}</p>
                  <p>Status: {selectedItem.report.status}</p>
                  <p>{new Date(selectedItem.report.created_at).toLocaleString()}</p>
                </div>
              )}

              {selectedItem.kind === 'area' && (
                <div className="popup-content">
                  <p>{selectedItem.area.description ?? `${selectedItem.category} hazard area`}</p>
                  <p>Severity: {selectedItem.area.severity ?? 'Unspecified'}</p>
                  <p>Vertices: {selectedItem.area.coordinates.length}</p>
                </div>
              )}
            </motion.article>
          ) : null}
        </AnimatePresence>
      </div>
    </section>
  )
}
