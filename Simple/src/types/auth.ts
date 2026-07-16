export interface UserDto {
  id: number
  companyId: number
  companyName: string
  companyType: string
  username: string
  email: string
  firstName: string
  lastName: string
  phoneNumber: string
  role: string
  plantId: string | null
  lastLoginAt: string | null
  mustChangePassword: boolean
}

export interface LoginResponse {
  success: boolean
  message: string
  accessToken: string
  expiresAt: string
  mustChangePassword: boolean
  user: UserDto
}