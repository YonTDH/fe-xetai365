import { type FormEvent, useCallback, useEffect, useState } from 'react';
import { RefreshCw, Save } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useAppToast } from '@/components/ui/toast';
import {
  getAdminSiteSetting,
  updateAdminSiteSetting,
  type AdminSiteSettingPayload,
} from '../../api/adminApi';

type TextField = {
  key: keyof AdminSiteSettingPayload;
  label: string;
  placeholder?: string;
  multiline?: boolean;
};

type FieldGroup = {
  title: string;
  description: string;
  fields: TextField[];
};

const emptyForm: AdminSiteSettingPayload = {
  title: '',
  keywords: '',
  description: '',
  giupdochiase: 0,
  ten: '',
  email: '',
  website: '',
  dienthoai: '',
  diachi: '',
  fax: '',
  tennv: '',
  hotline: '',
  tennv1: '',
  hotline1: '',
  tennv2: '',
  hotline2: '',
  toado: '',
  facebook: '',
  youtube: '',
  yahoo: '',
  skype: '',
  twitter: '',
  zing: '',
  google: '',
  tip: '',
  linktip: '',
  analytics: '',
  dangky: '',
  tietkiem: '',
  hailong: '',
};

const fieldGroups: FieldGroup[] = [
  {
    title: 'Nội dung giới thiệu',
    description: 'Thông tin SEO và mô tả chính của trang về chúng tôi.',
    fields: [
      { key: 'title', label: 'Tiêu đề', placeholder: 'Nhập tiêu đề trang' },
      { key: 'description', label: 'Mô tả', placeholder: 'Nhập mô tả ngắn', multiline: true },
      { key: 'keywords', label: 'Từ khóa SEO', placeholder: 'xe tải, mua bán xe tải...' },
    ],
  },
  {
    title: 'Thông tin công ty',
    description: 'Thông tin liên hệ hiển thị trên website.',
    fields: [
      { key: 'ten', label: 'Tên công ty', placeholder: 'Nhập tên công ty' },
      { key: 'email', label: 'Email', placeholder: 'contact@example.com' },
      { key: 'website', label: 'Website', placeholder: 'https://...' },
      { key: 'dienthoai', label: 'Điện thoại', placeholder: 'Số điện thoại' },
      { key: 'diachi', label: 'Địa chỉ', placeholder: 'Nhập địa chỉ', multiline: true },
      { key: 'fax', label: 'Fax', placeholder: 'Fax' },
      { key: 'toado', label: 'Tọa độ / bản đồ', placeholder: 'Link iframe hoặc tọa độ', multiline: true },
    ],
  },
  {
    title: 'Hotline',
    description: 'Các đầu mối tư vấn và hotline bán hàng.',
    fields: [
      { key: 'tennv', label: 'Nhân viên 1', placeholder: 'Tên nhân viên' },
      { key: 'hotline', label: 'Hotline 1', placeholder: 'Số hotline' },
      { key: 'tennv1', label: 'Nhân viên 2', placeholder: 'Tên nhân viên' },
      { key: 'hotline1', label: 'Hotline 2', placeholder: 'Số hotline' },
      { key: 'tennv2', label: 'Nhân viên 3', placeholder: 'Tên nhân viên' },
      { key: 'hotline2', label: 'Hotline 3', placeholder: 'Số hotline' },
    ],
  },
  {
    title: 'Mạng xã hội',
    description: 'Các liên kết ngoài và kênh social của hệ thống.',
    fields: [
      { key: 'facebook', label: 'Facebook', placeholder: 'https://facebook.com/...' },
      { key: 'youtube', label: 'YouTube', placeholder: 'https://youtube.com/...' },
      { key: 'google', label: 'Google', placeholder: 'Google business hoặc Google+' },
      { key: 'twitter', label: 'Twitter / X', placeholder: 'https://x.com/...' },
      { key: 'yahoo', label: 'Yahoo', placeholder: 'Yahoo' },
      { key: 'skype', label: 'Skype', placeholder: 'Skype' },
      { key: 'zing', label: 'Zing', placeholder: 'Zing' },
    ],
  },
  {
    title: 'Cấu hình khác',
    description: 'Các nội dung phụ đang lưu trong bảng settings.',
    fields: [
      { key: 'tip', label: 'Tip', placeholder: 'Nội dung tip', multiline: true },
      { key: 'linktip', label: 'Link tip', placeholder: 'Đường dẫn tip' },
      { key: 'analytics', label: 'Analytics', placeholder: 'Mã analytics', multiline: true },
      { key: 'dangky', label: 'Đăng ký', placeholder: 'Nội dung đăng ký', multiline: true },
      { key: 'tietkiem', label: 'Tiết kiệm', placeholder: 'Nội dung tiết kiệm', multiline: true },
      { key: 'hailong', label: 'Hài lòng', placeholder: 'Nội dung hài lòng', multiline: true },
    ],
  },
];

function createFormState(setting: Partial<AdminSiteSettingPayload>) {
  const nextForm = { ...emptyForm };

  (Object.keys(nextForm) as Array<keyof AdminSiteSettingPayload>).forEach((key) => {
    const value = setting[key];
    if (value !== undefined) {
      Object.assign(nextForm, { [key]: value });
    }
  });

  return nextForm;
}

