import React from 'react';

const Spinner: React.FC = () => {
  return (
    // Design intent: Minimal, modern spinner with gradient accent
    <div className="inline-flex items-center justify-center">
      <span className="relative inline-block h-6 w-6">
        <span className="absolute inset-0 rounded-full bg-gradient-to-tr from-primary-500 to-accent-500 opacity-20" />
        <span className="absolute inset-0 rounded-full border-2 border-transparent border-t-primary-500 animate-spin" />
      </span>
      <span className="sr-only">Loading</span>
    </div>
  );
};

export default Spinner;

