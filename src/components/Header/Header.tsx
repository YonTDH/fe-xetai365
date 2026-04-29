import logoImg from '@/assets/logo-namviet-binh-phuov.png';
import type { PublicSiteSetting } from '@/api/landingApi';
import { formatPhoneDisplay } from '@/lib/formatPhone';

type HeaderProps = {
  setting?: PublicSiteSetting | null;
};

function formatPhoneLabel(value: string) {
  return formatPhoneDisplay(value) || 'Đang cập nhật';
}

export function Header({ setting }: HeaderProps) {
  const phone = setting?.hotline || setting?.dienthoai || '';
  const contactLabel = formatPhoneLabel(phone);
  const contactHref = phone ? `tel:${phone.replace(/[^\d+]/g, '')}` : undefined;
  const brandLabel = setting?.title?.trim() || 'ĐỨC XE TẢI';

  return (
    <div className="container mx-auto flex h-20 items-center justify-between px-4 text-slate-100">
      <div className="flex shrink-0 items-center">
        <img src={logoImg} alt="Nam Việt Logo" className="h-16 w-auto object-contain" />
      </div>

      <div className="hidden flex-1 px-4 text-center md:block">
        <h1 className="text-base font-black tracking-wide text-white md:text-lg lg:text-2xl">
          HINO - ISUZU - HUYNDAI - TERACO - JAC
        </h1>
      </div>

      <div className="flex shrink-0 flex-col items-end">
        {contactHref ? (
          <a href={contactHref} className="text-base font-bold text-slate-100 md:text-lg">
            Liên hệ: {contactLabel}
          </a>
        ) : (
          <span className="text-base font-bold text-slate-100 md:text-lg">Liên hệ: {contactLabel}</span>
        )}
        <span className="text-sm font-semibold text-primary-400">{brandLabel}</span>
      </div>
    </div>
  );
}
