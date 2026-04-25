import { useCallback, useEffect, useMemo, useState } from 'react';
import { Eye, Pencil, RefreshCw, Trash2 } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { useAppToast } from '@/components/ui/toast';
import {
  deleteAdminVehicleCategoryLevel2,
  listAdminVehicleCategoriesTree,
  updateAdminVehicleCategoryLevel2,
  type AdminVehicleCategory,
} from '../../api/adminApi';
import { AdminDataTable, type AdminTableColumn } from '../../components/AdminDataTable';
import { AdminTableFilters } from '../../components/AdminTableFilters';
import { CategoryLevel2Modal } from './CategoryLevel2Modal';

type CategoryLevel2Row = {
  id: number;
  name: string;
  parentId: number;
  parentName: string;
  isVisible: boolean;
  statusText: string;
};

type ModalState = {
  mode: 'view' | 'edit';
  item: AdminVehicleCategory;
} | null;

type DeleteState = {
  id: number;
  name: string;
  parentName: string;
} | null;

function flattenLevel2Categories(nodes: AdminVehicleCategory[]) {
  return nodes.flatMap((parent) =>
    parent.children.map((child) => ({
      ...child,
      parentName: parent.name,
    }))
  );
}

function mapCategoryToRow(item: AdminVehicleCategory & { parentName: string }): CategoryLevel2Row {
  return {
    id: item.id,
    name: item.name,
    parentId: item.parentId || 0,
    parentName: item.parentName,
    isVisible: item.isVisible,
    statusText: item.isVisible ? 'Đang hiển thị' : 'Đang ẩn',
  };
}

