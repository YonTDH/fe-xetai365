import { buildApiUrl } from './http';

export type VehicleOption = {
  id: number;
  title: string;
};

export async function listVehicleOptions(limit = 100): Promise<VehicleOption[]> {
  const response = await fetch(buildApiUrl(`/api/vehicles?limit=${limit}`));
  const data = (await response.json().catch(() => ({}))) as {
    success?: boolean;
    data?: {
      items?: Array<{ id: number; title: string }>;
    };
    message?: string;
  };

  if (!response.ok || data.success === false) {
    throw new Error(data.message || 'Không thể tải danh sách xe.');
  }

  return (data.data?.items || []).map((item) => ({
    id: item.id,
    title: item.title,
  }));
}
