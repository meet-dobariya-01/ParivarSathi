import React from 'react';
import { CheckCircle2, Clock, XCircle, ShieldCheck, AlertTriangle } from 'lucide-react';

const Badge = ({
  children,
  variant = 'default',
  size = 'md',
  icon: CustomIcon,
  className = ''
}) => {
  const sizeStyles = {
    sm: 'px-2 py-0.5 text-xs',
    md: 'px-2.5 py-1 text-xs',
    lg: 'px-3 py-1.5 text-sm font-semibold'
  };

  const variants = {
    default: {
      style: 'bg-slate-100 text-slate-800 border border-slate-300',
      icon: null
    },
    approved: {
      style: 'bg-[#eaf5ea] text-[#0f6e06] border border-[#a3d99b] font-semibold',
      icon: CheckCircle2
    },
    eligible: {
      style: 'bg-[#eaf5ea] text-[#0f6e06] border border-[#a3d99b] font-semibold',
      icon: CheckCircle2
    },
    under_review: {
      style: 'bg-[#fef7ee] text-[#9a4e05] border border-[#fed7aa] font-semibold',
      icon: Clock
    },
    submitted: {
      style: 'bg-[#eef4fb] text-[#1a3a6b] border border-[#bccde5] font-semibold',
      icon: Clock
    },
    rejected: {
      style: 'bg-[#fef2f2] text-[#991b1b] border border-[#fca5a5] font-semibold',
      icon: XCircle
    },
    not_eligible: {
      style: 'bg-[#fef2f2] text-[#991b1b] border border-[#fca5a5] font-semibold',
      icon: XCircle
    },
    partial: {
      style: 'bg-[#fef9c3] text-[#854d0e] border border-[#fde047] font-semibold',
      icon: AlertTriangle
    },
    verified: {
      style: 'bg-[#138808] text-white border border-[#138808] font-bold tracking-wide',
      icon: ShieldCheck
    },
    citizen: {
      style: 'bg-[#1a3a6b] text-white border border-[#1a3a6b] font-bold text-[10px] tracking-wider uppercase',
      icon: null
    },
    officer: {
      style: 'bg-[#ff9933] text-[#173059] border border-[#ff9933] font-bold text-[10px] tracking-wider uppercase',
      icon: null
    }
  };

  const currentVariant = variants[variant] || variants.default;
  const IconComponent = CustomIcon || currentVariant.icon;

  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-md font-medium select-none ${sizeStyles[size]} ${currentVariant.style} ${className}`}
    >
      {IconComponent && <IconComponent size={size === 'sm' ? 12 : 14} aria-hidden="true" className="shrink-0" />}
      <span>{children}</span>
    </span>
  );
};

export default Badge;
