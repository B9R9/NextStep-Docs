import { http, HttpResponse } from 'msw'

type Company = {
  id: number
  name: string
  industry: string
  size: string
  location: string
  website: string
  career_page: string
  contactName: string
  contactEmail: string
  contactPhone: string
  socialMedia: string
  comments: string
  available_jobs: string
  total_applications: number
}

let companiesDb: Company[] = [
  {
    id: 1,
    name: 'Tech Corp',
    industry: 'Technology',
    size: '1000-5000',
    location: 'New York, NY',
    website: 'https://techcorp.com',
    career_page: 'https://techcorp.com/careers',
    contactName: 'John Smith',
    contactEmail: 'john.smith@techcorp.com',
    contactPhone: '+1 (555) 123-4567',
    socialMedia: 'https://www.linkedin.com/company/techcorp',
    comments: 'Great company culture, competitive salaries.',
    available_jobs: 'In progress',
    total_applications: 3,
  },
  {
    id: 2,
    name: 'Nimble Labs',
    industry: 'Technology',
    size: '200-500',
    location: 'Helsinki, FI',
    website: 'https://nimblelabs.fi',
    career_page: 'https://nimblelabs.fi/careers',
    contactName: 'Eva Niemi',
    contactEmail: 'eva@nimblelabs.fi',
    contactPhone: '+358 40 123 4567',
    socialMedia: 'https://www.linkedin.com/company/nimble-labs',
    comments: 'Strong research team.',
    available_jobs: 'In progress',
    total_applications: 1,
  },
  {
    id: 3,
    name: 'Lumen Labs',
    industry: 'Health',
    size: '50-200',
    location: 'Lyon, FR',
    website: 'https://lumenlabs.fr',
    career_page: 'https://lumenlabs.fr/jobs',
    contactName: 'Claire Dubois',
    contactEmail: 'claire@lumenlabs.fr',
    contactPhone: '+33 6 12 34 56 78',
    socialMedia: 'https://www.linkedin.com/company/lumen-labs',
    comments: 'Mission-driven, great leadership.',
    available_jobs: 'In progress',
    total_applications: 2,
  },
]

const sortCompanies = (rows: Company[], key: keyof Company, dir: 'asc' | 'desc') => {
  const sorted = [...rows]
  sorted.sort((a, b) => {
    const aVal = a[key]
    const bVal = b[key]
    if (typeof aVal === 'number' && typeof bVal === 'number') {
      return dir === 'asc' ? aVal - bVal : bVal - aVal
    }
    return dir === 'asc'
      ? String(aVal).localeCompare(String(bVal))
      : String(bVal).localeCompare(String(aVal))
  })
  return sorted
}

const matchesSearch = (company: Company, query: string) => {
  const q = query.toLowerCase()
  return Object.values(company).some((value) => String(value).toLowerCase().includes(q))
}

export const companiesHandlers = [
  http.get('/api/companies', ({ request }) => {
    const url = new URL(request.url)
    const sortKey = url.searchParams.get('sortKey') as keyof Company | null
    const sortDir = (url.searchParams.get('sortDir') || 'asc') as 'asc' | 'desc'
    const q = url.searchParams.get('q') || ''
    const industry = url.searchParams.get('industry') || ''
    let rows = companiesDb
    if (q.trim()) {
      rows = rows.filter((company) => matchesSearch(company, q))
    }
    if (industry.trim()) {
      rows = rows.filter((company) => company.industry.toLowerCase() === industry.toLowerCase())
    }
    if (sortKey) {
      rows = sortCompanies(rows, sortKey, sortDir)
    }
    return HttpResponse.json(rows)
  }),

  http.post('/api/companies', async ({ request }) => {
    const data = (await request.json()) as Partial<Company>
    const nextId = Math.max(0, ...companiesDb.map((row) => row.id)) + 1
    const newCompany: Company = {
      id: nextId,
      name: data.name ?? '',
      industry: data.industry ?? '',
      size: data.size ?? '',
      location: data.location ?? '',
      website: data.website ?? '',
      career_page: data.career_page ?? '',
      contactName: data.contactName ?? '',
      contactEmail: data.contactEmail ?? '',
      contactPhone: data.contactPhone ?? '',
      socialMedia: data.socialMedia ?? '',
      comments: data.comments ?? '',
      available_jobs: data.available_jobs ?? 'In progress',
      total_applications: data.total_applications ?? 0,
    }
    companiesDb = [...companiesDb, newCompany]
    return HttpResponse.json(newCompany, { status: 201 })
  }),

  http.put('/api/companies/:id', async ({ params, request }) => {
    const id = Number(params.id)
    const data = (await request.json()) as Partial<Company>
    const index = companiesDb.findIndex((row) => row.id === id)
    if (index === -1) {
      return HttpResponse.json({ message: 'Company not found' }, { status: 404 })
    }
    const updated: Company = { ...companiesDb[index]!, ...data, id } as Company
    companiesDb = companiesDb.map((row, idx) => (idx === index ? updated : row))
    return HttpResponse.json(updated)
  }),

  http.delete('/api/companies/:id', ({ params }) => {
    const id = Number(params.id)
    companiesDb = companiesDb.filter((row) => row.id !== id)
    return HttpResponse.json({ success: true })
  }),
]
