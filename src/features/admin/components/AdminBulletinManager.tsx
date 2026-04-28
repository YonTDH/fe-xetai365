import { useCallback, useEffect, useMemo, useState } from 'react';
import { CheckCircle2, Circle, Eye, Pencil, Plus, RefreshCw, Trash2 } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { useAppToast } from '@/components/ui/toast';
import {
  createAdminBulletin,
  deleteAdminBulletin,
  getAdminBulletinDetail,
  listAdminBulletins,
  updateAdminBulletin,
  type AdminBulletin,
  type AdminBulletinPayload,
  type AdminBulletinStatus,
  type AdminBulletinType,
} from '../api/adminApi';
import { AdminDataTable, type AdminTableColumn } from './AdminDataTable';
import { AdminTableFilters } from './AdminTableFilters';
import { AdminBulletinModal } from './AdminBulletinModal';

type AdminBulletinManagerProps = {
  type: AdminBulletinType;
  heading: string;
  description: string;
};

type BulletinRow = {
  id: number;
  title: string;
  slug: string;
  publishedAt: string;
  isVisible: boolean;
  isFeatured: boolean;
  status: AdminBulletinStatus;
  statusLabel: string;
};

type ModalState = {
  mode: 'view' | 'edit' | 'create';
  item: AdminBulletin | null;
} | null;

type DeleteState = {
  id: number;
  title: string;
} | null;

function translateBulletinStatus(status: AdminBulletinStatus) {
  switch (status) {
    case 'draft':
      return 'Bản nháp';
    case 'published':
      return 'Hiển thị';
    case 'archived':
      return 'Lưu trữ';
    default:
      return status;
  }
}

function formatPublishedAt(value: string | null) {
  if (!value) return 'Chưa đặt lịch';
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value;
  return new Intl.DateTimeFormat('vi-VN', {
    dateStyle: 'short',
    timeStyle: 'short',
  }).format(date);
}

function toIsoDateTime(value: string) {
  if (!value) {
    return new Date().toISOString();
  }
  return new Date(value).toISOString();
}

function mapBulletinToPayload(item: AdminBulletin, overrides?: Partial<AdminBulletinPayload>): AdminBulletinPayload {
  return {
    title: item.title,
    slug: item.slug,
    bulletinType: item.bulletinType,
    status: item.status,
    excerpt: item.excerpt,
    descriptionShort: item.descriptionShort,
    content: item.content,
    imageUrl: item.imageUrl,
    sortOrder: item.sortOrder || 1,
    isFeatured: item.isFeatured,
    isVisible: item.isVisible,
    publishedAt: item.publishedAt || new Date().toISOString(),
    titleSeo: item.titleSeo,
    keywords: item.keywords,
    metaDescription: item.metaDescription,
    ...overrides,
  };
}

function mapBulletinToRow(item: AdminBulletin): BulletinRow {
  return {
    id: item.id,
    title: item.title,
    slug: item.slug,
    publishedAt: formatPublishedAt(item.publishedAt),
    isVisible: item.isVisible,
    isFeatured: item.isFeatured,
    status: item.status,
    statusLabel: translateBulletinStatus(item.status),
  };
}

function renderVisibilityIcon(isVisible: boolean, label: string) {
  return (
    <span className="inline-flex" aria-label={label} title={label}>
      {isVisible ? <CheckCircle2 className="h-5 w-5 text-emerald-600" /> : <Circle className="h-5 w-5 text-slate-400" />}
    </span>
  );
}

