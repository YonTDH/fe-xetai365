import { Globe, Home, Mail, MessageCircle, Phone } from 'lucide-react';
import type { PublicSiteSetting } from '@/api/landingApi';
import { formatPhoneDisplay } from '@/lib/formatPhone';

type FooterProps = {
  setting?: PublicSiteSetting | null;
};

function splitAddresses(value: string) {
  return value
    .split(/\r?\n/)
    .map((line) => line.trim())
    .filter(Boolean);
}

function parseShowroomItems(value: string) {
  return splitAddresses(value).map((line, index) => {
    const separatorIndex = line.indexOf(':');
    if (separatorIndex === -1) {
      return {
        id: `${index}-${line}`,
        office: `Showroom ${index + 1}`,
        address: line,
      };
    }

    return {
      id: `${index}-${line}`,
      office: line.slice(0, separatorIndex).trim(),
      address: line.slice(separatorIndex + 1).trim(),
    };
  });
}

function splitWebsites(value: string) {
  return value
    .split(/\r?\n/)
    .map((line) => line.trim())
    .filter(Boolean);
}

function normalizePhoneHref(value: string) {
  return value.replace(/[^\d+]/g, '');
}

function normalizePhoneForZalo(value: string) {
  const digits = String(value || '').replace(/\D/g, '');
  if (!digits) return '';
  return digits.startsWith('0') ? `84${digits.slice(1)}` : digits;
}

