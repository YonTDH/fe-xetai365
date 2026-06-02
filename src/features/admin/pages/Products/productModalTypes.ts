import type { AdminProduct, AdminProductPayload, AdminVehicleCategory } from '../../api/adminApi';

export type ProductModalProps = {
  item: AdminProduct | null;
  parentCategories: AdminVehicleCategory[];
  mode: 'view' | 'edit' | 'create';
  open: boolean;
  isSaving?: boolean;
  onClose: () => void;
  onEdit?: () => void;
  onSave: (payload: AdminProductPayload) => void;
};

export type FormState = AdminProductPayload;
export type ProductTab = 'info' | 'content' | 'seo';
