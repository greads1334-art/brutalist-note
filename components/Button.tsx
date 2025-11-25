import React from 'react';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'danger' | 'neutral';
  isLoading?: boolean;
}

export const Button: React.FC<ButtonProps> = ({ 
  children, 
  variant = 'primary', 
  isLoading, 
  className = '', 
  ...props 
}) => {
  const baseStyles = "relative inline-flex items-center justify-center px-6 py-3 font-bold transition-all active:translate-x-[2px] active:translate-y-[2px] active:shadow-none disabled:opacity-50 disabled:cursor-not-allowed border-2 border-black dark:border-white shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] dark:shadow-[4px_4px_0px_0px_rgba(255,255,255,1)]";
  
  const variants = {
    primary: "bg-[#FF6B6B] hover:bg-[#ff5252] text-black", // Red/Pink
    secondary: "bg-[#4ECDC4] hover:bg-[#3dbdb4] text-black", // Teal
    danger: "bg-[#FF0000] text-white hover:bg-red-700", // Pure Red
    neutral: "bg-white hover:bg-gray-100 text-black dark:bg-black dark:text-white dark:hover:bg-gray-900", // Neutral
  };

  return (
    <button 
      className={`${baseStyles} ${variants[variant]} ${className}`}
      disabled={isLoading || props.disabled}
      {...props}
    >
      {isLoading ? (
        <span className="animate-pulse">PROCESSING...</span>
      ) : (
        children
      )}
    </button>
  );
};