export function AdminCategoryLevel2Page() {
  const { showToast } = useAppToast();
  const [items, setItems] = useState<AdminVehicleCategory[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [isDeletingId, setIsDeletingId] = useState<number | null>(null);
  const [error, setError] = useState('');
  const [selectedIds, setSelectedIds] = useState<number[]>([]);
  const [modalState, setModalState] = useState<ModalState>(null);
  const [deleteState, setDeleteState] = useState<DeleteState>(null);
  const [keyword, setKeyword] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | 'visible' | 'hidden'>('all');

  const loadItems = useCallback(async () => {
    try {
      setIsLoading(true);
      setError('');
      const data = await listAdminVehicleCategoriesTree();
      setItems(data);
    } catch (err) {
      setItems([]);
      setError(err instanceof Error ? err.message : 'Không thể tải danh mục cấp 2.');
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    void loadItems();
  }, [loadItems]);

  const level2Items = useMemo(() => flattenLevel2Categories(items), [items]);
  const rows = useMemo(() => level2Items.map(mapCategoryToRow), [level2Items]);
  const filteredRows = useMemo(() => {
    const normalizedKeyword = keyword.trim().toLowerCase();

    return rows.filter((row) => {
      const matchesKeyword =
        !normalizedKeyword ||
        row.name.toLowerCase().includes(normalizedKeyword) ||
        row.parentName.toLowerCase().includes(normalizedKeyword);
      const matchesStatus =
        statusFilter === 'all' || (statusFilter === 'visible' ? row.isVisible : !row.isVisible);

      return matchesKeyword && matchesStatus;
    });
  }, [keyword, rows, statusFilter]);

  const allSelected = filteredRows.length > 0 && selectedIds.length === filteredRows.length;

  const toggleSelectAll = () => {
    setSelectedIds((prev) => (prev.length === filteredRows.length ? [] : filteredRows.map((row) => row.id)));
  };

  const toggleSelectOne = (id: number) => {
    setSelectedIds((prev) => (prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]));
  };

  const findLevel2Item = (id: number) => level2Items.find((item) => item.id === id) || null;

  const openModal = (mode: 'view' | 'edit', id: number) => {
    const item = findLevel2Item(id);
    if (!item) return;
    setModalState({ mode, item });
  };

  const closeModal = () => {
    if (isSaving) return;
    setModalState(null);
  };

  const handleSaveCategory = async (
    nextItem: Pick<AdminVehicleCategory, 'id' | 'parentId' | 'name' | 'slug' | 'isVisible' | 'description' | 'sortOrder'>
  ) => {
    try {
      setIsSaving(true);
      setError('');
      const updated = await updateAdminVehicleCategoryLevel2(nextItem.id, nextItem);
      setModalState(null);
      await loadItems();
      showToast({
        type: 'success',
        message: `Đã cập nhật danh mục cấp 2 "${updated.name}".`,
      });
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Không thể cập nhật danh mục cấp 2.';
      setError(message);
      showToast({
        type: 'error',
        message,
      });
    } finally {
      setIsSaving(false);
    }
  };

  const requestDeleteCategory = (row: CategoryLevel2Row) => {
    setDeleteState({
      id: row.id,
      name: row.name,
      parentName: row.parentName,
    });
  };

  const closeDeleteModal = () => {
    if (isDeletingId !== null) return;
    setDeleteState(null);
  };

  const handleConfirmDelete = async () => {
    if (!deleteState) return;

    try {
      setIsDeletingId(deleteState.id);
      setError('');
      const deleted = await deleteAdminVehicleCategoryLevel2(deleteState.id);
      setItems((prev) =>
        prev.map((parent) => ({
          ...parent,
          children: parent.children.filter((child) => child.id !== deleteState.id),
        }))
      );
      setSelectedIds((prev) => prev.filter((id) => id !== deleteState.id));
      setDeleteState(null);
      showToast({
        type: 'success',
        message: `Đã xóa danh mục cấp 2 "${deleted.name || deleteState.name}".`,
      });
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Không thể xóa danh mục cấp 2.';
      setError(message);
      showToast({
        type: 'error',
        message,
      });
    } finally {
      setIsDeletingId(null);
    }
  };

  const columns = useMemo<AdminTableColumn<CategoryLevel2Row>[]>(
    () => [
      {
        key: 'select',
        title: (
          <input
            type="checkbox"
            aria-label="Chọn tất cả danh mục cấp 2"
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
            aria-label={`Chọn danh mục ${row.name}`}
            checked={selectedIds.includes(row.id)}
            onChange={() => toggleSelectOne(row.id)}
            onClick={(event) => event.stopPropagation()}
            className="h-4 w-4 rounded border-slate-300"
          />
        ),
      },
      {
        key: 'name',
        title: 'Tên danh mục',
        sortable: true,
        render: (row) => <span className="text-slate-900">{row.name}</span>,
      },
      {
        key: 'parentName',
        title: 'Danh mục cấp 1',
        sortable: true,
        render: (row) => <span className="text-slate-700">{row.parentName}</span>,
      },
      {
        key: 'isVisible',
        title: 'Hiển thị',
        align: 'center',
        render: (row) => (
          <input
            type="checkbox"
            aria-label={`Trạng thái hiển thị của danh mục ${row.name}`}
            checked={row.isVisible}
            readOnly
            onClick={(event) => event.stopPropagation()}
            className="h-4 w-4 rounded border-slate-300"
          />
        ),
      },
      {
        key: 'statusText',
        title: 'Trạng thái',
        sortable: true,
        align: 'center',
        render: (row) => (
          <Badge
            variant="outline"
            className={
              row.isVisible
                ? 'border-emerald-200 bg-emerald-50 text-emerald-700'
                : 'border-slate-200 bg-slate-100 text-slate-600'
            }
          >
            {row.statusText}
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
              aria-label={`Xem danh mục ${row.name}`}
              title={`Xem danh mục ${row.name}`}
              onClick={(event) => {
                event.stopPropagation();
                openModal('view', row.id);
              }}
              disabled={isDeletingId === row.id}
            >
              <Eye className="h-4 w-4" />
            </Button>
            <Button
              type="button"
              variant="outline"
              size="icon-sm"
              aria-label={`Sửa danh mục ${row.name}`}
              title={`Sửa danh mục ${row.name}`}
              onClick={(event) => {
                event.stopPropagation();
                openModal('edit', row.id);
              }}
              disabled={isDeletingId === row.id}
            >
              <Pencil className="h-4 w-4" />
            </Button>
            <Button
              type="button"
              variant="outline"
              size="icon-sm"
              aria-label={`Xóa danh mục ${row.name}`}
              title={`Xóa danh mục ${row.name}`}
              onClick={(event) => {
                event.stopPropagation();
                requestDeleteCategory(row);
              }}
              disabled={isDeletingId === row.id}
              className="border-red-200 text-red-600 hover:border-red-300 hover:bg-red-50 hover:text-red-700"
            >
              <Trash2 className={['h-4 w-4', isDeletingId === row.id ? 'animate-pulse' : ''].join(' ')} />
            </Button>
          </div>
        ),
      },
    ],
    [allSelected, filteredRows.length, isDeletingId, selectedIds]
  );

  return (
    <>
      <div className="space-y-4">
        {error ? <div className="rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">{error}</div> : null}

        <AdminDataTable
          title="Danh mục cấp 2"
          description="Dữ liệu đang lấy từ cây danh mục quản trị để phục vụ cập nhật danh mục cấp 2."
          columns={columns}
          data={filteredRows}
          loading={isLoading}
          emptyText="Chưa có danh mục cấp 2."
          getRowKey={(row) => row.id}
          onRowClick={(row) => openModal('view', row.id)}
          filters={
            <AdminTableFilters
              keyword={keyword}
              onKeywordChange={setKeyword}
              keywordPlaceholder="Tìm theo tên danh mục cấp 2 hoặc cấp 1..."
              status={statusFilter}
              onStatusChange={(value) => setStatusFilter(value as 'all' | 'visible' | 'hidden')}
              summary={`Hiển thị ${filteredRows.length}/${rows.length} danh mục cấp 2`}
            />
          }
          toolbar={
            <div className="flex items-center gap-2">
              <Button type="button" variant="outline" onClick={() => void loadItems()} disabled={isLoading || isSaving || isDeletingId !== null}>
                <RefreshCw className={['h-4 w-4', isLoading ? 'animate-spin' : ''].join(' ')} />
                {isLoading ? 'Đang tải...' : 'Tải lại'}
              </Button>
            </div>
          }
        />
      </div>

      <CategoryLevel2Modal
        key={`${modalState?.mode ?? 'view'}-${modalState?.item?.id ?? 'none'}`}
        open={Boolean(modalState)}
        item={modalState?.item ?? null}
        parentOptions={items}
        mode={modalState?.mode ?? 'view'}
        isSaving={isSaving}
        onClose={closeModal}
        onSave={handleSaveCategory}
      />

      {deleteState ? (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/45 px-4 py-6 backdrop-blur-sm">
          <div className="w-full max-w-md rounded-3xl border border-slate-200 bg-white p-6 shadow-2xl">
            <div className="space-y-2">
              <div className="text-xs font-semibold uppercase tracking-[0.22em] text-red-600">Xác nhận xóa</div>
              <h3 className="text-xl font-black text-slate-950">{deleteState.name}</h3>
              <p className="text-sm leading-6 text-slate-600">
                Danh mục này đang thuộc nhóm <span className="font-semibold text-slate-900">{deleteState.parentName}</span>. Chỉ có thể xóa khi không còn sản phẩm đang hiển thị thuộc danh mục này.
              </p>
            </div>

            <div className="mt-6 flex items-center justify-end gap-3">
              <Button type="button" variant="outline" onClick={closeDeleteModal} disabled={isDeletingId !== null}>
                Hủy
              </Button>
              <Button
                type="button"
                onClick={() => void handleConfirmDelete()}
                disabled={isDeletingId !== null}
                className="bg-red-600 text-white hover:bg-red-700"
              >
                {isDeletingId !== null ? 'Đang xóa...' : 'Xóa danh mục'}
              </Button>
            </div>
          </div>
        </div>
      ) : null}
    </>
  );
}
