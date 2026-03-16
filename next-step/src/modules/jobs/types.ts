export type Job = {
  id: number
  company_id: number | null
  company_name?: string
  position: string
  industry: string
  work_mode: string
  location: string
  contract: string
  level: string
  published_at: string
  deadline_at: string
  link: string
  languages: string[]
  description: string
  requirements: string
}
