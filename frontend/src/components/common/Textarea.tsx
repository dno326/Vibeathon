import React from 'react';

interface TextareaProps extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {}

// Design intent: Spacious text areas with soft focus visuals and readable line-height
const Textarea: React.FC<TextareaProps> = ({ className = '', ...props }) => {
  return (
    <textarea
      className={`w-full rounded-xl border border-gray-300 bg-white px-4 py-3 text-gray-900 placeholder:text-gray-400 shadow-soft focus:border-primary-400 focus:ring-2 focus:ring-primary-200 focus:outline-none transition-all duration-200 leading-relaxed ${className}`}
      {...props}
    />
  );
};

export default Textarea;

