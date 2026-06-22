// ── Register Company ──────────────────────────────────────────
export interface RegisterCompanyRequest {
  // Company
  companyName:          string
  companyType?:         string
  adminPhoneNumber?:    string

  // Admin user
  adminFirstName:       string
  adminLastName:        string
  adminUsername:        string
  adminEmail:           string
  adminPassword:        string

  // Plan
  planId:               string
  estimatedDriverCount: number
  requestDemo:          boolean
}

export interface RegisterCompanyResponse {
  id:             number
  companyName:    string
  companyType:    string | null
  tenantId:       string | null
  defaultPlantId: string
  adminUserId:    number
  adminEmail:     string
  xeroConnected:  boolean
  createdAt:      string
  updatedAt:      string
  message?:       string
  success?:       boolean
}

// ── Connect Xero ──────────────────────────────────────────────
export interface ConnectXeroRequest {
  tenantId: string
}