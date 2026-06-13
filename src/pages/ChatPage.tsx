import { useEffect, useRef, useState } from 'react'
import {
  RiCheckLine,
  RiCloseLine,
  RiErrorWarningLine,
  RiLoader4Line,
  RiRadioButtonLine,
  RiSendPlane2Line,
} from 'react-icons/ri'
import ReactMarkdown from 'react-markdown'
import remarkGfm from 'remark-gfm'
import { ZenfixMark } from '../components/ZenfixLogo'
import { chatService, jobsService, reposService } from '../services'
import type { Job, JobStep } from '../types/job'
import type { Repo } from '../types'

// ── Markdown renderer ─────────────────────────────────────────────────────────

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
          <a href={href} target="_blank" rel="noopener noreferrer" className="text-primary underline hover:opacity-80">{children}</a>
        ),
        blockquote: ({ children }) => (
          <blockquote className="my-2 border-l-2 border-primary/40 pl-3 text-on-surface-variant italic">{children}</blockquote>
        ),
        code: ({ className, children, ...props }) => {
          const isBlock = className?.startsWith('language-')
          const lang = className?.replace('language-', '') ?? ''
          if (isBlock) {
            return (
              <div className="my-2 overflow-hidden rounded-lg border border-outline-variant bg-[#1e1e2e]">
                {lang && (
                  <div className="flex items-center border-b border-white/10 px-3 py-1.5">
                    <span className="font-mono text-[11px] text-white/50">{lang}</span>
                  </div>
                )}
                <pre className="overflow-x-auto p-3">
                  <code className="font-mono text-[13px] leading-relaxed text-[#cdd6f4]">{children}</code>
                </pre>
              </div>
            )
          }
          return <code className="rounded bg-surface-container-high px-1.5 py-0.5 font-mono text-[12px] text-on-surface" {...props}>{children}</code>
        },
        pre: ({ children }) => <>{children}</>,
        table: ({ children }) => (
          <div className="my-3 overflow-x-auto rounded-lg border border-outline-variant">
            <table className="w-full border-collapse text-sm">{children}</table>
          </div>
        ),
        thead: ({ children }) => <thead className="bg-surface-container-low">{children}</thead>,
        tbody: ({ children }) => <tbody className="divide-y divide-outline-variant/50">{children}</tbody>,
        tr: ({ children }) => <tr className="transition-colors hover:bg-surface-container-low/50">{children}</tr>,
        th: ({ children }) => <th className="px-4 py-2.5 text-left text-xs font-semibold uppercase tracking-wide text-on-surface-variant">{children}</th>,
        td: ({ children }) => <td className="px-4 py-2.5 text-sm text-on-surface">{children}</td>,
      }}
    >
      {content}
    </ReactMarkdown>
  )
}

// ── Job step indicator ────────────────────────────────────────────────────────

function StepIcon({ status }: { status: JobStep['status'] }) {
  if (status === 'done')    return <RiCheckLine className="text-[13px] text-green-600" />
  if (status === 'running') return <RiLoader4Line className="animate-spin text-[13px] text-primary" />
  if (status === 'failed')  return <RiCloseLine className="text-[13px] text-error" />
  return <RiRadioButtonLine className="text-[13px] text-outline" />
}

// ── Investigation result card ─────────────────────────────────────────────────

