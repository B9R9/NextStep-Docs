import { http, HttpResponse } from 'msw'
import { LOCATION_VALUES } from '@/shared/references/catalog'

const cities = [...LOCATION_VALUES]

export const locationsHandlers = [
  http.get('/api/locations', ({ request }) => {
    const url = new URL(request.url)
    const query = (url.searchParams.get('query') || '').toLowerCase()
    const results = query
      ? cities.filter((city) => city.toLowerCase().includes(query)).slice(0, 8)
      : cities.slice(0, 8)
    return HttpResponse.json({ results })
  }),
]
