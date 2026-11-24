import React from 'react';
import { clsx } from 'clsx';

interface CardProps {
  children: React.ReactNode;
  className?: string;
  onClick?: () => void;
  hoverEffect?: boolean;
}

export const Card: React.FC<CardProps> = ({
  children,
  className,
  onClick,
  hoverEffect = false,
}) => {
  return (
    <div
      onClick={onClick}
      className={clsx(
        'bg-navy-900/80 border border-slate-800/80 rounded-xl p-5 shadow-lg backdrop-blur-sm transition-all duration-200',
        hoverEffect && 'hover:border-cyan-500/40 hover:shadow-cyan-950/30 hover:-translate-y-0.5 cursor-pointer',
        className
      )}
    >
      {children}
    </div>
  );
};

export const CardHeader: React.FC<{
  title: React.ReactNode;
  subtitle?: React.ReactNode;
  action?: React.ReactNode;
  icon?: React.ReactNode;
  className?: string;
}> = ({ title, subtitle, action, icon, className }) => {
  return (
    <div className={clsx('flex items-start justify-between gap-4 mb-4', className)}>
      <div className="flex items-center gap-3">
        {icon && <div className="p-2 rounded-lg bg-slate-800/80 text-cyan-400 border border-slate-700/60">{icon}</div>}
        <div>
          <h3 className="text-base font-semibold text-slate-100 tracking-tight">{title}</h3>
          {subtitle && <p className="text-xs text-slate-400 mt-0.5">{subtitle}</p>}
        </div>
      </div>
      {action && <div>{action}</div>}
    </div>
  );
};
