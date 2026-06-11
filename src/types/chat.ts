export interface AskPayload {
  question: string
  top_k?: number
}

export interface AskResponse {
  answer: string
  chunks_used: number
}
