import httpClient from './api'

export interface Template {
  id: number
  name: string
  description: string
  fileName: string
  category: string
  isDefault: boolean
  isActive: boolean
  createdAt: string
  companyId: number
}

export interface UploadTemplateRequest {
  templateFile: File
  name: string
  description: string
  category: string
}

const templateService = {
  getAll: async (companyId: number): Promise<Template[]> => {
    const res = await httpClient.get<Template[]>(
      `/api/companies/${companyId}/templates?includeInactive=true`
    )
    return res.data
  },

  upload: async (companyId: number, data: UploadTemplateRequest): Promise<void> => {
    const form = new FormData()
    form.append('templateFile', data.templateFile)
    form.append('name', data.name)
    form.append('description', data.description)
    form.append('category', data.category)
    await httpClient.post(`/api/companies/${companyId}/templates`, form, {
      headers: { 'Content-Type': undefined },
    })
  },

  setDefault: async (companyId: number, id: number): Promise<void> => {
    await httpClient.post(`/api/companies/${companyId}/templates/${id}/set-default`)
  },

  delete: async (companyId: number, id: number): Promise<void> => {
    await httpClient.delete(`/api/companies/${companyId}/templates/${id}`)
  },
}

export default templateService
