import httpClient from './api'
import { getCompanyId } from '@/helpers/config'

export interface Driver {
  id: number
  empNo: string
  firstName: string
  lastName: string
  fullName: string
  plantId: string
  username: string | null
  licenseNumber: string | null
  licenseExpiryDate: string | null
  isSignedIn: boolean
  isActive: boolean
  createdAt: string
  updatedAt: string
}

export interface CreateDriverRequest {
  empNo: string
  firstName: string
  lastName: string
  plantId: string
  username: string | null
  licenseNumber: string | null
  licenseExpiryDate: string | null
  isActive: boolean
}

export interface UpdateDriverRequest {
  empNo: string
  firstName: string
  lastName: string
  plantId: string
  username: string | null
  licenseNumber: string | null
  licenseExpiryDate: string | null
  isActive: boolean
}

const driverService = {
  getAll: async (): Promise<Driver[]> => {
    const companyId = getCompanyId()
    const res = await httpClient.get<Driver[]>(
      `/api/companies/${companyId}/drivers?activeOnly=false`
    )
    return res.data
  },

  getById: async (id: number): Promise<Driver> => {
    const companyId = getCompanyId()
    const res = await httpClient.get<Driver>(
      `/api/companies/${companyId}/drivers/${id}`
    )
    return res.data
  },

  create: async (data: CreateDriverRequest): Promise<{ driverId: number }> => {
    const companyId = getCompanyId()
    const res = await httpClient.post<{ driverId: number }>(
      `/api/companies/${companyId}/drivers`,
      data
    )
    return res.data
  },

  update: async (id: number, data: UpdateDriverRequest): Promise<void> => {
    const companyId = getCompanyId()
    await httpClient.put(
      `/api/companies/${companyId}/drivers/${id}`,
      data
    )
  },

  delete: async (id: number): Promise<void> => {
    const companyId = getCompanyId()
    await httpClient.delete(
      `/api/companies/${companyId}/drivers/${id}`
    )
  }
}

export default driverService