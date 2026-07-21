'use client'

import { useEffect, useState } from 'react'
import { Badge, Button, Col, Form, InputGroup, Modal, Row } from 'react-bootstrap'
import { LuChevronDown, LuChevronRight, LuFilter, LuPrinter, LuSearch, LuSettings, LuTrash2, LuUsers } from 'react-icons/lu'
import { Button as ShadButton } from '@/components/ui/button'
import { RotateCcw } from 'lucide-react'
import { TbPackage, TbTruck } from 'react-icons/tb'
import { AssignedDelivery, Driver, LocationGroup, Shipment, UnassignedDelivery } from '@/types/dispatch'
import dispatchService, { type SubmitDispatchItem } from '@/services/dispatchService'
import vehicleService, { type Vehicle } from '@/services/vehicleService'
import { getCompanyId } from '@/helpers/config'

interface BulkDrag {
  _bulk: true
  deliveries: (UnassignedDelivery | AssignedDelivery)[]
  deliveryNo: string
}

type DraggedItem = (UnassignedDelivery & { _driverId?: number; _shipmentNo?: string | null }) | (AssignedDelivery & { _driverId: number; _shipmentNo: string | null }) | BulkDrag
type DragSource = 'unassigned' | 'driver'

interface Toast { message: string; type: string }

interface DriverCardProps {
  driver: Driver
  index: number
  isDropTarget: boolean
  dragOverTarget: string | null
  setDragOverTarget: (target: string | null) => void
  onDropOnShipment: (driverId: number, shipmentNo: string | null, vehicleId: number | null) => Promise<void>
  onDropOnNewShipment: (driverId: number, vehicleReg: string, vehicleId: number | null) => Promise<void>
  onDragStartDelivery: (delivery: any, source: DragSource) => void
  onDragEnd: () => void
  selectedAssigned: Set<string>
  toggleSelectAssigned: (deliveryNo: string) => void
}

interface ShipmentBlockProps {
  shipment: Shipment
  driverId: number
  index: number
  isDropTarget: boolean
  dragOverTarget: string | null
  setDragOverTarget: (target: string | null) => void
  onDropOnShipment: (driverId: number, shipmentNo: string | null, vehicleId: number | null) => Promise<void>
  onDragStartDelivery: (delivery: any, source: DragSource) => void
  onDragEnd: () => void
  selectedAssigned: Set<string>
  toggleSelectAssigned: (deliveryNo: string) => void
}

interface NewShipmentBlockProps {
  driverId: number
  vehicleReg: string
  vehicleId: number | null
  isDropTarget: boolean
  dragOverTarget: string | null
  setDragOverTarget: (target: string | null) => void
  onDropOnNewShipment: (driverId: number, vehicleReg: string, vehicleId: number | null) => Promise<void>
}

interface AssignedDeliveryCardProps {
  delivery: AssignedDelivery & { _driverId: number; _shipmentNo: string | null }
  isChecked: boolean
  onToggleCheck: () => void
  onDragStart: () => void
  onDragEnd: () => void
}

interface DeliveryCardProps {
  delivery: UnassignedDelivery
  isChecked: boolean
  onToggleCheck: () => void
  isDragging: boolean
  onDragStart: () => void
  onDragEnd: () => void
}

const PLANT_OPTIONS = [
  { id: 'P001', name: 'Acme Head Office - JHB' },
  { id: 'P002', name: 'Acme Depot - CPT' },
  { id: 'P003', name: 'Acme Depot - DBN' },
  { id: 'PLANT001', name: 'Johannesburg Warehouse' },
]

