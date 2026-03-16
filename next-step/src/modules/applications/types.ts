export type Application = {
  id: number
  type: string
  position: string
  company_id: number | null
  status: string
  applied: string
  deadline: string
  hasCV: boolean
  hasCL: boolean
  jobId?: number | null
}
