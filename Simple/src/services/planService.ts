import httpClient from './api'

export interface PlanResponse {
  id:           number
  name:         string
  code:         string
  monthlyPrice: number
  maxDrivers:   number | null
  maxVehicles:  number | null
  hasAnalytics: boolean
  hasApiAccess: boolean
  features:     string[]
}

const planService = {
  getAll: async (): Promise<PlanResponse[]> => {
    const res = await httpClient.get<PlanResponse[]>('/api/plans')
    return res.data
  },
}

export default planService
