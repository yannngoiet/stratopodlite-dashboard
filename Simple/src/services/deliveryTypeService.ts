import httpClient from './api'

export interface DeliveryType {
  id: number
  description: string
}

export interface CreateDeliveryTypeRequest {
  id: number
  description: string
}

export interface UpdateDeliveryTypeRequest {
  description: string
}

const deliveryTypeService = {
  getAll: async (companyId: number): Promise<DeliveryType[]> => {
    const res = await httpClient.get<DeliveryType[]>(
      `/api/companies/${companyId}/delivery-types`
    )
    return res.data
  },

  getById: async (companyId: number, id: number): Promise<DeliveryType> => {
    const res = await httpClient.get<DeliveryType>(
      `/api/companies/${companyId}/delivery-types/${id}`
    )
    return res.data
  },

  create: async (companyId: number, data: CreateDeliveryTypeRequest): Promise<DeliveryType> => {
    const res = await httpClient.post<DeliveryType>(
      `/api/companies/${companyId}/delivery-types`,
      data
    )
    return res.data
  },

  update: async (companyId: number, id: number, data: UpdateDeliveryTypeRequest): Promise<void> => {
    await httpClient.put(
      `/api/companies/${companyId}/delivery-types/${id}`,
      data
    )
  },

  delete: async (companyId: number, id: number): Promise<void> => {
    await httpClient.delete(
      `/api/companies/${companyId}/delivery-types/${id}`
    )
  }
}

export default deliveryTypeService