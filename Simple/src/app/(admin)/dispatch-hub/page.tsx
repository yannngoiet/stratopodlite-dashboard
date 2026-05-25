'use client'

import { useEffect, useState } from 'react'
import DispatchHub from './components/DispatchHub'

const Page = () => {
  const [companyName, setCompanyName] = useState('')

  useEffect(() => {
    const user = localStorage.getItem('user')
    if (user) {
      const parsed = JSON.parse(user)
      if (parsed.companyName) setCompanyName(parsed.companyName)
    }
  }, [])

  return (
    <>
      <div className="mb-3">
        <h4 className="fw-bold mb-1">
          Dispatch Hub{companyName && <span className="fw-bold ms-2">- {companyName}</span>}
        </h4>
        <p className="text-muted mb-0" style={{ fontSize: 13 }}>
          Assign deliveries to drivers using drag and drop
        </p>
      </div>
      <DispatchHub />
    </>
  )
}

export default Page