const DispatchHub = () => {
  const [deliveryDate, setDeliveryDate] = useState(() => new Date().toISOString().split('T')[0])
  const [drivers, setDrivers] = useState<Driver[]>([])
  const [driversLoading, setDriversLoading] = useState(false)
  const [driversError, setDriversError] = useState<string | null>(null)
  const [deliveryGroups, setDeliveryGroups] = useState<LocationGroup[]>([])
  const [deliveriesLoading, setDeliveriesLoading] = useState(false)
  const [deliveriesError, setDeliveriesError] = useState<string | null>(null)
  const [driverSearch, setDriverSearch] = useState('')
  const [deliverySearch, setDeliverySearch] = useState('')
  const [factoryFilter, setFactoryFilter] = useState('')
  const [customerFilter, setCustomerFilter] = useState('')
  const [collapsedLocations, setCollapsedLocations] = useState<Record<string, boolean>>({})
  const [collapsedFactories, setCollapsedFactories] = useState<Record<string, boolean>>({})
  const [selectedDeliveries, setSelectedDeliveries] = useState<Set<string>>(new Set())
  const [selectedAssigned, setSelectedAssigned] = useState<Set<string>>(new Set())
  const [draggedDelivery, setDraggedDelivery] = useState<DraggedItem | null>(null)
  const [dragSource, setDragSource] = useState<DragSource | null>(null)
  const [dragOverTarget, setDragOverTarget] = useState<string | null>(null)
  const [toast, setToast] = useState<Toast | null>(null)
  const [showVehicleModal, setShowVehicleModal] = useState(false)
  const [selectedVehicleIdForDriver, setSelectedVehicleIdForDriver] = useState<number | null>(null)
  const [pendingNewShipmentDriver, setPendingNewShipmentDriver] = useState<{ driverId: number; vehicleReg: string; deliveryNos: string[]; incoming: any[] } | null>(null)
  const [availableVehicles, setAvailableVehicles] = useState<Vehicle[]>([])
  const [submitting, setSubmitting] = useState(false)

  // Driver Modal
  const [showDriverModal, setShowDriverModal] = useState(false)
  const [newDriver, setNewDriver] = useState({
    empNo: '', firstName: '', lastName: '',
    plantId: 'P001', username: '', password: '',
    licenseNumber: '', licenseExpiryDate: '', isActive: true
  })
  const [creatingDriver, setCreatingDriver] = useState(false)

  const loadDeliveries = async () => {
    setDeliveriesLoading(true)
    setDeliveriesError(null)
    try {
      const data = await dispatchService.fetchUnassignedDeliveries({ search: deliverySearch })
      setDeliveryGroups(dispatchService.groupDeliveriesByFactory(data.items))
    } catch (err: any) {
      setDeliveriesError(err.message)
    } finally {
      setDeliveriesLoading(false)
    }
  }

  const loadDrivers = async () => {
    setDriversLoading(true)
    setDriversError(null)
    try {
      const data = await dispatchService.fetchDriversWithAssignments()
      setDrivers(data)
    } catch (err: any) {
      setDriversError(err.message)
    } finally {
      setDriversLoading(false)
    }
  }

  const loadVehicles = async () => {
    try {
      const data = await vehicleService.getAll(getCompanyId())
      setAvailableVehicles(data)
    } catch (err) {
      console.error(err)
    }
  }

  useEffect(() => {
    loadDeliveries()
    loadDrivers()
    loadVehicles()
  }, [])

  const showToast = (message: string, type = 'success') => {
    setToast({ message, type })
    setTimeout(() => setToast(null), 5000)
  }

  const toggleLocation = (loc: string) => setCollapsedLocations((prev) => ({ ...prev, [loc]: !prev[loc] }))
  const toggleFactory = (key: string) => setCollapsedFactories((prev) => ({ ...prev, [key]: !prev[key] }))

  const filteredDrivers = drivers.filter((d) => {
    if (!driverSearch) return true
    const q = driverSearch.toLowerCase()
    return d.fullName.toLowerCase().includes(q) ||
      (d.shipments?.some(s => s.vehicleReg?.toLowerCase().includes(q)) ?? false)
  })

  const filteredGroups = deliveryGroups
    .map((group) => ({
      ...group,
      factories: group.factories
        .filter((f) => !factoryFilter || f.factoryName.toLowerCase().includes(factoryFilter.toLowerCase()))
        .map((f) => ({
          ...f,
          deliveries: f.deliveries.filter((d) => {
            const q = deliverySearch.toLowerCase()
            const cq = customerFilter.toLowerCase()
            const matchSearch = !deliverySearch || d.deliveryNo.includes(q) || d.customerName.toLowerCase().includes(q) || (d.invoiceNo ?? '').toLowerCase().includes(q)
            const matchCustomer = !customerFilter || d.customerName.toLowerCase().includes(cq)
            return matchSearch && matchCustomer
          }),
        }))
        .filter((f) => f.deliveries.length > 0),
    }))
    .filter((g) => g.factories.length > 0)

  const toggleSelect = (deliveryNo: string) => {
    setSelectedDeliveries((prev) => {
      const next = new Set(prev)
      if (next.has(deliveryNo)) { next.delete(deliveryNo) } else { next.add(deliveryNo) }
      return next
    })
  }

  const toggleSelectAssigned = (deliveryNo: string) => {
    setSelectedAssigned((prev) => {
      const next = new Set(prev)
      if (next.has(deliveryNo)) { next.delete(deliveryNo) } else { next.add(deliveryNo) }
      return next
    })
  }

  const allUnassignedDeliveries = deliveryGroups.flatMap((g) => g.factories.flatMap((f) => f.deliveries))

  const onDragStartDelivery = (delivery: any, source: DragSource) => {
    if (source === 'unassigned' && selectedDeliveries.has(delivery.deliveryNo) && selectedDeliveries.size > 1) {
      const bulk = allUnassignedDeliveries.filter((d) => selectedDeliveries.has(d.deliveryNo))
      setDraggedDelivery({ _bulk: true, deliveries: bulk, deliveryNo: `${bulk.length} deliveries` })
    } else if (source === 'driver' && selectedAssigned.has(delivery.deliveryNo) && selectedAssigned.size > 1) {
      const bulk = drivers.flatMap((d) =>
        d.shipments.flatMap((s) =>
          s.deliveries
            .filter((x) => selectedAssigned.has(x.deliveryNo))
            .map((x) => ({ ...x, _driverId: d.driverId, _shipmentNo: s.shipmentNo }))
        )
      )
      setDraggedDelivery({ _bulk: true, deliveries: bulk, deliveryNo: `${bulk.length} deliveries` })
    } else {
      setDraggedDelivery(delivery)
    }
    setDragSource(source)
  }

  const onDragEnd = () => {
    setDraggedDelivery(null)
    setDragSource(null)
    setDragOverTarget(null)
  }

  const cleanDelivery = (d: any) => {
    if (!d) return null
    const copy = { ...d }
    delete copy._driverId
    delete copy._shipmentNo
    return copy
  }

  const getDraggedList = () => {
    if (!draggedDelivery) return []
    return (draggedDelivery as BulkDrag)?._bulk
      ? (draggedDelivery as BulkDrag).deliveries.map(cleanDelivery).filter(Boolean)
      : [cleanDelivery(draggedDelivery)].filter(Boolean)
  }

  const getDraggedNos = (): string[] => {
    if (!draggedDelivery) return []
    return (draggedDelivery as BulkDrag)?._bulk
      ? (draggedDelivery as BulkDrag).deliveries.map((d) => d.deliveryNo)
      : [(draggedDelivery as any).deliveryNo]
  }

  const removeFromSource = (currentDrivers: Driver[], currentGroups: LocationGroup[]) => {
    const nos = new Set(getDraggedNos())
    let updatedDrivers = currentDrivers
    let updatedGroups = currentGroups
    if (dragSource === 'unassigned') {
      updatedGroups = currentGroups.map((g) => ({
        ...g,
        factories: g.factories.map((f) => ({
          ...f,
          deliveries: f.deliveries.filter((d) => !nos.has(d.deliveryNo)),
        })),
      }))
    }
    if (dragSource === 'driver') {
      updatedDrivers = currentDrivers.map((d) => ({
        ...d,
        shipments: d.shipments
          .map((s) => ({ ...s, deliveries: s.deliveries.filter((x) => !nos.has(x.deliveryNo)) }))
          .filter((s) => s.deliveries.length > 0),
      }))
    }
    return { updatedDrivers, updatedGroups }
  }

  const refreshAll = () => { loadDeliveries(); loadDrivers() }

  const handleSubmitDispatch = async () => {
    // Build list of items from current driver state
    const items: SubmitDispatchItem[] = drivers.flatMap(driver =>
      driver.shipments.flatMap(shipment =>
        shipment.deliveries.map(delivery => ({
          deliveryNo: delivery.deliveryNo,
          driverId: driver.driverId,
          vehicleId: shipment.vehicleId ?? null,
          shipmentNo: shipment.shipmentNo,
        }))
      )
    )

    if (items.length === 0) {
      showToast('No deliveries assigned to dispatch.', 'warning')
      return
    }

    setSubmitting(true)
    try {
      const result = await dispatchService.submitDispatch(items)
      showToast(`${result.shipmentsDispatched} shipments dispatched with ${result.deliveriesDispatched} deliveries`)
      refreshAll()
    } catch (err: any) {
      showToast(err.response?.data?.message || err.message || 'Failed to submit dispatch', 'danger')
    } finally {
      setSubmitting(false)
    }
  }

  const handleCreateDriver = async () => {
    if (!newDriver.empNo.trim() || !newDriver.firstName.trim() || !newDriver.lastName.trim() || !newDriver.username.trim() || !newDriver.password.trim()) return
    setCreatingDriver(true)
    try {
      const driverService = await import('@/services/driverService')
      await driverService.default.create({
        empNo: newDriver.empNo,
        firstName: newDriver.firstName,
        lastName: newDriver.lastName,
        plantId: newDriver.plantId,
        username: newDriver.username || null,
        password: newDriver.password,
        licenseNumber: newDriver.licenseNumber || null,
        licenseExpiryDate: newDriver.licenseExpiryDate || null,
        isActive: newDriver.isActive
      })
      showToast(`Driver ${newDriver.firstName} ${newDriver.lastName} created successfully!`)
      setShowDriverModal(false)
      resetDriverForm()
      loadDrivers()
    } catch (err: any) {
      showToast(err.response?.data?.message || err.message || 'Failed to create driver', 'danger')
    } finally {
      setCreatingDriver(false)
    }
  }

  const resetDriverForm = () => {
    setNewDriver({
      empNo: '', firstName: '', lastName: '',
      plantId: 'P001', username: '', password: '',
      licenseNumber: '', licenseExpiryDate: '', isActive: true
    })
  }

  const onDropOnShipment = async (driverId: number, shipmentNo: string | null, vehicleId: number | null = null) => {
    if (!draggedDelivery) return
    setDragOverTarget(null)
    if (dragSource === 'driver' && !(draggedDelivery as BulkDrag)._bulk && (draggedDelivery as any)._shipmentNo === shipmentNo) {
      setDraggedDelivery(null); setDragSource(null); return
    }
    const incoming = getDraggedList()
    const deliveryNos = getDraggedNos()
    if (deliveryNos.length === 0) return
    const { updatedDrivers, updatedGroups } = removeFromSource(drivers, deliveryGroups)
    setDrivers(updatedDrivers.map((d) => {
      if (d.driverId !== driverId) return d
      return { ...d, shipments: d.shipments.map((s) => s.shipmentNo === shipmentNo ? { ...s, deliveries: [...s.deliveries, ...incoming] } : s) }
    }))
    if (dragSource === 'unassigned') setDeliveryGroups(updatedGroups)
    setSelectedDeliveries(new Set()); setSelectedAssigned(new Set())
    setDraggedDelivery(null); setDragSource(null)
    try {
      if (deliveryNos.length === 1) {
        await dispatchService.assignDelivery({ deliveryNo: deliveryNos[0], driverId, vehicleId: vehicleId ?? null })
      } else {
        await dispatchService.bulkAssignDeliveries({ deliveryNos, driverId, vehicleId: vehicleId ?? null })
      }
      const label = incoming.length > 1 ? `${incoming.length} deliveries` : incoming[0]?.deliveryNo || 'delivery'
      showToast(`${label} added to shipment ${shipmentNo}`)
      refreshAll()
    } catch (err: any) {
      showToast(err.response?.data?.message || err.message, 'danger')
      refreshAll()
    }
  }

  const proceedWithNewShipment = async (driverId: number, vehicleReg: string, vehicleId: number) => {
    if (!draggedDelivery) return
    setDragOverTarget(null)
    const incoming = getDraggedList()
    const deliveryNos = getDraggedNos()
    if (deliveryNos.length === 0) return
    const { updatedDrivers, updatedGroups } = removeFromSource(drivers, deliveryGroups)
    setDrivers(updatedDrivers.map((d) => {
      if (d.driverId !== driverId) return d
      return {
        ...d,
        shipments: [...d.shipments, {
          shipmentNo: null, status: 'Assigning...',
          statusId: 0, assignedExecutionDate: null,
          vehicleId, vehicleReg, deliveries: incoming
        }]
      }
    }))
    if (dragSource === 'unassigned') setDeliveryGroups(updatedGroups)
    setSelectedDeliveries(new Set()); setSelectedAssigned(new Set())
    setDraggedDelivery(null); setDragSource(null)
    setShowVehicleModal(false)
    try {
      let result: any
      if (deliveryNos.length === 1) {
        result = await dispatchService.assignDelivery({ deliveryNo: deliveryNos[0], driverId, vehicleId })
      } else {
        result = await dispatchService.bulkAssignDeliveries({ deliveryNos, driverId, vehicleId })
      }
      const label = incoming.length > 1 ? `${incoming.length} deliveries` : incoming[0]?.deliveryNo || 'delivery'
      showToast(`Shipment ${result.shipmentNo} created — ${label}`)
      refreshAll()
    } catch (err: any) {
      showToast(err.response?.data?.message || err.message, 'danger')
      refreshAll()
    }
    setPendingNewShipmentDriver(null)
    setSelectedVehicleIdForDriver(null)
  }

  const onDropOnNewShipment = async (driverId: number, vehicleReg: string, vehicleId: number | null = null) => {
    if (!draggedDelivery) return
    const driver = drivers.find(d => d.driverId === driverId)
    if (driver && driver.shipments.some(s => s.statusId === 1)) {
      showToast(`${driver.fullName} already has a pending shipment. Submit Dispatch first, or drop the delivery onto the existing shipment.`, 'warning')
      setDraggedDelivery(null); setDragSource(null)
      return
    }
    if (!vehicleId) {
      if (driver?.assignedVehicleId) {
        await proceedWithNewShipment(driverId, driver.assignedVehicleReg ?? vehicleReg, driver.assignedVehicleId)
        return
      }
      // Save deliveries NOW before onDragEnd clears draggedDelivery
      setPendingNewShipmentDriver({ driverId, vehicleReg, deliveryNos: getDraggedNos(), incoming: getDraggedList() })
      setShowVehicleModal(true)
      return
    }
    await proceedWithNewShipment(driverId, vehicleReg, vehicleId)
  }

  const handleCreateShipment = async () => {
    if (!pendingNewShipmentDriver || !selectedVehicleIdForDriver) {
      showToast('Please select a vehicle', 'warning')
      return
    }
    const { driverId, deliveryNos, incoming } = pendingNewShipmentDriver
    const vehicle = availableVehicles.find(v => v.id === selectedVehicleIdForDriver)
    const vehicleReg = vehicle?.vehicleReg ?? 'N/A'
    const vehicleId = selectedVehicleIdForDriver

    setShowVehicleModal(false)
    setDrivers(prev => prev.map(d => {
      if (d.driverId !== driverId) return d
      return { ...d, shipments: [...d.shipments, { shipmentNo: null, status: 'Assigning...', statusId: 0, assignedExecutionDate: null, vehicleId, vehicleReg, deliveries: incoming }] }
    }))
    if (dragSource === 'unassigned') {
      const nos = new Set(deliveryNos)
      setDeliveryGroups(prev => prev.map(g => ({
        ...g,
        factories: g.factories.map(f => ({ ...f, deliveries: f.deliveries.filter(d => !nos.has(d.deliveryNo)) }))
      })))
    }
    setSelectedDeliveries(new Set()); setSelectedAssigned(new Set())
    setDraggedDelivery(null); setDragSource(null)
    setPendingNewShipmentDriver(null)
    setSelectedVehicleIdForDriver(null)

    try {
      let result: any
      if (deliveryNos.length === 1) {
        result = await dispatchService.assignDelivery({ deliveryNo: deliveryNos[0], driverId, vehicleId })
      } else {
        result = await dispatchService.bulkAssignDeliveries({ deliveryNos, driverId, vehicleId })
      }
      const label = incoming.length > 1 ? `${incoming.length} deliveries` : incoming[0]?.deliveryNo || 'delivery'
      showToast(`Shipment ${result.shipmentNo} created — ${label}`)
      refreshAll()
    } catch (err: any) {
      showToast(err.message || 'Failed to create shipment', 'danger')
      refreshAll()
    }
  }

  const onDropOnUnassigned = async () => {
    if (!draggedDelivery || dragSource !== 'driver') return
    setDragOverTarget(null)
    const deliveryNos = getDraggedNos()
    const { updatedDrivers } = removeFromSource(drivers, deliveryGroups)
    setDrivers(updatedDrivers)
    setSelectedDeliveries(new Set()); setSelectedAssigned(new Set())
    setDraggedDelivery(null); setDragSource(null)
    try {
      await Promise.all(deliveryNos.map((no) => dispatchService.unassignDelivery(no)))
      const label = deliveryNos.length > 1 ? `${deliveryNos.length} deliveries` : `Delivery ${deliveryNos[0]}`
      showToast(`${label} returned to unassigned`, 'warning')
      refreshAll()
    } catch (err: any) {
      showToast(err.message, 'danger')
      refreshAll()
    }
  }

  const isDropTarget = draggedDelivery !== null

  return (
    <div style={{ position: 'relative', fontSize: 13 }}>
      <style>{`.spin { animation: spin 1s linear infinite; } @keyframes spin { to { transform: rotate(360deg); } }`}</style>

      {toast && (
        <div style={{ position: 'fixed', top: 20, right: 20, zIndex: 9999, minWidth: 300 }}
          className={`alert alert-${toast.type} alert-dismissible shadow py-2 px-3 mb-0`}>
          {toast.message}
          <button type="button" className="btn-close" style={{ fontSize: 11 }} onClick={() => setToast(null)} />
        </div>
      )}

      {/* Add Driver Modal */}
      <Modal show={showDriverModal} onHide={() => { setShowDriverModal(false); resetDriverForm() }} size="lg" centered>
        <Modal.Header closeButton className="modal-header-dark">
          <Modal.Title style={{ fontSize: 15, fontWeight: 600 }}>Add New Driver</Modal.Title>
        </Modal.Header>
        <Modal.Body style={{ padding: '1.5rem' }}>
          <div className="row g-3">
            <div className="col-md-6">
              <label className="field-label">Employee Number <span style={{ color: 'var(--color-error)' }}>*</span></label>
              <div className="input-wrapper">
                <input className="raw-input no-icon" placeholder="EMP011"
                  value={newDriver.empNo}
                  onChange={(e) => setNewDriver({ ...newDriver, empNo: e.target.value })} />
              </div>
            </div>
            <div className="col-md-6">
              <label className="field-label">Username <span style={{ color: 'var(--color-error)' }}>*</span></label>
              <div className="input-wrapper">
                <input className="raw-input no-icon" placeholder="username"
                  value={newDriver.username}
                  onChange={(e) => setNewDriver({ ...newDriver, username: e.target.value })} />
              </div>
            </div>
            <div className="col-md-6">
              <label className="field-label">Password <span style={{ color: 'var(--color-error)' }}>*</span></label>
              <div className="input-wrapper">
                <input className="raw-input no-icon" type="password" placeholder="••••••••"
                  value={newDriver.password}
                  onChange={(e) => setNewDriver({ ...newDriver, password: e.target.value })} />
              </div>
            </div>
            <div className="col-md-6">
              <label className="field-label">First Name <span style={{ color: 'var(--color-error)' }}>*</span></label>
              <div className="input-wrapper">
                <input className="raw-input no-icon" placeholder="Johannes"
                  value={newDriver.firstName}
                  onChange={(e) => setNewDriver({ ...newDriver, firstName: e.target.value })} />
              </div>
            </div>
            <div className="col-md-6">
              <label className="field-label">Last Name <span style={{ color: 'var(--color-error)' }}>*</span></label>
              <div className="input-wrapper">
                <input className="raw-input no-icon" placeholder="Burg"
                  value={newDriver.lastName}
                  onChange={(e) => setNewDriver({ ...newDriver, lastName: e.target.value })} />
              </div>
            </div>
            <div className="col-md-6">
              <label className="field-label">Plant <span style={{ color: 'var(--color-error)' }}>*</span></label>
              <div className="input-wrapper" style={{ padding: 0 }}>
                <select className="raw-input no-icon" style={{ paddingLeft: '0.75rem', width: '100%' }}
                  value={newDriver.plantId}
                  onChange={(e) => setNewDriver({ ...newDriver, plantId: e.target.value })}>
                  {PLANT_OPTIONS.map(p => (
                    <option key={p.id} value={p.id}>{p.id} - {p.name}</option>
                  ))}
                </select>
              </div>
            </div>
            <div className="col-md-6">
              <label className="field-label">License Number</label>
              <div className="input-wrapper">
                <input className="raw-input no-icon" placeholder="LIC123456"
                  value={newDriver.licenseNumber}
                  onChange={(e) => setNewDriver({ ...newDriver, licenseNumber: e.target.value })} />
              </div>
            </div>
            <div className="col-md-6">
              <label className="field-label">License Expiry</label>
              <div className="input-wrapper">
                <input className="raw-input no-icon" type="date"
                  value={newDriver.licenseExpiryDate}
                  onChange={(e) => setNewDriver({ ...newDriver, licenseExpiryDate: e.target.value })} />
              </div>
            </div>
            <div className="col-md-6">
              <label className="field-label">Status</label>
              <div className="input-wrapper" style={{ padding: 0 }}>
                <select className="raw-input no-icon" style={{ paddingLeft: '0.75rem', width: '100%' }}
                  value={newDriver.isActive ? 'active' : 'inactive'}
                  onChange={(e) => setNewDriver({ ...newDriver, isActive: e.target.value === 'active' })}>
                  <option value="active">Active</option>
                  <option value="inactive">Inactive</option>
                </select>
              </div>
            </div>
          </div>
        </Modal.Body>
        <Modal.Footer style={{ borderTop: '1px solid #dde3f0', padding: '0.75rem 1.25rem' }}>
          <ShadButton size="sm" variant="outline" className="rounded-md px-4"
            onClick={() => { setShowDriverModal(false); resetDriverForm() }}>Cancel</ShadButton>
          <ShadButton size="sm" className="rounded-md px-4 btn-navy"
            disabled={creatingDriver || !newDriver.empNo || !newDriver.firstName || !newDriver.lastName}
            onClick={handleCreateDriver}>
            {creatingDriver ? 'Creating...' : 'Add Driver'}
          </ShadButton>
        </Modal.Footer>
      </Modal>

      {/* Vehicle Selection Modal */}
      <Modal show={showVehicleModal} onHide={() => {
        setShowVehicleModal(false)
        setPendingNewShipmentDriver(null)
        setSelectedVehicleIdForDriver(null)
      }} size="sm" centered>
        <Modal.Header closeButton>
          <Modal.Title style={{ fontSize: 15 }}>Select Vehicle</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Form.Group>
            <Form.Label className="small">Choose a vehicle for this shipment</Form.Label>
            <Form.Select size="sm"
              value={selectedVehicleIdForDriver || ''}
              onChange={(e) => setSelectedVehicleIdForDriver(Number(e.target.value))}>
              <option value="">Select vehicle...</option>
              {availableVehicles
                .filter(v => !v.currentDriverId || v.currentDriverId === pendingNewShipmentDriver?.driverId)
                .map(vehicle => (
                  <option key={vehicle.id} value={vehicle.id}>
                    {vehicle.vehicleReg}{vehicle.vehicleType ? ` — ${vehicle.vehicleType}` : ''} (Available)
                  </option>
                ))}
            </Form.Select>
          </Form.Group>
        </Modal.Body>
        <Modal.Footer style={{ borderTop: '1px solid #dde3f0', padding: '0.75rem 1.25rem' }}>
          <ShadButton size="sm" variant="outline" className="rounded-md px-4" onClick={() => {
            setShowVehicleModal(false)
            setPendingNewShipmentDriver(null)
            setSelectedVehicleIdForDriver(null)
          }}>Cancel</ShadButton>
          <ShadButton size="sm" className="rounded-md px-4 btn-navy"
            disabled={!selectedVehicleIdForDriver}
            onClick={handleCreateShipment}>
            Create Shipment
          </ShadButton>
        </Modal.Footer>
      </Modal>

      <Row className="g-3">
        {/* ===== LEFT: Drivers ===== */}
        <Col lg={5}>
          <div className="d-flex align-items-center justify-content-between mb-2 p-2 rounded"
            style={{ background: '#fff', border: '1px solid #d0dbe8' }}>
            <div className="d-flex align-items-center gap-2">
              <LuUsers size={18} />
              <strong style={{ fontSize: 14 }}>Drivers</strong>
            </div>
            <div className="d-flex align-items-center gap-2">
              <ShadButton size="sm" onClick={() => setShowDriverModal(true)}
                className="flex items-center gap-1 btn-green rounded-md" style={{ fontSize: 11 }}>
                + Add Driver
              </ShadButton>
              <Form.Control type="date" size="sm" value={deliveryDate}
                onChange={(e) => setDeliveryDate(e.target.value)}
                style={{ fontSize: 12, width: 140 }} />
              <ShadButton size="sm" variant="outline" onClick={refreshAll}
                className="rounded-md px-2">
                <RotateCcw size={13} />
              </ShadButton>
              <ShadButton size="sm" className="flex items-center gap-1 btn-sky rounded-md" style={{ fontSize: 11 }}>
                <LuPrinter size={13} /> PRINT ALL
              </ShadButton>
              <ShadButton size="sm" disabled={submitting} onClick={handleSubmitDispatch}
                className="flex items-center gap-1 btn-green rounded-md" style={{ fontSize: 11 }}>
                {submitting ? 'Submitting...' : 'SUBMIT DISPATCH'}
              </ShadButton>
            </div>
          </div>

          <div className="d-flex align-items-center gap-2 mb-2 flex-wrap">
            <Form.Select size="sm" style={{ width: 160, fontSize: 12 }}>
              <option>Driver Status</option>
              <option>All Drivers</option>
              <option>Active</option>
              <option>On Break</option>
              <option>Off Duty</option>
            </Form.Select>
            <Badge bg="success" style={{ fontSize: 11, cursor: 'pointer', padding: '6px 10px' }}>✅ Available</Badge>
            <Badge bg="warning" text="dark" style={{ fontSize: 11, cursor: 'pointer', padding: '6px 10px' }}>🚚 On Route</Badge>
            <Badge bg="secondary" style={{ fontSize: 11, cursor: 'pointer', padding: '6px 10px' }}>⏸ On Break</Badge>
            <InputGroup size="sm" style={{ flex: 1, minWidth: 100 }}>
              <InputGroup.Text style={{ background: '#fff' }}><LuSearch size={12} /></InputGroup.Text>
              <Form.Control placeholder="Search drivers..." value={driverSearch}
                onChange={(e) => setDriverSearch(e.target.value)} style={{ fontSize: 12 }} />
            </InputGroup>
          </div>

          <div style={{ overflowY: 'auto', maxHeight: 'calc(100vh - 260px)' }}>
            {driversLoading ? (
              <div className="text-center text-muted py-5">
                <div className="spinner-border spinner-border-sm mb-2" role="status" />
                <div style={{ fontSize: 13 }}>Loading drivers...</div>
              </div>
            ) : driversError ? (
              <div className="text-center py-4">
                <div className="text-danger mb-2" style={{ fontSize: 13 }}>{driversError}</div>
                <Button size="sm" variant="outline-secondary" onClick={loadDrivers}>Retry</Button>
              </div>
            ) : filteredDrivers.length === 0 ? (
              <div className="text-center text-muted py-5" style={{ fontSize: 13 }}>No drivers found</div>
            ) : null}

            {!driversLoading && !driversError && filteredDrivers.map((driver, idx) => (
              <DriverCard
                key={driver.driverId}
                driver={driver}
                index={idx + 1}
                isDropTarget={isDropTarget}
                dragOverTarget={dragOverTarget}
                setDragOverTarget={setDragOverTarget}
                onDropOnShipment={onDropOnShipment}
                onDropOnNewShipment={onDropOnNewShipment}
                onDragStartDelivery={onDragStartDelivery}
                onDragEnd={onDragEnd}
                selectedAssigned={selectedAssigned}
                toggleSelectAssigned={toggleSelectAssigned}
              />
            ))}
          </div>
        </Col>

        {/* ===== RIGHT: Deliveries ===== */}
        <Col lg={7}>
          <div className="d-flex align-items-center justify-content-between mb-2 p-2 rounded"
            style={{ background: '#fff', border: '1px solid #d0dbe8' }}>
            <strong style={{ fontSize: 14 }}>📄 Delivery Notes</strong>
            <div className="d-flex align-items-center gap-2">
              <ShadButton size="sm" variant="outline" onClick={loadDeliveries} disabled={deliveriesLoading}
                className="rounded-md px-2">
                <RotateCcw size={13} className={deliveriesLoading ? 'spin' : ''} />
              </ShadButton>
              <ShadButton size="sm" disabled={submitting} onClick={handleSubmitDispatch}
                className="flex items-center gap-1 btn-green rounded-md" style={{ fontSize: 11 }}>
                {submitting ? 'Submitting...' : 'SUBMIT DISPATCH'}
              </ShadButton>
              <Form.Control type="date" size="sm" value={deliveryDate}
                onChange={(e) => setDeliveryDate(e.target.value)}
                style={{ fontSize: 12, width: 140 }} />
            </div>
          </div>

          <div className="d-flex gap-2 mb-2">
            <InputGroup size="sm" style={{ flex: 1 }}>
              <InputGroup.Text style={{ background: '#fff' }}><LuSearch size={12} /></InputGroup.Text>
              <Form.Control placeholder="Delivery Nr" value={deliverySearch}
                onChange={(e) => setDeliverySearch(e.target.value)} style={{ fontSize: 12 }} />
            </InputGroup>
            <InputGroup size="sm" style={{ flex: 1 }}>
              <InputGroup.Text style={{ background: '#fff' }}><LuFilter size={12} /></InputGroup.Text>
              <Form.Control placeholder="Factory Name" value={factoryFilter}
                onChange={(e) => setFactoryFilter(e.target.value)} style={{ fontSize: 12 }} />
            </InputGroup>
            <InputGroup size="sm" style={{ flex: 1 }}>
              <InputGroup.Text style={{ background: '#fff' }}><LuFilter size={12} /></InputGroup.Text>
              <Form.Control placeholder="Customer Name" value={customerFilter}
                onChange={(e) => setCustomerFilter(e.target.value)} style={{ fontSize: 12 }} />
            </InputGroup>
          </div>

          <div
            style={{ overflowY: 'auto', maxHeight: 'calc(100vh - 310px)' }}
            onDragOver={(e) => { e.preventDefault(); if (dragSource === 'driver') setDragOverTarget('unassigned-panel') }}
            onDragLeave={() => { if (dragOverTarget === 'unassigned-panel') setDragOverTarget(null) }}
            onDrop={(e) => { e.preventDefault(); onDropOnUnassigned() }}>

            {isDropTarget && dragSource === 'driver' && (
              <div className="text-center py-3 mb-2 rounded fw-semibold"
                style={{
                  border: '2px dashed #dc3545',
                  background: dragOverTarget === 'unassigned-panel' ? '#fff5f5' : 'transparent',
                  color: '#dc3545', fontSize: 12,
                }}>
                Drop here to unassign
              </div>
            )}

            {deliveriesLoading ? (
              <div className="text-center text-muted py-5">
                <div className="spinner-border spinner-border-sm mb-2" role="status" />
                <div style={{ fontSize: 13 }}>Loading deliveries...</div>
              </div>
            ) : deliveriesError ? (
              <div className="text-center py-5">
                <div className="text-danger mb-2" style={{ fontSize: 13 }}>{deliveriesError}</div>
                <Button size="sm" variant="outline-secondary" onClick={loadDeliveries}>Retry</Button>
              </div>
            ) : filteredGroups.length === 0 ? (
              <div className="text-center text-muted py-5">
                <TbPackage size={48} className="mb-2 opacity-25" />
                <div>No deliveries found</div>
              </div>
            ) : (
              filteredGroups.map((group) => (
                <div key={group.location} className="mb-2">
                  <div
                    className="d-flex align-items-center justify-content-between px-2 py-1 rounded"
                    style={{ background: '#f5f5f5', cursor: 'pointer', userSelect: 'none' }}
                    onClick={() => toggleLocation(group.location)}>
                    <div className="d-flex align-items-center gap-2 fw-semibold" style={{ fontSize: 12 }}>
                      {collapsedLocations[group.location] ? <LuChevronRight size={14} /> : <LuChevronDown size={14} />}
                      {group.location}
                    </div>
                    <Badge bg="secondary" style={{ fontSize: 10 }}>
                      {group.factories.reduce((s, f) => s + f.deliveries.length, 0)}
                    </Badge>
                  </div>
                  {!collapsedLocations[group.location] && (
                    <div>
                      {group.factories.map((factory) => {
                        const factKey = `${group.location}__${factory.factoryCode}`
                        return (
                          <div key={factKey} className="ms-2 mt-1">
                            <div
                              className="d-flex align-items-center justify-content-between px-2 py-1 rounded"
                              style={{ background: '#eef2f7', cursor: 'pointer', userSelect: 'none', border: '1px solid #d0dbe8' }}
                              onClick={() => toggleFactory(factKey)}>
                              <div className="d-flex align-items-center gap-2" style={{ fontSize: 12 }}>
                                {collapsedFactories[factKey] ? <LuChevronRight size={13} /> : <LuChevronDown size={13} />}
                                <span className="text-muted">{factory.factoryCode}</span>
                                <span>– {factory.factoryName}</span>
                              </div>
                              <Badge bg="warning" text="dark" style={{ fontSize: 10 }}>{factory.deliveries.length}</Badge>
                            </div>
                            {!collapsedFactories[factKey] && (
                              <div>
                                {factory.deliveries.map((delivery) => (
                                  <DeliveryCard
                                    key={delivery.deliveryNo}
                                    delivery={delivery}
                                    isChecked={selectedDeliveries.has(delivery.deliveryNo)}
                                    onToggleCheck={() => toggleSelect(delivery.deliveryNo)}
                                    isDragging={
                                      (draggedDelivery as BulkDrag)?._bulk
                                        ? selectedDeliveries.has(delivery.deliveryNo)
                                        : (draggedDelivery as any)?.deliveryNo === delivery.deliveryNo
                                    }
                                    onDragStart={() => onDragStartDelivery(delivery, 'unassigned')}
                                    onDragEnd={onDragEnd}
                                  />
                                ))}
                              </div>
                            )}
                          </div>
                        )
                      })}
                    </div>
                  )}
                </div>
              ))
            )}
          </div>
        </Col>
      </Row>
    </div>
  )
}

