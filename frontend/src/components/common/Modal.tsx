import React from 'react';

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  children: React.ReactNode;
  title?: string;
}

const Modal: React.FC<ModalProps> = ({ isOpen, onClose, children, title }) => {
  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-6 bg-black/40 backdrop-blur-sm"
      onClick={onClose}
    >
      <div
        className="w-full max-w-lg rounded-2xl bg-white shadow-float p-6 md:p-8 transform transition-all duration-250 ease-out-soft animate-[fadeIn_200ms_ease-out] scale-100"
        onClick={(e) => e.stopPropagation()}
        role="dialog"
        aria-modal="true"
      >
        {title && (
          <h2 className="text-xl md:text-2xl font-bold text-gray-900 mb-4">
            {title}
          </h2>
        )}
        {children}
      </div>
    </div>
  );
};

export default Modal;

