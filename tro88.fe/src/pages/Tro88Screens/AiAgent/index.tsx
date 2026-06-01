import { useRouterState } from '@tanstack/react-router'
import { UploadOutlined } from '@ant-design/icons'
import { FormEvent, ReactNode, useEffect, useMemo, useState } from 'react'
import { Form, Input, Select } from 'antd'
import { useMutation, useQuery } from 'react-query'
import { api } from '../../../services/apiClient'
import { queryClient } from '../../../queryClient'
import { createAiConversation, fetchAiConversation, fetchAiConversations, sendAiMessage } from '../../../services/aiAgentService'
import { createHouse, fetchHouseDetail, updateHouse } from '../../../services/houseService'
import ModalForm from '../../../shared/components/modal-form/ModalForm'
import {
  AreaChartLite, Badge, Button, Card, DataTable, EmptyState, FormShell, Illustration, Link, navigateTo,
  MaintenanceCard, MiniBarChart, NotificationList, PageHeader, SimpleFormPage, SimplePage, SkeletonGrid,
  Maintenance, Room, Status, Timeline, UtilityTable, contracts, fetchProvinceOptions, fetchWardOptions, formatDate, formatVND,
  houseStatusLabel, houses, invoices, maintenance, normalizeHouse, ok, pageId, read, rooms, statusVariant, total, QK,
} from '../shared'

export function AiAgentPage() {
  const [conversationId, setConversationId] = useState<string | null>(null)
  const [messages, setMessages] = useState<Array<{ role: 'user' | 'assistant'; text: string }>>([
    { role: 'assistant', text: 'Xin chao, toi co the giup ban kiem tra phong trong, cong no va doanh thu.' },
  ])
  const [input, setInput] = useState('')

  const conversations = useQuery(['ai-conversations'], () => fetchAiConversations(), {
    retry: 1,
  })

  const createConversation = useMutation(() => createAiConversation('Tro88 AI Chat'), {
    onSuccess: (conversation) => {
      setConversationId(conversation.id)
      setMessages([{ role: 'assistant', text: 'Da tao cuoc tro chuyen moi. Ban muon toi ho tro gi?' }])
      queryClient.invalidateQueries(['ai-conversations'])
    },
  })

  const sendMessage = useMutation(async (message: string) => {
    const activeConversationId = conversationId ?? (await createAiConversation('Tro88 AI Chat')).id
    setConversationId(activeConversationId)
    return sendAiMessage(activeConversationId, message)
  }, {
    onSuccess: (assistantMessage) => {
      setMessages((current) => [
        ...current,
        { role: 'assistant', text: assistantMessage.content || 'Toi da ghi nhan yeu cau cua ban.' },
      ])
      queryClient.invalidateQueries(['ai-conversations'])
    },
    onError: () => {
      setMessages((current) => [
        ...current,
        { role: 'assistant', text: 'Chua ket noi duoc AI Agent. Vui long kiem tra backend, token dang nhap hoac cau hinh Gemini.' },
      ])
    },
  })

  const send = () => {
    const message = input.trim()
    if (!message || sendMessage.isLoading) return
    setMessages((current) => [...current, { role: 'user', text: message }])
    setInput('')
    sendMessage.mutate(message)
  }

  const selectConversation = async (id: string) => {
    setConversationId(id)
    try {
      const conversation = await fetchAiConversation(id)
      const history = (conversation.messages ?? [])
        .filter((message): message is typeof message & { role: 'user' | 'assistant' } => message.role === 'user' || message.role === 'assistant')
        .map((message) => ({ role: message.role, text: message.content }))
      setMessages(history.length ? history : [{ role: 'assistant', text: 'Cuoc tro chuyen nay chua co tin nhan.' }])
    } catch {
      setMessages([{ role: 'assistant', text: 'Khong tai duoc lich su cuoc tro chuyen.' }])
    }
  }

  return (
    <main className="chat-page">
      <aside className="chat-sidebar">
        <Button full loading={createConversation.isLoading} onClick={() => createConversation.mutate()}>Cuoc tro chuyen moi</Button>
        {(conversations.data?.items ?? []).map((item) => (
          <button key={item.id} onClick={() => selectConversation(item.id)}>
            {item.title}
            <span>{item.messageCount} tin nhan</span>
          </button>
        ))}
      </aside>
      <section className="chat-main">
        <header>Tro ly Tro88 AI</header>
        <div className="messages">
          {messages.map((message, index) => <div key={`${message.role}-${index}`} className={`message ${message.role}`}>{message.text}</div>)}
          {sendMessage.isLoading ? <div className="message assistant">Dang xu ly...</div> : null}
        </div>
        <div className="prompt-chips">
          {['Phong nao dang trong?', 'Thang nay ai chua dong tien?', 'Doanh thu 6 thang gan nhat', 'Hop dong sap het han'].map((text) => <button key={text} onClick={() => setInput(text)}>{text}</button>)}
        </div>
        <div className="chat-input">
          <textarea value={input} onChange={(event) => setInput(event.target.value)} rows={2} />
          <Button onClick={send} loading={sendMessage.isLoading}>Gui</Button>
        </div>
      </section>
    </main>
  )
}