export default DispatchHub

// ── Driver Card ───────────────────────────────────────────────────────────────
function DriverCard({
  driver, index, isDropTarget, dragOverTarget, setDragOverTarget,
  onDropOnShipment, onDropOnNewShipment, onDragStartDelivery,
  onDragEnd, selectedAssigned, toggleSelectAssigned,
}: DriverCardProps) {
  const totalDeliveries = driver.shipments.reduce((s, sh) => s + sh.deliveries.length, 0)
  const hasVehicle = !!driver.shipments[0]?.vehicleReg || !!driver.assignedVehicleReg
  const currentVehicle = driver.shipments[0]?.vehicleReg ?? driver.assignedVehicleReg ?? 'No vehicle assigned'
  const activeShipmentsCount = driver.shipments.length

  return (
    <div className="mb-2" style={{ border: '1px solid #d0dbe8', borderRadius: 4, background: '#fff' }}>
      <div className="d-flex align-items-stretch" style={{ borderBottom: '1px solid #eee' }}>

        {/* Index */}
        <div className="d-flex align-items-center justify-content-center"
          style={{ width: 30, background: '#f5f5f5', borderRight: '1px solid #eee', fontSize: 13, fontWeight: 700, color: '#555' }}>
          {index}
        </div>

        {/* Driver Avatar */}
        <div className="d-flex align-items-center justify-content-center px-3"
          style={{ borderRight: '1px solid #eee', flexShrink: 0 }}>
          {driver.photoUrl ? (
            <img src={driver.photoUrl} alt={driver.fullName}
              style={{ width: 56, height: 56, borderRadius: '50%', objectFit: 'cover', border: '2px solid #2c3e50' }} />
          ) : (
            <div style={{
              width: 56, height: 56, borderRadius: '50%',
              background: driver.fullName ? '#2c3e50' : '#ccc',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              color: '#fff', fontSize: 24, fontWeight: 700, border: '2px solid #2c3e50'
            }}>
              {driver.fullName ? driver.fullName.charAt(0).toUpperCase() : '?'}
            </div>
          )}
        </div>

        {/* Print Icon */}
        <div className="d-flex align-items-start justify-content-center pt-2 px-1"
          style={{ borderRight: '1px solid #eee' }}>
          <Button variant="link" size="sm" style={{ color: '#17a2b8', padding: 2 }}>
            <LuPrinter size={16} />
          </Button>
        </div>

        {/* Driver Info + Shipments */}
        <div className="flex-grow-1 p-2">
          <div style={{ fontWeight: 700, fontSize: 15, color: '#2c3e50' }}>
            {driver.fullName || 'Unassigned Driver'}
          </div>
          <div style={{ fontSize: 12, color: hasVehicle ? '#28a745' : '#dc3545', fontWeight: 600 }}>
            <TbTruck size={12} className="me-1" />
            {currentVehicle}
          </div>
          <div style={{ fontSize: 11, color: '#666', marginTop: 2 }}>
            Active Shipments: <strong>{activeShipmentsCount}</strong> |
            Total Deliveries: <strong>{totalDeliveries}</strong>
          </div>

          {driver.shipments.map((shipment, idx) => (
            <ShipmentBlock
              key={shipment.shipmentNo ?? `pending-${idx}`}
              shipment={shipment}
              index={idx}
              driverId={driver.driverId}
              isDropTarget={isDropTarget}
              dragOverTarget={dragOverTarget}
              setDragOverTarget={setDragOverTarget}
              onDropOnShipment={onDropOnShipment}
              onDragStartDelivery={onDragStartDelivery}
              onDragEnd={onDragEnd}
              selectedAssigned={selectedAssigned}
              toggleSelectAssigned={toggleSelectAssigned}
            />
          ))}

          {!driver.shipments.some(s => s.statusId === 1) && (
            <NewShipmentBlock
              driverId={driver.driverId}
              vehicleReg={driver.assignedVehicleReg ?? 'N/A'}
              vehicleId={driver.assignedVehicleId ?? null}
              isDropTarget={isDropTarget}
              dragOverTarget={dragOverTarget}
              setDragOverTarget={setDragOverTarget}
              onDropOnNewShipment={onDropOnNewShipment}
            />
          )}
        </div>

        {/* ── Vehicle Photo — Option A: Landscape banner ── */}
        <div style={{
          width: 140,
          minHeight: 80,
          borderLeft: '1px solid #eee',
          overflow: 'hidden',
          flexShrink: 0,
          position: 'relative',
          background: '#e8edf3'
        }}>
          {driver.vehiclePhotoUrl ? (
            <img
              src={driver.vehiclePhotoUrl}
              alt="Vehicle"
              style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }}
            />
          ) : (
            <div style={{
              width: '100%',
              height: '100%',
              minHeight: 80,
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              gap: 4,
            }}>
              <TbTruck size={36} color="#94a3b8" />
              <span style={{ fontSize: 10, color: '#94a3b8' }}>No photo</span>
            </div>
          )}
          {/* Reg plate overlay */}
          {(driver.shipments[0]?.vehicleReg || driver.assignedVehicleReg) && (
            <div style={{
              position: 'absolute',
              bottom: 0,
              left: 0,
              right: 0,
              background: 'rgba(0,0,0,0.50)',
              padding: '3px 6px',
              display: 'flex',
              alignItems: 'center',
              gap: 4
            }}>
              <TbTruck size={10} color="#fff" />
              <span style={{ fontSize: 10, color: '#fff', fontWeight: 600, letterSpacing: '0.5px' }}>
                {driver.shipments[0]?.vehicleReg ?? driver.assignedVehicleReg}
              </span>
            </div>
          )}
        </div>

      </div>
    </div>
  )
}