function InvestigationCard({ job }: { job: Job }) {
  const r = job.result
  const isDone   = job.status === 'done'
  const isFailed = job.status === 'failed'

  return (
    <div className="rounded-xl border border-outline-variant bg-surface-container-lowest text-sm overflow-hidden">
      {/* Header */}
      <div className="flex items-center gap-2 border-b border-outline-variant px-4 py-3 bg-surface-container-low">
        {job.status === 'running' && <RiLoader4Line className="animate-spin text-primary" />}
        {isDone   && <RiCheckLine className="text-green-600" />}
        {isFailed && <RiErrorWarningLine className="text-error" />}
        <span className="rounded-full bg-error/10 px-2 py-0.5 text-[11px] font-semibold text-error">Bug</span>
        <span className="font-semibold text-on-surface">
          {job.status === 'running' ? 'Investigating…' : isDone ? 'Investigation complete' : 'Investigation failed'}
        </span>
        {isDone && r?.confidence !== undefined && (
          <span className="ml-auto rounded-full bg-primary/10 px-2 py-0.5 text-xs font-medium text-primary">
            {Math.round(r.confidence * 100)}% confidence
          </span>
        )}
      </div>

      {/* Live steps */}
      <div className="px-4 py-3 space-y-1.5">
        {job.steps.map((step) => (
          <div key={step.name} className="flex items-start gap-2">
            <span className="mt-0.5 shrink-0"><StepIcon status={step.status} /></span>
            <div className="min-w-0">
              <span className={`text-xs ${step.status === 'pending' ? 'text-on-surface-variant' : 'text-on-surface'}`}>
                {step.name}
              </span>
              {step.detail && (
                <p className="mt-0.5 truncate text-[11px] text-on-surface-variant">{step.detail}</p>
              )}
            </div>
          </div>
        ))}
      </div>

      {/* Result */}
      {isDone && r && (
        <div className="border-t border-outline-variant px-4 py-4 space-y-3">
          {r.summary && (
            <div>
              <p className="text-[11px] font-semibold uppercase tracking-wide text-on-surface-variant mb-1">Root Cause</p>
              <p className="text-sm text-on-surface leading-relaxed">{r.summary}</p>
            </div>
          )}

          {r.affectedFiles && r.affectedFiles.length > 0 && (
            <div>
              <p className="text-[11px] font-semibold uppercase tracking-wide text-on-surface-variant mb-1">Location</p>
              <div className="flex flex-wrap gap-1.5">
                {r.affectedFiles.map((f) => (
                  <span key={f} className="rounded-md bg-surface-container-high px-2 py-0.5 font-mono text-[11px] text-on-surface">
                    {f}
                  </span>
                ))}
              </div>
            </div>
          )}

          {r.offendingCommit && (
            <div>
              <p className="text-[11px] font-semibold uppercase tracking-wide text-on-surface-variant mb-1">Offending Commit</p>
              <p className="font-mono text-[12px] text-on-surface">
                <span className="rounded bg-surface-container-high px-1.5 py-0.5">{r.offendingCommit.slice(0, 8)}</span>
                {r.commitMessage && <span className="ml-2 text-on-surface-variant">{r.commitMessage}</span>}
              </p>
            </div>
          )}

          {r.fixDirection && (
            <div>
              <p className="text-[11px] font-semibold uppercase tracking-wide text-on-surface-variant mb-1">Fix Direction</p>
              <p className="text-sm text-on-surface leading-relaxed whitespace-pre-wrap">{r.fixDirection}</p>
            </div>
          )}

          {(r.prNumber || r.jiraKey) && (
            <div className="flex flex-wrap gap-3 pt-1">
              {r.prNumber && r.prUrl && (
                <a href={r.prUrl} target="_blank" rel="noopener noreferrer"
                  className="flex items-center gap-1.5 rounded-lg border border-outline-variant px-3 py-1.5 text-xs font-medium text-on-surface hover:bg-surface-container transition-colors">
                  🔀 PR #{r.prNumber}
                </a>
              )}
              {r.jiraKey && r.jiraUrl && (
                <a href={r.jiraUrl} target="_blank" rel="noopener noreferrer"
                  className="flex items-center gap-1.5 rounded-lg border border-outline-variant px-3 py-1.5 text-xs font-medium text-on-surface hover:bg-surface-container transition-colors">
                  🎫 {r.jiraKey}
                </a>
              )}
            </div>
          )}
        </div>
      )}

      {isFailed && (
        <div className="border-t border-outline-variant px-4 py-3">
          <p className="text-xs text-error">{r?.error ?? 'Unknown error — check server logs.'}</p>
        </div>
      )}
    </div>
  )
}

// ── Message types ─────────────────────────────────────────────────────────────

interface AskMessage {
  type: 'ask'
  role: 'user' | 'assistant'
  content: string
  chunksUsed?: number
}

interface BugMessage {
  type: 'bug'
  role: 'user' | 'assistant'
  content: string
  jobId: string
  job: Job
}

type Message = AskMessage | BugMessage

const SUGGESTED = [
  'What does this repo do?',
  'Users get a 500 error on checkout',
  'How is the database accessed?',
  'Login fails silently after session expires',
]

// ── Main component ────────────────────────────────────────────────────────────

