import type { AdminProduct, AdminProductPayload, AdminVehicleCategory } from '../../api/adminApi';

export type ProductModalProps = {
  item: AdminProduct | null;
  parentCategories: AdminVehicleCategory[];
  mode: 'view' | 'edit' | 'create';
  open: boolean;
  variant?: 'modal' | 'page';
  isSaving?: boolean;
  onClose: () => void;
  onEdit?: () => void;
  onEditContent?: () => void;
  onSave: (payload: AdminProductPayload) => void;
};

export type FormState = AdminProductPayload;
export type ProductTab = 'info' | 'content' | 'seo';
