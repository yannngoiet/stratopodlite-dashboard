'use client';
import { LuTruck, LuLock, LuArrowRight } from 'react-icons/lu';
import { useRouter } from 'next/navigation';

export default function SuspendedPage() {
  const router = useRouter();

  const handleSignOut = () => {
    localStorage.clear();
    document.cookie = 'accessToken=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT';
    router.push('/auth/sign-in');
  };

  return (
    <div className="auth-page">
      {/* Logo */}
      <div style={{ textAlign: 'center', marginBottom: '1.75rem' }}>
        <div className="auth-logo-circle">
          <LuTruck size={34} color="#fff" />
        </div>
        <p className="auth-logo-text">
          STRATO<span className="auth-logo-accent">POD</span>
        </p>
        <p className="auth-logo-sub">Electronic Proof of Delivery</p>
      </div>

      <div className="auth-card">
        {/* Alert */}
        <div style={{ background: '#FCEBEB', border: '1.5px solid #F5AAAA', padding: '0.875rem 1rem', marginBottom: '1.25rem', display: 'flex', alignItems: 'flex-start', gap: 10 }}>
          <LuLock size={18} color="#A32D2D" style={{ flexShrink: 0, marginTop: 2 }} />
          <div>
            <p style={{ margin: '0 0 3px', fontWeight: 700, color: '#A32D2D', fontSize: '0.875rem' }}>Account suspended</p>
            <p style={{ margin: 0, fontSize: '0.82rem', color: '#A32D2D', lineHeight: 1.5 }}>
              Your account has been suspended due to a failed payment. All your data is safe.
            </p>
          </div>
        </div>

        {/* Content */}
        <div className="auth-card-heading">
          <h2 className="auth-card-title">Reactivate your account</h2>
          <p className="auth-card-sub">Update your payment details on PayFast to reactivate immediately.</p>
        </div>

        <div style={{ background: '#f8f9fc', border: '1px solid #dde3f0', padding: '0.75rem 1rem', marginBottom: '1.25rem', fontSize: '0.78rem', color: '#6b7a99', lineHeight: 1.8 }}>
          ✓ Your data is safe — nothing has been deleted<br />
          ✓ Reactivation is instant once payment is processed<br />
          ✓ All drivers and dispatchers restored immediately
        </div>

        <button onClick={() => window.open('https://www.payfast.co.za', '_blank')} style={{ width: '100%', justifyContent: 'center', marginBottom: 8 }}>
          Reactivate on PayFast <LuArrowRight size={14} />
        </button>

        <button onClick={handleSignOut} className="btn-ghost" style={{ width: '100%', justifyContent: 'center', fontSize: '0.8rem', color: '#6b7a99', padding: '0.5rem' }}>
          Sign in with a different account
        </button>

        <p style={{ textAlign: 'center', fontSize: '0.75rem', color: '#6b7a99', marginTop: '1rem', marginBottom: 0 }}>
          Need help? <a href="mailto:support@stratopod.co.za" style={{ color: '#3b6fd4' }}>support@stratopod.co.za</a>
        </p>
      </div>

      <p className="auth-footer">&copy; {new Date().getFullYear()} StratoPOD. All rights reserved.</p>
    </div>
  );
}