import { useCallback, useEffect, useMemo, useState } from 'react';
import { CheckCircle2, Circle, Eye, PhoneCall, RefreshCw, X } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { useAppToast } from '@/components/ui/toast';
import {
  markAdminContactRequestViewed,
  markAdminContactRequestsViewed,
  listAdminContactRequests,
  updateAdminContactRequestStatus,
  type AdminContactRequest,
  type AdminContactRequestStatus,
} from '../api/adminApi';
import { AdminDataTable, type AdminTableColumn } from '../components/AdminDataTable';

type ContactRequestRow = {
  id: number;
  fullName: string;
  phone: string;
  email: string;
  content: string;
  vehicleId: number | null;
  status: AdminContactRequestStatus;
  isViewed: boolean;
  statusLabel: string;
  createdAt: string;
  contactedAt: string;
};

function translateStatus(status: AdminContactRequestStatus) {
  switch (status) {
    case 'new':
      return 'Mới';
    case 'contacted':
      return 'Đã liên hệ';
    case 'closed':
      return 'Đã đóng';
    default:
      return status;
  }
}

function formatDate(value: string | null) {
  if (!value) return '-';
  const parsed = new Date(value);
  if (Number.isNaN(parsed.getTime())) return value;
  return new Intl.DateTimeFormat('vi-VN', {
    dateStyle: 'short',
    timeStyle: 'short',
  }).format(parsed);
}

function mapToRow(item: AdminContactRequest): ContactRequestRow {
  return {
    id: item.id,
    fullName: item.fullName,
    phone: item.phone,
    email: item.email || '-',
    content: item.content || '-',
    vehicleId: item.vehicleId,
    status: item.status,
    isViewed: item.isViewed,
    statusLabel: translateStatus(item.status),
    createdAt: formatDate(item.createdAt),
    contactedAt: formatDate(item.contactedAt),
  };
}

function StatusBadge({ row }: { row: ContactRequestRow }) {
  let className = 'border-amber-200 bg-amber-50 text-amber-700';
  if (row.status === 'contacted') className = 'border-sky-200 bg-sky-50 text-sky-700';
  if (row.status === 'closed') className = 'border-emerald-200 bg-emerald-50 text-emerald-700';

  return (
    <div className="flex flex-col items-center gap-1">
      <Badge variant="outline" className={className}>
        {row.statusLabel}
      </Badge>
      {!row.isViewed ? (
        <span className="inline-flex rounded-full bg-red-50 px-2 py-0.5 text-[10px] font-semibold text-red-600 ring-1 ring-red-200">
          Chưa xem
        </span>
      ) : null}
    </div>
  );
}