const SHIPMENT_COLORS = ['#0d6efd', '#28a745', '#6f42c1', '#fd7e14', '#20c997']

// ── Shipment Block ────────────────────────────────────────────────────────────
function ShipmentBlock({
  shipment, driverId, index, isDropTarget, dragOverTarget,
  setDragOverTarget, onDropOnShipment, onDragStartDelivery,
  onDragEnd, selectedAssigned, toggleSelectAssigned,
}: ShipmentBlockProps) {
  const targetKey = `shipment-${driverId}-${shipment.shipmentNo}`
  const isHovered = dragOverTarget === targetKey
  const borderColor = SHIPMENT_COLORS[index % SHIPMENT_COLORS.length]

  return (
    <div
      className="mt-1 rounded"
      style={{
        border: isHovered && isDropTarget ? `2px dashed ${borderColor}` : `1px solid ${borderColor}`,
        background: isHovered && isDropTarget ? '#f8f9ff' : '#fff',
        transition: 'border 0.15s, background 0.15s',
      }}
      onDragOver={(e) => { e.preventDefault(); setDragOverTarget(targetKey) }}
      onDragLeave={() => { if (dragOverTarget === targetKey) setDragOverTarget(null) }}
      onDrop={(e) => { e.preventDefault(); onDropOnShipment(driverId, shipment.shipmentNo, shipment.vehicleId ?? null) }}>

      <div className="d-flex align-items-center justify-content-between px-2 py-1 dispatch-shipment-bar"
        style={{ borderRadius: '4px 4px 0 0' }}>
        <span style={{ fontSize: 11, color: '#fff' }}>
          Shipment: {shipment.shipmentNo ?? <em style={{ opacity: 0.6 }}>Assigning...</em>}
        </span>
        <div className="d-flex align-items-center gap-1">
          <Button size="sm" style={{ fontSize: 10, padding: '1px 6px', background: '#3d5166', border: 'none' }}>
            Waybill Required?
          </Button>
          <Button size="sm" style={{ fontSize: 10, padding: '1px 6px', background: '#3d5166', border: 'none' }}>
            Customer Addresses
          </Button>
        </div>
      </div>

      {isHovered && isDropTarget && (
        <div className="text-center py-1" style={{ fontSize: 11, color: borderColor, fontWeight: 600 }}>
          Drop to add to this shipment
        </div>
      )}

      {shipment.deliveries.map((delivery) => (
        <AssignedDeliveryCard
          key={delivery.deliveryNo}
          delivery={{ ...delivery, _driverId: driverId, _shipmentNo: shipment.shipmentNo }}
          isChecked={selectedAssigned.has(delivery.deliveryNo)}
          onToggleCheck={() => toggleSelectAssigned(delivery.deliveryNo)}
          onDragStart={() => onDragStartDelivery({ ...delivery, _driverId: driverId, _shipmentNo: shipment.shipmentNo }, 'driver')}
          onDragEnd={onDragEnd}
        />
      ))}
    </div>
  )
}

