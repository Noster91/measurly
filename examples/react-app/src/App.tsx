import { OpenMeasureProvider, useTrack, useIdentify, presets } from '@open-measure/react'
import { ga4 } from '@open-measure/dest-ga4'
import { meta } from '@open-measure/dest-meta'

const destinations = [
  ga4({ measurementId: 'G-XXXXXXXXXX' }),
  meta({ pixelId: '123456789' }),
]

export function App() {
  return (
    <OpenMeasureProvider
      destinations={destinations}
      preset={presets.saas}
      autoTrack={{ pageViews: true }}
      consent={{ analytics: true, marketing: true }}
    >
      <Dashboard />
    </OpenMeasureProvider>
  )
}

function Dashboard() {
  const track = useTrack()
  const identify = useIdentify()

  const handleSignUp = () => {
    identify('user-new', { method: 'email' })
    track('sign_up', { method: 'email' })
  }

  const handleFeatureUse = (feature: string) => {
    track('feature_used', { feature_name: feature })
  }

  return (
    <div>
      <h1>SaaS Dashboard</h1>
      <button onClick={handleSignUp}>Sign Up</button>
      <button onClick={() => handleFeatureUse('export')}>Export Data</button>
      <button onClick={() => handleFeatureUse('report')}>Generate Report</button>
    </div>
  )
}
