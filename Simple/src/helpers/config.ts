export const getCompanyId = (): number => {
  // Use env variable if set, otherwise fall back to localStorage
  if (process.env.NEXT_PUBLIC_COMPANY_ID) {
    return parseInt(process.env.NEXT_PUBLIC_COMPANY_ID)
  }
  if (typeof window === 'undefined') return 0
  const user = localStorage.getItem('user')
  return user ? JSON.parse(user).companyId ?? 0 : 0
}

export const getToken = (): string => {
  if (typeof window === 'undefined') return ''
  return localStorage.getItem('accessToken') ?? ''
}