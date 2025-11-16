import React from 'react';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'danger';
}

// Design intent: Elevated, rounded buttons with generous padding and crisp interactions
const Button: React.FC<ButtonProps> = ({ variant = 'primary', children, className = '', ...props }) => {
  const base =
    'inline-flex items-center justify-center rounded-2xl px-5 py-3 font-semibold transition-all duration-250 ease-out-soft focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 active:scale-95';
  const variants: Record<NonNullable<ButtonProps['variant']>, string> = {
    primary:
      'bg-gradient-to-r from-primary-600 to-violet-600 text-white shadow-soft hover:shadow-card hover:brightness-105 focus-visible:ring-primary-300',
    secondary:
      'bg-white text-gray-800 border border-gray-200 shadow-soft hover:shadow-card hover:bg-gray-50 focus-visible:ring-gray-300',
    danger:
      'bg-gradient-to-r from-rose-600 to-rose-500 text-white shadow-soft hover:shadow-card hover:brightness-105 focus-visible:ring-rose-300',
  };

  return (
    <button className={`${base} ${variants[variant]} ${className}`} {...props}>
      {children}
    </button>
  );
};

export default Button;

