import httpClient from './api'

export interface TripSheetItem {
  id: number
  itemCode: string
  description: string | null
  uom: string | null
  qtyReturned: number
  reason: string | null
}

export interface TripSheet {
  id: number
  shipmentNo: string
  driverId: number | null
  driverName: string | null
  dispatchControllerName: string | null
  statusId: number
  status: string
  arrivedAt: string | null
  completedAt: string | null
  createdAt: string
  itemCount: number
  items: TripSheetItem[]
}

const tripSheetService = {
  getAll: async (companyId: number): Promise<TripSheet[]> => {
    const res = await httpClient.get<TripSheet[]>(`/api/companies/${companyId}/trip-sheets`)
    return res.data
  },

  getById: async (companyId: number, id: number): Promise<TripSheet> => {
    const res = await httpClient.get<TripSheet>(`/api/companies/${companyId}/trip-sheets/${id}`)
    return res.data
  }
}

export default tripSheetService
