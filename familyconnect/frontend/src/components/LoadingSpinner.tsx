export const LoadingSpinner = ({ label = "Loading..." }: { label?: string }) => (
  <div className="flex items-center gap-3 rounded-2xl border border-slate-200 bg-white p-5 text-slate-600 shadow-sm">
    <span className="inline-block h-5 w-5 animate-spin rounded-full border-2 border-blue-200 border-t-blue-600" />
    <span className="text-sm font-medium">{label}</span>
  </div>
);
