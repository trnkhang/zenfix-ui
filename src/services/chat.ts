import type { AskPayload, AskResponse, ChatPayload, ChatResponse } from '../types/chat'
import { request } from './http'

export const chatService = {
  ask: (repoId: string, payload: AskPayload) =>
    request<AskResponse>(`/api/repos/${repoId}/ask`, {
      method: 'POST',
      body: JSON.stringify(payload),
    }),
  chat: (repoId: string, payload: ChatPayload) =>
    request<ChatResponse>(`/api/repos/${repoId}/chat`, {
      method: 'POST',
      body: JSON.stringify(payload),
    }),
}
