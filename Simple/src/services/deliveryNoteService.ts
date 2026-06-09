import httpClient from './api'
import { getCompanyId } from '@/helpers/config'

export interface DeliveryNoteListItem {
  deliveryNo: string
  shipmentNo: string | null
  customerName: string | null
  status: string | null
  invoiceNo: string | null
  purchaseOrderNo: string | null
  createdAt: string
  updatedAt: string
}

export interface DeliveryNoteListResult {
  items: DeliveryNoteListItem[]
  totalCount: number
  page: number
  pageSize: number
  totalPages: number
}

export interface DeliveryNoteFilters {
  deliveryNo?: string
  customerName?: string
  dateFrom?: string
  dateTo?: string
  page?: number
  pageSize?: number
}

const deliveryNoteService = {
  getAll: async (filters: DeliveryNoteFilters = {}): Promise<DeliveryNoteListResult> => {
    const companyId = getCompanyId()
    const params = new URLSearchParams({
      page: String(filters.page ?? 1),
      pageSize: String(filters.pageSize ?? 10),
      ...(filters.deliveryNo && { deliveryNo: filters.deliveryNo }),
      ...(filters.customerName && { customerName: filters.customerName }),
      ...(filters.dateFrom && { dateFrom: filters.dateFrom }),
      ...(filters.dateTo && { dateTo: filters.dateTo })
    })

    const res = await httpClient.get<DeliveryNoteListResult>(
      `/api/companies/${companyId}/deliveries/list?${params}`
    )
    return res.data
  },

  getById: async (deliveryNo: string): Promise<DeliveryNoteListItem> => {
    const companyId = getCompanyId()
    const res = await httpClient.get<DeliveryNoteListItem>(
      `/api/companies/${companyId}/deliveries/${deliveryNo}`
    )
    return res.data
  },

  downloadPdf: async (deliveryNo: string): Promise<Blob> => {
    const companyId = getCompanyId()
    const res = await httpClient.get(
      `/api/companies/${companyId}/deliveries/${deliveryNo}/download-pdf`,
      { responseType: 'blob' }
    )
    return res.data
  }
}

export default deliveryNoteService