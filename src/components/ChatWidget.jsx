'use client'
import { useState, useEffect, useRef, useCallback } from 'react'

// ── Mock: all conversation threads ───────────────────────────
const MOCK_THREADS = [
  {
    id: 'thread_pod_001',
    type: 'pod',
    label: 'Pod Chat',
    name: 'DeFi Builders',
    avatar: null,
    initials: 'DB',
    accentColor: '#1DC433',
    unread: 2,
    lastMessage: 'Alex: Stand-up at 10am tomorrow?',
    lastAt: new Date(Date.now() - 1000*60*20).toISOString(),
    messages: [
      { id: 'm1', sender: 'Sarah Park',  text: "Hey team, let's sync on the audit scope tomorrow.", sentAt: new Date(Date.now()-1000*60*60*3).toISOString(), isOwn: false },
      { id: 'm2', sender: 'Mike Torres', text: 'Designs are 80% done. Will share Figma link EOD.',  sentAt: new Date(Date.now()-1000*60*60*1).toISOString(), isOwn: false },
      { id: 'm3', sender: 'Alex Chen',   text: 'Great progress everyone. Stand-up at 10am tomorrow?', sentAt: new Date(Date.now()-1000*60*20).toISOString(), isOwn: true },
    ],
  },
  {
    id: 'thread_pod_003',
    type: 'pod',
    label: 'Pod Chat',
    name: 'Chain Analytics',
    avatar: null,
    initials: 'CA',
    accentColor: '#1DC433',
    unread: 0,
    lastMessage: 'Samuel: Dashboard looks clean. Ready to submit.',
    lastAt: new Date(Date.now() - 1000*60*60*5).toISOString(),
    messages: [
      { id: 'm1', sender: 'Josh',    text: 'TVL data is all indexed. Query runs in ~120ms.', sentAt: new Date(Date.now()-1000*60*60*8).toISOString(), isOwn: false },
      { id: 'm2', sender: 'Maliel',  text: 'Nice — let me check the wallet cohort chart.',    sentAt: new Date(Date.now()-1000*60*60*6).toISOString(), isOwn: false },
      { id: 'm3', sender: 'Samuel',  text: 'Dashboard looks clean. Ready to submit.',         sentAt: new Date(Date.now()-1000*60*60*5).toISOString(), isOwn: true },
    ],
  },
  {
    id: 'thread_deal_mk001',
    type: 'deal',
    label: 'Deal Chat',
    name: 'BaseSwap Protocol',
    subtitle: 'DEX Frontend Redesign',
    avatar: null,
    initials: 'BP',
    accentColor: '#3B82F6',
    unread: 1,
    lastMessage: 'BaseSwap: Can you share a rough timeline?',
    lastAt: new Date(Date.now() - 1000*60*60*2).toISOString(),
    messages: [
      { id: 'm1', sender: 'BaseSwap Protocol', text: 'Hi! Excited to work together. Can you share a rough timeline breakdown?', sentAt: new Date(Date.now()-1000*60*60*2).toISOString(), isOwn: false },
      { id: 'm2', sender: 'Alex Chen',         text: 'Week 1-2: wireframes. Week 3-5: dev. Week 6: QA + handoff.',              sentAt: new Date(Date.now()-1000*60*30).toISOString(),  isOwn: true },
    ],
  },
  {
    id: 'thread_interview_001',
    type: 'interview',
    label: 'Interview',
    name: 'OmniLend Finance',
    subtitle: 'Smart Contract Audit',
    avatar: null,
    initials: 'OL',
    accentColor: '#8B5CF6',
    unread: 1,
    lastMessage: 'OmniLend: When can you start the audit?',
    lastAt: new Date(Date.now() - 1000*60*45).toISOString(),
    messages: [
      { id: 'm1', sender: 'OmniLend Finance', text: 'Thanks for applying! Your audit experience looks great.', sentAt: new Date(Date.now()-1000*60*90).toISOString(), isOwn: false },
      { id: 'm2', sender: 'OmniLend Finance', text: 'Can you walk us through your Foundry testing approach?',  sentAt: new Date(Date.now()-1000*60*60).toISOString(), isOwn: false },
      { id: 'm3', sender: 'Alex Chen',        text: 'Happy to. I start with invariant tests, then manual review of state transitions.', sentAt: new Date(Date.now()-1000*60*50).toISOString(), isOwn: true },
      { id: 'm4', sender: 'OmniLend Finance', text: 'When can you start the audit?',                          sentAt: new Date(Date.now()-1000*60*45).toISOString(), isOwn: false },
    ],
  },
  {
    id: 'thread_interview_002',
    type: 'interview',
    label: 'Interview',
    name: 'MetaGov DAO',
    subtitle: 'DAO Governance Dashboard',
    avatar: null,
    initials: 'MG',
    accentColor: '#8B5CF6',
    unread: 0,
    lastMessage: 'You: I can integrate The Graph in week 1.',
    lastAt: new Date(Date.now() - 1000*60*60*24).toISOString(),
    messages: [
      { id: 'm1', sender: 'MetaGov DAO',  text: 'Hi! Loved your portfolio. Have you built with The Graph before?', sentAt: new Date(Date.now()-1000*60*60*26).toISOString(), isOwn: false },
      { id: 'm2', sender: 'Alex Chen',    text: 'Yes — indexed 3 subgraphs for DeFi protocols on Base.',            sentAt: new Date(Date.now()-1000*60*60*25).toISOString(), isOwn: true  },
      { id: 'm3', sender: 'MetaGov DAO',  text: 'How long for initial subgraph + basic UI?',                         sentAt: new Date(Date.now()-1000*60*60*24.5).toISOString(), isOwn: false },
      { id: 'm4', sender: 'Alex Chen',    text: 'I can integrate The Graph in week 1.',                              sentAt: new Date(Date.now()-1000*60*60*24).toISOString(), isOwn: true  },
    ],
  },
]

