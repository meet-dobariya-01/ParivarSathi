type StatusBadgeProps = {
  status: string;
};

const statusStyles: Record<string, string> = {
  SUBMITTED: "bg-blue-100 text-blue-800 border-blue-300",
  UNDER_REVIEW: "bg-amber-100 text-amber-800 border-amber-300",
  APPROVED: "bg-green-100 text-green-800 border-green-300",
  REJECTED: "bg-red-100 text-red-800 border-red-300",
  DRAFT: "bg-gray-100 text-gray-700 border-gray-300",
};

export const StatusBadge = ({ status }: StatusBadgeProps) => {
  const normalizedStatus = (status || "").toUpperCase();
  const badgeClass = statusStyles[normalizedStatus] || "bg-gray-100 text-gray-700 border-gray-200";

  return (
    <span
      className={[
        "inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold uppercase tracking-wider shadow-sm",
        badgeClass,
      ].join(" ")}
    >
      {normalizedStatus.replace(/_/g, " ") || "UNKNOWN"}
    </span>
  );
};
