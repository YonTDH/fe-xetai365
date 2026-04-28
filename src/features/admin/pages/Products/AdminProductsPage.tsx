import { useCallback, useEffect, useMemo, useState } from 'react';
import { CheckCircle2, Circle, Eye, Pencil, Plus, RefreshCw, Trash2 } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { useAppToast } from '@/components/ui/toast';
import {
  createAdminProduct,
  deleteAdminProduct,
  listAdminProducts,
  listAdminVehicleCategoriesTree,
  updateAdminProduct,
  type AdminProduct,
  type AdminProductPayload,
  type AdminVehicleCategory,
} from '../../api/adminApi';
import { AdminDataTable, type AdminTableColumn } from '../../components/AdminDataTable';
import { AdminTableFilters } from '../../components/AdminTableFilters';
import { ProductModal } from './ProductModal';

type ProductRow = {
  id: number;
  title: string;
  categoryName: string;
  brand: string;
  priceVnd: string;
  isVisible: boolean;
  status: string;
};

type ModalState = {
  mode: 'view' | 'edit' | 'create';
  item: AdminProduct | null;
} | null;

type DeleteState = {
  id: number;
  title: string;
} | null;

function translateProductStatus(status: string) {
  switch (status) {
    case 'available':
      return 'Đang bán';
    case 'sold':
      return 'Đã bán';
    case 'sold_out':
      return 'Hết hàng';
    case 'coming_soon':
      return 'Sắp về';
    case 'draft':
      return 'Bản nháp';
    case 'hidden':
      return 'Đã ẩn';
    default:
      return status;
  }
}

function mapProductToRow(item: AdminProduct): ProductRow {
  return {
    id: item.id,
    title: item.title,
    categoryName: `${item.categoryLevel1Name} / ${item.categoryLevel2Name}`,
    brand: item.brand,
    priceVnd: item.priceVnd,
    isVisible: item.isVisible,
    status: translateProductStatus(item.status),
  };
}

function renderVisibilityIcon(isVisible: boolean, label: string) {
  return (
    <span className="inline-flex" aria-label={label} title={label}>
      {isVisible ? <CheckCircle2 className="h-5 w-5 text-emerald-600" /> : <Circle className="h-5 w-5 text-slate-400" />}
    </span>
  );
}

