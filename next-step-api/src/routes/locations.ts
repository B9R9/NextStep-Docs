import { Router } from 'express'

const cities = [
  'New York, NY',
  'San Francisco, CA',
  'Los Angeles, CA',
  'Seattle, WA',
  'Austin, TX',
  'Boston, MA',
  'Chicago, IL',
  'Miami, FL',
  'Paris, FR',
  'Lyon, FR',
  'Bordeaux, FR',
  'Berlin, DE',
  'Helsinki, FI',
  'Stockholm, SE',
  'London, UK',
  'Dublin, IE',
  'Amsterdam, NL',
  'Lisbon, PT',
  'Madrid, ES',
  'Milan, IT',
]

export const locationsRoutes = Router()

locationsRoutes.get('/', (req, res) => {
  const query = String(req.query.query ?? '').trim().toLowerCase()
  const results = query
    ? cities.filter((city) => city.toLowerCase().includes(query)).slice(0, 8)
    : cities.slice(0, 8)

  return res.json({ results })
})
