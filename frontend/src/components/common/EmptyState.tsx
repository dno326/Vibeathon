import React from 'react';

interface EmptyStateProps {
  title?: string;
  message: string;
  actionLabel?: string;
  onAction?: () => void;
}

const EmptyState: React.FC<EmptyStateProps> = ({ title, message, actionLabel, onAction }) => {
  return (
    // Design intent: Friendly, inviting empty state with icon, hierarchy, and clear CTA
    <div className="text-center py-16 bg-white/90 backdrop-blur rounded-2xl shadow-card border border-white/60">
      <div className="max-w-md mx-auto">
        <div className="mb-6">
          <svg
            className="mx-auto h-16 w-16 text-primary-400"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
            />
          </svg>
        </div>
        {title && (
          <h3 className="text-2xl font-bold text-gray-900 mb-2">{title}</h3>
        )}
        <p className="text-gray-600 mb-6 leading-relaxed">{message}</p>
      {actionLabel && onAction && (
          <button
            onClick={onAction}
            className="px-6 py-3 bg-gradient-to-r from-primary-700 to-primary-600 text-white font-semibold rounded-2xl shadow-soft hover:shadow-card hover:brightness-105 active:scale-95 transition-all"
          >
            {actionLabel}
          </button>
      )}
      </div>
    </div>
  );
};

export default EmptyState;

