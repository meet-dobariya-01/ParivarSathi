import type { ReactNode } from "react";

type CardProps = {
  title?: string;
  subtitle?: string;
  children: ReactNode;
  className?: string;
};

export const Card = ({ title, subtitle, children, className = "" }: CardProps) => (
  <div className={['rounded-2xl border border-slate-200 bg-white p-5 shadow-sm', className].join(" ")}>
    {(title || subtitle) && (
      <div className="mb-4">
        {title && <h2 className="text-lg font-semibold text-slate-900">{title}</h2>}
        {subtitle && <p className="mt-1 text-sm text-slate-500">{subtitle}</p>}
      </div>
    )}
    {children}
  </div>
);