export function AdminBulletinManager({ type, heading }: AdminBulletinManagerProps) {
  const { showToast } = useAppToast();
  const [items, setItems] = useState<AdminBulletin[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState('');
  const [selectedIds, setSelectedIds] = useState<number[]>([]);
  const [modalState, setModalState] = useState<ModalState>(null);
  const [deleteState, setDeleteState] = useState<DeleteState>(null);
  const [keyword, setKeyword] = useState('');
  const [visibilityFilter, setVisibilityFilter] = useState<'all' | 'visible' | 'hidden'>('all');
  const [statusFilter, setStatusFilter] = useState<'all' | AdminBulletinStatus>('all');

  const loadItems = useCallback(async () => {
    try {
      setIsLoading(true);
      setError('');
      const data = await listAdminBulletins(type);
      setItems(data);
    } catch (err) {
      setItems([]);
      setError(err instanceof Error ? err.message : 'Không thể tải danh sách bài viết.');
    } finally {
      setIsLoading(false);
    }
  }, [type]);

  useEffect(() => {
    setSelectedIds([]);
    setModalState(null);
    setDeleteState(null);
    setKeyword('');
    setVisibilityFilter('all');
    setStatusFilter('all');
    void loadItems();
  }, [loadItems, type]);

  const rows = useMemo(() => items.map(mapBulletinToRow), [items]);
  const filteredRows = useMemo(() => {
    const normalizedKeyword = keyword.trim().toLowerCase();

    return rows.filter((row) => {
      const source = `${row.title} ${row.slug} ${row.statusLabel}`.toLowerCase();
      const matchesKeyword = !normalizedKeyword || source.includes(normalizedKeyword);
      const matchesVisibility =
        visibilityFilter === 'all' || (visibilityFilter === 'visible' ? row.isVisible : !row.isVisible);
      const matchesStatus = statusFilter === 'all' || row.status === statusFilter;

      return matchesKeyword && matchesVisibility && matchesStatus;
    });
  }, [keyword, rows, statusFilter, visibilityFilter]);

  const filteredRowIds = useMemo(() => filteredRows.map((row) => row.id), [filteredRows]);
  const selectedFilteredIds = useMemo(
    () => selectedIds.filter((id) => filteredRowIds.includes(id)),
    [filteredRowIds, selectedIds]
  );
  const allSelected = filteredRows.length > 0 && selectedFilteredIds.length === filteredRows.length;

  const toggleSelectAll = () => {
    setSelectedIds((prev) => {
      if (allSelected) {
        return prev.filter((id) => !filteredRowIds.includes(id));
      }

      return Array.from(new Set([...prev, ...filteredRowIds]));
    });
  };

  const toggleSelectOne = (id: number) => {
    setSelectedIds((prev) => (prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]));
  };

  const selectedItems = useMemo(
    () => items.filter((item) => selectedIds.includes(item.id)),
    [items, selectedIds]
  );

  const openCreateModal = () => {
    setModalState({ mode: 'create', item: null });
  };

  const openModal = async (mode: 'view' | 'edit', id: number) => {
    try {
      setIsLoading(true);
      setError('');
      const detail = await getAdminBulletinDetail(id);
      setModalState({ mode, item: detail });
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Không thể tải chi tiết bài viết.';
      setError(message);
      showToast({ type: 'error', message });
    } finally {
      setIsLoading(false);
    }
  };

  const closeModal = () => {
    if (isSaving) return;
    setModalState(null);
  };

  const switchModalToEdit = () => {
    setModalState((prev) => (prev?.item ? { mode: 'edit', item: prev.item } : prev));
  };

  const handleSave = async (payload: AdminBulletinPayload) => {
    try {
      setIsSaving(true);
      setError('');

      const normalizedPayload = {
        ...payload,
        bulletinType: type,
        publishedAt: toIsoDateTime(payload.publishedAt),
      };

      if (modalState?.mode === 'create') {
        await createAdminBulletin(normalizedPayload);
        showToast({ type: 'success', message: 'Đã tạo bài viết mới.' });
      } else if (modalState?.item) {
        await updateAdminBulletin(modalState.item.id, normalizedPayload);
        showToast({ type: 'success', message: 'Đã cập nhật bài viết.' });
      }

      setModalState(null);
      await loadItems();
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Không thể lưu bài viết.';
      setError(message);
      showToast({ type: 'error', message });
    } finally {
      setIsSaving(false);
    }
  };

  const requestDelete = (row: BulletinRow) => {
    setDeleteState({ id: row.id, title: row.title });
  };

  const handleConfirmDelete = async () => {
    if (!deleteState) return;

    try {
      setIsSaving(true);
      setError('');
      await deleteAdminBulletin(deleteState.id);
      setSelectedIds((prev) => prev.filter((id) => id !== deleteState.id));
      setDeleteState(null);
      await loadItems();
      showToast({ type: 'success', message: 'Đã xóa bài viết.' });
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Không thể xóa bài viết.';
      setError(message);
      showToast({ type: 'error', message });
    } finally {
      setIsSaving(false);
    }
  };

  const handleBulkVisibilityChange = async (isVisible: boolean) => {
    if (!selectedItems.length) return;

    try {
      setIsSaving(true);
      setError('');
      await Promise.all(
        selectedItems.map((item) =>
          updateAdminBulletin(
            item.id,
            mapBulletinToPayload(item, {
              isVisible,
            })
          )
        )
      );
      setSelectedIds([]);
      await loadItems();
      showToast({
        type: 'success',
        message: `${isVisible ? 'Đã hiển thị' : 'Đã ẩn'} ${selectedItems.length} bài viết.`,
      });
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Không thể cập nhật trạng thái hiển thị.';
      setError(message);
      showToast({ type: 'error', message });
    } finally {
      setIsSaving(false);
    }
  };

  const handleBulkDelete = async () => {
    if (!selectedItems.length) return;

    try {
      setIsSaving(true);
      setError('');
      await Promise.all(selectedItems.map((item) => deleteAdminBulletin(item.id)));
      setSelectedIds([]);
      await loadItems();
      showToast({ type: 'success', message: `Đã xóa ${selectedItems.length} bài viết.` });
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Không thể xóa bài viết đã chọn.';
      setError(message);
      showToast({ type: 'error', message });
    } finally {
      setIsSaving(false);
    }
  };

  const columns = useMemo<AdminTableColumn<BulletinRow>[]>(
    () => [
      {
        key: 'select',
        title: (
          <input
            type="checkbox"
            aria-label={`Chọn tất cả ${heading}`}
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
            aria-label={`Chọn bài ${row.title}`}
            checked={selectedIds.includes(row.id)}
            onChange={() => toggleSelectOne(row.id)}
            onClick={(event) => event.stopPropagation()}
            className="h-4 w-4 rounded border-slate-300"
          />
        ),
      },
      {
        key: 'title',
        title: 'Tiêu đề',
        sortable: true,
        render: (row) => <span className="text-slate-900">{row.title}</span>,
      },
      {
        key: 'slug',
        title: 'Slug',
        sortable: true,
        render: (row) => <span className="text-slate-600">{row.slug}</span>,
      },
      {
        key: 'publishedAt',
        title: 'Ngày đăng',
        sortable: true,
        render: (row) => <span className="text-slate-700">{row.publishedAt}</span>,
      },
      {
        key: 'isVisible',
        title: 'Hiển thị',
        align: 'center',
        render: (row) => (
          <div className="flex justify-center" onClick={(event) => event.stopPropagation()}>
            {renderVisibilityIcon(row.isVisible, `Trạng thái hiển thị của bài ${row.title}`)}
          </div>
        ),
      },
      {
        key: 'statusLabel',
        title: 'Trạng thái',
        sortable: true,
        align: 'center',
        render: (row) => {
          let className = 'border-emerald-200 bg-emerald-50 text-emerald-700';
          if (row.status === 'draft') className = 'border-amber-200 bg-amber-50 text-amber-700';
          if (row.status === 'archived') className = 'border-slate-200 bg-slate-100 text-slate-600';

          return (
            <Badge variant="outline" className={className}>
              {row.statusLabel}
            </Badge>
          );
        },
      },
      {
        key: 'isFeatured',
        title: 'Nổi bật',
        align: 'center',
        render: (row) => (
          <Badge variant="outline" className={row.isFeatured ? 'border-sky-200 bg-sky-50 text-sky-700' : 'border-slate-200 bg-slate-100 text-slate-600'}>
            {row.isFeatured ? 'Có' : 'Không'}
          </Badge>
        ),
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
              aria-label={`Xem bài ${row.title}`}
              title={`Xem bài ${row.title}`}
              onClick={(event) => {
                event.stopPropagation();
                void openModal('view', row.id);
              }}
              disabled={isSaving}
            >
              <Eye className="h-4 w-4" />
            </Button>
            <Button
              type="button"
              variant="outline"
              size="icon-sm"
              aria-label={`Sửa bài ${row.title}`}
              title={`Sửa bài ${row.title}`}
              onClick={(event) => {
                event.stopPropagation();
                void openModal('edit', row.id);
              }}
              disabled={isSaving}
            >
              <Pencil className="h-4 w-4" />
            </Button>
            <Button
              type="button"
              variant="outline"
              size="icon-sm"
              aria-label={`Xóa bài ${row.title}`}
              title={`Xóa bài ${row.title}`}
              onClick={(event) => {
                event.stopPropagation();
                requestDelete(row);
              }}
              disabled={isSaving}
              className="border-red-200 text-red-600 hover:border-red-300 hover:bg-red-50 hover:text-red-700"
            >
              <Trash2 className="h-4 w-4" />
            </Button>
          </div>
        ),
      },
    ],
    [allSelected, heading, isSaving, selectedIds]
  );

  return (
    <>
      <div className="space-y-4">
        {error ? <div className="rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">{error}</div> : null}

        <AdminDataTable
          columns={columns}
          data={filteredRows}
          loading={isLoading}
          emptyText="Chưa có bài viết."
          getRowKey={(row) => row.id}
          onRowClick={(row) => void openModal('view', row.id)}
          filters={
            <AdminTableFilters
              keyword={keyword}
              onKeywordChange={setKeyword}
              keywordPlaceholder="Tìm theo tiêu đề, slug hoặc trạng thái..."
              status={visibilityFilter}
              onStatusChange={(value) => setVisibilityFilter(value as 'all' | 'visible' | 'hidden')}
              summary={`Hiển thị ${filteredRows.length}/${rows.length} bài viết`}
              extraFilters={
                <select
                  value={statusFilter}
                  onChange={(event) => setStatusFilter(event.target.value as 'all' | AdminBulletinStatus)}
                  className="h-11 rounded-xl border border-slate-200 bg-white px-3 text-sm text-slate-900"
                >
                  <option value="all">Tất cả trạng thái bài viết</option>
                  <option value="draft">Bản nháp</option>
                  <option value="published">Hiển thị</option>
                  <option value="archived">Lưu trữ</option>
                </select>
              }
            />
          }
          toolbar={
            <div className="flex flex-wrap items-center gap-2">
              {selectedIds.length > 0 ? (
                <>
                  <Button type="button" onClick={() => void handleBulkVisibilityChange(false)} disabled={isLoading || isSaving} className="bg-[#135a91] text-white hover:bg-[#0f4b78]">
                    Ẩn
                  </Button>
                  <Button type="button" onClick={() => void handleBulkVisibilityChange(true)} disabled={isLoading || isSaving} className="bg-[#135a91] text-white hover:bg-[#0f4b78]">
                    Hiển thị
                  </Button>
                  <Button type="button" onClick={() => void handleBulkDelete()} disabled={isLoading || isSaving} className="bg-[#135a91] text-white hover:bg-[#0f4b78]">
                    Xóa
                  </Button>
                </>
              ) : null}
              <Button type="button" onClick={() => void loadItems()} disabled={isLoading || isSaving} className="bg-[#135a91] text-white hover:bg-[#0f4b78]">
                <RefreshCw className={['h-4 w-4', isLoading ? 'animate-spin' : ''].join(' ')} />
                {isLoading ? 'Đang tải...' : 'Tải lại'}
              </Button>
              <Button type="button" onClick={openCreateModal} disabled={isLoading || isSaving} className="bg-[#135a91] text-white hover:bg-[#0f4b78]">
                <Plus className="h-4 w-4" />
                Thêm bài viết
              </Button>
            </div>
          }
        />
      </div>

      <AdminBulletinModal
        open={Boolean(modalState)}
        item={modalState?.item ?? null}
        mode={modalState?.mode ?? 'view'}
        type={type}
        isSaving={isSaving}
        onClose={closeModal}
        onEdit={switchModalToEdit}
        onSave={handleSave}
      />

      {deleteState ? (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/45 px-4 py-6 backdrop-blur-sm">
          <div className="w-full max-w-md rounded-3xl border border-slate-200 bg-white p-6 shadow-2xl">
            <div className="space-y-2">
              <div className="text-xs font-semibold uppercase tracking-[0.22em] text-red-600">Xác nhận xóa</div>
              <h3 className="text-xl font-black text-slate-950">{deleteState.title}</h3>
              <p className="text-sm leading-6 text-slate-600">Hành động này sẽ xóa vĩnh viễn bài viết khỏi hệ thống quản trị.</p>
            </div>
            <div className="mt-6 flex items-center justify-end gap-3">
              <Button type="button" variant="outline" onClick={() => setDeleteState(null)} disabled={isSaving}>
                Hủy
              </Button>
              <Button type="button" onClick={() => void handleConfirmDelete()} disabled={isSaving} className="bg-red-600 text-white hover:bg-red-700">
                {isSaving ? 'Đang xóa...' : 'Xóa bài viết'}
              </Button>
            </div>
          </div>
        </div>
      ) : null}
    </>
  );
}
