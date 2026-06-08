import httpClient from './api'

export interface PreInspection {
  id: number
  description: string
  category: string | null
  inspectionType: string
  isMandatory: boolean
  isSupervisor: boolean
  sortOrder: number
  isActive: boolean
  createdAt: string
  updatedAt: string
}

export interface CreatePreInspectionRequest {
  description: string
  category: string | null
  inspectionType: string
  isMandatory: boolean
  isSupervisor: boolean
  sortOrder: number
  isActive: boolean
}

export interface UpdatePreInspectionRequest {
  description: string
  category: string | null
  inspectionType: string
  isMandatory: boolean
  isSupervisor: boolean
  sortOrder: number
  isActive: boolean
}

const preInspectionService = {
  getAll: async (companyId: number): Promise<PreInspection[]> => {
    const res = await httpClient.get<PreInspection[]>(
      `/api/companies/${companyId}/pre-inspections`
    )
    return res.data
  },

  create: async (companyId: number, data: CreatePreInspectionRequest): Promise<PreInspection> => {
    const res = await httpClient.post<PreInspection>(
      `/api/companies/${companyId}/pre-inspections`,
      data
    )
    return res.data
  },

  update: async (companyId: number, id: number, data: UpdatePreInspectionRequest): Promise<void> => {
    await httpClient.put(
      `/api/companies/${companyId}/pre-inspections/${id}`,
      data
    )
  },

  delete: async (companyId: number, id: number): Promise<void> => {
    await httpClient.delete(
      `/api/companies/${companyId}/pre-inspections/${id}`
    )
  }
}

export default preInspectionService
