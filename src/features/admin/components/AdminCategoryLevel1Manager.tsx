import { useCallback, useEffect, useMemo, useState } from 'react';
import { Eye, Pencil, RefreshCw, Trash2 } from 'lucide-react';
import { listCatalogCategoriesTree, type CategoryNode } from '@/api/landingApi';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { AdminDataTable, type AdminTableColumn } from './AdminDataTable';

type CategoryLevel1Row = {
  id: number;
  name: string;
  childCount: number;
  isVisible: boolean;
  statusText: string;
};

function mapCategoryToRow(item: CategoryNode): CategoryLevel1Row {
  return {
    id: item.id,
    name: item.name,
    childCount: item.children.length,
    isVisible: item.isVisible,
    statusText: item.isVisible ? 'Đang hiển thị' : 'Đang ẩn',
  };
}

export function AdminCategoryLevel1Manager() {
  const [items, setItems] = useState<CategoryNode[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [selectedIds, setSelectedIds] = useState<number[]>([]);

  const loadItems = useCallback(async () => {
    try {
      setIsLoading(true);
      setError('');
      const data = await listCatalogCategoriesTree();
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
              onClick={(event) => event.stopPropagation()}
            >
              <Eye className="h-4 w-4" />
            </Button>
            <Button
              type="button"
              variant="outline"
              size="icon-sm"
              aria-label={`Sửa danh mục ${row.name}`}
              title={`Sửa danh mục ${row.name}`}
              onClick={(event) => event.stopPropagation()}
            >
              <Pencil className="h-4 w-4" />
            </Button>
            <Button
              type="button"
              variant="outline"
              size="icon-sm"
              aria-label={`Xóa danh mục ${row.name}`}
              title={`Xóa danh mục ${row.name}`}
              onClick={(event) => event.stopPropagation()}
              className="border-red-200 text-red-600 hover:border-red-300 hover:bg-red-50 hover:text-red-700"
            >
              <Trash2 className="h-4 w-4" />
            </Button>
          </div>
        ),
      },
    ],
    [allSelected, rows, selectedIds]
  );

  return (
    <div className="space-y-4">
      {error ? (
        <div className="rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">{error}</div>
      ) : null}

      <AdminDataTable
        title="Danh mục cấp 1"
        description="Dữ liệu đang lấy từ cây danh mục hiện có trên site để chuẩn bị cho màn quản lý danh mục admin."
        columns={columns}
        data={rows}
        loading={isLoading}
        emptyText="Chưa có danh mục cấp 1."
        getRowKey={(row) => row.id}
        toolbar={
          <div className="flex items-center gap-2">
            <Button type="button" variant="outline" onClick={() => void loadItems()} disabled={isLoading}>
              <RefreshCw className="h-4 w-4" />
              Tải lại
            </Button>
          </div>
        }
      />
    </div>
  );
}
