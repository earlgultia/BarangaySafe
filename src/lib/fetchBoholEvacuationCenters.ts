import { supabase } from './supabase'

export type FetchedEvacuationCenter = {
  name: string
  municipality: string
  barangay: string
  address: string
  latitude: number
  longitude: number
  contact_number: string
  capacity: number
  current_occupancy: number
}

// Fetch evacuation centers from Bohol ArcGIS server
export async function fetchBoholEvacuationCentersFromArcGIS(): Promise<FetchedEvacuationCenter[]> {
  try {
    console.log('Fetching evacuation centers from Bohol ArcGIS server...')

    const arcgisUrl =
      'https://services.arcgis.com/LG9Yn2oFqZi5PnO5/ArcGIS/rest/services/EvacuationRoutesBoholProjects/FeatureServer/0/query'

    const params = new URLSearchParams({
      where: '1=1',
      outFields: '*',
      returnGeometry: 'true',
      f: 'geojson',
    })

    const response = await fetch(`${arcgisUrl}?${params}`)
    const data = await response.json()

    console.log('ArcGIS Response:', data)

    const centers: FetchedEvacuationCenter[] = []

    if (data.features && Array.isArray(data.features)) {
      data.features.forEach((feature: any) => {
        const props = feature.properties || {}
        const coords = feature.geometry?.coordinates || [123.95, 9.59]

        centers.push({
          name: props.NAME || props.name || 'Evacuation Center',
          municipality: props.MUNICIPALITY || props.municipality || 'Bohol',
          barangay: props.BARANGAY || props.barangay || '',
          address:
            props.ADDRESS || props.address || `${props.barangay || ''}, ${props.municipality || 'Bohol'}, Philippines`,
          latitude: coords[1],
          longitude: coords[0],
          contact_number: props.CONTACT || props.contact || '',
          capacity: parseInt(props.CAPACITY || props.capacity) || 100,
          current_occupancy: 0,
        })
      })
    }

    console.log(`Found ${centers.length} evacuation centers from ArcGIS`)
    return centers
  } catch (error) {
    console.error('Error fetching from ArcGIS:', error)
    return []
  }
}

// Fetch from OpenStreetMap using Overpass API
export async function fetchBoholEvacuationCentersFromOSM(): Promise<FetchedEvacuationCenter[]> {
  try {
    console.log('Fetching evacuation centers from OpenStreetMap Overpass API...')

    const overpassUrl = 'https://overpass-api.de/api/interpreter'
    const query = `
      [bbox:9.4,123.6,10.4,124.5];
      (
        node["amenity"="shelter"]["shelter_type"="evacuation"];
        way["amenity"="shelter"]["shelter_type"="evacuation"];
        node["building"="evacuation_center"];
      );
      out center;
    `

    const response = await fetch(overpassUrl, {
      method: 'POST',
      body: query,
    })

    const data = await response.json()
    console.log('OSM Response:', data)

    const centers: FetchedEvacuationCenter[] = []

    if (data.elements && Array.isArray(data.elements)) {
      data.elements.forEach((element: any) => {
        if (element.tags?.name && element.lat && element.lon) {
          centers.push({
            name: element.tags.name,
            municipality: element.tags['addr:municipality'] || 'Bohol',
            barangay: element.tags['addr:barangay'] || '',
            address: `${element.tags['addr:street'] || ''}, ${element.tags['addr:municipality'] || 'Bohol'}`.trim(),
            latitude: element.lat,
            longitude: element.lon,
            contact_number: element.tags.phone || '',
            capacity: 100,
            current_occupancy: 0,
          })
        }
      })
    }

    console.log(`Found ${centers.length} evacuation centers from OSM`)
    return centers
  } catch (error) {
    console.error('Error fetching from OSM:', error)
    return []
  }
}

// Insert evacuation centers into Supabase
export async function insertEvacuationCentersToDatabase(
  centers: FetchedEvacuationCenter[]
): Promise<{ success: boolean; inserted: number; errors: string[] }> {
  try {
    console.log(`Inserting ${centers.length} evacuation centers into database...`)

    const errors: string[] = []
    let inserted = 0

    // Insert in batches to avoid overwhelming the database
    const batchSize = 10
    for (let i = 0; i < centers.length; i += batchSize) {
      const batch = centers.slice(i, i + batchSize)

      const { error } = await supabase.from('evacuation_centers').insert(batch)

      if (error) {
        console.error(`Error inserting batch ${i / batchSize + 1}:`, error)
        errors.push(`Batch ${i / batchSize + 1}: ${error.message}`)
      } else {
        inserted += batch.length
        console.log(`Successfully inserted batch ${i / batchSize + 1} (${batch.length} centers)`)
      }
    }

    return {
      success: errors.length === 0,
      inserted,
      errors,
    }
  } catch (error) {
    console.error('Error inserting evacuation centers:', error)
    return {
      success: false,
      inserted: 0,
      errors: [error instanceof Error ? error.message : 'Unknown error'],
    }
  }
}

// Main function: Fetch from ArcGIS and insert to database
export async function syncBoholEvacuationCenters(): Promise<{
  success: boolean
  fetched: number
  inserted: number
  errors: string[]
}> {
  try {
    console.log('Starting Bohol evacuation center sync...')

    // Fetch from ArcGIS
    const centers = await fetchBoholEvacuationCentersFromArcGIS()

    if (centers.length === 0) {
      console.warn('No centers fetched from ArcGIS, trying OSM...')
      const osmCenters = await fetchBoholEvacuationCentersFromOSM()
      if (osmCenters.length > 0) {
        centers.push(...osmCenters)
      }
    }

    if (centers.length === 0) {
      return {
        success: false,
        fetched: 0,
        inserted: 0,
        errors: ['No evacuation centers found from any source'],
      }
    }

    // Insert to database
    const result = await insertEvacuationCentersToDatabase(centers)

    console.log('Sync complete:', result)

    return {
      success: result.success,
      fetched: centers.length,
      inserted: result.inserted,
      errors: result.errors,
    }
  } catch (error) {
    console.error('Error during sync:', error)
    return {
      success: false,
      fetched: 0,
      inserted: 0,
      errors: [error instanceof Error ? error.message : 'Unknown error'],
    }
  }
}

