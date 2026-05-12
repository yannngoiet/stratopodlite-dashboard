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

const BASE_URL = process.env.NEXT_PUBLIC_DASHBOARD_API_URL
export const COMPANY_ID = Number(process.env.NEXT_PUBLIC_COMPANY_ID)

export async function fetchUnassignedDeliveries(
  companyId: number,
  { search = '', page = 1, pageSize = 100 }: { search?: string; page?: number; pageSize?: number } = {}
): Promise<UnassignedDeliveriesResponse> {
  const url = new URL(`${BASE_URL}/api/companies/${companyId}/dispatch/unassigned`)

  if (search) url.searchParams.set('search', search)
  url.searchParams.set('page', String(page))
  url.searchParams.set('pageSize', String(pageSize))

  let res: Response
  try {
    res = await fetch(url.toString())
  } catch {
    throw new Error(
      `Cannot reach the Dashboard API at ${BASE_URL}. ` +
        `Make sure the server is running on port 5100 and CORS is enabled.`
    )
  }

  if (!res.ok) {
    let detail = ''
    try {
      detail = await res.text()
    } catch {
      /* ignore */
    }
    throw new Error(`API error ${res.status} (${res.statusText})${detail ? `: ${detail}` : ''}`)
  }

  return res.json()
}

export async function fetchDriversWithAssignments(companyId: number): Promise<Driver[]> {
  const url = `${BASE_URL}/api/companies/${companyId}/dispatch/drivers`

  let res: Response
  try {
    res = await fetch(url)
  } catch {
    throw new Error(`Cannot reach the Dashboard API at ${BASE_URL}. Make sure the server is running and CORS is enabled.`)
  }

  if (!res.ok) {
    let detail = ''
    try {
      detail = await res.text()
    } catch {
      /* ignore */
    }
    throw new Error(`API error ${res.status} (${res.statusText})${detail ? `: ${detail}` : ''}`)
  }

  return res.json()
}

export async function assignDelivery(companyId: number, payload: AssignDeliveryRequest): Promise<AssignDeliveryResponse> {
  const res = await fetch(`${BASE_URL}/api/companies/${companyId}/dispatch/assign`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  })
  if (!res.ok) {
    const detail = await res.text().catch(() => '')
    throw new Error(`Assign failed ${res.status}: ${detail}`)
  }
  return res.json()
}

export async function bulkAssignDeliveries(companyId: number, payload: BulkAssignRequest): Promise<BulkAssignResponse> {
  const res = await fetch(`${BASE_URL}/api/companies/${companyId}/dispatch/bulk-assign`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  })
  if (!res.ok) {
    const detail = await res.text().catch(() => '')
    throw new Error(`Bulk assign failed ${res.status}: ${detail}`)
  }
  return res.json()
}

export async function unassignDelivery(companyId: number, deliveryNo: string): Promise<UnassignResponse> {
  const res = await fetch(`${BASE_URL}/api/companies/${companyId}/dispatch/unassign/${encodeURIComponent(deliveryNo)}`, {
    method: 'POST',
  })
  if (!res.ok) {
    const detail = await res.text().catch(() => '')
    throw new Error(`Unassign failed ${res.status}: ${detail}`)
  }
  return res.json()
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
