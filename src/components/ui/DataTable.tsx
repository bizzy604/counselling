import type { ReactNode } from "react";

import { cn } from "@/lib/utils";

type Column<T> = {
  header: string;
  accessor: keyof T | ((row: T) => ReactNode);
  className?: string;
};

type DataTableProps<T> = {
  columns: Column<T>[];
  data: T[];
  rowKey: (row: T) => string;
  onRowClick?: (row: T) => void;
  emptyMessage?: string;
  crisisRowKey?: (row: T) => boolean;
};

export function DataTable<T>({
  columns,
  crisisRowKey,
  data,
  emptyMessage = "No data available.",
  onRowClick,
  rowKey,
}: DataTableProps<T>) {
  return (
    <div className="overflow-x-auto rounded-[var(--radius-xl)] border border-[var(--border-subtle)] shadow-[var(--shadow-xs)]">
      <table className="w-full border-collapse font-[family-name:var(--font-body)] text-sm">
        <thead className="border-b border-[var(--border-default)] bg-[var(--bg-surface-raised)]">
          <tr>
            {columns.map((col) => (
              <th
                className={cn(
                  "px-4 py-3 text-left text-xs font-semibold uppercase tracking-[0.05em] text-[var(--text-secondary)] whitespace-nowrap",
                  col.className,
                )}
                key={col.header}
              >
                {col.header}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {data.length === 0 ? (
            <tr>
              <td
                className="px-4 py-8 text-center text-[var(--text-tertiary)]"
                colSpan={columns.length}
              >
                {emptyMessage}
              </td>
            </tr>
          ) : (
            data.map((row) => {
              const isCrisis = crisisRowKey?.(row);

              return (
                <tr
                  className={cn(
                    "border-b border-[var(--border-subtle)] last:border-b-0",
                    isCrisis
                      ? "border-l-[3px] border-l-[var(--jasper-400)] bg-[var(--danger-surface)]"
                      : "hover:bg-[var(--bg-surface-raised)]",
                    onRowClick && "cursor-pointer",
                  )}
                  key={rowKey(row)}
                  onClick={onRowClick ? () => onRowClick(row) : undefined}
                >
                  {columns.map((col) => (
                    <td
                      className={cn(
                        "px-4 py-4 align-middle text-[var(--text-primary)]",
                        col.className,
                      )}
                      key={col.header}
                    >
                      {typeof col.accessor === "function"
                        ? col.accessor(row)
                        : (row[col.accessor] as ReactNode)}
                    </td>
                  ))}
                </tr>
              );
            })
          )}
        </tbody>
      </table>
    </div>
  );
}
