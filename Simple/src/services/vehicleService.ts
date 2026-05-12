import httpClient from './api'

export interface Vehicle {
  id: number
  vehicleReg: string
  trailerReg: string | null
  vehicleType: string | null
  isActive: boolean
  createdAt: string
  updatedAt: string
}

export interface CreateVehicleRequest {
  vehicleReg: string
  trailerReg: string | null
  vehicleType: string | null
  isActive: boolean
}

export interface UpdateVehicleRequest {
  vehicleReg: string
  trailerReg: string | null
  vehicleType: string | null
  isActive: boolean
}

const vehicleService = {
  getAll: async (companyId: number): Promise<Vehicle[]> => {
    const res = await httpClient.get<Vehicle[]>(
      `/companies/${companyId}/vehicles`
    )
    return res.data
  },

  getById: async (companyId: number, id: number): Promise<Vehicle> => {
    const res = await httpClient.get<Vehicle>(
      `/companies/${companyId}/vehicles/${id}`
    )
    return res.data
  },

  create: async (companyId: number, data: CreateVehicleRequest): Promise<Vehicle> => {
    const res = await httpClient.post<Vehicle>(
      `/companies/${companyId}/vehicles`,
      data
    )
    return res.data
  },

  update: async (companyId: number, id: number, data: UpdateVehicleRequest): Promise<void> => {
    await httpClient.put(
      `/companies/${companyId}/vehicles/${id}`,
      data
    )
  },

  delete: async (companyId: number, id: number): Promise<void> => {
    await httpClient.delete(
      `/companies/${companyId}/vehicles/${id}`
    )
  }
}

export default vehicleService