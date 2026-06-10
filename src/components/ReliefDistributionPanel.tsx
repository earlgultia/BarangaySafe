import { useEffect, useState } from 'react'
import jsPDF from 'jspdf'
import { Download, FileSpreadsheet } from 'lucide-react'
import { fetchReliefDistributions, type ReliefDistributionRecord } from '../lib/relief'

export default function ReliefDistributionPanel() {
  const [records, setRecords] = useState<ReliefDistributionRecord[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    async function load() {
      setLoading(true)
      const { data, error } = await fetchReliefDistributions()
      if (error || !data) {
        setError('Unable to load relief distribution data.')
        setLoading(false)
        return
      }
      setRecords(data)
      setLoading(false)
    }

    void load()
  }, [])

  function downloadCsv() {
    const header = ['Beneficiary', 'Distribution Date', 'Claim Status', 'Amount']
    const body = records.map((record) => [
      record.beneficiary_name,
      new Date(record.distribution_date).toLocaleDateString(),
      record.claim_status,
      record.amount != null ? record.amount.toFixed(2) : '-',
    ])

    const csvContent = [header, ...body].map((row) => row.map((value) => `"${String(value).replace(/"/g, '""')}"`).join(',')).join('\n')
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' })
    const url = URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.href = url
    link.download = 'relief-distributions.csv'
    link.click()
    URL.revokeObjectURL(url)
  }

  function downloadPdf() {
    const doc = new jsPDF({ unit: 'pt', format: 'letter' })
    doc.setFontSize(14)
    doc.text('Relief Distribution Report', 40, 40)
    doc.setFontSize(11)

    let y = 70
    records.slice(0, 20).forEach((record, index) => {
      doc.text(`${index + 1}. ${record.beneficiary_name}`, 40, y)
      y += 14
      doc.text(`   Date: ${new Date(record.distribution_date).toLocaleDateString()}`, 40, y)
      y += 14
      doc.text(`   Status: ${record.claim_status} | Amount: ${record.amount != null ? record.amount.toFixed(2) : '-'}`, 40, y)
      y += 18
      if (y > 740) {
        doc.addPage()
        y = 40
      }
    })

    doc.save('relief-distribution-report.pdf')
  }

  return (
    <section className="relief-panel">
      <div className="panel-header">
        <div>
          <p className="report-subtitle">Relief distribution</p>
          <h2>Beneficiaries and claim tracking</h2>
          <p>Monitor distribution status and export the latest relief distribution list.</p>
        </div>
        <div className="export-actions">
          <button className="button-outline" type="button" onClick={downloadPdf}>
            <Download size={16} />
            <span>Export PDF</span>
          </button>
          <button className="button-secondary" type="button" onClick={downloadCsv}>
            <FileSpreadsheet size={16} />
            <span>Export Excel</span>
          </button>
        </div>
      </div>

      {loading ? (
        <div className="alert-empty">Loading relief records…</div>
      ) : error ? (
        <div className="alert-empty">{error}</div>
      ) : (
        <div className="relief-table-wrapper">
          <table className="relief-table">
            <thead>
              <tr>
                <th>Beneficiary</th>
                <th>Date</th>
                <th>Status</th>
                <th>Amount</th>
              </tr>
            </thead>
            <tbody>
              {records.map((record) => (
                <tr key={record.id}>
                  <td>{record.beneficiary_name}</td>
                  <td>{new Date(record.distribution_date).toLocaleDateString()}</td>
                  <td>
                    <span className={`claim-pill claim-${record.claim_status.toLowerCase().replace(/\s+/g, '-')}`}>
                      {record.claim_status}
                    </span>
                  </td>
                  <td>{record.amount != null ? `₱${record.amount.toFixed(2)}` : '-'}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </section>
  )
}
