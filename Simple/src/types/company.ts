// ── Register Company ──────────────────────────────────────────
export interface RegisterCompanyRequest {
  companyName:       string
  companyType:       string

  // Admin user
  adminFirstName:    string
  adminLastName:     string
  adminUsername:     string
  adminEmail:        string
  adminPassword:     string
  adminPhoneNumber?: string
}

export interface RegisterCompanyResponse {
  id:             number
  companyName:    string
  companyType:    string | null
  tenantId:       string | null   // null until Xero is connected
  defaultPlantId: string
  adminUserId:    number
  adminEmail:     string
  xeroConnected:  boolean
  createdAt:      string
  updatedAt:      string
  message:        string
}

// ── Connect Xero ──────────────────────────────────────────────
export interface ConnectXeroRequest {
  tenantId: string
}