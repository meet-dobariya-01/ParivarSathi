import type { SelectHTMLAttributes, DetailedHTMLProps } from "react";

type SelectProps = DetailedHTMLProps<SelectHTMLAttributes<HTMLSelectElement>, HTMLSelectElement> & {
  label?: string;
  error?: string;
  helperText?: string;
};

export const Select = ({ label, id, error, helperText, className = "", children, ...props }: SelectProps) => (
  <div className="block text-sm font-medium text-slate-700">
    {label && (
      <label htmlFor={id} className="mb-1.5 block">
        {label}
        {props.required && <span className="ml-1 text-red-500">*</span>}
      </label>
    )}
    <select
      id={id}
      {...props}
      className={[
        "w-full rounded-xl border bg-white px-3.5 py-2.5 text-sm text-slate-900 shadow-sm transition focus:outline-none focus:ring-2 disabled:bg-slate-100 disabled:cursor-not-allowed",
        error
          ? "border-red-400 focus:border-red-500 focus:ring-red-100"
          : "border-slate-300 focus:border-blue-500 focus:ring-blue-100",
        className,
      ].join(" ")}
    >
      {children}
    </select>
    {error ? (
      <p className="mt-1 text-xs text-red-600">{error}</p>
    ) : helperText ? (
      <p className="mt-1 text-xs text-slate-500">{helperText}</p>
    ) : null}
  </div>
);
