import axios from 'axios'

const paymentsClient = axios.create({
  baseURL: process.env.NEXT_PUBLIC_PAYMENTS_API_URL,
})

export interface CreateSubscriptionPaymentRequest {
  companyId: number
  planId: number
  amount: number
  itemName: string
  emailAddress: string
}

const paymentsService = {
  createOnsiteUuid: async (
    data: CreateSubscriptionPaymentRequest
  ): Promise<{ uuid: string }> => {
    const res = await paymentsClient.post<{ uuid: string }>(
      '/api/payments/subscriptions/onsite',
      data
    )
    return res.data
  },
}

export default paymentsService
