import { Button } from "./Button";

type EmptyStateProps = {
  title: string;
  description: string;
  actionLabel?: string;
  onAction?: () => void;
};

export const EmptyState = ({ title, description, actionLabel, onAction }: EmptyStateProps) => (
  <div className="rounded-2xl border border-dashed border-slate-300 bg-white p-8 text-center shadow-sm">
    <h3 className="text-xl font-semibold text-slate-900">{title}</h3>
    <p className="mt-2 text-sm text-slate-600">{description}</p>
    {actionLabel && onAction ? (
      <div className="mt-5 flex justify-center">
        <Button onClick={onAction}>{actionLabel}</Button>
      </div>
    ) : null}
  </div>
);
