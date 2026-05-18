import dashboardApi from './dashboardApi'

export interface DeliveryStatusStat {
  status: string
  count: number
}

export interface RecentDeliveryNote {
  deliveryNo: string
  shipmentNo: string | null
  customerName: string | null
  status: string | null
  invoiceNo: string | null
  purchaseOrderNo: string | null
  createdAt: string
}

export interface DashboardStats {
  totalDeliveryNotes: number
  totalCustomers: number
  totalDrivers: number
  totalVehicles: number
  deliveriesByStatus: DeliveryStatusStat[]
  recentDeliveryNotes: RecentDeliveryNote[]
}

const dashboardStatsService = {
  getStats: async (companyId: number): Promise<DashboardStats> => {
    const res = await dashboardApi.get<DashboardStats>(
      `/api/companies/${companyId}/dashboard/stats`
    )
    return res.data
  }
}

export default dashboardStatsService
