import httpClient from './api'
import { getCompanyId } from '@/helpers/config'
import {
  AssignDeliveryRequest,
  AssignDeliveryResponse,
  BulkAssignRequest,
  BulkAssignResponse,
  Driver,
  LocationGroup,
  UnassignedDeliveriesResponse,
  UnassignedDelivery,
  UnassignResponse,
} from '@/types/dispatch'

export interface SubmitDispatchItem {
  deliveryNo: string
  driverId: number
  vehicleId: number | null
  shipmentNo: string | null
}

const dispatchService = {
  fetchUnassignedDeliveries: async (
    { search = '', page = 1, pageSize = 100 }: { search?: string; page?: number; pageSize?: number } = {}
  ): Promise<UnassignedDeliveriesResponse> => {
    const companyId = getCompanyId()
    const res = await httpClient.get<UnassignedDeliveriesResponse>(
      `/api/companies/${companyId}/dispatch/unassigned`,
      { params: { search: search || undefined, page, pageSize } }
    )
    return res.data
  },

  fetchDriversWithAssignments: async (): Promise<Driver[]> => {
    const companyId = getCompanyId()
    const res = await httpClient.get<Driver[]>(
      `/api/companies/${companyId}/dispatch/drivers`
    )
    return res.data
  },

  assignDelivery: async (payload: AssignDeliveryRequest): Promise<AssignDeliveryResponse> => {
    const companyId = getCompanyId()
    const cleanPayload = {
      deliveryNo: payload.deliveryNo,
      driverId: payload.driverId,
      vehicleId: payload.vehicleId === 0 ? null : (payload.vehicleId ?? null)
    }
    const res = await httpClient.post<AssignDeliveryResponse>(
      `/api/companies/${companyId}/dispatch/assign`,
      cleanPayload
    )
    return res.data
  },

  bulkAssignDeliveries: async (payload: BulkAssignRequest): Promise<BulkAssignResponse> => {
    const companyId = getCompanyId()
    const cleanPayload = {
      deliveryNos: payload.deliveryNos,
      driverId: payload.driverId,
      vehicleId: payload.vehicleId === 0 ? null : (payload.vehicleId ?? null)
    }
    try {
      const res = await httpClient.post<BulkAssignResponse>(
        `/api/companies/${companyId}/dispatch/bulk-assign`,
        cleanPayload
      )
      return res.data
    } catch (error: any) {
      console.error('Bulk assign error response:', error.response?.data)
      throw error
    }
  },

  unassignDelivery: async (deliveryNo: string): Promise<UnassignResponse> => {
    const companyId = getCompanyId()
    const res = await httpClient.post<UnassignResponse>(
      `/api/companies/${companyId}/dispatch/unassign/${encodeURIComponent(deliveryNo)}`
    )
    return res.data
  },

  submitDispatch: async (
    items: SubmitDispatchItem[]
  ): Promise<{ shipmentsDispatched: number; deliveriesDispatched: number }> => {
    const companyId = getCompanyId()
    const res = await httpClient.post(
      `/api/companies/${companyId}/dispatch/submit`,
      { items }
    )
    return res.data
  },

  groupDeliveriesByFactory: (items: UnassignedDelivery[]): LocationGroup[] => {
    const factoryMap = new Map<string, { factoryCode: string; factoryName: string; deliveries: UnassignedDelivery[] }>()

    for (const item of items) {
      const key = item.customerCode ?? 'UNKNOWN'
      if (!factoryMap.has(key)) {
        factoryMap.set(key, {
          factoryCode: item.customerCode ?? '',
          factoryName: item.customerName ?? 'Unknown Customer',
          deliveries: [],
        })
      }
      factoryMap.get(key)!.deliveries.push({
        deliveryNo: item.deliveryNo,
        shipmentNo: item.shipmentNo ?? null,
        invoiceNo: item.invoiceNo ?? null,
        customerName: item.customerName ?? '',
        customerCode: item.customerCode ?? '',
        customerAddress: item.customerAddress ?? '',
        customerAccountNo: item.customerAccountNo ?? '',
        suburb: item.suburb ?? '',
        city: item.city ?? '',
        purchaseOrderNo: item.purchaseOrderNo ?? '',
        salesOrderNo: item.salesOrderNo ?? '',
        poSvoNo: item.poSvoNo ?? '',
        status: item.status ?? 'AVAILABLE',
        statusId: item.statusId,
        deliveryType: item.deliveryType ?? '',
        itemCount: item.itemCount,
        createdAt: item.createdAt,
      })
    }

    if (factoryMap.size === 0) return []

    return [
      {
        location: 'Deliveries',
        factories: Array.from(factoryMap.values()),
      },
    ]
  }
}

export default dispatchService
