import { useEffect } from 'react';

export default function Notification({ message, type, onClose }) {
  useEffect(() => {
    // Auto-close the alert after 3 seconds
    const timer = setTimeout(() => {
      onClose();
    }, 3000);
    return () => clearTimeout(timer);
  }, [message, onClose]);

  if (!message) return null;

  return (
    <div className={`alert-toast ${type}`}>
      {type === 'success' ? '✅' : '⚠️'} {message}
      <button onClick={onClose} className="close-alert">&times;</button>
    </div>
  );
}