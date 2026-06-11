import type { AskPayload, AskResponse } from '../types/chat'
import { request } from './http'

export const chatService = {
  ask: (repoId: string, payload: AskPayload) =>
    request<AskResponse>(`/api/repos/${repoId}/ask`, {
      method: 'POST',
      body: JSON.stringify(payload),
    }),
}
