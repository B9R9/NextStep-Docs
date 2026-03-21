import { http, HttpResponse } from 'msw'

const REMOTE = 'Remote'

const CITIES = [
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

export const locationsHandlers = [
  http.get('/api/locations', ({ request }) => {
    const url = new URL(request.url)
    const query = (url.searchParams.get('query') || '').toLowerCase().trim()

    if (!query) {
      return HttpResponse.json({ results: [REMOTE, ...CITIES.slice(0, 7)] })
    }

    const includeRemote = REMOTE.toLowerCase().startsWith(query)
    const matches = CITIES.filter((city) => city.toLowerCase().includes(query)).slice(0, includeRemote ? 7 : 8)
    const results = includeRemote ? [REMOTE, ...matches] : matches

    return HttpResponse.json({ results })
  }),
]
