import { useDeferredValue, useMemo, useState, type ReactNode } from 'react';
import { ArrowDown, ArrowUp, ArrowUpDown } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { cn } from '@/lib/utils';

type CellAlign = 'left' | 'center' | 'right';
type SortDirection = 'asc' | 'desc';

export type AdminTableColumn<TData> = {
  key: keyof TData | string;
  title: ReactNode;
  width?: string;
  align?: CellAlign;
  sortable?: boolean;
  render?: (row: TData, rowIndex: number) => ReactNode;
  sortValue?: (row: TData) => string | number | boolean | null | undefined;
  headerClassName?: string;
  cellClassName?: string;
};

export type AdminDataTableProps<TData> = {
  title?: string;
  description?: string;
  toolbar?: ReactNode;
  columns: AdminTableColumn<TData>[];
  data: TData[];
  loading?: boolean;
  emptyText?: string;
  striped?: boolean;
  pageSize?: number;
  onRowClick?: (row: TData) => void;
  getRowKey?: (row: TData, rowIndex: number) => string | number;
};

function getAlignClassName(align: CellAlign = 'left') {
  if (align === 'center') return 'text-center';
  if (align === 'right') return 'text-right';
  return 'text-left';
}

function compareValues(left: string | number | boolean | null | undefined, right: string | number | boolean | null | undefined) {
  if (left == null && right == null) return 0;
  if (left == null) return 1;
  if (right == null) return -1;

  if (typeof left === 'number' && typeof right === 'number') {
    return left - right;
  }

  if (typeof left === 'boolean' && typeof right === 'boolean') {
    return Number(left) - Number(right);
  }

  return String(left).localeCompare(String(right), 'vi', { numeric: true, sensitivity: 'base' });
}

function defaultSortValue<TData>(column: AdminTableColumn<TData>, row: TData) {
  if (column.sortValue) return column.sortValue(row);
  if (typeof column.key === 'string' && column.key in (row as object)) {
    return (row as Record<string, string | number | boolean | null | undefined>)[column.key];
  }
  return undefined;
}

function renderSortIcon(active: boolean, direction: SortDirection | null) {
  if (!active) return <ArrowUpDown className="h-3.5 w-3.5 text-slate-400" />;
  if (direction === 'asc') return <ArrowUp className="h-3.5 w-3.5 text-slate-700" />;
  return <ArrowDown className="h-3.5 w-3.5 text-slate-700" />;
}

