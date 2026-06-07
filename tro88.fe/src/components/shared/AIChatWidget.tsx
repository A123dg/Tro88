import { useEffect, useRef, useState } from 'react'
import {
  createAiConversation,
  fetchAiConversation,
  fetchAiConversations,
  sendAiMessage,
} from '../../services/aiAgentService'
import { AiConversationDto } from '../../types/aiAgent.types'

interface Message {
  role: 'user' | 'assistant'
  content: string
}

const suggestedPrompts = [
  'Phong nao dang trong?',
  'Thang nay ai chua dong tien?',
  'Doanh thu 6 thang gan nhat',
  'Hop dong sap het han',
]

export function AIChatWidget() {
  const [isOpen, setIsOpen] = useState(false)
  const [isMinimized, setIsMinimized] = useState(false)
  const [showHistory, setShowHistory] = useState(false)
  const [conversationId, setConversationId] = useState<string | null>(null)
  const [conversations, setConversations] = useState<AiConversationDto[]>([])
  const [messages, setMessages] = useState<Message[]>([
    { role: 'assistant', content: 'Xin chao! Toi la Tro ly Tro88 AI. Ban can ho tro gi?' },
  ])
  const [input, setInput] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [isHistoryLoading, setIsHistoryLoading] = useState(false)
  const messagesEndRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (isOpen) {
      messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
    }
  }, [messages, isOpen])

  const ensureConversation = async () => {
    if (conversationId) return conversationId

    const conversation = await createAiConversation('Tro88 AI Chat')
    setConversationId(conversation.id)
    return conversation.id
  }

  const loadHistory = async () => {
    setShowHistory((value) => !value)
    if (showHistory || isHistoryLoading) return

    setIsHistoryLoading(true)
    try {
      const result = await fetchAiConversations()
      setConversations(result.items)
    } catch {
      setMessages((prev) => [
        ...prev,
        { role: 'assistant', content: 'Khong tai duoc lich su chat. Vui long thu lai sau.' },
      ])
    } finally {
      setIsHistoryLoading(false)
    }
  }

  const openConversation = async (id: string) => {
    setIsHistoryLoading(true)
    try {
      const conversation = await fetchAiConversation(id)
      const history = (conversation.messages ?? [])
        .filter((message): message is typeof message & { role: 'user' | 'assistant' } => (
          message.role === 'user' || message.role === 'assistant'
        ))
        .map((message) => ({ role: message.role, content: message.content }))

      setConversationId(id)
      setMessages(history.length ? history : [
        { role: 'assistant', content: 'Cuoc tro chuyen nay chua co tin nhan.' },
      ])
      setShowHistory(false)
    } catch {
      setMessages((prev) => [
        ...prev,
        { role: 'assistant', content: 'Khong mo duoc cuoc tro chuyen nay.' },
      ])
    } finally {
      setIsHistoryLoading(false)
    }
  }

  const startNewConversation = () => {
    setConversationId(null)
    setShowHistory(false)
    setMessages([
      { role: 'assistant', content: 'Da bat dau cuoc tro chuyen moi. Ban can ho tro gi?' },
    ])
  }

  const handleSend = async () => {
    const userMessage = input.trim()
    if (!userMessage || isLoading) return

    setInput('')
    setMessages((prev) => [...prev, { role: 'user', content: userMessage }])
    setIsLoading(true)

    try {
      const id = await ensureConversation()
      const assistantMessage = await sendAiMessage(id, userMessage)
      setMessages((prev) => [
        ...prev,
        { role: 'assistant', content: assistantMessage.content || 'Toi da ghi nhan yeu cau cua ban.' },
      ])
      if (showHistory) {
        const result = await fetchAiConversations()
        setConversations(result.items)
      }
    } catch {
      setMessages((prev) => [
        ...prev,
        {
          role: 'assistant',
          content: 'Chua ket noi duoc AI Agent. Vui long kiem tra dang nhap, backend hoac cau hinh Gemini.',
        },
      ])
    } finally {
      setIsLoading(false)
    }
  }

  const handleKeyPress = (event: React.KeyboardEvent) => {
    if (event.key === 'Enter' && !event.shiftKey) {
      event.preventDefault()
      handleSend()
    }
  }

  if (!isOpen) {
    return (
      <button
        className="ai-chat-fab"
        onClick={() => setIsOpen(true)}
        aria-label="Mo AI Chat"
      >
        <SparkleChatIcon />
        <span className="ai-chat-fab-badge">AI</span>
      </button>
    )
  }

  return (
    <div className={`ai-chat-widget ${isMinimized ? 'minimized' : ''}`}>
      <div className="ai-chat-header" onClick={() => setIsMinimized(!isMinimized)}>
        <div className="ai-chat-header-left">
          <span className="ai-chat-icon">AI</span>
          <span>Tro ly Tro88 AI</span>
        </div>
        <div className="ai-chat-header-actions">
          <button
            className="ai-chat-history"
            onClick={(event) => {
              event.stopPropagation()
              loadHistory()
            }}
            aria-label="Xem lich su chat"
            title="Lich su chat"
          >
            H
          </button>
          <button
            className="ai-chat-new"
            onClick={(event) => {
              event.stopPropagation()
              startNewConversation()
            }}
            aria-label="Chat moi"
            title="Chat moi"
          >
            +
          </button>
          <button
            className="ai-chat-minimize"
            onClick={(event) => {
              event.stopPropagation()
              setIsMinimized(!isMinimized)
            }}
            aria-label={isMinimized ? 'Mo rong' : 'Thu gon'}
          >
            {isMinimized ? '+' : '-'}
          </button>
          <button
            className="ai-chat-close"
            onClick={(event) => {
              event.stopPropagation()
              setIsOpen(false)
            }}
            aria-label="Dong"
          >
            x
          </button>
        </div>
      </div>

      {!isMinimized && (
        <>
          {showHistory && (
            <div className="ai-chat-history-panel">
              <div className="ai-chat-history-title">
                <strong>Lich su chat</strong>
                {isHistoryLoading ? <span>Dang tai...</span> : null}
              </div>
              {!isHistoryLoading && conversations.length === 0 ? (
                <p>Chua co cuoc tro chuyen nao.</p>
              ) : null}
              {conversations.map((conversation) => (
                <button
                  key={conversation.id}
                  className={conversation.id === conversationId ? 'active' : ''}
                  onClick={() => openConversation(conversation.id)}
                >
                  <strong>{conversation.title || 'Tro88 AI Chat'}</strong>
                  <span>{conversation.messageCount} tin nhan</span>
                </button>
              ))}
            </div>
          )}

          <div className="ai-chat-messages">
            {messages.map((msg, index) => (
              <div key={`${msg.role}-${index}`} className={`ai-chat-message ${msg.role}`}>
                {msg.content}
              </div>
            ))}
            {isLoading && (
              <div className="ai-chat-message assistant loading">
                <span className="typing-indicator">
                  <span />
                  <span />
                  <span />
                </span>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          <div className="ai-chat-prompts">
            {suggestedPrompts.map((prompt) => (
              <button
                key={prompt}
                onClick={() => setInput(prompt)}
                className="ai-chat-prompt-chip"
              >
                {prompt}
              </button>
            ))}
          </div>

          <div className="ai-chat-input-wrap">
            <textarea
              className="ai-chat-input"
              value={input}
              onChange={(event) => setInput(event.target.value)}
              onKeyDown={handleKeyPress}
              placeholder="Nhap tin nhan..."
              rows={1}
            />
            <button
              className="ai-chat-send"
              onClick={handleSend}
              disabled={!input.trim() || isLoading}
              aria-label="Gui"
            >
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="m22 2-7 20-4-9-9-4 20-7Z" />
                <path d="M22 2 11 13" />
              </svg>
            </button>
          </div>
        </>
      )}
    </div>
  )
}

function SparkleChatIcon() {
  return (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" style={{ verticalAlign: 'middle' }}>
      <defs>
        <linearGradient id="aiChatIconStarGrad" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#da22ff" />
          <stop offset="100%" stopColor="#9733ee" />
        </linearGradient>
        <linearGradient id="aiChatIconSmallStarGrad" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#ff5e62" />
          <stop offset="100%" stopColor="#ff9966" />
        </linearGradient>
      </defs>
      
      {/* Speech bubble path with gap on top-right for the sparkle */}
      <path 
        d="M 14 4 H 5 C 3.9 4 3 4.9 3 6 V 14 C 3 15.1 3.9 16 5 16 H 7 V 19 L 10.5 16 H 17 C 18.1 16 19 15.1 19 14 V 11" 
        fill="none" 
      />
      
      {/* Horizontal text lines representing chat */}
      <line x1="6" y1="8" x2="13" y2="8" strokeWidth="2.2" />
      <line x1="6" y1="11" x2="10" y2="11" strokeWidth="2.2" />
      
      {/* Big Sparkle Star at top-right */}
      <path 
        d="M 19 4.5 C 19 7 17 8 16 8 C 17 8 19 9 19 11.5 C 19 9 21 8 22 8 C 21 8 19 7 19 4.5 Z" 
        fill="url(#aiChatIconStarGrad)" 
        stroke="none"
      />
      
      {/* Small Sparkle Star above the bubble */}
      <path 
        d="M 15.5 1 C 15.5 2.1 14.7 2.5 14.2 2.5 C 14.7 2.5 15.5 2.9 15.5 4 C 15.5 2.9 16.3 2.5 16.8 2.5 C 16.3 2.5 15.5 2.1 15.5 1 Z" 
        fill="url(#aiChatIconSmallStarGrad)" 
        stroke="none"
      />
    </svg>
  )
}
