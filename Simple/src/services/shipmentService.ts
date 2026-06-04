import httpClient from './api'
import { getCompanyId } from '@/helpers/config'

export interface Shipment {
  shipmentNo: string
  plantId: string | null
  driverName: string | null
  vehicleReg: string | null
  status: string | null
  assignedExecutionDate: string | null
  sealNoRange: string | null
  deliveryNotesCount: number
  createdAt: string
  updatedAt: string
}

export interface ShipmentPagedResult {
  items: Shipment[]
  totalCount: number
  page: number
  pageSize: number
  totalPages: number
  hasNextPage: boolean
  hasPreviousPage: boolean
}

const shipmentService = {
  getAll: async (params: {
    shipmentNo?: string
    statusId?: number
    page?: number
    pageSize?: number
  }): Promise<ShipmentPagedResult> => {
    const companyId = getCompanyId()
    const query = new URLSearchParams()
    if (params.shipmentNo) query.set('shipmentNo', params.shipmentNo)
    if (params.statusId)   query.set('statusId', String(params.statusId))
    query.set('page',     String(params.page     ?? 1))
    query.set('pageSize', String(params.pageSize ?? 10))

    const res = await httpClient.get<ShipmentPagedResult>(
      `/api/companies/${companyId}/shipments?${query.toString()}`
    )
    return res.data
  }
}

export default shipmentService
