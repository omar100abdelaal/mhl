import React, { useState, useEffect, useMemo } from 'react'
import { ClipboardList, Calendar, ChevronRight, Receipt as ReceiptIcon, Trash2 } from 'lucide-react'
import { Receipt } from '../types'
import { useI18n } from '../contexts/I18nContext'
import Modal from '../components/Modal'

const SalesHistory: React.FC = () => {
  const { t } = useI18n()
  const [receipts, setReceipts] = useState<Receipt[]>([])
  const [selectedReceipt, setSelectedReceipt] = useState<Receipt | null>(null)
  const [receiptItems, setReceiptItems] = useState<any[]>([])
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false)
  const [receiptToDelete, setReceiptToDelete] = useState<Receipt | null>(null)
  const [deleteError, setDeleteError] = useState<string | null>(null)
  const [dateFilter, setDateFilter] = useState<string>('') // YYYY-MM-DD

  useEffect(() => {
    fetchReceipts()
  }, [])

  const fetchReceipts = async () => {
    try {
      const data = await window.api.getReceipts()
      console.log('Fetched receipts:', data)
      setReceipts(data)
    } catch (err) {
      console.error('Failed to fetch receipts:', err)
    }
  }

  const handleReceiptClick = async (receipt: Receipt) => {
    try {
      const items = await window.api.getReceiptItems(receipt.id)
      setReceiptItems(items)
      setSelectedReceipt(receipt)
      setIsModalOpen(true)
    } catch (err) {
      console.error('Failed to fetch receipt items:', err)
    }
  }

  const handleDeleteClick = (e: React.MouseEvent, receipt: Receipt) => {
    e.stopPropagation()
    setReceiptToDelete(receipt)
    setDeleteError(null)
    setIsDeleteModalOpen(true)
  }

  const handleConfirmDelete = async () => {
    if (!receiptToDelete) return
    try {
      await window.api.deleteReceipt(receiptToDelete.id)
      setIsDeleteModalOpen(false)
      setReceiptToDelete(null)
      fetchReceipts()
    } catch (err) {
      console.error('Failed to delete receipt:', err)
      // Show the actual error message to help debug (e.g. 'window.api.deleteReceipt is not a function')
      setDeleteError(err instanceof Error ? err.message : String(err))
    }
  }

  // Parse and group receipts by day
  const groupedReceipts = useMemo(() => {
    let filtered = receipts
    if (dateFilter) {
      filtered = receipts.filter(r => {
        try {
          // Both ISO strings and SQLite timestamp format (YYYY-MM-DD HH:MM:SS) 
          // are handled correctly by the Date constructor.
          // We compare the YYYY-MM-DD part in local time.
          const date = new Date(r.date);
          const year = date.getFullYear();
          const month = String(date.getMonth() + 1).padStart(2, '0');
          const day = String(date.getDate()).padStart(2, '0');
          const localDateString = `${year}-${month}-${day}`;
          return localDateString === dateFilter;
        } catch (e) {
          return false;
        }
      })
    }

    const groups: Record<string, Receipt[]> = {}
    filtered.forEach(r => {
      try {
        const day = new Date(r.date).toLocaleDateString(undefined, { 
          year: 'numeric', 
          month: 'long', 
          day: 'numeric' 
        })
        if (!groups[day]) groups[day] = []
        groups[day].push(r)
      } catch (e) {
        if (!groups['Unknown Date']) groups['Unknown Date'] = []
        groups['Unknown Date'].push(r)
      }
    })
    return groups
  }, [receipts, dateFilter])

  return (
    <div className="sales-history">
      <header style={{ marginBottom: '2rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <h1 style={{ fontSize: '1.5rem', fontWeight: 'bold' }}>{t('history')}</h1>
        
        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', background: 'var(--glass)', padding: '0.5rem 1rem', borderRadius: '0.75rem', border: '1px solid var(--border)' }}>
            <Calendar size={18} color="var(--text-muted)" />
            <span style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>{t('filterByDay')}:</span>
            <input 
              type="date" 
              value={dateFilter}
              onChange={(e) => setDateFilter(e.target.value)}
              style={{ background: 'transparent', border: 'none', color: 'white', outline: 'none', cursor: 'pointer' }}
            />
            {dateFilter && (
              <button 
                onClick={() => setDateFilter('')}
                style={{ background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer', fontSize: '1.2rem' }}
              >
                ×
              </button>
            )}
          </div>
        </div>
      </header>

      {Object.keys(groupedReceipts).length > 0 ? (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
          {Object.entries(groupedReceipts).map(([day, items]) => (
            <div key={day}>
              <h2 style={{ fontSize: '1rem', fontWeight: 'bold', color: 'var(--text-muted)', marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <Calendar size={16} />
                {day}
              </h2>
              <div className="glass-card" style={{ padding: '0' }}>
                <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
                  <thead>
                    <tr style={{ borderBottom: '1px solid var(--border)' }}>
                      <th style={{ padding: '1rem' }}>{t('receiptNo')}</th>
                      <th style={{ padding: '1rem' }}>{t('date')}</th>
                      <th style={{ padding: '1rem' }}>{t('total')}</th>
                      <th style={{ padding: '1rem' }}></th>
                    </tr>
                  </thead>
                  <tbody>
                    {items.map(receipt => (
                      <tr 
                        key={receipt.id} 
                        onClick={() => handleReceiptClick(receipt)}
                        style={{ borderBottom: '1px solid var(--border)', cursor: 'pointer', transition: 'background 0.2s' }}
                        className="hover-row"
                      >
                        <td style={{ padding: '1rem' }}>#{receipt.id}</td>
                        <td style={{ padding: '1rem' }}>
                          <span style={{ color: 'var(--text-muted)' }}>
                            {new Date(receipt.date).toLocaleTimeString(undefined, { hour: '2-digit', minute: '2-digit' })}
                          </span>
                        </td>
                        <td style={{ padding: '1rem', fontWeight: 'bold', color: 'var(--primary)' }}>
                          {receipt.total.toFixed(2)} {t('currency')}
                        </td>
                        <td style={{ padding: '1rem', textAlign: 'right' }}>
                          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-end', gap: '0.5rem' }}>
                            <button 
                              onClick={(e) => handleDeleteClick(e, receipt)}
                              className="btn-icon"
                              style={{ color: '#f87171', background: 'rgba(248, 113, 113, 0.1)', padding: '6px' }}
                            >
                              <Trash2 size={16} />
                            </button>
                            <ChevronRight size={18} color="var(--text-muted)" />
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="glass-card" style={{ textAlign: 'center', padding: '4rem' }}>
          <ClipboardList size={48} style={{ margin: '0 auto 1.5rem', color: 'var(--text-muted)' }} />
          <h2 style={{ fontSize: '1.25rem', marginBottom: '0.5rem' }}>{t('noSales')}</h2>
          <p style={{ color: 'var(--text-muted)' }}>{t('salesDescription')}</p>
        </div>
      )}

      {/* Sale Detail Modal */}
      <Modal 
        isOpen={isModalOpen} 
        onClose={() => setIsModalOpen(false)} 
        title={`${t('receiptNo')} #${selectedReceipt?.id}`}
      >
        <div style={{ marginBottom: '1.5rem' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
            <span style={{ color: 'var(--text-muted)' }}>{t('date')}</span>
            <span>{selectedReceipt && new Date(selectedReceipt.date).toLocaleString()}</span>
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between', fontWeight: 'bold', fontSize: '1.1rem' }}>
            <span>{t('total')}</span>
            <span style={{ color: 'var(--primary)' }}>{selectedReceipt?.total.toFixed(2)} {t('currency')}</span>
          </div>
        </div>

        <h3 style={{ fontSize: '1rem', fontWeight: 'bold', marginBottom: '1rem', borderBottom: '1px solid var(--border)', paddingBottom: '0.5rem' }}>
          {t('items')}
        </h3>
        
        <div style={{ maxHeight: '300px', overflowY: 'auto' }}>
          {receiptItems.map((item, idx) => (
            <div key={idx} style={{ display: 'flex', justifyContent: 'space-between', padding: '0.75rem 0', borderBottom: '1px solid var(--border)' }}>
              <div>
                <div style={{ fontWeight: '500' }}>{item.product_name || 'Deleted Product'}</div>
                <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                  {item.price.toFixed(2)} {t('currency')} x {item.quantity}
                </div>
              </div>
              <div style={{ fontWeight: 'bold' }}>
                {(item.price * item.quantity).toFixed(2)} {t('currency')}
              </div>
            </div>
          ))}
        </div>
        
        <button 
          className="btn btn-primary" 
          onClick={() => window.print()}
          style={{ width: '100%', marginTop: '1.5rem', justifyContent: 'center' }}
        >
          <ReceiptIcon size={18} />
          {t('printReceipt')}
        </button>
      </Modal>

      {/* Delete Confirmation Modal */}
      <Modal 
        isOpen={isDeleteModalOpen} 
        onClose={() => setIsDeleteModalOpen(false)} 
        title={t('confirmDeleteTitle')}
      >
        <div style={{ textAlign: 'center', padding: '1rem 0' }}>
          <div style={{ 
            width: '60px', 
            height: '60px', 
            borderRadius: '50%', 
            background: 'rgba(248, 113, 113, 0.1)', 
            display: 'flex', 
            alignItems: 'center', 
            justifyContent: 'center',
            margin: '0 auto 1.5rem',
            color: '#f87171'
          }}>
            <Trash2 size={30} />
          </div>
          <p style={{ marginBottom: '2rem', fontSize: '1.1rem' }}>{t('confirmDeleteReceipt')}</p>
          
          {deleteError && (
            <div style={{ 
              padding: '0.75rem', 
              background: 'rgba(239, 68, 68, 0.1)', 
              color: '#f87171', 
              borderRadius: '0.5rem', 
              marginBottom: '1.5rem',
              fontSize: '0.9rem',
              border: '1px solid rgba(239, 68, 68, 0.2)'
            }}>
              {deleteError}
            </div>
          )}

          <div style={{ display: 'flex', gap: '1rem' }}>
            <button 
              className="btn glass-card" 
              onClick={() => setIsDeleteModalOpen(false)}
              style={{ flex: 1, justifyContent: 'center' }}
            >
              {t('cancel')}
            </button>
            <button 
              className="btn" 
              onClick={handleConfirmDelete}
              style={{ flex: 1, justifyContent: 'center', background: '#ef4444', color: 'white' }}
            >
              {t('delete')}
            </button>
          </div>
        </div>
      </Modal>
    </div>
  )
}

export default SalesHistory
