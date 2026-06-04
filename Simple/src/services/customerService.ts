import httpClient from './api'
import { getCompanyId } from '@/helpers/config'

export interface Customer {
  id: number
  customerCode: string
  customerName: string
  telephone: string | null
  contact: string | null
  billToAddr1: string | null
  billToAddr2: string | null
  billToAddr3: string | null
  shipToAddr1: string | null
  shipToAddr2: string | null
  shipToAddr3: string | null
  isActive: boolean
  createdAt: string
  updatedAt: string
}

export interface CustomerPagedResult {
  items: Customer[]
  totalCount: number
  page: number
  pageSize: number
  totalPages: number
  hasNextPage: boolean
  hasPreviousPage: boolean
}

const customerService = {
  getAll: async (params: {
    customerCode?: string
    customerName?: string
    isActive?: boolean
    page?: number
    pageSize?: number
  }): Promise<CustomerPagedResult> => {
    const companyId = getCompanyId()
    const query = new URLSearchParams()
    if (params.customerCode) query.set('customerCode', params.customerCode)
    if (params.customerName) query.set('customerName', params.customerName)
    if (params.isActive !== undefined) query.set('isActive', String(params.isActive))
    query.set('page',     String(params.page     ?? 1))
    query.set('pageSize', String(params.pageSize ?? 10))

    const res = await httpClient.get<CustomerPagedResult>(
      `/api/companies/${companyId}/customers?${query.toString()}`
    )
    return res.data
  }
}

export default customerService
