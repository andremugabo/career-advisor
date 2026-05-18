import React from 'react';

interface CardProps {
  children: React.ReactNode;
  className?: string;
  noPadding?: boolean;
}

export const Card: React.FC<CardProps> = ({ children, className = '', noPadding = false }) => {
  return (
    <div className={`glass-card ${noPadding ? 'p-0' : 'p-6'} ${className}`}>
      {children}
    </div>
  );
};
