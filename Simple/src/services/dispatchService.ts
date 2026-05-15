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

export async function fetchUnassignedDeliveries(
  { search = '', page = 1, pageSize = 100 }: { search?: string; page?: number; pageSize?: number } = {}
): Promise<UnassignedDeliveriesResponse> {
  const companyId = getCompanyId()
  const res = await httpClient.get<UnassignedDeliveriesResponse>(
    `/companies/${companyId}/dispatch/unassigned`,
    { params: { search: search || undefined, page, pageSize } }
  )
  return res.data
}

export async function fetchDriversWithAssignments(): Promise<Driver[]> {
  const companyId = getCompanyId()
  const res = await httpClient.get<Driver[]>(
    `/companies/${companyId}/dispatch/drivers`
  )
  return res.data
}

export async function assignDelivery(payload: AssignDeliveryRequest): Promise<AssignDeliveryResponse> {
  const companyId = getCompanyId()
  const res = await httpClient.post<AssignDeliveryResponse>(
    `/companies/${companyId}/dispatch/assign`,
    payload
  )
  return res.data
}

export async function bulkAssignDeliveries(payload: BulkAssignRequest): Promise<BulkAssignResponse> {
  const companyId = getCompanyId()
  const res = await httpClient.post<BulkAssignResponse>(
    `/companies/${companyId}/dispatch/bulk-assign`,
    payload
  )
  return res.data
}

export async function unassignDelivery(deliveryNo: string): Promise<UnassignResponse> {
  const companyId = getCompanyId()
  const res = await httpClient.post<UnassignResponse>(
    `/companies/${companyId}/dispatch/unassign/${encodeURIComponent(deliveryNo)}`
  )
  return res.data
}

export function groupDeliveriesByFactory(items: UnassignedDelivery[]): LocationGroup[] {
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