export function AdminProductsPage() {
  const { showToast } = useAppToast();
  const [items, setItems] = useState<AdminProduct[]>([]);
  const [categories, setCategories] = useState<AdminVehicleCategory[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [isDeletingId, setIsDeletingId] = useState<number | null>(null);
  const [error, setError] = useState('');
  const [selectedIds, setSelectedIds] = useState<number[]>([]);
  const [modalState, setModalState] = useState<ModalState>(null);
  const [deleteState, setDeleteState] = useState<DeleteState>(null);
  const [keyword, setKeyword] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | 'visible' | 'hidden'>('all');
  const [categoryFilter, setCategoryFilter] = useState<number>(0);

  const loadData = useCallback(async () => {
    try {
      setIsLoading(true);
      setError('');
      const [productItems, categoryTree] = await Promise.all([listAdminProducts(), listAdminVehicleCategoriesTree()]);
      setItems(productItems);
      setCategories(categoryTree);
    } catch (err) {
      setItems([]);
      setCategories([]);
      setError(err instanceof Error ? err.message : 'Không thể tải sản phẩm.');
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    void loadData();
  }, [loadData]);

  const rows = useMemo(() => items.map(mapProductToRow), [items]);
  const categoryLevel2Options = useMemo(
    () =>
      categories.flatMap((parent) =>
        parent.children.map((child) => ({
          id: child.id,
          label: `${parent.name} / ${child.name}`,
        }))
      ),
    [categories]
  );

  const filteredRows = useMemo(() => {
    const normalizedKeyword = keyword.trim().toLowerCase();

    return rows.filter((row) => {
      const source = `${row.title} ${row.categoryName} ${row.brand}`.toLowerCase();
      const matchesKeyword = !normalizedKeyword || source.includes(normalizedKeyword);
      const matchesStatus = statusFilter === 'all' || (statusFilter === 'visible' ? row.isVisible : !row.isVisible);
      const matchesCategory = categoryFilter === 0 || items.find((item) => item.id === row.id)?.categoryLevel2Id === categoryFilter;

      return matchesKeyword && matchesStatus && matchesCategory;
    });
  }, [categoryFilter, items, keyword, rows, statusFilter]);

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

  const openModal = (mode: 'view' | 'edit', id: number) => {
    const item = items.find((entry) => entry.id === id);
    if (!item) return;
    setModalState({ mode, item });
  };

  const openCreateModal = () => {
    setModalState({ mode: 'create', item: null });
  };

  const closeModal = () => {
    if (isSaving) return;
    setModalState(null);
  };

  const switchModalToEdit = () => {
    setModalState((prev) => (prev?.item ? { mode: 'edit', item: prev.item } : prev));
  };

  const handleSaveProduct = async (payload: AdminProductPayload) => {
    try {
      setIsSaving(true);
      setError('');
      if (modalState?.mode === 'create') {
        await createAdminProduct(payload);
        showToast({ type: 'success', message: `Đã tạo sản phẩm "${payload.title}".` });
      } else if (modalState?.item) {
        await updateAdminProduct(modalState.item.id, payload);
        showToast({ type: 'success', message: `Đã cập nhật sản phẩm "${payload.title}".` });
      }
      setModalState(null);
      await loadData();
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Không thể lưu sản phẩm.';
      setError(message);
      showToast({ type: 'error', message });
    } finally {
      setIsSaving(false);
    }
  };

  const requestDeleteProduct = (row: ProductRow) => {
    setDeleteState({ id: row.id, title: row.title });
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
      const deleted = await deleteAdminProduct(deleteState.id);
      setItems((prev) => prev.filter((item) => item.id !== deleteState.id));
      setSelectedIds((prev) => prev.filter((id) => id !== deleteState.id));
      setDeleteState(null);
      showToast({ type: 'success', message: `Đã xóa sản phẩm "${deleted.title || deleteState.title}".` });
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Không thể xóa sản phẩm.';
      setError(message);
      showToast({ type: 'error', message });
    } finally {
      setIsDeletingId(null);
    }
  };

  const selectedItems = useMemo(
    () => items.filter((item) => selectedIds.includes(item.id)),
    [items, selectedIds]
  );

  const handleBulkVisibilityChange = async (isVisible: boolean) => {
    if (!selectedItems.length) return;

    try {
      setIsSaving(true);
      setError('');
      await Promise.all(
        selectedItems.map((item) =>
          updateAdminProduct(item.id, {
            categoryLevel2Id: item.categoryLevel2Id,
            productCode: item.productCode,
            slug: item.slug,
            title: item.title,
            shortDescription: item.shortDescription,
            content: item.content,
            brand: item.brand,
            status: item.status,
            priceVnd: item.priceVnd,
            location: item.location,
            imageUrl: item.imageUrl,
            isFeatured: item.isFeatured,
            isVisible,
            sortOrder: item.sortOrder,
            titleSeo: item.titleSeo,
            keywords: item.keywords,
            metaDescription: item.metaDescription,
          })
        )
      );
      setSelectedIds([]);
      await loadData();
      showToast({
        type: 'success',
        message: `${isVisible ? 'Đã hiển thị' : 'Đã ẩn'} ${selectedItems.length} sản phẩm.`,
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
      await Promise.all(selectedItems.map((item) => deleteAdminProduct(item.id)));
      setSelectedIds([]);
      await loadData();
      showToast({
        type: 'success',
        message: `Đã xóa ${selectedItems.length} sản phẩm.`,
      });
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Không thể xóa sản phẩm đã chọn.';
      setError(message);
      showToast({ type: 'error', message });
    } finally {
      setIsSaving(false);
    }
  };

  const columns = useMemo<AdminTableColumn<ProductRow>[]>(
    () => [
      {
        key: 'select',
        title: (
          <input
            type="checkbox"
            aria-label="Chọn tất cả sản phẩm"
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
            aria-label={`Chọn sản phẩm ${row.title}`}
            checked={selectedIds.includes(row.id)}
            onChange={() => toggleSelectOne(row.id)}
            onClick={(event) => event.stopPropagation()}
            className="h-4 w-4 rounded border-slate-300"
          />
        ),
      },
      { key: 'title', title: 'Tên sản phẩm', sortable: true, render: (row) => <span className="text-slate-900">{row.title}</span> },
      { key: 'categoryName', title: 'Danh mục', sortable: true },
      { key: 'brand', title: 'Hãng', sortable: true },
      { key: 'priceVnd', title: 'Giá', sortable: true, align: 'right' },
      {
        key: 'isVisible',
        title: 'Hiển thị',
        align: 'center',
        render: (row) => (
          <div className="flex justify-center" onClick={(event) => event.stopPropagation()}>
            {renderVisibilityIcon(row.isVisible, `Trạng thái hiển thị của sản phẩm ${row.title}`)}
          </div>
        ),
      },
      {
        key: 'status',
        title: 'Trạng thái',
        sortable: true,
        align: 'center',
        render: (row) => {
          let className = 'border-emerald-200 bg-emerald-50 text-emerald-700';

          if (row.status === 'Đã bán') {
            className = 'border-amber-200 bg-amber-50 text-amber-700';
          } else if (!row.isVisible) {
            className = 'border-slate-200 bg-slate-100 text-slate-600';
          }

          return (
            <Badge variant="outline" className={className}>
              {row.status}
            </Badge>
          );
        },
      },
      {
        key: 'actions',
        title: 'Thao tác',
        align: 'right',
        render: (row) => (
          <div className="flex items-center justify-end gap-2">
            <Button type="button" variant="outline" size="icon-sm" onClick={(event) => { event.stopPropagation(); openModal('view', row.id); }} disabled={isDeletingId === row.id}>
              <Eye className="h-4 w-4" />
            </Button>
            <Button type="button" variant="outline" size="icon-sm" onClick={(event) => { event.stopPropagation(); openModal('edit', row.id); }} disabled={isDeletingId === row.id}>
              <Pencil className="h-4 w-4" />
            </Button>
            <Button
              type="button"
              variant="outline"
              size="icon-sm"
              onClick={(event) => { event.stopPropagation(); requestDeleteProduct(row); }}
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
        {error ? <div className="rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">{error}</div> : null}

        <AdminDataTable
          columns={columns}
          data={filteredRows}
          loading={isLoading}
          emptyText="Chưa có sản phẩm."
          getRowKey={(row) => row.id}
          onRowClick={(row) => openModal('view', row.id)}
          filters={
            <AdminTableFilters
              keyword={keyword}
              onKeywordChange={setKeyword}
              keywordPlaceholder="Tìm theo tên sản phẩm, hãng hoặc danh mục..."
              status={statusFilter}
              onStatusChange={(value) => setStatusFilter(value as 'all' | 'visible' | 'hidden')}
              summary={`Hiển thị ${filteredRows.length}/${rows.length} sản phẩm`}
              extraFilters={
                <select
                  value={categoryFilter}
                  onChange={(event) => setCategoryFilter(Number(event.target.value))}
                  className="h-11 rounded-xl border border-slate-200 bg-white px-3 text-sm text-slate-900"
                >
                  <option value={0}>Tất cả danh mục cấp 2</option>
                  {categoryLevel2Options.map((option) => (
                    <option key={option.id} value={option.id}>
                      {option.label}
                    </option>
                  ))}
                </select>
              }
            />
          }
          toolbar={
            <div className="flex flex-wrap items-center gap-2">
              {selectedIds.length > 0 ? (
                <>
                  <Button type="button" onClick={() => void handleBulkVisibilityChange(false)} disabled={isLoading || isSaving || isDeletingId !== null} className="bg-[#135a91] text-white hover:bg-[#0f4b78]">
                    Ẩn
                  </Button>
                  <Button type="button" onClick={() => void handleBulkVisibilityChange(true)} disabled={isLoading || isSaving || isDeletingId !== null} className="bg-[#135a91] text-white hover:bg-[#0f4b78]">
                    Hiển thị
                  </Button>
                  <Button
                    type="button"
                    onClick={() => void handleBulkDelete()}
                    disabled={isLoading || isSaving || isDeletingId !== null}
                    className="bg-[#135a91] text-white hover:bg-[#0f4b78]"
                  >
                    Xóa
                  </Button>
                </>
              ) : null}
              <Button type="button" onClick={() => void loadData()} disabled={isLoading || isSaving || isDeletingId !== null} className="bg-[#135a91] text-white hover:bg-[#0f4b78]">
                <RefreshCw className={['h-4 w-4', isLoading ? 'animate-spin' : ''].join(' ')} />
                {isLoading ? 'Đang tải...' : 'Tải lại'}
              </Button>
              <Button type="button" onClick={openCreateModal} disabled={isLoading || isSaving || categoryLevel2Options.length === 0} className="bg-[#135a91] text-white hover:bg-[#0f4b78]">
                <Plus className="h-4 w-4" />
                Thêm sản phẩm
              </Button>
            </div>
          }
        />
      </div>

      <ProductModal
        open={Boolean(modalState)}
        item={modalState?.item ?? null}
        parentCategories={categories}
        mode={modalState?.mode ?? 'view'}
        isSaving={isSaving}
        onClose={closeModal}
        onEdit={switchModalToEdit}
        onSave={handleSaveProduct}
      />

      {deleteState ? (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/45 px-4 py-6 backdrop-blur-sm">
          <div className="w-full max-w-md rounded-3xl border border-slate-200 bg-white p-6 shadow-2xl">
            <div className="space-y-2">
              <div className="text-xs font-semibold uppercase tracking-[0.22em] text-red-600">Xác nhận xóa</div>
              <h3 className="text-xl font-black text-slate-950">{deleteState.title}</h3>
              <p className="text-sm leading-6 text-slate-600">Hành động này sẽ xóa vĩnh viễn sản phẩm khỏi hệ thống quản trị.</p>
            </div>
            <div className="mt-6 flex items-center justify-end gap-3">
              <Button type="button" variant="outline" onClick={closeDeleteModal} disabled={isDeletingId !== null}>Hủy</Button>
              <Button type="button" onClick={() => void handleConfirmDelete()} disabled={isDeletingId !== null} className="bg-red-600 text-white hover:bg-red-700">
                {isDeletingId !== null ? 'Đang xóa...' : 'Xóa sản phẩm'}
              </Button>
            </div>
          </div>
        </div>
      ) : null}
    </>
  );
}
