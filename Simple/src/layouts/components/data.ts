import { TbBellRinging, TbHeadset, TbLock, TbLogout2, TbSettings2, TbUserCircle } from 'react-icons/tb';
import {
  LuCircleGauge,
  LuTruck,
  LuFileText,
  LuMonitor,
  LuChartColumnBig,
  LuFileSpreadsheet,
  LuUsers,
  LuCar,
  LuBuilding2,
  LuFuel,
  LuSettings,
  LuCarFront,
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
  { label: 'Log Out', icon: TbLogout2, url: '#', class: 'text-danger fw-semibold', isLogout: true }
];

export const menuItems: MenuItemType[] = [

  // ── Dashboard ─────────────────────────────────────────────
  {
    key: 'dashboard',
    label: 'Dashboard',
    icon: LuCircleGauge,
    url: '/dashboard'
  },

  // ── Operations ────────────────────────────────────────────
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
    key: 'trip-sheets',
    label: 'Trip Sheets',
    icon: LuFileSpreadsheet,
    url: '/trip-sheets',
    badge: { text: '0', variant: 'warning' }
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
    key: 'customers-suppliers',
    label: 'Customers and Suppliers',
    icon: LuBuilding2,
    url: '/customers-suppliers'
  },
  {
    key: 'drivers',
    label: 'Drivers',
    icon: LuCar,
    url: '/drivers'
  },
  {
    key: 'fuel-management',
    label: 'Fuel Management',
    icon: LuFuel,
    url: '/fuel-management'
  },
  {
    key: 'users',
    label: 'Users',
    icon: LuUsers,
    url: '/users',
    badge: { text: 'new', variant: 'success' }
  },
  {
    key: 'vehicles',
    label: 'Vehicles',
    icon: LuCarFront,
    url: '/vehicles/list'
  },

  // ── Configuration ─────────────────────────────────────────
  {
    key: 'configuration',
    label: 'Configuration',
    icon: LuSettings,
    children: [
      {
        key: 'config-delivery-types',
        label: 'Delivery Types',
        url: '/configuration/delivery-types'
      },
      {
        key: 'config-discrepancy-reasons',
        label: 'Discrepancy Reason Codes',
        url: '/configuration/discrepancy-reasons'
      },
      {
        key: 'config-inspection-types',
        label: 'Inspection Types',
        url: '/configuration/inspection-types'
      },
      {
        key: 'config-photo-types',
        label: 'Photo Types',
        url: '/configuration/photo-types'
      },
      {
        key: 'config-plants',
        label: 'Plants / Quarries',
        url: '/configuration/plants'
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
      },
      {
        key: 'config-status-codes',
        label: 'Status Codes',
        url: '/configuration/status-codes'
      },
      {
        key: 'config-templates',
        label: 'Templates',
        url: '/configuration/templates'
      }
    ]
  }
];