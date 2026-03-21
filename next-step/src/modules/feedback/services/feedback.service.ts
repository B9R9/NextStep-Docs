import { http } from '@/shared/api/http'

export type FeedbackSubject = 'feedback' | 'bug' | 'feature_request' | 'question' | 'performance' | 'other'

export interface SubmitFeedbackPayload {
  subject: FeedbackSubject
  message: string
  is_anonymous: boolean
}

export const submitFeedback = async (payload: SubmitFeedbackPayload): Promise<void> => {
  await http.post('/feedback', payload)
}
