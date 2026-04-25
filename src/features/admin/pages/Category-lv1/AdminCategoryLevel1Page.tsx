import { useCallback, useEffect, useMemo, useState } from 'react';
import { Eye, Pencil, RefreshCw, Trash2 } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { useAppToast } from '@/components/ui/toast';
import {
  deleteAdminVehicleCategoryLevel1,
  listAdminVehicleCategoriesTree,
  updateAdminVehicleCategoryLevel1,
  type AdminVehicleCategory,
} from '../../api/adminApi';
import { AdminDataTable, type AdminTableColumn } from '../../components/AdminDataTable';
import { CategoryLevel1Modal } from './CategoryLevel1Modal';

type CategoryLevel1Row = {
  id: number;
  name: string;
  childCount: number;
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
  childCount: number;
} | null;

function mapCategoryToRow(item: AdminVehicleCategory): CategoryLevel1Row {
  return {
    id: item.id,
    name: item.name,
    childCount: item.children.length,
    isVisible: item.isVisible,
    statusText: item.isVisible ? 'Đang hiển thị' : 'Đang ẩn',
  };
}

function updateCategoryNode(nodes: AdminVehicleCategory[], nextItem: AdminVehicleCategory): AdminVehicleCategory[] {
  return nodes.map((node) => {
    if (node.id === nextItem.id) {
      return nextItem;
    }

    if (!node.children.length) {
      return node;
    }

    return {
      ...node,
      children: updateCategoryNode(node.children, nextItem),
    };
  });
}

export function AdminCategoryLevel1Page() {
  const { showToast } = useAppToast();
  const [items, setItems] = useState<AdminVehicleCategory[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [isDeletingId, setIsDeletingId] = useState<number | null>(null);
  const [error, setError] = useState('');
  const [selectedIds, setSelectedIds] = useState<number[]>([]);
  const [modalState, setModalState] = useState<ModalState>(null);
  const [deleteState, setDeleteState] = useState<DeleteState>(null);

  const loadItems = useCallback(async () => {
    try {
      setIsLoading(true);
      setError('');
      const data = await listAdminVehicleCategoriesTree();
      setItems(data);
    } catch (err) {
      setItems([]);
      setError(err instanceof Error ? err.message : 'Không thể tải danh mục cấp 1.');
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    void loadItems();
  }, [loadItems]);

  const rows = useMemo(() => items.map(mapCategoryToRow), [items]);
  const allSelected = rows.length > 0 && selectedIds.length === rows.length;

  const toggleSelectAll = () => {
    setSelectedIds((prev) => (prev.length === rows.length ? [] : rows.map((row) => row.id)));
  };

  const toggleSelectOne = (id: number) => {
    setSelectedIds((prev) => (prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]));
  };

  const openModal = (mode: 'view' | 'edit', id: number) => {
    const item = items.find((entry) => entry.id === id);
    if (!item) {
      return;
    }

    setModalState({ mode, item });
  };

  const closeModal = () => {
    if (isSaving) {
      return;
    }
    setModalState(null);
  };

  const handleSaveCategory = async (
    nextItem: Pick<AdminVehicleCategory, 'id' | 'name' | 'slug' | 'isVisible' | 'description' | 'sortOrder'>
  ) => {
    try {
      setIsSaving(true);
      setError('');
      const updated = await updateAdminVehicleCategoryLevel1(nextItem.id, nextItem);
      const previousChildren = modalState?.item.children || [];
      setModalState(null);
      await loadItems();
      setItems((prev) => updateCategoryNode(prev, { ...updated, children: previousChildren }));
      showToast({
        type: 'success',
        message: `Đã cập nhật danh mục "${updated.name}".`,
      });
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Không thể cập nhật danh mục cấp 1.';
      setError(message);
      showToast({
        type: 'error',
        message,
      });
    } finally {
      setIsSaving(false);
    }
  };

  const requestDeleteCategory = (row: CategoryLevel1Row) => {
    setDeleteState({
      id: row.id,
      name: row.name,
      childCount: row.childCount,
    });
  };

  const closeDeleteModal = () => {
    if (isDeletingId !== null) {
      return;
    }
    setDeleteState(null);
  };

  const handleConfirmDelete = async () => {
    if (!deleteState) {
      return;
    }

    try {
      setIsDeletingId(deleteState.id);
      setError('');
      const deleted = await deleteAdminVehicleCategoryLevel1(deleteState.id);
      setItems((prev) => prev.filter((item) => item.id !== deleteState.id));
      setSelectedIds((prev) => prev.filter((id) => id !== deleteState.id));
      setDeleteState(null);
      showToast({
        type: 'success',
        message: `Đã xóa danh mục "${deleted.name || deleteState.name}".`,
      });
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Không thể xóa danh mục cấp 1.';
      setError(message);
      showToast({
        type: 'error',
        message,
      });
    } finally {
      setIsDeletingId(null);
    }
  };

  const columns = useMemo<AdminTableColumn<CategoryLevel1Row>[]>(
    () => [
      {
        key: 'select',
        title: (
          <input
            type="checkbox"
            aria-label="Chọn tất cả danh mục cấp 1"
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
        key: 'childCount',
        title: 'Danh mục cấp 2',
        sortable: true,
        align: 'center',
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
    [allSelected, isDeletingId, selectedIds]
  );

  return (
    <>
      <div className="space-y-4">
        {error ? (
          <div className="rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">{error}</div>
        ) : null}

        <AdminDataTable
          title="Danh mục cấp 1"
          description="Dữ liệu đang lấy từ cây danh mục quản trị để phục vụ cập nhật danh mục cấp 1."
          columns={columns}
          data={rows}
          loading={isLoading}
          emptyText="Chưa có danh mục cấp 1."
          getRowKey={(row) => row.id}
          onRowClick={(row) => openModal('view', row.id)}
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

      <CategoryLevel1Modal
        open={Boolean(modalState)}
        item={modalState?.item ?? null}
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
                Danh mục này hiện có {deleteState.childCount} danh mục cấp 2. Chỉ có thể xóa khi không còn danh mục cấp 2 đang hiển thị trong hệ thống.
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