export function AdminDataTable<TData>({
  title,
  description,
  toolbar,
  columns,
  data,
  loading = false,
  emptyText = 'Chưa có dữ liệu.',
  striped = true,
  pageSize = 10,
  onRowClick,
  getRowKey,
}: AdminDataTableProps<TData>) {
  const [sortState, setSortState] = useState<{ key: string; direction: SortDirection } | null>(null);
  const [page, setPage] = useState(1);
  const deferredData = useDeferredValue(data);

  const sortedData = useMemo(() => {
    if (!sortState) return deferredData;

    const targetColumn = columns.find((column) => String(column.key) === sortState.key);
    if (!targetColumn) return deferredData;

    const cloned = [...deferredData];
    cloned.sort((left, right) => {
      const result = compareValues(defaultSortValue(targetColumn, left), defaultSortValue(targetColumn, right));
      return sortState.direction === 'asc' ? result : -result;
    });
    return cloned;
  }, [columns, deferredData, sortState]);

  const totalPages = Math.max(1, Math.ceil(sortedData.length / pageSize));
  const currentPage = Math.min(page, totalPages);

  const paginatedData = useMemo(() => {
    const start = (currentPage - 1) * pageSize;
    return sortedData.slice(start, start + pageSize);
  }, [currentPage, pageSize, sortedData]);

  const handleSort = (column: AdminTableColumn<TData>) => {
    if (!column.sortable) return;

    setPage(1);
    setSortState((prev) => {
      if (!prev || prev.key !== String(column.key)) {
        return { key: String(column.key), direction: 'asc' };
      }
      if (prev.direction === 'asc') {
        return { key: prev.key, direction: 'desc' };
      }
      return null;
    });
  };

  const skeletonRows = Array.from({ length: Math.min(pageSize, 5) }, (_, index) => index);

  return (
    <Card className="rounded-3xl border border-slate-200 bg-white py-0 shadow-sm">
      {(title || description || toolbar) && (
        <CardHeader className="gap-4 border-b border-slate-200 px-5 py-4 md:flex md:flex-row md:items-center md:justify-between">
          <div>
            {title ? <CardTitle className="text-base font-semibold text-slate-900">{title}</CardTitle> : null}
            {description ? <p className="mt-1 text-sm text-slate-500">{description}</p> : null}
          </div>
          {toolbar ? <div className="flex items-center gap-2">{toolbar}</div> : null}
        </CardHeader>
      )}

      <CardContent className="px-0">
        <Table>
          <TableHeader className="bg-slate-50/80">
            <TableRow className="hover:bg-transparent">
              {columns.map((column) => {
                const isActive = sortState?.key === String(column.key);
                const alignClassName = getAlignClassName(column.align);

                return (
                  <TableHead
                    key={String(column.key)}
                    className={cn(alignClassName, column.headerClassName)}
                    style={column.width ? { width: column.width } : undefined}
                  >
                    {column.sortable ? (
                      <button
                        type="button"
                        onClick={() => handleSort(column)}
                        className={cn(
                          'inline-flex items-center gap-1.5 transition-colors hover:text-slate-900',
                          column.align === 'center' && 'mx-auto',
                          column.align === 'right' && 'ml-auto'
                        )}
                      >
                        <span>{column.title}</span>
                        {renderSortIcon(isActive, isActive ? sortState?.direction ?? null : null)}
                      </button>
                    ) : (
                      column.title
                    )}
                  </TableHead>
                );
              })}
            </TableRow>
          </TableHeader>

          <TableBody>
            {loading
              ? skeletonRows.map((rowIndex) => (
                  <TableRow key={`skeleton-${rowIndex}`} className="hover:bg-transparent">
                    {columns.map((column) => (
                      <TableCell key={`${String(column.key)}-${rowIndex}`} className={cn(getAlignClassName(column.align), column.cellClassName)}>
                        <div className="h-4 animate-pulse rounded-full bg-slate-200" />
                      </TableCell>
                    ))}
                  </TableRow>
                ))
              : null}

            {!loading && paginatedData.length
              ? paginatedData.map((row, rowIndex) => (
                  <TableRow
                    key={String(getRowKey ? getRowKey(row, rowIndex) : rowIndex)}
                    onClick={onRowClick ? () => onRowClick(row) : undefined}
                    className={cn(
                      striped && rowIndex % 2 === 1 && 'bg-slate-50/60',
                      onRowClick && 'cursor-pointer hover:bg-sky-50'
                    )}
                  >
                    {columns.map((column) => (
                      <TableCell key={String(column.key)} className={cn(getAlignClassName(column.align), column.cellClassName)}>
                        {column.render ? column.render(row, rowIndex) : String(defaultSortValue(column, row) ?? '')}
                      </TableCell>
                    ))}
                  </TableRow>
                ))
              : null}

            {!loading && !paginatedData.length ? (
              <TableRow className="hover:bg-transparent">
                <TableCell colSpan={columns.length} className="py-12 text-center text-sm text-slate-500">
                  {emptyText}
                </TableCell>
              </TableRow>
            ) : null}
          </TableBody>
        </Table>
      </CardContent>

      <CardFooter className="flex flex-col gap-3 border-t border-slate-200 bg-white px-5 py-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="text-sm text-slate-500">
          {loading ? 'Đang tải dữ liệu...' : `Tổng ${sortedData.length} bản ghi`}
        </div>

        <div className="flex items-center gap-2">
          <Button type="button" variant="outline" onClick={() => setPage((prev) => Math.max(1, prev - 1))} disabled={currentPage === 1 || loading}>
            Trước
          </Button>
          <div className="min-w-24 text-center text-sm font-medium text-slate-700">
            {currentPage}/{totalPages}
          </div>
          <Button
            type="button"
            variant="outline"
            onClick={() => setPage((prev) => Math.min(totalPages, prev + 1))}
            disabled={currentPage === totalPages || loading}
          >
            Sau
          </Button>
        </div>
      </CardFooter>
    </Card>
  );
}
