import { Router } from 'express'

const REMOTE = 'Remote'

// Fallback used if Photon is unreachable
const FALLBACK_CITIES = [
  'Paris, FR', 'Lyon, FR', 'Bordeaux, FR', 'Lille, FR', 'Marseille, FR', 'Toulouse, FR', 'Nantes, FR', 'Rennes, FR',
  'Helsinki, FI', 'Tampere, FI', 'Espoo, FI', 'Turku, FI',
  'Stockholm, SE', 'Gothenburg, SE', 'Malmö, SE',
  'Copenhagen, DK', 'Aarhus, DK',
  'London, GB', 'Manchester, GB', 'Edinburgh, GB', 'Bristol, GB',
  'Amsterdam, NL', 'Rotterdam, NL', 'Utrecht, NL',
  'Berlin, DE', 'Munich, DE', 'Hamburg, DE', 'Frankfurt, DE', 'Cologne, DE',
  'Madrid, ES', 'Barcelona, ES', 'Valencia, ES',
  'Milan, IT', 'Rome, IT',
  'Dublin, IE', 'Lisbon, PT', 'Vienna, AT', 'Zurich, CH', 'Brussels, BE',
  'New York, US', 'San Francisco, US', 'Los Angeles, US', 'Chicago, US', 'Austin, US', 'Seattle, US', 'Boston, US',
  'Toronto, CA', 'Montreal, CA', 'Vancouver, CA',
]

type PhotonFeature = {
  properties: {
    name?: string
    countrycode?: string
    osm_value?: string
    type?: string
  }
}

type PhotonResponse = {
  features: PhotonFeature[]
}

const PLACE_TYPES = new Set(['city', 'town', 'district', 'municipality', 'borough'])

const formatCity = (feature: PhotonFeature): string | null => {
  const { name, countrycode, osm_value, type } = feature.properties
  if (!name) return null
  if (!PLACE_TYPES.has(osm_value ?? '') && !PLACE_TYPES.has(type ?? '')) return null
  return countrycode ? `${name}, ${countrycode.toUpperCase()}` : name
}

export const locationsRoutes = Router()

locationsRoutes.get('/', async (req, res) => {
  const query = String(req.query.query ?? '').trim()

  if (!query) {
    return res.json({ results: [REMOTE, ...FALLBACK_CITIES.slice(0, 7)] })
  }

  const includeRemote = REMOTE.toLowerCase().startsWith(query.toLowerCase())

  try {
    const url = `https://photon.komoot.io/api/?q=${encodeURIComponent(query)}&limit=12&lang=en`
    console.log(`[locations] Photon request: ${url}`)

    const response = await fetch(url, { signal: AbortSignal.timeout(3000) })

    if (!response.ok) throw new Error(`Photon error: ${response.status}`)

    const data = await response.json() as PhotonResponse
    console.log(`[locations] Photon raw features (${data.features.length}):`, data.features.map(f => f.properties))

    const cities = data.features
      .map(formatCity)
      .filter((c): c is string => c !== null)

    const unique = [...new Set(cities)].slice(0, includeRemote ? 7 : 8)
    const results = includeRemote ? [REMOTE, ...unique] : unique

    console.log(`[locations] Results returned:`, results)
    return res.json({ results })
  } catch (err) {
    console.error(`[locations] Photon failed, using fallback:`, err)
    const q = query.toLowerCase()
    const fallback = [REMOTE, ...FALLBACK_CITIES]
      .filter((city) => city.toLowerCase().includes(q))
      .slice(0, 8)
    return res.json({ results: fallback })
  }
})
