import DispatchHub from './components/DispatchHub'

export const metadata = {
  title: 'Dispatch Hub',
}

const Page = () => {
  return (
    <>
      <div className="mb-3">
        <h4 className="fw-bold mb-1">Dispatch Hub</h4>
        <p className="text-muted mb-0" style={{ fontSize: 13 }}>
          Assign deliveries to drivers using drag and drop
        </p>
      </div>
      <DispatchHub />
    </>
  )
}

export default Page
