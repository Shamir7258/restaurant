import { Link } from 'react-router-dom'
import { Button } from '../components/ui'

export function NotFound() {
  return (
    <div className="container" style={{ paddingBlock: '8rem', textAlign: 'center' }}>
      <p className="eyebrow">404</p>
      <h1 style={{ marginTop: '1rem' }}>This table isn't set.</h1>
      <p style={{ color: 'var(--color-text-muted)', marginTop: '1rem' }}>The page you're looking for doesn't exist.</p>
      <div style={{ marginTop: '2rem' }}>
        <Button as={Link} to="/">
          Back to Home
        </Button>
      </div>
    </div>
  )
}
