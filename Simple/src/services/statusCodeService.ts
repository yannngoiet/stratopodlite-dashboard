import httpClient from './api'

export interface StatusCode {
  id: number
  description: string
}

export interface CreateStatusCodeRequest {
  id: number
  description: string
}

export interface UpdateStatusCodeRequest {
  description: string
}

const statusCodeService = {
  getAll: async (companyId: number): Promise<StatusCode[]> => {
    const res = await httpClient.get<StatusCode[]>(
      `/api/companies/${companyId}/status-codes`
    )
    return res.data
  },

  create: async (companyId: number, data: CreateStatusCodeRequest): Promise<StatusCode> => {
    const res = await httpClient.post<StatusCode>(
      `/api/companies/${companyId}/status-codes`,
      data
    )
    return res.data
  },

  update: async (companyId: number, id: number, data: UpdateStatusCodeRequest): Promise<void> => {
    await httpClient.put(
      `/api/companies/${companyId}/status-codes/${id}`,
      data
    )
  },

  delete: async (companyId: number, id: number): Promise<void> => {
    await httpClient.delete(
      `/api/companies/${companyId}/status-codes/${id}`
    )
  }
}

export default statusCodeService
