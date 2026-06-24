'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { LuCreditCard, LuLock, LuCheck, LuArrowLeft, LuShieldCheck } from 'react-icons/lu'
import authService from '@/services/authService'
import { notify } from '@/lib/toast'

interface PurchaseData {
  form: {
    companyName: string
    companyPhone: string
    firstName: string
    lastName: string
    email: string
    password: string
  }
  selectedPlan: string
  driverCount: number
  planName: string
  planPrice: number
  totalMonthly: number
}

const formatCardNumber = (val: string) =>
  val.replace(/\D/g, '').slice(0, 16).replace(/(.{4})/g, '$1 ').trim()

const formatExpiry = (val: string) => {
  const digits = val.replace(/\D/g, '').slice(0, 4)
  if (digits.length >= 3) return `${digits.slice(0, 2)}/${digits.slice(2)}`
  return digits
}

const PLAN_FEATURES = [
  'Proof of delivery',
  'Digital signatures',
  'Driver app',
  'Dashboard access',
  'Email support',
]

export default function PaymentPage() {
  const router = useRouter()
  const [purchaseData, setPurchaseData] = useState<PurchaseData | null>(null)
  const [submitting, setSubmitting] = useState(false)
  const [card, setCard] = useState({ holderName: '', number: '', expiry: '', cvv: '' })
  const [errors, setErrors] = useState<Record<string, string>>({})

  useEffect(() => {
    const stored = sessionStorage.getItem('purchase_data')
    if (!stored) { router.push('/auth/register-company'); return }
    setPurchaseData(JSON.parse(stored))
  }, [])

  const setField = (key: string, val: string) => {
    setCard(c => ({ ...c, [key]: val }))
    setErrors(e => ({ ...e, [key]: '' }))
  }

  const validate = () => {
    const errs: Record<string, string> = {}
    if (!card.holderName.trim())                     errs.holderName = 'Cardholder name is required'
    if (card.number.replace(/\s/g, '').length < 16)  errs.number     = 'Enter a valid 16-digit card number'
    if (card.expiry.length < 5)                      errs.expiry     = 'Enter a valid expiry date'
    if (card.cvv.length < 3)                         errs.cvv        = 'Enter a valid CVV'
    setErrors(errs)
    return Object.keys(errs).length === 0
  }

  const handlePay = async () => {
    if (!validate() || !purchaseData) return
    setSubmitting(true)
    try {
      await authService.registerCompany({
        companyName:          purchaseData.form.companyName,
        companyType:          'ORGANISATION',
        adminPhoneNumber:     purchaseData.form.companyPhone || undefined,
        adminFirstName:       purchaseData.form.firstName,
        adminLastName:        purchaseData.form.lastName,
        adminUsername:        purchaseData.form.email,
        adminEmail:           purchaseData.form.email,
        adminPassword:        purchaseData.form.password,
        planId:               purchaseData.selectedPlan,
        estimatedDriverCount: purchaseData.driverCount,
        requestDemo:          false,
        cardHolderName:       card.holderName,
        cardNumber:           card.number.replace(/\s/g, ''),
        cardExpiry:           card.expiry,
        cardCvv:              card.cvv,
      })
      await authService.login(purchaseData.form.email, purchaseData.form.password)
      sessionStorage.removeItem('purchase_data')
      notify.success('Payment successful!', `Your ${purchaseData.planName} plan is now active. Welcome to StratoPOD!`)
      setTimeout(() => router.push('/dashboard'), 1500)
    } catch (err: any) {
      const message = err?.response?.data?.message ?? err?.message ?? 'Payment failed. Please try again.'
      notify.error('Payment failed', message)
    } finally {
      setSubmitting(false)
    }
  }

  if (!purchaseData) return null

  const { planName, planPrice, driverCount, totalMonthly } = purchaseData

  return (
    <div className="pay-page">

      {/* Logo */}
      <div className="pay-header">
        <div className="pay-logo">
          STRATO<span className="pay-logo-accent">POD</span>
        </div>
        <p className="pay-subtitle">
          <LuShieldCheck size={12} /> Secure Checkout
        </p>
      </div>

      <div className="pay-grid">

        {/* Left — Order Summary */}
        <div className="pay-card" style={{ height: 'fit-content' }}>
          <h3 className="pay-card-title">Order Summary</h3>

          <div className="pay-plan-badge">
            <div className="pay-plan-name">{planName} Plan</div>
            <div className="pay-plan-sub">Billed monthly · per driver</div>
          </div>

          <div className="pay-summary-rows">
            <div className="pay-summary-row">
              <span>Price per driver</span>
              <span>R{planPrice}/mo</span>
            </div>
            <div className="pay-summary-row">
              <span>Number of drivers</span>
              <span>{driverCount}</span>
            </div>
            <div className="pay-summary-total">
              <span>Total / month</span>
              <span className="pay-total-amount">R{totalMonthly.toLocaleString('en-ZA')}</span>
            </div>
          </div>

          <div className="pay-features">
            {PLAN_FEATURES.map(feature => (
              <div key={feature} className="pay-feature-item">
                <LuCheck size={13} style={{ color: '#22c55e', flexShrink: 0 }} />
                {feature}
              </div>
            ))}
          </div>

          <div className="pay-security-note">
            <LuShieldCheck size={13} style={{ color: '#22c55e', flexShrink: 0 }} />
            <span>256-bit SSL encrypted &amp; secure</span>
          </div>
        </div>

        {/* Right — Card Form */}
        <div className="pay-card">
          <div className="pay-card-header">
            <LuCreditCard size={20} style={{ color: '#3b6fd4' }} />
            <h3 className="pay-card-header-title">Card Details</h3>
          </div>

          {/* Cardholder Name */}
          <div className="pay-field">
            <label className="field-label">
              Cardholder Name <span style={{ color: '#ef4444' }}>*</span>
            </label>
            <input
              className={`pay-input${errors.holderName ? ' has-error' : ''}`}
              placeholder="John Smith"
              value={card.holderName}
              onChange={e => setField('holderName', e.target.value)}
            />
            {errors.holderName && <p className="field-error">{errors.holderName}</p>}
          </div>

          {/* Card Number */}
          <div className="pay-field">
            <label className="field-label">
              Card Number <span style={{ color: '#ef4444' }}>*</span>
            </label>
            <div className="pay-input-wrap">
              <input
                className={`pay-input${errors.number ? ' has-error' : ''}`}
                placeholder="1234 5678 9012 3456"
                value={card.number}
                onChange={e => setField('number', formatCardNumber(e.target.value))}
                style={{ letterSpacing: '0.08em' }}
              />
              <LuCreditCard size={16} className="pay-input-icon" />
            </div>
            {errors.number && <p className="field-error">{errors.number}</p>}
          </div>

          {/* Expiry + CVV */}
          <div className="pay-input-grid">
            <div>
              <label className="field-label">
                Expiry Date <span style={{ color: '#ef4444' }}>*</span>
              </label>
              <input
                className={`pay-input${errors.expiry ? ' has-error' : ''}`}
                placeholder="MM/YY"
                value={card.expiry}
                onChange={e => setField('expiry', formatExpiry(e.target.value))}
              />
              {errors.expiry && <p className="field-error">{errors.expiry}</p>}
            </div>
            <div>
              <label className="field-label">
                CVV <span style={{ color: '#ef4444' }}>*</span>
              </label>
              <input
                className={`pay-input${errors.cvv ? ' has-error' : ''}`}
                placeholder="123"
                value={card.cvv}
                maxLength={4}
                onChange={e => setField('cvv', e.target.value.replace(/\D/g, '').slice(0, 4))}
              />
              {errors.cvv && <p className="field-error">{errors.cvv}</p>}
            </div>
          </div>

          {/* SSL note */}
          <div className="pay-ssl-note">
            <LuLock size={12} className="dash-text-teal" />
            Your card details are encrypted and securely transmitted.
          </div>

          {/* Actions */}
          <div className="pay-actions">
            <button className="pay-btn-back" onClick={() => router.push('/auth/register-company')}>
              <LuArrowLeft size={14} /> Back
            </button>
            <button className="pay-btn-pay" onClick={handlePay} disabled={submitting}>
              <LuLock size={14} />
              {submitting ? 'Processing...' : `Pay R${totalMonthly.toLocaleString('en-ZA')}/mo`}
            </button>
          </div>
        </div>

      </div>

      <p className="pay-footer-copy">
        © {new Date().getFullYear()} StratoPOD. All rights reserved.
      </p>
    </div>
  )
}
