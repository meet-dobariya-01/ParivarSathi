import type { ButtonHTMLAttributes, DetailedHTMLProps } from "react";

type ButtonProps = DetailedHTMLProps<ButtonHTMLAttributes<HTMLButtonElement>, HTMLButtonElement> & {
  variant?: "primary" | "secondary" | "ghost" | "danger";
};

const variants = {
  primary: "bg-blue-600 text-white hover:bg-blue-700 focus:ring-blue-500",
  secondary: "bg-slate-100 text-slate-800 hover:bg-slate-200 focus:ring-slate-500",
  ghost: "bg-transparent text-blue-700 hover:bg-blue-50 focus:ring-blue-500",
  danger: "bg-red-600 text-white hover:bg-red-700 focus:ring-red-500",
};

export const Button = ({ variant = "primary", className = "", children, ...props }: ButtonProps) => (
  <button
    {...props}
    className={[
      "inline-flex items-center justify-center rounded-xl px-4 py-2.5 text-sm font-medium transition focus:outline-none focus:ring-2 focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-60",
      variants[variant],
      className,
    ].join(" ")}
  >
    {children}
  </button>
);
