import { useEffect, useRef, useState } from 'react'
import { RiSendPlane2Line } from 'react-icons/ri'
import ReactMarkdown from 'react-markdown'
import remarkGfm from 'remark-gfm'
import { ZenfixMark } from '../components/ZenfixLogo'
import { chatService, reposService } from '../services'
import type { Repo } from '../types'

interface Message {
  role: 'user' | 'assistant'
  content: string
  chunksUsed?: number
}

function MarkdownContent({ content }: { content: string }) {
  return (
    <ReactMarkdown
      remarkPlugins={[remarkGfm]}
      components={{
        h1: ({ children }) => <h1 className="mb-2 mt-4 text-base font-bold text-on-surface first:mt-0">{children}</h1>,
        h2: ({ children }) => <h2 className="mb-2 mt-3 text-sm font-bold text-on-surface first:mt-0">{children}</h2>,
        h3: ({ children }) => <h3 className="mb-1 mt-2 text-sm font-semibold text-on-surface first:mt-0">{children}</h3>,
        p:  ({ children }) => <p className="mb-2 last:mb-0 leading-relaxed">{children}</p>,
        ul: ({ children }) => <ul className="mb-2 ml-4 list-disc space-y-0.5 last:mb-0">{children}</ul>,
        ol: ({ children }) => <ol className="mb-2 ml-4 list-decimal space-y-0.5 last:mb-0">{children}</ol>,
        li: ({ children }) => <li className="leading-relaxed">{children}</li>,
        strong: ({ children }) => <strong className="font-semibold text-on-surface">{children}</strong>,
        em: ({ children }) => <em className="italic">{children}</em>,
        hr: () => <hr className="my-3 border-outline-variant" />,
        a: ({ href, children }) => (
          <a href={href} target="_blank" rel="noopener noreferrer"
            className="text-primary underline hover:opacity-80">
            {children}
          </a>
        ),
        blockquote: ({ children }) => (
          <blockquote className="my-2 border-l-2 border-primary/40 pl-3 text-on-surface-variant italic">
            {children}
          </blockquote>
        ),
        code: ({ className, children, ...props }) => {
          const isBlock = className?.startsWith('language-')
          const lang = className?.replace('language-', '') ?? ''
          if (isBlock) {
            return (
              <div className="my-2 overflow-hidden rounded-lg border border-outline-variant bg-[#1e1e2e]">
                {lang && (
                  <div className="flex items-center justify-between border-b border-white/10 px-3 py-1.5">
                    <span className="font-mono text-[11px] text-white/50">{lang}</span>
                  </div>
                )}
                <pre className="overflow-x-auto p-3">
                  <code className="font-mono text-[13px] leading-relaxed text-[#cdd6f4]">{children}</code>
                </pre>
              </div>
            )
          }
          return (
            <code
              className="rounded bg-surface-container-high px-1.5 py-0.5 font-mono text-[12px] text-on-surface"
              {...props}
            >
              {children}
            </code>
          )
        },
        pre: ({ children }) => <>{children}</>,
        table: ({ children }) => (
          <div className="my-3 overflow-x-auto rounded-lg border border-outline-variant">
            <table className="w-full border-collapse text-sm">{children}</table>
          </div>
        ),
        thead: ({ children }) => (
          <thead className="bg-surface-container-low">{children}</thead>
        ),
        tbody: ({ children }) => (
          <tbody className="divide-y divide-outline-variant/50">{children}</tbody>
        ),
        tr: ({ children }) => (
          <tr className="transition-colors hover:bg-surface-container-low/50">{children}</tr>
        ),
        th: ({ children }) => (
          <th className="px-4 py-2.5 text-left text-xs font-semibold uppercase tracking-wide text-on-surface-variant">
            {children}
          </th>
        ),
        td: ({ children }) => (
          <td className="px-4 py-2.5 text-sm text-on-surface">{children}</td>
        ),
      }}
    >
      {content}
    </ReactMarkdown>
  )
}

const SUGGESTED = [
  'What does this repo do?',
  'What are the main components?',
  'How is the database accessed?',
  'Where is authentication handled?',
]

