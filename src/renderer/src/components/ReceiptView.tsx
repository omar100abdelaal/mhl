import React from 'react'
import { Printer } from 'lucide-react'
import { CartItem } from '../types'
import { useI18n } from '../contexts/I18nContext'

interface ReceiptViewProps {
  receiptId: number;
  items: CartItem[];
  total: number;
  date: Date;
}

const ReceiptView: React.FC<ReceiptViewProps> = ({ receiptId, items, total, date }) => {
  const { t } = useI18n()
  const handlePrint = () => {
    window.print()
  }

  return (
    <div className="receipt-container">
      <div className="receipt-card">
        <div style={{ textAlign: 'center', marginBottom: '1.5rem' }}>
          <h2 style={{ fontSize: '1.5rem', fontWeight: 'bold' }}>منصور</h2>
          <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>MHL POS System</p>
        </div>

        <div style={{ borderTop: '1px dashed var(--border)', borderBottom: '1px dashed var(--border)', padding: '1rem 0', marginBottom: '1rem' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.85rem', marginBottom: '0.25rem' }}>
            <span>{t('receiptNo')}:</span>
            <span>{receiptId}</span>
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.85rem' }}>
            <span>{t('date')}:</span>
            <span>{new Date(date).toLocaleString()}</span>
          </div>
        </div>

        <div style={{ marginBottom: '1.5rem' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.9rem' }}>
            <thead>
              <tr style={{ textAlign: 'start', borderBottom: '1px solid var(--border)' }}>
                <th style={{ paddingBottom: '0.5rem' }}>{t('item')}</th>
                <th style={{ paddingBottom: '0.5rem', textAlign: 'center' }}>{t('qty')}</th>
                <th style={{ paddingBottom: '0.5rem', textAlign: 'end' }}>{t('price')}</th>
              </tr>
            </thead>
            <tbody>
              {items.map((item, idx) => (
                <tr key={idx}>
                  <td style={{ padding: '0.5rem 0' }}>{item.name}</td>
                  <td style={{ padding: '0.5rem 0', textAlign: 'center' }}>{item.quantity}</td>
                  <td style={{ padding: '0.5rem 0', textAlign: 'end' }}>{(item.price * item.quantity).toFixed(2)} {t('currency')}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div style={{ borderTop: '2px solid var(--text-main)', paddingTop: '1rem', display: 'flex', justifyContent: 'space-between', fontWeight: 'bold', fontSize: '1.1rem' }}>
          <span>{t('total')}</span>
          <span>{total.toFixed(2)} {t('currency')}</span>
        </div>

        <div style={{ marginTop: '2rem', textAlign: 'center', fontSize: '0.8rem', color: 'var(--text-muted)' }}>
          <p>{t('thankYou')}</p>
        </div>
      </div>

      <div className="no-print" style={{ marginTop: '2rem', display: 'flex', justifyContent: 'center' }}>
        <button onClick={handlePrint} className="btn btn-primary" style={{ width: '100%' }}>
          <Printer size={20} />
          {t('printReceipt')}
        </button>
      </div>
    </div>
  )
}

export default ReceiptView
