import React from 'react';

interface DeckCardProps {
  title?: string;
  count?: number;
  onClick?: () => void;
}

// Design intent: Polished card with gradient accent and micro-interactions
const DeckCard: React.FC<DeckCardProps> = ({ title = 'Untitled Deck', count = 0, onClick }) => {
  return (
    <div
      className="bg-white rounded-2xl shadow-card border border-white/60 p-6 hover:shadow-float hover:border-primary-300 transition-all duration-250 ease-out-soft cursor-pointer group"
      onClick={onClick}
      role="button"
    >
      <div className="flex items-start justify-between">
        <div>
          <h3 className="text-lg font-bold text-gray-900 group-hover:text-primary-700 transition-colors">
            {title}
          </h3>
          <p className="text-sm text-gray-600 mt-1">{count} cards</p>
        </div>
        <div className="h-8 w-8 rounded-xl bg-gradient-to-tr from-primary-500 to-accent-500 opacity-80" />
      </div>
      <div className="mt-4 text-primary-600 font-semibold text-sm inline-flex items-center">
        Study now
        <svg className="w-4 h-4 ml-2 transform group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
        </svg>
      </div>
    </div>
  );
};

export default DeckCard;

