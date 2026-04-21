import { buildApiUrl } from './http';

export type CreateContactRequestPayload = {
  fullName: string;
  phone: string;
  email?: string;
  content?: string;
  vehicleId?: number | null;
};

export async function createContactRequest(payload: CreateContactRequestPayload) {
  const response = await fetch(buildApiUrl('/api/contact-requests'), {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(payload),
  });

  const data = (await response.json().catch(() => ({}))) as {
    success?: boolean;
    message?: string;
  };

  if (!response.ok || data.success === false) {
    throw new Error(data.message || 'Không thể gửi liên hệ. Vui lòng thử lại.');
  }

  return data;
}
