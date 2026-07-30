import axios from 'axios'

export const API = axios.create({ baseURL: 'http://localhost:5000/api' })

export const agentAPI = {
  understand: (data: unknown) => API.post('/agents/understanding', data),
  duplicate: (data: unknown) => API.post('/agents/duplicate', data),
  route: (data: unknown) => API.post('/agents/routing', data),
  priority: (data: unknown) => API.post('/agents/priority', data),
  assign: (data: unknown) => API.post('/agents/assignment', data),
  verify: (data: unknown) => API.post('/agents/verification', data),
  history: (agentId?: number, limit = 10) => API.get(`/agents/history?${agentId ? `agentId=${agentId}&` : ''}limit=${limit}`),
  deleteHistory: (id: string) => API.delete(`/agents/history/${id}`),
  stats: () => API.get('/agents/stats'),
  health: () => API.get('/agents/health'),
}
