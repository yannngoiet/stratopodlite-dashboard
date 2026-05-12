import { TbBellRinging, TbHeadset, TbLock, TbLogout2, TbSettings2, TbUserCircle } from 'react-icons/tb';
import {
  LuCircleGauge,
  LuTruck,
  LuFileText,
  LuSmartphone,
  LuClipboardCheck,
  LuMonitor,
  LuChartColumnBig,
  LuFileSpreadsheet,
  LuUsers,
  LuCar,
  LuBuilding2,
  LuFuel,
  LuMail,
  LuSettings,
  LuCarFront,
  LuReceipt,
  LuShieldCheck,
} from 'react-icons/lu';
import { IconType } from 'react-icons';

export interface MenuItemType {
  key: string
  label: string
  icon?: IconType
  url?: string
  isTitle?: boolean
  isDisabled?: boolean
  badge?: {
    text: string
    variant: string
  }
  children?: MenuItemType[]
}

export const userDropdownItems = [
  { label: 'Welcome back!', isHeader: true },
  { label: 'Profile', icon: TbUserCircle, url: '/pages/profile' },
  { label: 'Notifications', icon: TbBellRinging, url: '#' },
  { label: 'Account Settings', icon: TbSettings2, url: '#' },
  { label: 'Support Center', icon: TbHeadset, url: '#' },
  { isDivider: true },
  { label: 'Lock Screen', icon: TbLock, url: '/auth/lock-screen' },
  { label: 'Log Out', icon: TbLogout2, url: '#', class: 'text-danger fw-semibold' }
];

export const menuItems: MenuItemType[] = [
  // ── Operational ──────────────────────────────────────────
  {
    key: 'dashboard',
    label: 'Dashboard',
    icon: LuCircleGauge,
    url: '/dashboard'
  },
  {
    key: 'vehicle-dispatch',
    label: 'Vehicle Dispatch',
    icon: LuTruck,
    url: '/dispatch-hub'
  },
  {
    key: 'delivery-notes',
    label: 'Delivery Notes',
    icon: LuFileText,
    url: '/delivery-notes',
    badge: { text: '0', variant: 'primary' }
  },
  {
    key: 'epod-lifecycle',
    label: 'E-POD Life Cycle',
    icon: LuSmartphone,
    url: '/epod-lifecycle',
    badge: { text: '0', variant: 'warning' }
  },
  {
    key: 'endorsements',
    label: 'Endorsements',
    icon: LuClipboardCheck,
    children: [
      { key: 'endorsements-at-quarry', label: 'At Quarry', url: '/endorsements/quarry' },
      { key: 'endorsements-at-customer', label: 'At Customer', url: '/endorsements/customer' }
    ]
  },
  {
    key: 'trip-sheets',
    label: 'Trip Sheets',
    icon: LuFileSpreadsheet,
    url: '/trip-sheets',
    badge: { text: '0', variant: 'warning' }
  },
  {
    key: 'inspections',
    label: 'Inspections',
    icon: LuShieldCheck,
    children: [
      { key: 'inspection-results', label: 'Inspection Results', url: '/inspections/results' },
      { key: 'inspection-history', label: 'Inspection History', url: '/inspections/history' }
    ]
  },
  {
    key: 'invoices',
    label: 'Invoices',
    icon: LuReceipt,
    children: [
      { key: 'invoice-list', label: 'Invoice List', url: '/invoices/list' },
      { key: 'invoice-templates', label: 'Templates', url: '/invoices/templates' }
    ]
  },
  {
    key: 'devices',
    label: 'Devices',
    icon: LuMonitor,
    url: '/devices'
  },
  {
    key: 'reports',
    label: 'Reports',
    icon: LuChartColumnBig,
    url: '/reports'
  },

  // ── People & Assets ───────────────────────────────────────
  {
    key: 'users',
    label: 'Users',
    icon: LuUsers,
    url: '/users',
    badge: { text: 'new', variant: 'success' }
  },
  {
    key: 'drivers',
    label: 'Drivers',
    icon: LuCar,
    children: [
      { key: 'driver-list', label: 'Driver List', url: '/drivers/list' },
      { key: 'driver-status', label: 'Driver Status', url: '/drivers/status' }
    ]
  },
  {
    key: 'vehicles',
    label: 'Vehicles',
    icon: LuCarFront,
    children: [
      { key: 'vehicle-list', label: 'Vehicle List', url: '/vehicles/list' },
      { key: 'vehicle-status', label: 'Vehicle Status', url: '/vehicles/status' }
    ]
  },
  {
    key: 'customers-suppliers',
    label: 'Customers and Suppliers',
    icon: LuBuilding2,
    url: '/customers-suppliers'
  },
  {
    key: 'fuel-management',
    label: 'Fuel Management',
    icon: LuFuel,
    url: '/fuel-management'
  },
  {
    key: 'mailing-list',
    label: 'Mailing List',
    icon: LuMail,
    url: '/mailing-list'
  },

  // ── Configuration ─────────────────────────────────────────
  {
    key: 'configuration',
    label: 'Configuration',
    icon: LuSettings,
    children: [
      {
        key: 'config-plants',
        label: 'Plants / Quarries',
        url: '/configuration/plants'
      },
      {
        key: 'config-delivery-types',
        label: 'Delivery Types',
        url: '/configuration/delivery-types'
      },
      {
        key: 'config-status-codes',
        label: 'Status Codes',
        url: '/configuration/status-codes'
      },
      {
        key: 'config-discrepancy-reasons',
        label: 'Discrepancy Reason Codes',
        url: '/configuration/discrepancy-reasons'
      },
      {
        key: 'config-photo-types',
        label: 'Photo Types',
        url: '/configuration/photo-types'
      },
      {
        key: 'config-inspection-types',
        label: 'Inspection Types',
        url: '/configuration/inspection-types'
      },
      {
        key: 'config-pre-inspections',
        label: 'Pre Inspections',
        url: '/configuration/pre-inspections'
      },
      {
        key: 'config-roles',
        label: 'Roles',
        url: '/configuration/roles'
      }
    ]
  }
];