export function ChatPage() {
  const [repos, setRepos]               = useState<Repo[]>([])
  const [selectedRepoId, setSelectedRepoId] = useState<string>('')
  const [messages, setMessages]         = useState<Message[]>([])
  const [input, setInput]               = useState('')
  const [loading, setLoading]           = useState(false)
  const [error, setError]               = useState<string | null>(null)
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
      setMessages((prev) => [...prev, { role: 'assistant', content: res.answer, chunksUsed: res.chunks_used }])
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
    <div className="flex h-[calc(100vh-64px)] flex-col bg-background">
      <div className="flex items-center gap-4 border-b border-outline-variant bg-surface-container-lowest px-8 py-3">
        <span className="text-sm font-medium text-on-surface-variant whitespace-nowrap">Repository:</span>
        {repos.length === 0 ? (
          <p className="text-sm text-on-surface-variant">No indexed repos — add one in Repositories first.</p>
        ) : (
          <select
            value={selectedRepoId}
            onChange={(e) => { setSelectedRepoId(e.target.value); setMessages([]) }}
            className="rounded-lg border border-outline-variant bg-surface-container px-3 py-1.5 text-sm text-on-surface outline-none focus:border-primary focus:ring-2 focus:ring-primary/20"
          >
            {repos.map((r) => (
              <option key={r.id} value={r.id}>{r.name}</option>
            ))}
          </select>
        )}
        {selectedRepo && (
          <span className="font-mono text-xs text-on-surface-variant">
            {selectedRepo.chunksIndexed.toLocaleString()} chunks indexed
          </span>
        )}
        {messages.length > 0 && (
          <button
            onClick={() => setMessages([])}
            className="ml-auto text-xs text-on-surface-variant hover:text-on-surface"
          >
            Clear
          </button>
        )}
      </div>

      <div className="flex-1 overflow-y-auto px-8 py-8 space-y-6">
        {messages.length === 0 && !loading && (
          <div className="flex flex-col items-center justify-center h-full text-center pb-16">
            <div className="mb-4">
              <ZenfixMark size={56} />
            </div>
            <p className="font-semibold text-on-surface" style={{ fontFamily: 'Geist, Inter, sans-serif' }}>
              Ask anything about the repo
            </p>
            <p className="mt-1 text-sm text-on-surface-variant">
              e.g. "What does this repo do?", "Where is auth handled?", "How is the DB structured?"
            </p>
            <div className="mt-5 flex flex-wrap justify-center gap-2">
              {SUGGESTED.map((q) => (
                <button
                  key={q}
                  onClick={() => setInput(q)}
                  className="rounded-full border border-outline-variant bg-surface-container-lowest px-3 py-1.5 text-xs text-on-surface-variant transition-colors hover:border-primary/50 hover:bg-primary/5 hover:text-primary"
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
              <div className="mr-3 shrink-0">
                <ZenfixMark size={28} />
              </div>
            )}
            <div className={`max-w-[75%] ${msg.role === 'user' ? 'order-first' : ''}`}>
              <div
                className={`rounded-2xl px-4 py-3 text-sm ${
                  msg.role === 'user'
                    ? 'rounded-tr-sm bg-primary text-on-primary leading-relaxed whitespace-pre-wrap'
                    : 'rounded-tl-sm border border-outline-variant bg-surface-container-lowest text-on-surface'
                }`}
              >
                {msg.role === 'user'
                  ? msg.content
                  : <MarkdownContent content={msg.content} />}
              </div>
              {msg.role === 'assistant' && msg.chunksUsed !== undefined && (
                <p className="mt-1 px-1 text-[11px] text-on-surface-variant font-mono">
                  {msg.chunksUsed} chunks used
                </p>
              )}
            </div>
          </div>
        ))}

        {loading && (
          <div className="flex justify-start">
            <div className="mr-3 flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-primary text-xs text-on-primary font-bold">
              Z
            </div>
            <div className="rounded-2xl rounded-tl-sm border border-outline-variant bg-surface-container-lowest px-4 py-3">
              <div className="flex gap-1">
                {[0, 150, 300].map((d) => (
                  <span
                    key={d}
                    className="h-1.5 w-1.5 animate-bounce rounded-full bg-outline"
                    style={{ animationDelay: `${d}ms` }}
                  />
                ))}
              </div>
            </div>
          </div>
        )}

        {error && (
          <div className="rounded-xl border border-error-container bg-error-container px-4 py-3 text-sm text-on-error-container">
            {error}
          </div>
        )}

        <div ref={bottomRef} />
      </div>

      <div className="border-t border-outline-variant bg-surface-container-lowest px-8 py-4">
        <form onSubmit={handleSend} className="flex items-end gap-3">
          <textarea
            rows={1}
            placeholder={selectedRepoId ? 'Ask about the codebase… (Enter to send)' : 'Select a repo first'}
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            disabled={!selectedRepoId || loading}
            className="flex-1 resize-none rounded-xl border border-outline-variant bg-surface-container px-4 py-2.5 text-sm text-on-surface outline-none transition focus:border-primary focus:bg-surface-container-lowest focus:ring-2 focus:ring-primary/20 disabled:cursor-not-allowed disabled:opacity-50"
            style={{ maxHeight: '120px' }}
          />
          <button
            type="submit"
            disabled={!input.trim() || !selectedRepoId || loading}
            className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-primary text-on-primary transition active:scale-[0.98] hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-40"
          >
            <RiSendPlane2Line />
          </button>
        </form>
      </div>
    </div>
  )
}
