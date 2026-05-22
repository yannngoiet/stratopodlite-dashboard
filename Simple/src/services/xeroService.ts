import axios from 'axios'

const xeroApi = axios.create({
  baseURL: process.env.NEXT_PUBLIC_XERO_API_URL,
  headers: { 'Content-Type': 'application/json' },
  withCredentials: true,
})

const xeroService = {
  getAuthorizeUrl: async (): Promise<string> => {
    const res = await xeroApi.get<{ authorizationUrl: string }>('/api/xero-auth/authorize')
    return res.data.authorizationUrl
  },

  getStatus: async (): Promise<boolean> => {
    const res = await xeroApi.get<{ authenticated: boolean }>('/api/xero-auth/status')
    return res.data.authenticated
  },
}

export default xeroService
