import React from 'react';

interface CardProps extends React.HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode;
  className?: string;
  noPadding?: boolean;
}

export const Card: React.FC<CardProps> = ({ children, className = '', noPadding = false, ...props }) => {
  return (
    <div className={`glass-card ${noPadding ? 'p-0' : 'p-6'} ${className}`} {...props}>
      {children}
    </div>
  );
};
