export interface UnassignedDelivery {
  deliveryNo: string
  shipmentNo: string | null
  invoiceNo: string | null
  customerName: string
  customerCode: string
  customerAddress: string
  customerAccountNo: string
  suburb: string
  city: string
  purchaseOrderNo: string
  salesOrderNo: string
  poSvoNo: string
  status: string
  statusId: number
  deliveryType: string
  itemCount: number
  createdAt: string
}

export interface UnassignedDeliveriesResponse {
  items: UnassignedDelivery[]
  totalCount?: number
  page?: number
  pageSize?: number
}

export interface AssignedDelivery {
  deliveryNo: string
  invoiceNo: string | null
  customerName: string
  customerAddress: string
  suburb: string
  city: string
  factoryName: string
  factoryAddress: string
  factoryCode: string
  itemQuantity: number
  loadNo: string | null
  deliveryOrder: string
  status: string
  operator: string | null
  priority: string
  salesOrderNo: string
  poSvoNo: string
  customerAccountNo: string
  shipmentNo: string | null
  customerCode: string
  purchaseOrderNo: string
  statusId: number
  deliveryType: string
  itemCount: number
  createdAt: string
}

export interface Shipment {
  shipmentNo: string | null
  status: string
  vehicleReg: string
  deliveries: AssignedDelivery[]
}

export interface Driver {
  driverId: number
  fullName: string
  vehicleId: number          // ← added to match controller
  photoUrl?: string | null
  vehiclePhotoUrl?: string | null
  shipments: Shipment[]
}

export interface FactoryGroup {
  factoryCode: string
  factoryName: string
  deliveries: UnassignedDelivery[]
}

export interface LocationGroup {
  location: string
  factories: FactoryGroup[]
}

// Matches AssignDeliveryRequest in controller
export interface AssignDeliveryRequest {
  deliveryNo: string
  driverId: number
  vehicleId: number
}

// Matches BulkAssignDeliveryRequest in controller
export interface BulkAssignRequest {
  deliveryNos: string[]
  driverId: number
  vehicleId: number
}

export interface AssignDeliveryResponse {
  message: string
  shipmentNo: string
}

export interface BulkAssignResponse {
  message: string
  shipmentNo: string
  assigned: number
  skipped: number
}

export interface UnassignResponse {
  message: string
}