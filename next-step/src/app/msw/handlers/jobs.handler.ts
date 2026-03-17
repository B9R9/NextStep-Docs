import { http, HttpResponse } from 'msw'
import type { Job } from '@/modules/jobs/types'

let jobsDb: Job[] = [
  {
    id: 1,
    company_id: 1,
    position: 'Software Engineer',
    industry: 'tech',
    work_mode: 'onsite',
    location: 'New York, NY',
    contract: 'full_time',
    level: 'mid',
    published_at: '2024-06-15',
    deadline_at: '2024-07-15',
    link: 'https://techcorp.com/careers/12345',
    languages: ['en'],
    description:
      'Build and evolve a high-traffic web platform used by internal teams and external partners. You will design, implement, and maintain reliable services, collaborate with product and design, and participate in code reviews. Expect hands-on delivery, ownership of features end-to-end, and continuous improvement of performance, observability, and developer experience.',
    requirements:
      "Bachelor's degree in Computer Science (or equivalent experience).\n3+ years of professional software development.\nStrong JavaScript/TypeScript fundamentals.\nExperience with modern frontend frameworks (Vue/React).\nFamiliarity with REST APIs and data modeling.\nComfortable with Git workflows and code reviews.\nBonus: CI/CD, monitoring, or cloud experience.",
  },
  {
    id: 2,
    company_id: 2,
    position: 'Product Designer',
    industry: 'tech',
    work_mode: 'hybrid',
    location: 'Paris, FR',
    contract: 'full_time',
    level: 'mid',
    published_at: '2024-05-10',
    deadline_at: '2024-06-10',
    link: '',
    languages: ['fr', 'en'],
    description:
      'Own the end-to-end design process for key product flows: discovery, wireframes, prototyping, and final UI. Partner closely with PM and engineering to ship high-quality features, and contribute to the design system to keep the experience consistent across the product.',
    requirements:
      '3+ years in product design.\nStrong portfolio with shipped work.\nExperience with design systems and component libraries.\nClear communication and collaboration skills.',
  },
  {
    id: 3,
    company_id: 3,
    position: 'Data Analyst',
    industry: 'finance',
    work_mode: 'remote',
    location: 'Remote',
    contract: 'full_time',
    level: 'junior',
    published_at: '2024-04-02',
    deadline_at: '2024-05-02',
    link: 'https://example.com/job/3',
    languages: ['en'],
    description: 'Analyze metrics and build dashboards.',
    requirements: 'SQL + Excel required.',
  },
  {
    id: 4,
    company_id: 4,
    position: 'Marketing Ops',
    industry: 'saas',
    work_mode: 'onsite',
    location: 'Berlin, DE',
    contract: 'part_time',
    level: 'mid',
    published_at: '2024-03-12',
    deadline_at: '2024-04-12',
    link: '',
    languages: ['de', 'en'],
    description: 'Own marketing operations and tooling.',
    requirements: 'Marketing ops experience.',
  },
  {
    id: 5,
    company_id: 5,
    position: 'UX Writer',
    industry: 'health',
    work_mode: 'hybrid',
    location: 'Lyon, FR',
    contract: 'full_time',
    level: 'senior',
    published_at: '2024-06-01',
    deadline_at: '2024-07-01',
    link: 'https://example.com/job/5',
    languages: ['fr'],
    description: 'Craft UX copy for key journeys.',
    requirements: 'Portfolio required.',
  },
]

const sortJobs = (rows: Job[], key: keyof Job, dir: 'asc' | 'desc') => {
  const sorted = [...rows]
  sorted.sort((a, b) => {
    const aVal = a[key]
    const bVal = b[key]
    if (typeof aVal === 'number' && typeof bVal === 'number') {
      return dir === 'asc' ? aVal - bVal : bVal - aVal
    }
    if (Array.isArray(aVal) && Array.isArray(bVal)) {
      return dir === 'asc'
        ? aVal.join(',').localeCompare(bVal.join(','))
        : bVal.join(',').localeCompare(aVal.join(','))
    }
    return dir === 'asc'
      ? String(aVal).localeCompare(String(bVal))
      : String(bVal).localeCompare(String(aVal))
  })
  return sorted
}

const matchesSearch = (job: Job, query: string) => {
  const q = query.toLowerCase()
  return Object.values(job).some((value) => String(value).toLowerCase().includes(q))
}

export const jobsHandlers = [
  http.get('/api/jobs', ({ request }) => {
    const url = new URL(request.url)
    const sortKey = url.searchParams.get('sortKey') as keyof Job | null
    const sortDir = (url.searchParams.get('sortDir') || 'asc') as 'asc' | 'desc'
    const q = url.searchParams.get('q') || ''
    let rows = jobsDb
    if (q.trim()) {
      rows = rows.filter((job) => matchesSearch(job, q))
    }
    if (sortKey) {
      rows = sortJobs(rows, sortKey, sortDir)
    }
    return HttpResponse.json(rows)
  }),

  http.post('/api/jobs', async ({ request }) => {
    const data = (await request.json()) as Partial<Job>
    const nextId = Math.max(0, ...jobsDb.map((row) => row.id)) + 1
    const newJob: Job = {
      id: nextId,
      company_id: data.company_id ?? null,
      position: data.position ?? '',
      industry: data.industry ?? '',
      work_mode: data.work_mode ?? 'onsite',
      location: data.location ?? '',
      contract: data.contract ?? 'full_time',
      level: data.level ?? 'mid',
      published_at: data.published_at ?? '',
      deadline_at: data.deadline_at ?? '',
      link: data.link ?? '',
      languages: data.languages ?? [],
      description: data.description ?? '',
      requirements: data.requirements ?? '',
    }
    jobsDb = [...jobsDb, newJob]
    return HttpResponse.json(newJob, { status: 201 })
  }),

  http.put('/api/jobs/:id', async ({ params, request }) => {
    const id = Number(params.id)
    const data = (await request.json()) as Partial<Job>
    const index = jobsDb.findIndex((row) => row.id === id)
    if (index === -1) {
      return HttpResponse.json({ message: 'Job not found' }, { status: 404 })
    }
    const updated: Job = { ...jobsDb[index]!, ...data, id }
    jobsDb = jobsDb.map((row, idx) => (idx === index ? updated : row))
    return HttpResponse.json(updated)
  }),

  http.delete('/api/jobs/:id', ({ params }) => {
    const id = Number(params.id)
    jobsDb = jobsDb.filter((row) => row.id !== id)
    return HttpResponse.json({ success: true })
  }),
]
