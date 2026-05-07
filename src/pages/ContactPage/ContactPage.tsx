import { useEffect, useMemo, useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { PublicSectionHeading } from '@/components/PublicSectionHeading';
import { createContactRequest } from '@/api/contactRequestsApi';
import { getPublicSiteSetting, type PublicSiteSetting } from '@/api/landingApi';
import { listVehicleOptions, type VehicleOption } from '@/api/vehiclesApi';

type ContactForm = {
  fullName: string;
  phone: string;
  email: string;
  vehicleId: string;
  message: string;
};

type ContactErrors = Partial<Record<keyof ContactForm, string>>;

const initialForm: ContactForm = {
  fullName: '',
  phone: '',
  email: '',
  vehicleId: '',
  message: '',
};

export function ContactPage() {
  const [form, setForm] = useState<ContactForm>(initialForm);
  const [errors, setErrors] = useState<ContactErrors>({});
  const [submitError, setSubmitError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [vehicles, setVehicles] = useState<VehicleOption[]>([]);
  const [siteSetting, setSiteSetting] = useState<PublicSiteSetting | null>(null);
  const [isLoadingVehicles, setIsLoadingVehicles] = useState(false);

  const contactSummary = useMemo(() => {
    const lines: string[] = [];

    if (siteSetting?.hotline) lines.push(`Hotline bán hàng: ${siteSetting.hotline}`);
    if (siteSetting?.hotline1) lines.push(`Đường dây nóng: ${siteSetting.hotline1}`);
    if (siteSetting?.hotline2) lines.push(`Hỗ trợ thêm: ${siteSetting.hotline2}`);
    if (siteSetting?.email) lines.push(`Email: ${siteSetting.email}`);
    if (siteSetting?.diachi) lines.push(`Địa chỉ: ${siteSetting.diachi}`);

    return lines.length ? lines : ['Thông tin liên hệ đang cập nhật.'];
  }, [siteSetting]);

  const setField = (field: keyof ContactForm, value: string) => {
    setForm((prev) => ({ ...prev, [field]: value }));
    setErrors((prev) => ({ ...prev, [field]: undefined }));
    setSubmitError('');
    setIsSubmitted(false);
  };

  useEffect(() => {
    let mounted = true;

    const loadVehicles = async () => {
      try {
        setIsLoadingVehicles(true);
        const options = await listVehicleOptions(100);
        if (mounted) {
          setVehicles(options);
        }
      } catch {
        if (mounted) {
          setVehicles([]);
        }
      } finally {
        if (mounted) {
          setIsLoadingVehicles(false);
        }
      }
    };

    const loadSiteSetting = async () => {
      try {
        const data = await getPublicSiteSetting();
        if (mounted) {
          setSiteSetting(data);
        }
      } catch {
        if (mounted) {
          setSiteSetting(null);
        }
      }
    };

    void loadVehicles();
    void loadSiteSetting();

    return () => {
      mounted = false;
    };
  }, []);

  const validate = () => {
    const nextErrors: ContactErrors = {};

    if (!form.fullName.trim()) nextErrors.fullName = 'Vui lòng nhập họ và tên.';
    if (!form.phone.trim()) nextErrors.phone = 'Vui lòng nhập số điện thoại.';
    if (!/^[0-9+\s().-]{8,20}$/.test(form.phone.trim())) nextErrors.phone = 'Số điện thoại chưa hợp lệ.';
    if (!form.email.trim()) nextErrors.email = 'Vui lòng nhập email.';
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email.trim())) nextErrors.email = 'Email chưa hợp lệ.';
    if (!form.vehicleId) nextErrors.vehicleId = 'Vui lòng chọn xe cần tư vấn.';
    if (!form.message.trim()) nextErrors.message = 'Vui lòng nhập nội dung liên hệ.';

    setErrors(nextErrors);
    return Object.keys(nextErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!validate()) return;

    try {
      setIsSubmitting(true);
      setSubmitError('');
      await createContactRequest({
        fullName: form.fullName.trim(),
        phone: form.phone.trim(),
        email: form.email.trim(),
        vehicleId: form.vehicleId === 'other' ? null : Number(form.vehicleId),
        content: form.message.trim(),
      });
      setIsSubmitted(true);
      setForm(initialForm);
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Không thể gửi liên hệ. Vui lòng thử lại.';
      setSubmitError(message);
      setIsSubmitted(false);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <section className="bg-slate-50 py-8 md:py-12">
      <div className="container mx-auto px-4">
        <PublicSectionHeading title="Liên hệ" />

        <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
          <Card className="border border-slate-300 bg-white shadow-card lg:col-span-2">
            <CardHeader>
              <CardTitle className="text-lg font-bold text-navy-950">Gửi thông tin liên hệ</CardTitle>
              <CardDescription>Điền form, đội ngũ tư vấn sẽ phản hồi sớm nhất.</CardDescription>
            </CardHeader>

            <CardContent>
              <form className="space-y-4" onSubmit={handleSubmit} noValidate>
                <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                  <div className="space-y-1">
                    <label className="text-sm font-semibold text-slate-700" htmlFor="fullName">
                      Họ và tên <span className="text-red-600">*</span>
                    </label>
                    <Input
                      id="fullName"
                      value={form.fullName}
                      onChange={(e) => setField('fullName', e.target.value)}
                      placeholder="Nhập họ và tên"
                      aria-invalid={Boolean(errors.fullName)}
                    />
                    {errors.fullName && <p className="text-xs text-red-600">{errors.fullName}</p>}
                  </div>

                  <div className="space-y-1">
                    <label className="text-sm font-semibold text-slate-700" htmlFor="phone">
                      Số điện thoại <span className="text-red-600">*</span>
                    </label>
                    <Input
                      id="phone"
                      value={form.phone}
                      onChange={(e) => setField('phone', e.target.value)}
                      placeholder="Nhập số điện thoại"
                      aria-invalid={Boolean(errors.phone)}
                    />
                    {errors.phone && <p className="text-xs text-red-600">{errors.phone}</p>}
                  </div>
                </div>

                <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                  <div className="space-y-1">
                    <label className="text-sm font-semibold text-slate-700" htmlFor="email">
                      Email <span className="text-red-600">*</span>
                    </label>
                    <Input
                      id="email"
                      type="email"
                      value={form.email}
                      onChange={(e) => setField('email', e.target.value)}
                      placeholder="example@email.com"
                      aria-invalid={Boolean(errors.email)}
                    />
                    {errors.email && <p className="text-xs text-red-600">{errors.email}</p>}
                  </div>

                  <div className="space-y-1">
                    <label className="text-sm font-semibold text-slate-700" htmlFor="vehicleId">
                      Chọn xe cần tư vấn <span className="text-red-600">*</span>
                    </label>
                    <select
                      id="vehicleId"
                      value={form.vehicleId}
                      onChange={(e) => setField('vehicleId', e.target.value)}
                      aria-label="Chọn xe cần tư vấn"
                      title="Chọn xe cần tư vấn"
                      className="h-8 w-full rounded-lg border border-input bg-transparent px-2.5 py-1 text-sm text-slate-800 outline-none transition-colors focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50"
                      aria-invalid={Boolean(errors.vehicleId)}
                      disabled={isLoadingVehicles}
                    >
                      <option value="">{isLoadingVehicles ? 'Đang tải danh sách xe...' : 'Chọn xe'}</option>
                      <option value="other">Khác</option>
                      {vehicles.map((vehicle) => (
                        <option key={vehicle.id} value={vehicle.id}>
                          #{vehicle.id} - {vehicle.title}
                        </option>
                      ))}
                    </select>
                    {errors.vehicleId && <p className="text-xs text-red-600">{errors.vehicleId}</p>}
                  </div>
                </div>

                <div className="space-y-1">
                  <label className="text-sm font-semibold text-slate-700" htmlFor="message">
                    Nội dung liên hệ <span className="text-red-600">*</span>
                  </label>
                  <textarea
                    id="message"
                    value={form.message}
                    onChange={(e) => setField('message', e.target.value)}
                    placeholder="Nhập nội dung cần tư vấn..."
                    rows={5}
                    className="w-full rounded-lg border border-input bg-transparent px-2.5 py-2 text-sm text-slate-800 outline-none transition-colors placeholder:text-muted-foreground focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50"
                    aria-invalid={Boolean(errors.message)}
                  />
                  {errors.message && <p className="text-xs text-red-600">{errors.message}</p>}
                </div>

                <div className="flex items-center gap-3">
                  <Button type="submit" className="bg-primary-600 text-white hover:bg-primary-700" disabled={isSubmitting}>
                    {isSubmitting ? 'Đang gửi...' : 'Gửi liên hệ'}
                  </Button>
                  {isSubmitted && <p className="text-sm font-medium text-accent-green">Đã gửi thông tin thành công.</p>}
                  {submitError && <p className="text-sm font-medium text-red-600">{submitError}</p>}
                </div>
              </form>
            </CardContent>
          </Card>

          <Card className="border border-slate-300 bg-white shadow-card">
            <CardHeader>
              <CardTitle className="text-base font-bold uppercase text-navy-950">Thông tin công ty</CardTitle>
              <CardDescription>Liên hệ trực tiếp qua hotline hoặc email.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-2 text-sm leading-relaxed text-slate-700">
              {contactSummary.map((line) => (
                <p key={line}>{line}</p>
              ))}
            </CardContent>
          </Card>
        </div>
      </div>
    </section>
  );
}
