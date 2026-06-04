import httpClient from './api'
import { getCompanyId } from '@/helpers/config'

export interface ManagedUser {
  id: number
  username: string
  email: string
  firstName: string
  lastName: string
  phoneNumber: string | null
  plantId: string | null
  isSuperAdmin: boolean
  isActive: boolean
  lastLoginAt: string | null
  createdBy: string | null
  createdAt: string
  updatedAt: string
}

export interface CreateUserPayload {
  username: string
  email: string
  password: string
  firstName: string
  lastName: string
  phoneNumber: string | null
  plantId: string | null
  isSuperAdmin: boolean
}

const userManagementService = {
  getAll: async (params: { search?: string; isActive?: boolean }): Promise<ManagedUser[]> => {
    const companyId = getCompanyId()
    const query = new URLSearchParams()
    if (params.search)   query.set('search', params.search)
    if (params.isActive !== undefined) query.set('isActive', String(params.isActive))
    const res = await httpClient.get<ManagedUser[]>(
      `/api/companies/${companyId}/users?${query.toString()}`
    )
    return res.data
  },

  create: async (data: CreateUserPayload): Promise<{ userId: number }> => {
    const companyId = getCompanyId()
    const res = await httpClient.post<{ userId: number }>(
      `/api/companies/${companyId}/users`, data
    )
    return res.data
  },

  delete: async (userId: number): Promise<void> => {
    const companyId = getCompanyId()
    await httpClient.delete(`/api/companies/${companyId}/users/${userId}`)
  }
}

export default userManagementService