function normalizeUrl(value: string) {
  const trimmed = value.trim();
  if (!trimmed) return '';
  if (/^https?:\/\//i.test(trimmed)) return trimmed;
  return `https://${trimmed}`;
}

function SocialButton({
  href,
  label,
  className,
  children,
}: {
  href: string;
  label: string;
  className: string;
  children: React.ReactNode;
}) {
  if (!href) return null;

  return (
    <a
      href={href}
      aria-label={label}
      className={className}
      target="_blank"
      rel="noreferrer"
    >
      {children}
    </a>
  );
}

export function Footer({ setting }: FooterProps) {
  const phone = setting?.hotline || setting?.dienthoai || '';
  const email = setting?.email || '';
  const website = setting?.website || '';
  const companyTitle = setting?.title?.trim() || 'Ô TÔ NAM VIỆT GROUP';
  const showroomItems = parseShowroomItems(setting?.diachi || '');
  const phoneHref = phone ? `tel:${normalizePhoneHref(phone)}` : '';
  const phoneLabel = formatPhoneDisplay(phone);
  const emailHref = email ? `mailto:${email}` : '';
  const websiteLines = splitWebsites(website);
  const facebookHref = normalizeUrl(setting?.facebook || '');
  const youtubeHref = normalizeUrl(setting?.youtube || '');
  const skypeHref = normalizeUrl(setting?.skype || '');
  const zaloHref =
    normalizeUrl(setting?.zalo || '') ||
    (normalizePhoneForZalo(phone) ? `https://zalo.me/${normalizePhoneForZalo(phone)}` : '');

  return (
    <footer>
      <div className="border-b border-slate-700 bg-[#0f172a] py-3 text-sm text-gray-300 md:text-base">
        <div className="container mx-auto flex flex-wrap justify-center gap-6 px-4 md:gap-12">
          <span className="flex items-center gap-2 font-semibold tracking-wide">
            ĐIỆN THOẠI:
            {phoneHref ? (
              <a href={phoneHref} className="transition-colors hover:text-blue-400">
                {phoneLabel}
              </a>
            ) : (
              <span>Đang cập nhật</span>
            )}
          </span>
          <span className="flex items-center gap-2 font-semibold tracking-wide">
            EMAIL:
            {emailHref ? (
              <a href={emailHref} className="transition-colors hover:text-blue-400">
                {email}
              </a>
            ) : (
              <span>Đang cập nhật</span>
            )}
          </span>
        </div>
      </div>

      <div className="bg-[#0f172a] py-10 text-gray-300">
        <div className="container mx-auto grid grid-cols-1 gap-10 px-4 md:grid-cols-2">
          <div>
            <h3 className="mb-5 text-lg font-extrabold uppercase tracking-wide text-white">Vị trí showroom</h3>
            <ul className="space-y-3 text-sm leading-6">
              {showroomItems.length ? (
                showroomItems.map((item) => (
                  <li key={item.id} className="flex items-start gap-2 border-b border-slate-700/70 pb-3 last:border-b-0 last:pb-0">
                    <Home className="mt-1 h-4 w-4 shrink-0" />
                    <div>
                      <div className="font-bold uppercase text-white">{item.office}</div>
                      <div>{item.address}</div>
                    </div>
                  </li>
                ))
              ) : (
                <li className="flex items-start gap-2">
                  <Home className="mt-1 h-4 w-4 shrink-0" />
                  <span>Địa chỉ đang cập nhật.</span>
                </li>
              )}
            </ul>
          </div>

          <div>
            <h3 className="mb-5 text-lg font-extrabold uppercase tracking-wide text-white">Liên hệ và kết nối</h3>

            <ul className="space-y-3 text-sm leading-6">
              <li className="flex items-center gap-2">
                <Phone className="h-4 w-4 shrink-0" />
                {phoneHref ? (
                  <a href={phoneHref} className="hover:text-blue-400">
                    {phoneLabel}
                  </a>
                ) : (
                  <span>Đang cập nhật</span>
                )}
              </li>

              <li className="flex items-center gap-2">
                <Mail className="h-4 w-4 shrink-0" />
                {emailHref ? (
                  <a href={emailHref} className="hover:text-blue-400">
                    {email}
                  </a>
                ) : (
                  <span>Đang cập nhật</span>
                )}
              </li>

              <li className="flex items-start gap-2">
                <Globe className="mt-1 h-4 w-4 shrink-0" />
                {websiteLines.length ? (
                  <div className="space-y-1">
                    {websiteLines.map((site) => (
                      <div key={site}>
                        <a href={normalizeUrl(site)} className="hover:text-blue-400" target="_blank" rel="noreferrer">
                          {site}
                        </a>
                      </div>
                    ))}
                  </div>
                ) : (
                  <span>Đang cập nhật</span>
                )}
              </li>
            </ul>

            <div className="mt-6 flex flex-wrap items-center gap-3">
              <SocialButton
                href={facebookHref}
                label="Facebook"
                className="flex h-9 w-9 items-center justify-center rounded bg-[#1877F2] text-white transition-opacity hover:opacity-80"
              >
                <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M22 12c0-5.523-4.477-10-10-10S2 6.477 2 12c0 4.991 3.657 9.128 8.438 9.878v-6.987H7.898V12h2.54V9.797c0-2.506 1.492-3.89 3.777-3.89 1.094 0 2.238.195 2.238.195v2.46h-1.26c-1.243 0-1.63.771-1.63 1.562V12h2.773l-.443 2.89h-2.33v6.988C18.343 21.128 22 16.991 22 12z" />
                </svg>
              </SocialButton>

              <SocialButton
                href={youtubeHref}
                label="Youtube"
                className="flex h-9 w-9 items-center justify-center rounded bg-[#FF0000] text-white transition-opacity hover:opacity-80"
              >
                <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z" />
                </svg>
              </SocialButton>

              <SocialButton
                href={zaloHref}
                label="Zalo"
                className="flex h-9 w-9 items-center justify-center rounded bg-[#0068FF] text-[10px] font-extrabold text-white transition-opacity hover:opacity-80"
              >
                Zalo
              </SocialButton>

              <SocialButton
                href={skypeHref}
                label="Skype"
                className="flex h-9 w-9 items-center justify-center rounded bg-[#00AFF0] text-white transition-opacity hover:opacity-80"
              >
                <MessageCircle className="h-5 w-5" />
              </SocialButton>
            </div>
          </div>
        </div>
      </div>

      <div className="bg-[#222] py-4 text-center text-xs text-gray-400">
        Copyright © 2017 {companyTitle} | All rights reserved.
      </div>
    </footer>
  );
}
