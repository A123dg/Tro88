import { MetaData } from './room.types'

export type AiMessageRole = 'user' | 'assistant' | 'system'

export interface AiMessageDto {
  id: string
  role: AiMessageRole
  content: string
  inputTokens?: number | null
  outputTokens?: number | null
  createdAt: string
}

export interface AiConversationDto {
  id: string
  title: string
  isActive: boolean
  messageCount: number
  createdAt: string
  messages?: AiMessageDto[] | null
}

export interface AiAgentTaskDto {
  id: string
  taskType: string
  input: string
  output?: string | null
  status: string
  errorMessage?: string | null
  completedAt?: string | null
  createdAt: string
}

export interface AiConversationsQueryData {
  items: AiConversationDto[]
  meta?: MetaData
}
