import React from 'react';
import { useApp } from '../context/AppContext';
import { CheckCircle2, AlertCircle, X } from 'lucide-react';

const Toast = () => {
  const { toasts, removeToast } = useApp();

  return (
    <div className="toast-container">
      {toasts.map((toast) => (
        <div
          key={toast.id}
          className={`toast toast-${toast.type}`}
          role="alert"
        >
          {toast.type === 'success' ? (
            <CheckCircle2 size={18} style={{ color: 'var(--secondary)' }} />
          ) : (
            <AlertCircle size={18} style={{ color: 'var(--danger)' }} />
          )}
          <div className="toast-message">{toast.message}</div>
          <button 
            className="btn-icon" 
            onClick={() => removeToast(toast.id)}
            style={{ padding: '2px' }}
            aria-label="Dismiss Notification"
          >
            <X size={14} />
          </button>
        </div>
      ))}
    </div>
  );
};

export default Toast;
