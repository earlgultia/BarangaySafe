import { useState } from 'react'
import { Loader, CheckCircle, AlertCircle } from 'lucide-react'
import { syncBoholEvacuationCenters } from '../lib/fetchBoholEvacuationCenters'

export default function SyncEvacuationCentersPage() {
  const [loading, setLoading] = useState(false)
  const [result, setResult] = useState<{
    success: boolean
    fetched: number
    inserted: number
    errors: string[]
  } | null>(null)

  async function handleSync() {
    setLoading(true)
    setResult(null)

    try {
      const syncResult = await syncBoholEvacuationCenters()
      setResult(syncResult)
    } catch (error) {
      setResult({
        success: false,
        fetched: 0,
        inserted: 0,
        errors: [error instanceof Error ? error.message : 'Unknown error'],
      })
    } finally {
      setLoading(false)
    }
  }

  return (
    <div style={{ maxWidth: '600px', margin: '40px auto', padding: '20px' }}>
      <h1>Sync Evacuation Centers</h1>
      <p style={{ color: '#666', marginBottom: '20px' }}>
        Fetch evacuation centers from Bohol ArcGIS server and insert into the database.
      </p>

      <button
        onClick={handleSync}
        disabled={loading}
        style={{
          padding: '12px 24px',
          fontSize: '16px',
          backgroundColor: loading ? '#ccc' : '#0f766e',
          color: 'white',
          border: 'none',
          borderRadius: '8px',
          cursor: loading ? 'not-allowed' : 'pointer',
          display: 'flex',
          alignItems: 'center',
          gap: '8px',
        }}
      >
        {loading && <Loader size={20} className="spinner" style={{ animation: 'spin 1s linear infinite' }} />}
        {loading ? 'Syncing...' : 'Start Sync'}
      </button>

      {result && (
        <div
          style={{
            marginTop: '24px',
            padding: '16px',
            borderRadius: '8px',
            backgroundColor: result.success ? '#f0fdf4' : '#fef2f2',
            border: `1px solid ${result.success ? '#86efac' : '#fca5a5'}`,
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '12px' }}>
            {result.success ? (
              <CheckCircle size={24} color="#16a34a" />
            ) : (
              <AlertCircle size={24} color="#dc2626" />
            )}
            <h2 style={{ margin: 0, color: result.success ? '#16a34a' : '#dc2626' }}>
              {result.success ? 'Sync Successful' : 'Sync Failed'}
            </h2>
          </div>

          <div style={{ fontSize: '14px', lineHeight: '1.6', color: '#333' }}>
            <p>
              <strong>Fetched:</strong> {result.fetched} centers
            </p>
            <p>
              <strong>Inserted:</strong> {result.inserted} centers
            </p>
          </div>

          {result.errors.length > 0 && (
            <div style={{ marginTop: '12px', padding: '12px', backgroundColor: '#fca5a5', borderRadius: '4px' }}>
              <strong style={{ color: '#991b1b' }}>Errors:</strong>
              <ul style={{ margin: '8px 0 0', paddingLeft: '20px', color: '#991b1b' }}>
                {result.errors.map((error, idx) => (
                  <li key={idx}>{error}</li>
                ))}
              </ul>
            </div>
          )}
        </div>
      )}

      <style>{`
        @keyframes spin {
          from {
            transform: rotate(0deg);
          }
          to {
            transform: rotate(360deg);
          }
        }
      `}</style>
    </div>
  )
}
