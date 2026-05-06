export interface UserDto {
  id: number
  companyId: number
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
  refreshToken: string
  expiresAt: string
  mustChangePassword: boolean
  user: UserDto
}