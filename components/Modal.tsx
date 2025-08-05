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
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 animate-fade-in">
      {/* Backdrop */}
      <div 
        className="absolute inset-0 modal-backdrop"
        onClick={onClose}
      ></div>

      {/* Modal Container */}
      <div className={`
        relative w-full ${sizeClasses[size]} max-h-[90vh] 
        flex flex-col animate-slide-up
      `}>
        {/* Modal Content */}
        <div className="glass-gold rounded-2xl border border-primary-500/30 shadow-luxury overflow-hidden">
          {/* Header */}
          <div className="flex items-center justify-between p-6 border-b border-primary-500/20 bg-gradient-to-r from-dark-50/50 to-dark-100/50">
            <div className="flex items-center space-x-3">
              <div className="w-2 h-8 bg-gradient-gold rounded-full"></div>
              <h2 className="text-xl font-bold text-white">{title}</h2>
            </div>
            
            <button 
              onClick={onClose}
              className="p-2 rounded-xl text-primary-500/60 hover:text-primary-500 hover:bg-primary-500/10 transition-all duration-300 group"
            >
              <XMarkIcon className="w-6 h-6 transition-transform duration-300 group-hover:rotate-90" />
            </button>
          </div>

          {/* Content */}
          <div className="p-6 overflow-y-auto max-h-[calc(90vh-8rem)] custom-scrollbar">
            <div className="space-y-6">
              {children}
            </div>
          </div>

          {/* Footer Gradient */}
          <div className="h-1 bg-gradient-to-r from-primary-500 via-primary-400 to-accent"></div>
        </div>
      </div>

      <style jsx>{`
        .custom-scrollbar::-webkit-scrollbar {
          width: 6px;
        }
        .custom-scrollbar::-webkit-scrollbar-track {
          background: rgba(26, 26, 26, 0.3);
          border-radius: 10px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb {
          background: linear-gradient(135deg, #FFD700, #FFC107);
          border-radius: 10px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover {
          background: linear-gradient(135deg, #FFEB3B, #FFD700);
        }
      `}</style>
    </div>,
    document.body
  );
};

export default Modal;