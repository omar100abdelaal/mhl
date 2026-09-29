import React from 'react'
import { AlertTriangle } from 'lucide-react'
import Modal from './Modal'

interface ConfirmModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  title: string;
  message: string;
  confirmLabel?: string;
  cancelLabel?: string;
  isDanger?: boolean;
}

const ConfirmModal: React.FC<ConfirmModalProps> = ({
  isOpen,
  onClose,
  onConfirm,
  title,
  message,
  confirmLabel = 'Confirm',
  cancelLabel = 'Cancel',
  isDanger = true
}) => {
  return (
    <Modal isOpen={isOpen} onClose={onClose} title={title}>
      <div style={{ textAlign: 'center', padding: '1rem 0' }}>
        <div style={{ 
          margin: '0 auto 1.5rem', 
          width: '60px', 
          height: '60px', 
          borderRadius: '50%', 
          background: isDanger ? 'rgba(239, 68, 68, 0.1)' : 'rgba(59, 130, 246, 0.1)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          color: isDanger ? '#ef4444' : '#3b82f6'
        }}>
          <AlertTriangle size={32} />
        </div>
        
        <p style={{ marginBottom: '2rem', lineHeight: '1.6', color: 'var(--text-muted)' }}>
          {message}
        </p>
        
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
          <button 
            className="btn glass-card" 
            style={{ padding: '0.75rem' }} 
            onClick={onClose}
          >
            {cancelLabel}
          </button>
          <button 
            className={`btn ${isDanger ? 'btn-primary' : 'btn-primary'}`} 
            style={{ 
              padding: '0.75rem', 
              background: isDanger ? '#ef4444' : undefined,
              borderColor: isDanger ? '#ef4444' : undefined
            }} 
            onClick={() => {
              onConfirm();
              onClose();
            }}
          >
            {confirmLabel}
          </button>
        </div>
      </div>
    </Modal>
  )
}

export default ConfirmModal