export function ChatPage() {
  const [repos, setRepos]                     = useState<Repo[]>([])
  const [selectedRepoId, setSelectedRepoId]   = useState<string>('')
  const [messages, setMessages]               = useState<Message[]>([])
  const [input, setInput]                     = useState('')
  const [loading, setLoading]                 = useState(false)
  const [error, setError]                     = useState<string | null>(null)
  const bottomRef = useRef<HTMLDivElement>(null)
  const pollRef   = useRef<ReturnType<typeof setInterval> | null>(null)

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

  useEffect(() => () => { if (pollRef.current) clearInterval(pollRef.current) }, [])

  function startPolling(jobId: string) {
    pollRef.current = setInterval(async () => {
      try {
        const updated = await jobsService.get(jobId)
        setMessages((prev) =>
          prev.map((m) => m.type === 'bug' && m.jobId === jobId ? { ...m, job: updated } : m),
        )
        if (updated.status === 'done' || updated.status === 'failed') {
          clearInterval(pollRef.current!)
          pollRef.current = null
        }
      } catch { /* ignore transient poll errors */ }
    }, 2000)
  }

  async function handleChat(message: string) {
    if (!selectedRepoId) return
    setMessages((prev) => [...prev, { type: 'ask', role: 'user', content: message }])
    setLoading(true)
    try {
      const res = await chatService.chat(selectedRepoId, { message })
      if (res.type === 'ask') {
        setMessages((prev) => [...prev, { type: 'ask', role: 'assistant', content: res.answer, chunksUsed: res.chunks_used }])
      } else {
        setMessages((prev) => [...prev, { type: 'bug', role: 'assistant', content: '', jobId: res.job_id, job: res.job }])
        startPolling(res.job_id)
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Request failed')
    } finally {
      setLoading(false)
    }
  }

  async function handleSend(e: React.FormEvent) {
    e.preventDefault()
    const q = input.trim()
    if (!q || !selectedRepoId || loading) return
    setInput('')
    setError(null)
    await handleChat(q)
  }

  function handleKeyDown(e: React.KeyboardEvent<HTMLTextAreaElement>) {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleSend(e as unknown as React.FormEvent)
    }
  }

  const isEmpty = messages.length === 0 && !loading

  return (
    <div className="flex h-[calc(100vh-64px)] flex-col bg-background">
      {/* Header */}
      <div className="flex items-center gap-4 border-b border-outline-variant bg-surface-container-lowest px-8 py-3">
        <span className="text-sm font-medium text-on-surface-variant whitespace-nowrap">Repo:</span>
        {repos.length === 0 ? (
          <p className="text-sm text-on-surface-variant">No indexed repos.</p>
        ) : (
          <select
            value={selectedRepoId}
            onChange={(e) => { setSelectedRepoId(e.target.value); setMessages([]) }}
            className="rounded-lg border border-outline-variant bg-surface-container px-3 py-1.5 text-sm text-on-surface outline-none focus:border-primary focus:ring-2 focus:ring-primary/20"
          >
            {repos.map((r) => <option key={r.id} value={r.id}>{r.name}</option>)}
          </select>
        )}

        {messages.length > 0 && (
          <button onClick={() => setMessages([])} className="ml-auto text-xs text-on-surface-variant hover:text-on-surface">
            Clear
          </button>
        )}
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto px-8 py-8 space-y-6">
        {isEmpty && (
          <div className="flex flex-col items-center justify-center h-full text-center pb-16">
            <div className="mb-4"><ZenfixMark size={56} /></div>
            <p className="font-semibold text-on-surface" style={{ fontFamily: 'Geist, Inter, sans-serif' }}>
              Ask a question or describe a bug
            </p>
            <p className="mt-1 text-sm text-on-surface-variant">
              Zenfix will automatically route your message to the right pipeline
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

        {messages.map((msg, i) => {
          if (msg.type === 'bug' && msg.role === 'assistant') {
            return (
              <div key={i} className="flex justify-start">
                <div className="mr-3 shrink-0"><ZenfixMark size={28} /></div>
                <div className="max-w-[80%] min-w-[320px]">
                  <InvestigationCard job={msg.job} />
                </div>
              </div>
            )
          }

          return (
            <div key={i} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
              {msg.role === 'assistant' && (
                <div className="mr-3 shrink-0"><ZenfixMark size={28} /></div>
              )}
              <div className={`max-w-[75%] ${msg.role === 'user' ? 'order-first' : ''}`}>
                <div className={`rounded-2xl px-4 py-3 text-sm ${
                  msg.role === 'user'
                    ? 'rounded-tr-sm bg-primary text-on-primary leading-relaxed whitespace-pre-wrap'
                    : 'rounded-tl-sm border border-outline-variant bg-surface-container-lowest text-on-surface'
                }`}>
                  {msg.role === 'user'
                    ? msg.content
                    : msg.type === 'ask' && <MarkdownContent content={msg.content} />}
                </div>
                {msg.type === 'ask' && msg.role === 'assistant' && msg.chunksUsed !== undefined && (
                  <p className="mt-1 px-1 text-[11px] text-on-surface-variant font-mono">{msg.chunksUsed} chunks used</p>
                )}
              </div>
            </div>
          )
        })}

        {loading && (
          <div className="flex justify-start">
            <div className="mr-3 shrink-0"><ZenfixMark size={28} /></div>
            <div className="rounded-2xl rounded-tl-sm border border-outline-variant bg-surface-container-lowest px-4 py-3">
              <div className="flex gap-1">
                {[0, 150, 300].map((d) => (
                  <span key={d} className="h-1.5 w-1.5 animate-bounce rounded-full bg-outline" style={{ animationDelay: `${d}ms` }} />
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

      {/* Input area */}
      <div className="border-t border-outline-variant bg-surface-container-lowest px-8 py-4">
        <form onSubmit={handleSend} className="flex items-end gap-3">
          <textarea
            rows={1}
            placeholder={
              !selectedRepoId
                ? 'Select a repo first'
                : 'Ask about the codebase or describe a bug… (Enter to send)'
            }
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            disabled={!selectedRepoId || loading}
            className="w-full resize-none rounded-xl border border-outline-variant bg-surface-container px-4 py-2.5 text-sm text-on-surface outline-none transition focus:border-primary focus:bg-surface-container-lowest focus:ring-2 focus:ring-primary/20 disabled:cursor-not-allowed disabled:opacity-50"
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
