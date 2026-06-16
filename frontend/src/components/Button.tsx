import React from 'react';
import { Loader2 } from 'lucide-react';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'danger';
  isLoading?: boolean;
  leftIcon?: React.ReactNode;
}

export const Button: React.FC<ButtonProps> = ({ 
  children, 
  variant = 'primary', 
  isLoading, 
  leftIcon, 
  className = '', 
  disabled,
  ...props 
}) => {
  const baseClass = "inline-flex items-center justify-center gap-2 rounded-xl px-6 py-3 font-medium transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed font-outfit";
  
  // Custom vanilla CSS variants that will be hooked into index.css
  const variants = {
    primary: "btn-primary",
    secondary: "bg-white border border-slate-200 hover:border-[#19A7CE] hover:bg-[#19A7CE]/5 text-[#146C94]",
    danger: "bg-rose-500/10 text-rose-500 hover:bg-rose-500/20"
  };

  return (
    <button 
      className={`${baseClass} ${variants[variant]} ${className}`}
      disabled={disabled || isLoading}
      {...props}
    >
      {isLoading ? <Loader2 className="w-5 h-5 animate-spin" /> : leftIcon}
      {children}
    </button>
  );
};
