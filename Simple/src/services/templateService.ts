import axios from 'axios'

const pdfApiClient = axios.create({
  baseURL: process.env.NEXT_PUBLIC_PDF_API_URL,
})

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
    const res = await pdfApiClient.get<Template[]>(
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
    await pdfApiClient.post(
      `/api/companies/${companyId}/templates`,
      form
    )
  },

  setDefault: async (companyId: number, id: number): Promise<void> => {
    await pdfApiClient.post(
      `/api/companies/${companyId}/templates/${id}/set-default`
    )
  },

  delete: async (companyId: number, id: number): Promise<void> => {
    await pdfApiClient.delete(
      `/api/companies/${companyId}/templates/${id}`
    )
  }
}

export default templateService
