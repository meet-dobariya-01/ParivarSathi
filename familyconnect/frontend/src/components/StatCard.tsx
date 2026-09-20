type StatCardProps = {
  label: string;
  value: string | number;
  accent?: "blue" | "emerald" | "amber" | "slate";
};

const accentStyles = {
  blue: "border-blue-100 bg-blue-50 text-blue-700",
  emerald: "border-emerald-100 bg-emerald-50 text-emerald-700",
  amber: "border-amber-100 bg-amber-50 text-amber-700",
  slate: "border-slate-200 bg-slate-50 text-slate-700",
};

export const StatCard = ({ label, value, accent = "blue" }: StatCardProps) => (
  <div className={['rounded-2xl border p-4 shadow-sm', accentStyles[accent]].join(" ")}>
    <p className="text-sm font-medium text-slate-500">{label}</p>
    <p className="mt-2 text-3xl font-bold tracking-tight text-slate-900">{value}</p>
  </div>
);
