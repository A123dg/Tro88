import { ApiResponse } from '../types/room.types'
import {
  AiAgentTaskDto,
  AiConversationDto,
  AiConversationsQueryData,
  AiMessageDto,
} from '../types/aiAgent.types'
import { api } from './apiClient'

export async function createAiConversation(title?: string) {
  const response = await api.post<unknown, ApiResponse<AiConversationDto>>(
    '/AiAgent/conversations',
    { title: title ?? null },
  )

  return response.data
}

export async function fetchAiConversations(page = 1, pageSize = 20): Promise<AiConversationsQueryData> {
  const response = await api.get<unknown, ApiResponse<AiConversationDto[]>>(
    `/AiAgent/conversations?page=${page}&pageSize=${pageSize}`,
  )

  return {
    items: response.data,
    meta: response.metaData,
  }
}

export async function fetchAiConversation(id: string) {
  const response = await api.get<unknown, ApiResponse<AiConversationDto>>(
    `/AiAgent/conversations/${id}`,
  )

  return response.data
}

export async function sendAiMessage(conversationId: string, content: string) {
  const response = await api.post<unknown, ApiResponse<AiMessageDto>>(
    `/AiAgent/conversations/${conversationId}/messages`,
    { content },
  )

  return response.data
}

export async function deleteAiConversation(id: string) {
  return api.delete<unknown, ApiResponse<object | null>>(`/AiAgent/conversations/${id}`)
}

export async function executeAiAgentTask(conversationId: string, taskType: string, input: string) {
  const response = await api.post<unknown, ApiResponse<AiAgentTaskDto>>(
    '/AiAgent/tasks',
    { conversationId, taskType, input },
  )

  return response.data
}

export async function fetchAiAgentTask(id: string) {
  const response = await api.get<unknown, ApiResponse<AiAgentTaskDto>>(`/AiAgent/tasks/${id}`)

  return response.data
}
