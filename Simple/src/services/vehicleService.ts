import httpClient from './api'

export interface Vehicle {
  id: number
  vehicleReg: string
  trailerReg: string | null
  vehicleType: string | null
  currentDriverId: number | null
  currentDriverName: string | null
  isActive: boolean
  createdAt: string
  updatedAt: string
}

export interface CreateVehicleRequest {
  vehicleReg: string
  trailerReg: string | null
  vehicleType: string | null
  isActive?: boolean        // ← add
}

export interface UpdateVehicleRequest {
  vehicleReg: string        // ← added
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

  create: async (companyId: number, data: CreateVehicleRequest): Promise<any> => {
    const res = await httpClient.post(
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
  },

  assignDriver: async (
    companyId: number,
    vehicleId: number,
    driverId: number | null
  ): Promise<void> => {
    await httpClient.post(
      `/companies/${companyId}/vehicles/${vehicleId}/assign-driver`,
      { driverId }
    )
  }
}

export default vehicleService