import React from 'react';

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {}

// Design intent: Soft borders, rounded corners, subtle focus shadow, clear placeholder
const Input: React.FC<InputProps> = ({ className = '', ...props }) => {
  return (
    <input
      className={`w-full rounded-xl border border-gray-300 bg-white px-4 py-3 text-gray-900 placeholder:text-gray-400 shadow-soft focus:border-primary-400 focus:ring-2 focus:ring-primary-200 focus:outline-none transition-all duration-200 ${className}`}
      {...props}
    />
  );
};

export default Input;

