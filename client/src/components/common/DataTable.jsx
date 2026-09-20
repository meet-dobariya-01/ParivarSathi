import React, { useState, useMemo } from 'react';
import { ArrowUpDown, ArrowUp, ArrowDown } from 'lucide-react';

const DataTable = ({
  columns = [],
  data = [],
  keyField = '_id',
  emptyMessage = 'No records found.',
  className = '',
  zebra = true,
  mobileCardView = true,
}) => {
  const [sortKey, setSortKey] = useState(null);
  const [sortDirection, setSortDirection] = useState('asc'); // 'asc' | 'desc'

  const handleSort = (colKey) => {
    if (sortKey === colKey) {
      if (sortDirection === 'asc') setSortDirection('desc');
      else {
        setSortKey(null);
        setSortDirection('asc');
      }
    } else {
      setSortKey(colKey);
      setSortDirection('asc');
    }
  };

  const sortedData = useMemo(() => {
    if (!sortKey) return data;
    return [...data].sort((a, b) => {
      const aVal = a[sortKey];
      const bVal = b[sortKey];
      if (aVal === bVal) return 0;
      if (aVal === undefined || aVal === null) return 1;
      if (bVal === undefined || bVal === null) return -1;

      if (typeof aVal === 'string') {
        const res = aVal.localeCompare(bVal);
        return sortDirection === 'asc' ? res : -res;
      }
      return sortDirection === 'asc' ? (aVal > bVal ? 1 : -1) : (aVal < bVal ? 1 : -1);
    });
  }, [data, sortKey, sortDirection]);

  if (!data || data.length === 0) {
    return (
      <div className="py-12 text-center text-gov-text-muted bg-white border border-gov-border rounded-md">
        <p className="text-sm font-medium">{emptyMessage}</p>
      </div>
    );
  }

  return (
    <div className={`w-full overflow-hidden border border-gov-border rounded-md bg-white ${className}`}>
      {/* Desktop & Tablet Table View */}
      <div className={`overflow-x-auto ${mobileCardView ? 'hidden md:block' : 'block'}`}>
        <table className="w-full text-left border-collapse text-sm">
          <thead className="bg-slate-100 border-b border-gov-border sticky top-0 z-10">
            <tr>
              {columns.map((col) => {
                const isSortable = col.sortable !== false && col.accessor;
                const isCurrentSort = sortKey === col.accessor;
                return (
                  <th
                    key={col.key || col.accessor || col.header}
                    scope="col"
                    aria-sort={isCurrentSort ? (sortDirection === 'asc' ? 'ascending' : 'descending') : 'none'}
                    className={`py-3 px-4 text-xs font-bold uppercase tracking-wider text-gov-navy select-none ${
                      isSortable ? 'cursor-pointer hover:bg-slate-200' : ''
                    } ${col.headerClassName || ''}`}
                    onClick={() => isSortable && handleSort(col.accessor)}
                  >
                    <div className="flex items-center gap-1.5">
                      <span>{col.header}</span>
                      {isSortable && (
                        <span className="text-gov-text-muted">
                          {isCurrentSort ? (
                            sortDirection === 'asc' ? (
                              <ArrowUp size={14} className="text-gov-navy" />
                            ) : (
                              <ArrowDown size={14} className="text-gov-navy" />
                            )
                          ) : (
                            <ArrowUpDown size={13} className="opacity-40" />
                          )}
                        </span>
                      )}
                    </div>
                  </th>
                );
              })}
            </tr>
          </thead>
          <tbody className="divide-y divide-gov-border">
            {sortedData.map((row, idx) => (
              <tr
                key={row[keyField] || idx}
                className={`transition-colors hover:bg-blue-50/50 ${
                  zebra && idx % 2 === 1 ? 'bg-slate-50/70' : 'bg-white'
                }`}
              >
                {columns.map((col) => (
                  <td
                    key={col.key || col.accessor || col.header}
                    className={`py-3.5 px-4 text-gov-text ${col.cellClassName || ''}`}
                  >
                    {col.render
                      ? col.render(row, idx)
                      : col.accessor
                      ? row[col.accessor]
                      : null}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Responsive Mobile Cards View (for screen width < 768px) */}
      {mobileCardView && (
        <div className="md:hidden divide-y divide-gov-border p-3 space-y-3">
          {sortedData.map((row, idx) => (
            <div
              key={row[keyField] || idx}
              className="p-4 bg-white border border-gov-border rounded-md shadow-gov-sm space-y-2.5"
            >
              {columns.map((col) => (
                <div key={col.key || col.accessor || col.header} className="flex justify-between items-start gap-2 text-xs">
                  <span className="font-bold text-gov-navy shrink-0">{col.header}:</span>
                  <div className="text-right text-gov-text">
                    {col.render
                      ? col.render(row, idx)
                      : col.accessor
                      ? row[col.accessor]
                      : null}
                  </div>
                </div>
              ))}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default DataTable;