// ── New Shipment Block ────────────────────────────────────────────────────────
function NewShipmentBlock({ driverId, vehicleReg, vehicleId, isDropTarget, dragOverTarget, setDragOverTarget, onDropOnNewShipment }: NewShipmentBlockProps) {
  const targetKey = `new-shipment-${driverId}`
  const isHovered = dragOverTarget === targetKey

  return (
    <div
      className="mt-1 text-center py-2 rounded"
      style={{
        border: `2px dashed #28a745`, color: '#28a745',
        background: isHovered && isDropTarget ? '#f0fff4' : 'transparent',
        fontSize: 12, fontWeight: 500,
        cursor: isDropTarget ? 'copy' : 'pointer',
        opacity: isDropTarget ? 1 : 0.8,
        transition: 'background 0.15s, opacity 0.15s',
      }}
      onDragOver={(e) => { e.preventDefault(); setDragOverTarget(targetKey) }}
      onDragLeave={() => { if (dragOverTarget === targetKey) setDragOverTarget(null) }}
      onDrop={(e) => { e.preventDefault(); onDropOnNewShipment(driverId, vehicleReg, vehicleId) }}
      onClick={() => onDropOnNewShipment(driverId, vehicleReg, vehicleId)}>
      {isHovered && isDropTarget ? 'Release to create new shipment' : '+ New Shipment'}
    </div>
  )
}

