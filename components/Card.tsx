import React from 'react';

interface CardProps {
  children: React.ReactNode;
  className?: string;
  color?: string;
  rotate?: number; // Slight rotation for the "messy" look
}

export const Card: React.FC<CardProps> = ({ children, className = '', color = 'bg-white dark:bg-[#1a1a1a]', rotate = 0 }) => {
  return (
    <div 
      className={`
        ${color} 
        border-2 border-black dark:border-white
        shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] dark:shadow-[4px_4px_0px_0px_rgba(255,255,255,1)]
        hover:shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] dark:hover:shadow-[8px_8px_0px_0px_rgba(255,255,255,1)]
        hover:-translate-y-1 hover:-translate-x-1
        transition-all duration-200 ease-out
        p-6 
        ${className}
      `}
      style={{
        transform: `rotate(${rotate}deg)`
      }}
    >
      {children}
    </div>
  );
};