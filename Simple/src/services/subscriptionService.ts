import httpClient from './api'

export interface SubscriptionStatus {
  status:            'trial' | 'active' | 'grace' | 'suspended' | 'cancelled' | 'trial_expired'
  planName:          string
  planCode:          string
  trialEndsAt:       string | null
  nextBillingDate:   string | null
  gracePeriodEndsAt: string | null
  daysLeft:          number | null
  isActive:          boolean
}

const subscriptionService = {
  getStatus: async (): Promise<SubscriptionStatus> => {
    const res = await httpClient.get<SubscriptionStatus>('/api/subscription/status')
    return res.data
  },
}

export default subscriptionService