// ── Assigned Delivery Card ────────────────────────────────────────────────────
function AssignedDeliveryCard({ delivery, isChecked, onToggleCheck, onDragStart, onDragEnd }: AssignedDeliveryCardProps) {
  return (
    <div
      draggable
      onDragStart={(e) => { e.dataTransfer.effectAllowed = 'move'; onDragStart() }}
      onDragEnd={onDragEnd}
      style={{
        border: isChecked ? '1px solid #0d6efd' : '1px solid #ddd',
        background: isChecked ? '#f0f5ff' : '#fff',
        cursor: 'grab', fontSize: 11, userSelect: 'none',
        borderRadius: 3, margin: '2px 0',
      }}>
      <div className="d-flex align-items-stretch">
        <div className="d-flex align-items-center px-2"
          style={{ borderRight: '1px solid #eee', cursor: 'pointer' }}
          onClick={(e) => { e.stopPropagation(); onToggleCheck() }}>
          <Form.Check type="checkbox" checked={isChecked} onChange={onToggleCheck}
            onClick={(e) => e.stopPropagation()} style={{ cursor: 'pointer' }} />
        </div>
        <div className="p-2 flex-grow-1">
          <Row className="g-0">
            <Col xs={6}>
              <div><span className="text-muted">CUSTOMER NAME: </span>
                <span style={{ color: '#e74c3c', fontWeight: 600 }}>{delivery.customerName}</span></div>
              <div><span className="text-muted">ADDRESS: </span>{delivery.customerAddress}</div>
              <div><span className="text-muted">DELIVERY NR: </span><strong>{delivery.deliveryNo}</strong></div>
            </Col>
            <Col xs={6}>
              <div><span className="text-muted">QUARRY: </span>
                <span style={{ fontWeight: 600 }}>{delivery.factoryName || '—'}</span></div>
              <div><span className="text-muted">QTY: </span>{(delivery as any).itemCount ?? delivery.itemQuantity ?? '—'}</div>
              <div><span className="text-muted">PRODUCT: </span>{delivery.deliveryType || '—'}</div>
            </Col>
          </Row>
        </div>
        <div className="d-flex flex-column align-items-center justify-content-center gap-1 px-2"
          style={{ borderLeft: '1px solid #eee' }}>
          <Button variant="primary" size="sm" title="Print" style={{ width: 28, height: 28, padding: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', borderRadius: 4 }}>
            <LuPrinter size={13} />
          </Button>
          <Button variant="secondary" size="sm" title="Settings" style={{ width: 28, height: 28, padding: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', borderRadius: 4 }}>
            <LuSettings size={13} />
          </Button>
          <Button variant="danger" size="sm" title="Remove" style={{ width: 28, height: 28, padding: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', borderRadius: 4 }}>
            <LuTrash2 size={13} />
          </Button>
        </div>
      </div>
    </div>
  )
}

// ── Unassigned Delivery Card ──────────────────────────────────────────────────
function DeliveryCard({ delivery, isChecked, onToggleCheck, isDragging, onDragStart, onDragEnd }: DeliveryCardProps) {
  return (
    <div
      draggable
      onDragStart={(e) => { e.dataTransfer.effectAllowed = 'move'; onDragStart() }}
      onDragEnd={onDragEnd}
      className="ms-3 mt-1 mb-1 rounded"
      style={{
        border: isChecked ? '1px solid #0d6efd' : '1px solid #e5e7eb',
        background: isChecked ? '#f0f5ff' : isDragging ? '#fff5f5' : '#fff',
        cursor: 'grab', opacity: isDragging ? 0.45 : 1,
        userSelect: 'none', display: 'flex', alignItems: 'stretch',
        transition: 'opacity 0.15s, border 0.1s, background 0.1s',
      }}>
      <div className="d-flex align-items-center justify-content-center px-2"
        style={{ borderRight: '1px solid #eee', cursor: 'pointer', flexShrink: 0 }}
        onClick={(e) => { e.stopPropagation(); onToggleCheck() }}>
        <Form.Check type="checkbox" checked={isChecked} onChange={onToggleCheck}
          onClick={(e) => e.stopPropagation()} style={{ cursor: 'pointer' }} />
      </div>
      <div className="p-2 flex-grow-1">
        <Row className="g-0">
          <Col xs={6}>
            <div><span className="text-muted">CUSTOMER NAME: </span>
              <span style={{ color: '#e74c3c', fontWeight: 600 }}>{delivery.customerName}</span></div>
            <div><span className="text-muted">ADDRESS: </span>{delivery.customerAddress}</div>
            <div><span className="text-muted">DELIVERY NR: </span><strong>{delivery.deliveryNo}</strong></div>
            <div>
              <span className="text-muted">STATUS: </span>
              <span style={{ color: delivery.status === 'Pending' ? '#856404' : '#28a745', fontWeight: 600 }}>
                {delivery.status}
              </span>
            </div>
          </Col>
          <Col xs={6}>
            <div><span className="text-muted">QTY: </span>{delivery.itemCount || '—'}</div>
            <div><span className="text-muted">PRODUCT: </span>{delivery.deliveryType || '—'}</div>
            <div><span className="text-muted">PO/SVO: </span>{delivery.poSvoNo || '—'}</div>
            <div><span className="text-muted">SALES ORDER: </span>{delivery.salesOrderNo || '—'}</div>
          </Col>
        </Row>
      </div>
    </div>
  )
}