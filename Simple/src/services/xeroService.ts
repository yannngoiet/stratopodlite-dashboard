import axios from 'axios'

const xeroApi = axios.create({
  baseURL: process.env.NEXT_PUBLIC_XERO_API_URL,
  headers: { 'Content-Type': 'application/json' },
  withCredentials: true,
})

const xeroService = {

  // ── Get OAuth URL ─────────────────────────────────────────────
  // Passes companyId so backend embeds it in state
  getAuthorizeUrl: async (companyId: number): Promise<string> => {
    const res = await xeroApi.get<{ authorizationUrl: string }>(
      `/api/xero-auth/authorize?companyId=${companyId}`
    )
    return res.data.authorizationUrl
  },

  // ── Get Xero connection status for a company ──────────────────
  getStatus: async (companyId: number): Promise<boolean> => {
    const res = await xeroApi.get<{ xeroConnected: boolean }>(
      `/api/xero-auth/status/${companyId}`
    )
    return res.data.xeroConnected
  },

  // ── Disconnect Xero ───────────────────────────────────────────
  disconnect: async (companyId: number): Promise<void> => {
    await xeroApi.delete(`/api/xero-auth/disconnect/${companyId}`)
  },
}

export default xeroService