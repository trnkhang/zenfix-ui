export interface AskPayload {
  question: string
  top_k?: number
}

export interface AskResponse {
  answer: string
  chunks_used: number
}

export interface ChatPayload {
  message: string
}

export interface ChatAskResponse {
  type: 'ask'
  answer: string
  chunks_used: number
}

export interface ChatBugResponse {
  type: 'bug'
  job_id: string
  job: import('./job').Job
}

export type ChatResponse = ChatAskResponse | ChatBugResponse
