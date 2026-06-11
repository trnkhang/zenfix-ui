import { useEffect, useRef, useState } from 'react'
import { chatService, reposService } from '../services'
import type { Repo } from '../types'

interface Message {
  role: 'user' | 'assistant'
  content: string
  chunksUsed?: number
}

export function ChatPage() {
  const [repos, setRepos] = useState<Repo[]>([])
  const [selectedRepoId, setSelectedRepoId] = useState<string>('')
  const [messages, setMessages] = useState<Message[]>([])
  const [input, setInput] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const bottomRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    reposService.list().then((data) => {
      const indexed = data.filter((r) => r.status === 'indexed')
      setRepos(indexed)
      if (indexed.length > 0) setSelectedRepoId(indexed[0].id)
    })
  }, [])

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages, loading])

  async function handleSend(e: React.FormEvent) {
    e.preventDefault()
    const q = input.trim()
    if (!q || !selectedRepoId || loading) return

    setInput('')
    setError(null)
    setMessages((prev) => [...prev, { role: 'user', content: q }])
    setLoading(true)

    try {
      const res = await chatService.ask(selectedRepoId, { question: q })
      setMessages((prev) => [
        ...prev,
        { role: 'assistant', content: res.answer, chunksUsed: res.chunks_used },
      ])
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Request failed')
    } finally {
      setLoading(false)
    }
  }

  function handleKeyDown(e: React.KeyboardEvent<HTMLTextAreaElement>) {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleSend(e as unknown as React.FormEvent)
    }
  }

  const selectedRepo = repos.find((r) => r.id === selectedRepoId)

  return (
    <div className="flex h-[calc(100vh-73px)] flex-col">
      {/* Header */}
      <div className="flex items-center gap-4 border-b border-zinc-100 bg-white px-6 py-3">
        <label className="text-sm font-medium text-zinc-600 whitespace-nowrap">Repo:</label>
        {repos.length === 0 ? (
          <p className="text-sm text-zinc-400">No indexed repos — add one in Repositories first.</p>
        ) : (
          <select
            value={selectedRepoId}
            onChange={(e) => {
              setSelectedRepoId(e.target.value)
              setMessages([])
            }}
            className="rounded-lg border border-zinc-200 bg-zinc-50 px-3 py-1.5 text-sm outline-none focus:border-zinc-400 focus:bg-white"
          >
            {repos.map((r) => (
              <option key={r.id} value={r.id}>
                {r.name}
              </option>
            ))}
          </select>
        )}
        {selectedRepo && (
          <span className="text-xs text-zinc-400">
            {selectedRepo.chunksIndexed.toLocaleString()} chunks indexed
          </span>
        )}
        {messages.length > 0 && (
          <button
            onClick={() => setMessages([])}
            className="ml-auto text-xs text-zinc-400 hover:text-zinc-600"
          >
            Clear
          </button>
        )}
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto px-6 py-6 space-y-6">
        {messages.length === 0 && !loading && (
          <div className="flex flex-col items-center justify-center h-full text-center pb-16">
            <div className="text-4xl mb-3">💬</div>
            <p className="font-medium text-zinc-700">Ask anything about the repo</p>
            <p className="mt-1 text-sm text-zinc-400">
              e.g. "What does this repo do?", "Where is auth handled?", "How is the DB structured?"
            </p>
            <div className="mt-4 flex flex-wrap justify-center gap-2">
              {[
                'What does this repo do?',
                'What are the main components?',
                'How is the database accessed?',
                'Where is authentication handled?',
              ].map((q) => (
                <button
                  key={q}
                  onClick={() => setInput(q)}
                  className="rounded-full border border-zinc-200 bg-white px-3 py-1.5 text-xs text-zinc-600 transition-colors hover:border-zinc-400 hover:bg-zinc-50"
                >
                  {q}
                </button>
              ))}
            </div>
          </div>
        )}

        {messages.map((msg, i) => (
          <div key={i} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
            {msg.role === 'assistant' && (
              <div className="mr-3 flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-zinc-900 text-xs text-white">
                Z
              </div>
            )}
            <div className={`max-w-[75%] ${msg.role === 'user' ? 'order-first' : ''}`}>
              <div
                className={`rounded-2xl px-4 py-3 text-sm leading-relaxed whitespace-pre-wrap ${
                  msg.role === 'user'
                    ? 'rounded-tr-sm bg-zinc-900 text-white'
                    : 'rounded-tl-sm border border-zinc-200 bg-white text-zinc-800'
                }`}
              >
                {msg.content}
              </div>
              {msg.role === 'assistant' && msg.chunksUsed !== undefined && (
                <p className="mt-1 px-1 text-[11px] text-zinc-400">
                  {msg.chunksUsed} chunks used
                </p>
              )}
            </div>
          </div>
        ))}

        {loading && (
          <div className="flex justify-start">
            <div className="mr-3 flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-zinc-900 text-xs text-white">
              Z
            </div>
            <div className="rounded-2xl rounded-tl-sm border border-zinc-200 bg-white px-4 py-3">
              <div className="flex gap-1">
                <span className="h-1.5 w-1.5 animate-bounce rounded-full bg-zinc-400 [animation-delay:0ms]" />
                <span className="h-1.5 w-1.5 animate-bounce rounded-full bg-zinc-400 [animation-delay:150ms]" />
                <span className="h-1.5 w-1.5 animate-bounce rounded-full bg-zinc-400 [animation-delay:300ms]" />
              </div>
            </div>
          </div>
        )}

        {error && (
          <div className="rounded-xl border border-red-100 bg-red-50 px-4 py-3 text-sm text-red-600">
            ⚠️ {error}
          </div>
        )}

        <div ref={bottomRef} />
      </div>

      {/* Input */}
      <div className="border-t border-zinc-200 bg-white px-6 py-4">
        <form onSubmit={handleSend} className="flex items-end gap-3">
          <textarea
            rows={1}
            placeholder={selectedRepoId ? 'Ask about the codebase… (Enter to send)' : 'Select a repo first'}
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            disabled={!selectedRepoId || loading}
            className="flex-1 resize-none rounded-xl border border-zinc-200 bg-zinc-50 px-4 py-2.5 text-sm outline-none focus:border-zinc-400 focus:bg-white disabled:cursor-not-allowed disabled:opacity-50"
            style={{ maxHeight: '120px' }}
          />
          <button
            type="submit"
            disabled={!input.trim() || !selectedRepoId || loading}
            className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-zinc-900 text-white transition-colors hover:bg-zinc-700 disabled:cursor-not-allowed disabled:opacity-40"
          >
            ↑
          </button>
        </form>
      </div>
    </div>
  )
}
