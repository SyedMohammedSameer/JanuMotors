import React, { useEffect } from 'react';
import ReactDOM from 'react-dom';
import { XMarkIcon } from './Icons';

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  children: React.ReactNode;
  size?: 'sm' | 'md' | 'lg' | 'xl';
}

const Modal: React.FC<ModalProps> = ({ isOpen, onClose, title, children, size = 'md' }) => {
  useEffect(() => {
    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        onClose();
      }
    };

    if (isOpen) {
      document.addEventListener('keydown', handleEscape);
      // Prevent body scroll when modal is open
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }

    return () => {
      document.removeEventListener('keydown', handleEscape);
      document.body.style.overflow = 'unset';
    };
  }, [onClose, isOpen]);

  if (!isOpen) return null;

  const sizeClasses = {
    sm: 'max-w-md',
    md: 'max-w-2xl',
    lg: 'max-w-4xl',
    xl: 'max-w-6xl'
  };

  return ReactDOM.createPortal(
    <div className="fixed inset-0 z-[60] flex items-end sm:items-center justify-center p-0 sm:p-4 animate-fade-in" role="dialog" aria-modal="true" aria-label={title}>
      {/* Backdrop */}
      <div 
        className="absolute inset-0 modal-backdrop"
        onClick={onClose}
      ></div>

      {/* Modal Container */}
      <div className={`
        relative w-full ${sizeClasses[size]} max-h-[95vh] sm:max-h-[90vh]
        flex flex-col animate-slide-up
      `}>
        {/* Modal Content */}
        <div className="glass-gold rounded-t-2xl sm:rounded-2xl border border-primary-500/30 shadow-luxury overflow-hidden">
          {/* Header */}
          <div className="flex items-center justify-between p-4 sm:p-6 border-b border-primary-500/20 bg-gradient-to-r from-dark-50/50 to-dark-100/50">
            <div className="flex items-center space-x-3 min-w-0">
              <div className="w-2 h-6 sm:h-8 bg-gradient-gold rounded-full flex-shrink-0"></div>
              <h2 className="text-base sm:text-xl font-bold text-white truncate">{title}</h2>
            </div>
            
            <button 
              onClick={onClose}
              aria-label="Close dialog"
              className="p-2 flex-shrink-0 rounded-xl text-primary-500/60 hover:text-primary-500 hover:bg-primary-500/10 transition-all duration-300 group"
            >
              <XMarkIcon className="w-6 h-6 transition-transform duration-300 group-hover:rotate-90" />
            </button>
          </div>

          {/* Content */}
          <div className="p-4 sm:p-6 overflow-y-auto max-h-[calc(95vh-8rem)] sm:max-h-[calc(90vh-8rem)] custom-scrollbar">
            <div className="space-y-6">
              {children}
            </div>
          </div>

          {/* Footer Gradient */}
          <div className="h-1 bg-gradient-to-r from-primary-500 via-primary-400 to-accent"></div>
        </div>
      </div>
    </div>,
    document.body
  );
};

export default Modal;