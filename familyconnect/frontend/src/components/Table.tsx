import type { ReactNode } from "react";

type Column<T> = {
  key: keyof T | string;
  header: string;
  render?: (row: T) => ReactNode;
};

type TableProps<T> = {
  columns: Array<Column<T>>;
  data: T[];
  emptyMessage?: string;
};

export const Table = <T,>({ columns, data, emptyMessage = "No records available." }: TableProps<T>) => {
  if (!data.length) {
    return (
      <div className="rounded-xl border border-dashed border-slate-200 bg-slate-50 p-6 text-center text-sm text-slate-500">
        {emptyMessage}
      </div>
    );
  }

  return (
    <div className="overflow-x-auto rounded-2xl border border-slate-200 bg-white">
      <table className="min-w-full divide-y divide-slate-200 text-left text-sm text-slate-700">
        <thead className="bg-slate-50">
          <tr>
            {columns.map((column) => (
              <th key={String(column.key)} className="px-4 py-3 font-semibold text-slate-700">
                {column.header}
              </th>
            ))}
          </tr>
        </thead>
        <tbody className="divide-y divide-slate-100">
          {data.map((row, rowIndex) => (
            <tr key={rowIndex} className="hover:bg-slate-50">
              {columns.map((column) => (
                <td key={`${String(column.key)}-${rowIndex}`} className="px-4 py-3 align-top">
                  {column.render ? column.render(row) : String((row as Record<string, unknown>)[column.key as string] ?? "-")}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};