export function AdminAboutUsPage() {
  const { showToast } = useAppToast();
  const [form, setForm] = useState<AdminSiteSettingPayload>(emptyForm);
  const [updatedAt, setUpdatedAt] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState('');

  const loadSetting = useCallback(async () => {
    try {
      setIsLoading(true);
      setError('');
      const setting = await getAdminSiteSetting();
      setForm(createFormState(setting));
      setUpdatedAt(setting.updatedAt);
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Không thể tải cấu hình.';
      setError(message);
      showToast({ type: 'error', message });
    } finally {
      setIsLoading(false);
    }
  }, [showToast]);

  useEffect(() => {
    void loadSetting();
  }, [loadSetting]);

  const updateField = (key: keyof AdminSiteSettingPayload, value: string | number) => {
    setForm((prev) => ({
      ...prev,
      [key]: value,
    }));
  };

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    try {
      setIsSaving(true);
      setError('');
      const setting = await updateAdminSiteSetting(form);
      setForm(createFormState(setting));
      setUpdatedAt(setting.updatedAt);
      showToast({ type: 'success', message: 'Đã cập nhật cấu hình về chúng tôi.' });
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Không thể lưu cấu hình.';
      setError(message);
      showToast({ type: 'error', message });
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      {error ? <div className="rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">{error}</div> : null}

      <section className="overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-sm">
        <div className="flex flex-col gap-4 border-b border-slate-200 bg-gradient-to-r from-sky-50 via-white to-amber-50 px-6 py-5 lg:flex-row lg:items-center lg:justify-between">
          <div>
            <div className="text-xs font-black uppercase tracking-[0.24em] text-sky-700">Cài đặt website</div>
            <h2 className="mt-2 text-2xl font-black text-slate-950">Về chúng tôi</h2>
            <p className="mt-2 max-w-3xl text-sm leading-6 text-slate-600">
              Load dữ liệu từ bảng settings và cập nhật thông tin giới thiệu, liên hệ, hotline, mạng xã hội.
            </p>
            {updatedAt ? <p className="mt-1 text-xs font-medium text-slate-500">Cập nhật gần nhất: {updatedAt}</p> : null}
          </div>
          <div className="flex items-center gap-2">
            <Button type="button" variant="outline" onClick={() => void loadSetting()} disabled={isLoading || isSaving}>
              <RefreshCw className={['h-4 w-4', isLoading ? 'animate-spin' : ''].join(' ')} />
              {isLoading ? 'Đang tải...' : 'Tải lại'}
            </Button>
            <Button type="submit" disabled={isLoading || isSaving}>
              <Save className="h-4 w-4" />
              {isSaving ? 'Đang lưu...' : 'Lưu cấu hình'}
            </Button>
          </div>
        </div>

        <div className="space-y-5 p-5">
          {fieldGroups.map((group) => (
            <fieldset key={group.title} className="rounded-2xl border border-slate-200 bg-slate-50/70 p-4">
              <div className="mb-4">
                <h3 className="text-base font-black text-slate-950">{group.title}</h3>
                <p className="mt-1 text-sm text-slate-600">{group.description}</p>
              </div>

              <div className="grid gap-4 md:grid-cols-2">
                {group.fields.map((field) => {
                  const rawValue = form[field.key];
                  const value = typeof rawValue === 'number' ? String(rawValue) : rawValue;
                  const inputId = `about-us-${field.key}`;

                  return (
                    <label key={field.key} htmlFor={inputId} className={field.multiline ? 'md:col-span-2' : undefined}>
                      <span className="mb-1.5 block text-sm font-bold text-slate-800">{field.label}</span>
                      {field.multiline ? (
                        <textarea
                          id={inputId}
                          value={value}
                          placeholder={field.placeholder}
                          onChange={(event) => updateField(field.key, event.target.value)}
                          disabled={isLoading || isSaving}
                          className="min-h-24 w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm leading-6 text-slate-900 outline-none transition focus:border-sky-400 focus:ring-4 focus:ring-sky-100 disabled:cursor-not-allowed disabled:bg-slate-100 disabled:text-slate-500"
                        />
                      ) : (
                        <Input
                          id={inputId}
                          value={value}
                          placeholder={field.placeholder}
                          onChange={(event) => updateField(field.key, event.target.value)}
                          disabled={isLoading || isSaving}
                          className="h-10 rounded-xl border-slate-200 bg-white text-slate-900"
                        />
                      )}
                    </label>
                  );
                })}
              </div>
            </fieldset>
          ))}

          <fieldset className="rounded-2xl border border-slate-200 bg-slate-50/70 p-4">
            <label htmlFor="about-us-giupdochiase">
              <span className="mb-1.5 block text-sm font-bold text-slate-800">Giúp đỡ chia sẻ</span>
              <Input
                id="about-us-giupdochiase"
                type="number"
                min={0}
                value={form.giupdochiase}
                onChange={(event) => updateField('giupdochiase', Number(event.target.value))}
                disabled={isLoading || isSaving}
                className="h-10 max-w-xs rounded-xl border-slate-200 bg-white text-slate-900"
              />
            </label>
          </fieldset>
        </div>
      </section>
    </form>
  );
}