export function AdminContactRequestsPage({ onViewedChange }: { onViewedChange?: () => Promise<void> | void }) {
  const { showToast } = useAppToast();
  const [items, setItems] = useState<AdminContactRequest[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState('');
  const [keyword, setKeyword] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | AdminContactRequestStatus>('all');
  const [selectedIds, setSelectedIds] = useState<number[]>([]);
  const [detailRow, setDetailRow] = useState<ContactRequestRow | null>(null);

  const loadItems = useCallback(async () => {
    try {
      setIsLoading(true);
      setError('');
      const data = await listAdminContactRequests(statusFilter);
      setItems(data);
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Không thể tải danh sách liên hệ.';
      setError(message);
      setItems([]);
    } finally {
      setIsLoading(false);
    }
  }, [statusFilter]);

  useEffect(() => {
    void loadItems();
  }, [loadItems]);

  const rows = useMemo(() => items.map(mapToRow), [items]);

  const filteredRows = useMemo(() => {
    const normalizedKeyword = keyword.trim().toLowerCase();

    return rows.filter((row) => {
      if (!normalizedKeyword) return true;
      const source = `${row.fullName} ${row.phone} ${row.email} ${row.content} ${row.statusLabel}`.toLowerCase();
      return source.includes(normalizedKeyword);
    });
  }, [keyword, rows]);

  const filteredRowIds = useMemo(() => filteredRows.map((row) => row.id), [filteredRows]);
  const selectedFilteredIds = useMemo(() => selectedIds.filter((id) => filteredRowIds.includes(id)), [filteredRowIds, selectedIds]);
  const allSelected = filteredRows.length > 0 && selectedFilteredIds.length === filteredRows.length;
  const selectedRows = useMemo(() => filteredRows.filter((row) => selectedIds.includes(row.id)), [filteredRows, selectedIds]);
  const selectedUnviewedRows = useMemo(() => selectedRows.filter((row) => !row.isViewed), [selectedRows]);
  const unviewedRows = useMemo(() => rows.filter((row) => !row.isViewed), [rows]);

  const toggleSelectAll = useCallback(() => {
    setSelectedIds((prev) => {
      if (allSelected) {
        return prev.filter((id) => !filteredRowIds.includes(id));
      }

      return Array.from(new Set([...prev, ...filteredRowIds]));
    });
  }, [allSelected, filteredRowIds]);

  const toggleSelectOne = useCallback((id: number) => {
    setSelectedIds((prev) => (prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]));
  }, []);

  const syncDetailRow = useCallback((nextRow: ContactRequestRow | null) => {
    setDetailRow((prev) => {
      if (!prev || !nextRow || prev.id !== nextRow.id) {
        return prev;
      }
      return nextRow;
    });
  }, []);

  const handleStatusChange = useCallback(
    async (row: ContactRequestRow, status: AdminContactRequestStatus) => {
      try {
        setIsSaving(true);
        setError('');
        const updated = await updateAdminContactRequestStatus(row.id, status);
        const nextRow = mapToRow(updated);
        syncDetailRow(nextRow);
        await loadItems();
        await onViewedChange?.();
        showToast({ type: 'success', message: `Đã cập nhật trạng thái liên hệ #${row.id}.` });
      } catch (err) {
        const message = err instanceof Error ? err.message : 'Không thể cập nhật trạng thái liên hệ.';
        setError(message);
        showToast({ type: 'error', message });
      } finally {
        setIsSaving(false);
      }
    },
    [loadItems, onViewedChange, showToast, syncDetailRow],
  );

  const handleBulkStatusChange = useCallback(
    async (status: AdminContactRequestStatus) => {
      if (!selectedRows.length) {
        return;
      }

      try {
        setIsSaving(true);
        setError('');
        await Promise.all(selectedRows.map((row) => updateAdminContactRequestStatus(row.id, status)));
        setSelectedIds([]);
        await loadItems();
        await onViewedChange?.();
        showToast({ type: 'success', message: `Đã cập nhật ${selectedRows.length} yêu cầu sang trạng thái ${translateStatus(status)}.` });
      } catch (err) {
        const message = err instanceof Error ? err.message : 'Không thể cập nhật các yêu cầu đã chọn.';
        setError(message);
        showToast({ type: 'error', message });
      } finally {
        setIsSaving(false);
      }
    },
    [loadItems, onViewedChange, selectedRows, showToast],
  );

  const handleMarkAllViewed = useCallback(async () => {
    try {
      setIsSaving(true);
      setError('');
      const result = await markAdminContactRequestsViewed();
      setSelectedIds([]);
      await loadItems();
      await onViewedChange?.();
      showToast({ type: 'success', message: `Đã đánh dấu ${result.updatedCount} yêu cầu là đã xem.` });
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Không thể đánh dấu đã xem.';
      setError(message);
      showToast({ type: 'error', message });
    } finally {
      setIsSaving(false);
    }
  }, [loadItems, onViewedChange, showToast]);

  const handleMarkSelectedViewed = useCallback(async () => {
    if (!selectedUnviewedRows.length) {
      return;
    }

    try {
      setIsSaving(true);
      setError('');
      await Promise.all(selectedUnviewedRows.map((row) => markAdminContactRequestViewed(row.id)));
      setSelectedIds((prev) => prev.filter((id) => !selectedUnviewedRows.some((row) => row.id === id)));
      await loadItems();
      await onViewedChange?.();
      showToast({ type: 'success', message: `Đã đánh dấu ${selectedUnviewedRows.length} yêu cầu đã chọn là đã xem.` });
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Không thể đánh dấu các yêu cầu đã chọn.';
      setError(message);
      showToast({ type: 'error', message });
    } finally {
      setIsSaving(false);
    }
  }, [loadItems, onViewedChange, selectedUnviewedRows, showToast]);

  const openDetail = useCallback(
    async (row: ContactRequestRow) => {
      try {
        setIsSaving(true);
        setError('');

        let nextRow = row;
        if (!row.isViewed) {
          const updated = await markAdminContactRequestViewed(row.id);
          nextRow = mapToRow(updated);
          await onViewedChange?.();
        }

        setDetailRow(nextRow);
        await loadItems();
      } catch (err) {
        const message = err instanceof Error ? err.message : 'Không thể mở chi tiết yêu cầu liên hệ.';
        setError(message);
        showToast({ type: 'error', message });
      } finally {
        setIsSaving(false);
      }
    },
    [loadItems, onViewedChange, showToast],
  );

  const columns = useMemo<AdminTableColumn<ContactRequestRow>[]>(
    () => [
      {
        key: 'select',
        title: (
          <input
            type="checkbox"
            aria-label="Chọn tất cả yêu cầu liên hệ"
            checked={allSelected}
            onChange={toggleSelectAll}
            className="h-4 w-4 rounded border-slate-300"
          />
        ),
        width: '56px',
        align: 'center',
        headerClassName: 'w-14',
        render: (row) => (
          <input
            type="checkbox"
            aria-label={`Chọn yêu cầu liên hệ ${row.fullName}`}
            checked={selectedIds.includes(row.id)}
            onChange={() => toggleSelectOne(row.id)}
            onClick={(event) => event.stopPropagation()}
            className="h-4 w-4 rounded border-slate-300"
          />
        ),
      },
      {
        key: 'id',
        title: 'ID',
        width: '72px',
        sortable: true,
        align: 'center',
      },
      {
        key: 'fullName',
        title: 'Khách hàng',
        sortable: true,
        render: (row) => (
          <div className="space-y-1 text-left">
            <div className="font-semibold text-slate-950">{row.fullName}</div>
            <div className="text-xs text-slate-500">{row.phone}</div>
            <div className="text-xs text-slate-500">{row.email}</div>
          </div>
        ),
      },
      {
        key: 'content',
        title: 'Nội dung',
        render: (row) => <div className="line-clamp-3 max-w-[420px] whitespace-pre-line text-sm text-slate-700">{row.content}</div>,
      },
      {
        key: 'vehicleId',
        title: 'Xe',
        align: 'center',
        sortable: true,
        sortValue: (row) => row.vehicleId || 0,
        render: (row) => <span className="text-sm text-slate-700">{row.vehicleId ? `#${row.vehicleId}` : '-'}</span>,
      },
      {
        key: 'createdAt',
        title: 'Ngày tạo',
        sortable: true,
        render: (row) => <span className="text-sm text-slate-700">{row.createdAt}</span>,
      },
      {
        key: 'contactedAt',
        title: 'Đã liên hệ',
        sortable: true,
        render: (row) => <span className="text-sm text-slate-700">{row.contactedAt}</span>,
      },
      {
        key: 'statusLabel',
        title: 'Trạng thái',
        sortable: true,
        align: 'center',
        render: (row) => <StatusBadge row={row} />,
      },
      {
        key: 'actions',
        title: 'Thao tác',
        align: 'right',
        render: (row) => (
          <div className="flex items-center justify-end gap-2">
            <Button
              type="button"
              variant="outline"
              size="icon-sm"
              aria-label={`Đánh dấu đã liên hệ ${row.fullName}`}
              title={`Đánh dấu đã liên hệ ${row.fullName}`}
              onClick={(event) => {
                event.stopPropagation();
                void handleStatusChange(row, 'contacted');
              }}
              disabled={isSaving || row.status === 'contacted'}
            >
              <PhoneCall className="h-4 w-4" />
            </Button>
            <Button
              type="button"
              variant="outline"
              size="icon-sm"
              aria-label={`Đóng yêu cầu ${row.fullName}`}
              title={`Đóng yêu cầu ${row.fullName}`}
              onClick={(event) => {
                event.stopPropagation();
                void handleStatusChange(row, 'closed');
              }}
              disabled={isSaving || row.status === 'closed'}
            >
              <CheckCircle2 className="h-4 w-4" />
            </Button>
            <Button
              type="button"
              variant="outline"
              size="icon-sm"
              aria-label={`Đánh dấu mới ${row.fullName}`}
              title={`Đánh dấu mới ${row.fullName}`}
              onClick={(event) => {
                event.stopPropagation();
                void handleStatusChange(row, 'new');
              }}
              disabled={isSaving || row.status === 'new'}
            >
              <Circle className="h-4 w-4" />
            </Button>
            <Button
              type="button"
              variant="outline"
              size="icon-sm"
              aria-label={`Xem ${row.fullName}`}
              title={`Xem ${row.fullName}`}
              onClick={(event) => {
                event.stopPropagation();
                void openDetail(row);
              }}
              disabled={isSaving}
            >
              <Eye className="h-4 w-4" />
            </Button>
          </div>
        ),
      },
    ],
    [allSelected, handleStatusChange, isSaving, openDetail, selectedIds, toggleSelectAll, toggleSelectOne],
  );

  return (
    <>
      <div className="space-y-4">
        {error ? <div className="rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">{error}</div> : null}

        <AdminDataTable
          columns={columns}
          data={filteredRows}
          loading={isLoading}
          emptyText="Chưa có yêu cầu liên hệ."
          getRowKey={(row) => row.id}
          onRowClick={(row) => void openDetail(row)}
          filters={
            <div className="space-y-3 rounded-2xl border border-slate-200 bg-white/80 p-4 shadow-sm backdrop-blur">
              <div className="grid gap-3 md:grid-cols-[minmax(0,1.5fr)_220px]">
                <input
                  value={keyword}
                  onChange={(event) => setKeyword(event.target.value)}
                  placeholder="Tìm theo tên, điện thoại, email hoặc nội dung..."
                  className="h-11 rounded-xl border border-slate-200 bg-white px-3 text-sm text-slate-900 outline-none transition focus:border-sky-300"
                />

                <select
                  value={statusFilter}
                  onChange={(event) => setStatusFilter(event.target.value as 'all' | AdminContactRequestStatus)}
                  aria-label="Lọc trạng thái liên hệ"
                  title="Lọc trạng thái liên hệ"
                  className="h-11 rounded-xl border border-slate-200 bg-white px-3 text-sm text-slate-900 outline-none transition focus:border-sky-300"
                >
                  <option value="all">Tất cả trạng thái</option>
                  <option value="new">Mới</option>
                  <option value="contacted">Đã liên hệ</option>
                  <option value="closed">Đã đóng</option>
                </select>
              </div>

              <div className="text-sm text-slate-500">Hiển thị {filteredRows.length}/{rows.length} yêu cầu liên hệ</div>
            </div>
          }
          toolbar={
            <div className="flex flex-wrap items-center gap-2">
              {selectedIds.length > 0 ? (
                <>
                  <Button type="button" onClick={() => void handleBulkStatusChange('new')} disabled={isLoading || isSaving} className="bg-[#135a91] text-white hover:bg-[#0f4b78]">
                    Mới
                  </Button>
                  <Button type="button" onClick={() => void handleBulkStatusChange('contacted')} disabled={isLoading || isSaving} className="bg-[#135a91] text-white hover:bg-[#0f4b78]">
                    Đã liên hệ
                  </Button>
                  <Button type="button" onClick={() => void handleBulkStatusChange('closed')} disabled={isLoading || isSaving} className="bg-[#135a91] text-white hover:bg-[#0f4b78]">
                    Đã đóng
                  </Button>
                  <Button type="button" onClick={() => void handleMarkSelectedViewed()} disabled={isLoading || isSaving || selectedUnviewedRows.length === 0} className="bg-slate-900 text-white hover:bg-slate-800">
                    Đánh dấu đã xem
                  </Button>
                </>
              ) : unviewedRows.length > 0 ? (
                <Button type="button" onClick={() => void handleMarkAllViewed()} disabled={isLoading || isSaving} className="bg-slate-900 text-white hover:bg-slate-800">
                  Đánh dấu tất cả đã xem ({unviewedRows.length})
                </Button>
              ) : null}

              <Button type="button" onClick={() => void loadItems()} disabled={isLoading || isSaving} className="bg-[#135a91] text-white hover:bg-[#0f4b78]">
                <RefreshCw className={['h-4 w-4', isLoading ? 'animate-spin' : ''].join(' ')} />
                {isLoading ? 'Đang tải...' : 'Tải lại'}
              </Button>
            </div>
          }
        />
      </div>

      {detailRow ? (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/50 px-4 py-6 backdrop-blur-sm">
          <div className="w-full max-w-3xl rounded-3xl border border-slate-200 bg-white shadow-2xl">
            <div className="flex items-start justify-between border-b border-slate-200 px-6 py-5">
              <div className="space-y-2">
                <div className="flex items-center gap-3">
                  <h3 className="text-2xl font-black text-slate-950">{detailRow.fullName}</h3>
                  <StatusBadge row={detailRow} />
                </div>
                <p className="text-sm text-slate-500">Yêu cầu liên hệ #{detailRow.id}</p>
              </div>

              <Button type="button" variant="outline" size="icon-sm" onClick={() => setDetailRow(null)} disabled={isSaving}>
                <X className="h-4 w-4" />
              </Button>
            </div>

            <div className="grid gap-6 px-6 py-5 md:grid-cols-2">
              <div className="space-y-4">
                <div>
                  <div className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-400">Điện thoại</div>
                  <div className="mt-1 text-base font-semibold text-slate-900">{detailRow.phone}</div>
                </div>
                <div>
                  <div className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-400">Email</div>
                  <div className="mt-1 text-base text-slate-900">{detailRow.email}</div>
                </div>
                <div>
                  <div className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-400">Xe quan tâm</div>
                  <div className="mt-1 text-base text-slate-900">{detailRow.vehicleId ? `#${detailRow.vehicleId}` : '-'}</div>
                </div>
              </div>

              <div className="space-y-4">
                <div>
                  <div className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-400">Ngày tạo</div>
                  <div className="mt-1 text-base text-slate-900">{detailRow.createdAt}</div>
                </div>
                <div>
                  <div className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-400">Đã liên hệ</div>
                  <div className="mt-1 text-base text-slate-900">{detailRow.contactedAt}</div>
                </div>
                <div>
                  <div className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-400">Tình trạng xem</div>
                  <div className="mt-1 text-base text-slate-900">{detailRow.isViewed ? 'Đã xem' : 'Chưa xem'}</div>
                </div>
              </div>
            </div>

            <div className="border-t border-slate-200 px-6 py-5">
              <div className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-400">Nội dung</div>
              <div className="mt-2 whitespace-pre-line rounded-2xl bg-slate-50 p-4 text-sm leading-6 text-slate-800">{detailRow.content}</div>
            </div>

            <div className="flex flex-wrap items-center justify-end gap-3 border-t border-slate-200 px-6 py-5">
              <Button type="button" onClick={() => void handleStatusChange(detailRow, 'new')} disabled={isSaving || detailRow.status === 'new'} className="bg-[#135a91] text-white hover:bg-[#0f4b78]">
                Mới
              </Button>
              <Button type="button" onClick={() => void handleStatusChange(detailRow, 'contacted')} disabled={isSaving || detailRow.status === 'contacted'} className="bg-[#135a91] text-white hover:bg-[#0f4b78]">
                Đã liên hệ
              </Button>
              <Button type="button" onClick={() => void handleStatusChange(detailRow, 'closed')} disabled={isSaving || detailRow.status === 'closed'} className="bg-[#135a91] text-white hover:bg-[#0f4b78]">
                Đã đóng
              </Button>
              <Button type="button" variant="outline" onClick={() => setDetailRow(null)} disabled={isSaving}>
                Đóng
              </Button>
            </div>
          </div>
        </div>
      ) : null}
    </>
  );
}