const TYPE_CONFIG = {
  pod:       { icon: 'bi-people-fill',       label: 'Pod',       color: '#1DC433' },
  deal:      { icon: 'bi-briefcase-fill',    label: 'Deal',      color: '#3B82F6' },
  interview: { icon: 'bi-person-lines-fill', label: 'Interview', color: '#8B5CF6' },
}

function timeAgo(iso) {
  const diff = Date.now() - new Date(iso).getTime()
  const m = Math.floor(diff / 60000)
  if (m < 1)  return 'just now'
  if (m < 60) return `${m}m ago`
  const h = Math.floor(m / 60)
  if (h < 24) return `${h}h ago`
  return `${Math.floor(h / 24)}d ago`
}

function Identicon({ seed = '', size = 34, color = '#1DC433' }) {
  const initials = seed.split(' ').map(w => w[0]).join('').slice(0,2).toUpperCase()
  return (
    <div className="rounded-full flex-shrink-0 flex items-center justify-center font-mono font-bold"
      style={{ width: size, height: size, background: color + '22', color, fontSize: size * 0.34, border: `1.5px solid ${color}33` }}>
      {initials}
    </div>
  )
}

export default function ChatWidget() {
  const [open, setOpen]           = useState(false)
  const [activeThread, setActiveThread] = useState(null)
  const [threads, setThreads]     = useState(MOCK_THREADS)
  const [filter, setFilter]       = useState('all')
  const [input, setInput]         = useState('')
  const [sending, setSending]     = useState(false)

  // Draggable state (mobile)
  const [pos, setPos]             = useState({ x: null, y: null }) // null = default position
  const dragging                  = useRef(false)
  const dragOffset                = useRef({ x: 0, y: 0 })
  const btnRef                    = useRef(null)
  const messagesEndRef             = useRef(null)

  const totalUnread = threads.reduce((a, t) => a + (t.unread || 0), 0)

  // Listen for external open requests (from Quick Actions buttons)
  useEffect(() => {
    const handler = () => { setOpen(true); setPos({ x: null, y: null }) }
    window.addEventListener('open-chat-widget', handler)
    return () => window.removeEventListener('open-chat-widget', handler)
  }, [])

  // Scroll to bottom when thread changes or new messages
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [activeThread, threads])

  // ── Drag handlers (touch + mouse) ────────────────────────
  const onDragStart = useCallback((clientX, clientY) => {
    if (!btnRef.current) return
    const rect = btnRef.current.getBoundingClientRect()
    dragOffset.current = { x: clientX - rect.left, y: clientY - rect.top }
    dragging.current = true
  }, [])

  const onDragMove = useCallback((clientX, clientY) => {
    if (!dragging.current) return
    const x = clientX - dragOffset.current.x
    const y = clientY - dragOffset.current.y
    const maxX = window.innerWidth  - 60
    const maxY = window.innerHeight - 60
    setPos({ x: Math.max(0, Math.min(x, maxX)), y: Math.max(0, Math.min(y, maxY)) })
  }, [])

  const onDragEnd = useCallback(() => { dragging.current = false }, [])

  useEffect(() => {
    const onMouseMove = e => onDragMove(e.clientX, e.clientY)
    const onTouchMove = e => { e.preventDefault(); onDragMove(e.touches[0].clientX, e.touches[0].clientY) }
    window.addEventListener('mousemove', onMouseMove)
    window.addEventListener('mouseup', onDragEnd)
    window.addEventListener('touchmove', onTouchMove, { passive: false })
    window.addEventListener('touchend', onDragEnd)
    return () => {
      window.removeEventListener('mousemove', onMouseMove)
      window.removeEventListener('mouseup', onDragEnd)
      window.removeEventListener('touchmove', onTouchMove)
      window.removeEventListener('touchend', onDragEnd)
    }
  }, [onDragMove, onDragEnd])

  // ── Send message ─────────────────────────────────────────
  function sendMessage() {
    if (!input.trim() || !activeThread || sending) return
    const text = input.trim()
    setInput('')
    setSending(true)
    const newMsg = { id: 'm_' + Date.now(), sender: 'You', text, sentAt: new Date().toISOString(), isOwn: true }
    setThreads(prev => prev.map(t =>
      t.id === activeThread
        ? { ...t, messages: [...t.messages, newMsg], lastMessage: `You: ${text}`, lastAt: newMsg.sentAt, unread: 0 }
        : t
    ))
    setTimeout(() => setSending(false), 300)
  }

  // ── Mark thread as read on open ──────────────────────────
  function openThread(id) {
    setActiveThread(id)
    setThreads(prev => prev.map(t => t.id === id ? { ...t, unread: 0 } : t))
  }

  const filtered = filter === 'all' ? threads : threads.filter(t => t.type === filter)
  const thread   = threads.find(t => t.id === activeThread)

  // ── Button position style ────────────────────────────────
  const btnStyle = pos.x !== null
    ? { position: 'fixed', left: pos.x, top: pos.y, zIndex: 9999 }
    : { position: 'fixed', bottom: '24px', right: '24px', zIndex: 9999 }

  return (
    <>
      {/* ── Floating button ──────────────────────────────── */}
      {!open && (
        <div
          ref={btnRef}
          style={btnStyle}
          onMouseDown={e => { onDragStart(e.clientX, e.clientY) }}
          onTouchStart={e => { onDragStart(e.touches[0].clientX, e.touches[0].clientY) }}
          onClick={e => {
            // Only open if we didn't drag
            if (!dragging.current) { setOpen(true); setPos({ x: null, y: null }) }
          }}
        >
          <button
            className="w-14 h-14 rounded-full bg-ink shadow-[0_4px_24px_rgba(0,0,0,0.28)] flex items-center justify-center cursor-pointer border-none hover:scale-105 active:scale-95 transition-transform select-none"
            style={{ touchAction: 'none' }}
            aria-label="Open chat"
          >
            <i className="bi bi-chat-dots-fill text-paper text-[22px]" />
            {totalUnread > 0 && (
              <span className="absolute -top-1 -right-1 w-5 h-5 bg-green-dark rounded-full flex items-center justify-center font-mono text-[9px] font-bold text-ink border-2 border-paper">
                {totalUnread > 9 ? '9+' : totalUnread}
              </span>
            )}
          </button>
        </div>
      )}

      {/* ── Chat panel ───────────────────────────────────── */}
      {open && (
        <div
          className="fixed bottom-5 right-5 z-[9999] flex flex-col bg-white border border-black/[0.09] rounded-[18px] shadow-[0_8px_48px_rgba(0,0,0,0.18)] overflow-hidden"
          style={{
            width: 'min(380px, calc(100vw - 20px))',
            height: 'min(580px, calc(100vh - 80px))',
            animation: 'up 0.2s cubic-bezier(0.22,1,0.36,1) both',
          }}
        >
          {/* ── Panel header ─────────────────────────────── */}
          <div className="flex items-center justify-between px-4 py-3 border-b border-black/[0.06] bg-white flex-shrink-0">
            {activeThread ? (
              <button
                onClick={() => setActiveThread(null)}
                className="flex items-center gap-2 font-mono text-[10px] tracking-[0.08em] uppercase text-[#AAA] hover:text-ink transition-colors bg-transparent border-none cursor-pointer p-0"
              >
                <i className="bi bi-arrow-left text-[11px]" />Back
              </button>
            ) : (
              <div className="flex items-center gap-2">
                <i className="bi bi-chat-dots-fill text-ink text-[15px]" />
                <span className="font-sans text-[14px] font-medium text-ink">Messages</span>
                {totalUnread > 0 && (
                  <span className="bg-green-dark text-ink font-mono font-bold text-[9px] rounded-full px-1.5 py-px">{totalUnread}</span>
                )}
              </div>
            )}
            <button
              onClick={() => { setOpen(false); setActiveThread(null) }}
              className="w-7 h-7 flex items-center justify-center rounded-full hover:bg-black/[0.05] transition-colors bg-transparent border-none cursor-pointer"
            >
              <i className="bi bi-x text-[16px] text-[#AAA]" />
            </button>
          </div>

          {/* ── Thread list ──────────────────────────────── */}
          {!activeThread && (
            <>
              {/* Filter tabs */}
              <div className="flex bg-[#F4F4F2] rounded-[8px] p-[3px] gap-[3px] mx-3 mt-3 mb-2 flex-shrink-0">
                {[
                  { key: 'all',       label: 'All'       },
                  { key: 'pod',       label: 'Pods'      },
                  { key: 'deal',      label: 'Deals'     },
                  { key: 'interview', label: 'Interviews' },
                ].map(f => (
                  <button key={f.key} type="button" onClick={() => setFilter(f.key)}
                    className={`flex-1 py-1.5 rounded-[6px] font-mono text-[9px] tracking-[0.06em] uppercase transition-all cursor-pointer border-none ${
                      filter === f.key ? 'bg-white text-ink shadow-[0_1px_4px_rgba(0,0,0,0.08)]' : 'text-[#AAA] bg-transparent'
                    }`}>
                    {f.label}
                  </button>
                ))}
              </div>

              {/* Thread rows */}
              <div className="flex-1 overflow-y-auto">
                {filtered.length === 0 ? (
                  <div className="flex flex-col items-center justify-center h-full gap-2 pb-8">
                    <i className="bi bi-chat-dots text-[28px] text-[#DDD]" />
                    <p className="font-mono text-[10px] text-[#CCC] uppercase tracking-[0.08em]">No conversations</p>
                  </div>
                ) : (
                  filtered.map(t => {
                    const cfg = TYPE_CONFIG[t.type]
                    return (
                      <button
                        key={t.id}
                        onClick={() => openThread(t.id)}
                        className="w-full flex items-start gap-3 px-4 py-3.5 hover:bg-[#FAFAFA] transition-colors border-b border-black/[0.05] last:border-b-0 text-left bg-transparent border-none cursor-pointer"
                      >
                        <div className="relative flex-shrink-0 mt-0.5">
                          <Identicon seed={t.initials} size={36} color={t.accentColor} />
                          <span className="absolute -bottom-0.5 -right-0.5 w-4 h-4 rounded-full flex items-center justify-center" style={{ background: cfg.color + '22' }}>
                            <i className={`bi ${cfg.icon} text-[8px]`} style={{ color: cfg.color }} />
                          </span>
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center justify-between gap-1 mb-0.5">
                            <p className="font-sans text-[13px] font-medium text-ink truncate">{t.name}</p>
                            <span className="font-mono text-[9px] text-[#CCC] flex-shrink-0">{timeAgo(t.lastAt)}</span>
                          </div>
                          {t.subtitle && <p className="font-mono text-[9px] text-[#AAA] truncate mb-0.5">{t.subtitle}</p>}
                          <p className="text-[11.5px] font-light text-[#AAA] truncate">{t.lastMessage}</p>
                        </div>
                        {t.unread > 0 && (
                          <span className="w-4.5 h-4.5 min-w-[18px] bg-green-dark rounded-full flex items-center justify-center font-mono text-[8px] font-bold text-ink flex-shrink-0 mt-1">
                            {t.unread}
                          </span>
                        )}
                      </button>
                    )
                  })
                )}
              </div>
            </>
          )}

          {/* ── Active thread view ────────────────────────── */}
          {activeThread && thread && (
            <>
              {/* Thread header */}
              <div className="px-4 py-3 border-b border-black/[0.05] flex-shrink-0">
                <div className="flex items-center gap-2.5">
                  <Identicon seed={thread.initials} size={30} color={thread.accentColor} />
                  <div className="min-w-0">
                    <p className="font-sans text-[13px] font-medium text-ink truncate">{thread.name}</p>
                    <div className="flex items-center gap-1.5">
                      <span className="font-mono text-[9px] tracking-[0.06em] uppercase" style={{ color: TYPE_CONFIG[thread.type].color }}>
                        {TYPE_CONFIG[thread.type].label}
                      </span>
                      {thread.subtitle && (
                        <><span className="text-[#CCC] text-[10px]">·</span>
                        <span className="font-mono text-[9px] text-[#AAA] truncate">{thread.subtitle}</span></>
                      )}
                    </div>
                  </div>
                </div>
              </div>

              {/* Messages */}
              <div className="flex-1 overflow-y-auto px-4 py-4 space-y-3">
                {thread.messages.map(msg => (
                  <div key={msg.id} className={`flex ${msg.isOwn ? 'justify-end' : 'justify-start'}`}>
                    <div className={`max-w-[78%] ${msg.isOwn ? 'items-end' : 'items-start'} flex flex-col gap-0.5`}>
                      {!msg.isOwn && (
                        <span className="font-mono text-[9px] text-[#AAA] px-1">{msg.sender}</span>
                      )}
                      <div className={`px-3 py-2 rounded-[12px] text-[13px] font-light leading-snug ${
                        msg.isOwn
                          ? 'bg-ink text-paper rounded-br-[4px]'
                          : 'bg-[#F4F4F2] text-ink rounded-bl-[4px]'
                      }`}>
                        {msg.text}
                      </div>
                      <span className="font-mono text-[8px] text-[#CCC] px-1">{timeAgo(msg.sentAt)}</span>
                    </div>
                  </div>
                ))}
                <div ref={messagesEndRef} />
              </div>

              {/* Input bar */}
              <div className="px-3 py-3 border-t border-black/[0.06] flex items-end gap-2 flex-shrink-0 bg-white">
                <textarea
                  value={input}
                  onChange={e => setInput(e.target.value)}
                  onKeyDown={e => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); sendMessage() } }}
                  placeholder="Type a message…"
                  rows={1}
                  className="flex-1 font-sans text-[13.5px] font-light text-ink bg-[#F4F4F2] border border-black/[0.07] rounded-[10px] px-3 py-2 outline-none resize-none placeholder-[#BBB] focus:border-[#1DC433] focus:shadow-[0_0_0_3px_rgba(45,252,68,0.08)] transition-all"
                  style={{ maxHeight: 80 }}
                />
                <button
                  onClick={sendMessage}
                  disabled={!input.trim() || sending}
                  className="w-9 h-9 rounded-[9px] bg-ink flex items-center justify-center flex-shrink-0 border-none cursor-pointer hover:bg-[#1A1A1A] transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
                >
                  <i className="bi bi-send-fill text-paper text-[13px]" />
                </button>
              </div>
            </>
          )}
        </div>
      )}
    </>
  )
}
