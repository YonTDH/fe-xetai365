import { useEffect, useMemo, useState } from 'react';
import view1 from '@/assets/gioi-thieu/View 1.png';
import view2 from '@/assets/gioi-thieu/view2.jpg';
import view3 from '@/assets/gioi-thieu/view3.jpg';
import view4 from '@/assets/gioi-thieu/view4.jpg';
import view5 from '@/assets/gioi-thieu/view5.jpg';
import view6 from '@/assets/gioi-thieu/view6.jpg';
import { getPublicSiteSetting, type PublicSiteSetting } from '@/api/landingApi';
import { PublicSectionHeading } from '@/components/PublicSectionHeading';
import { formatPhoneDisplay } from '@/lib/formatPhone';

const introImages = [view1, view2, view3, view4, view5, view6];

function splitAddresses(value: string) {
  return value
    .split(/\r?\n/)
    .map((line) => line.trim())
    .filter(Boolean);
}

export function AboutPage() {
  const [siteSetting, setSiteSetting] = useState<PublicSiteSetting | null>(null);

  useEffect(() => {
    let mounted = true;

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

    void loadSiteSetting();

    return () => {
      mounted = false;
    };
  }, []);

  const addresses = useMemo(() => splitAddresses(siteSetting?.diachi || ''), [siteSetting?.diachi]);

  return (
    <section className="bg-slate-50 py-8 md:py-12">
      <div className="container mx-auto px-4">
        <PublicSectionHeading title="Giới thiệu" />

        <div className="rounded-lg border border-slate-300 bg-white p-4 shadow-card md:p-6">
          <div className="space-y-2 text-sm leading-relaxed md:text-base">
            <p className="font-semibold text-red-600">XE TẢI 365 / HỒ SƠ PHÁP LÝ / HỒ SƠ NĂNG LỰC.</p>
            <p className="font-semibold text-navy-900">{siteSetting?.title || 'XE TẢI 365 GROUP'}</p>
            <p className="font-medium text-navy-900">Mã số thuế: 3801223229/0314868566</p>
            {addresses.length ? (
              addresses.map((line, index) => (
                <p key={`${line}-${index}`} className="font-semibold text-navy-900">
                  {line}
                </p>
              ))
            ) : (
              <p className="font-semibold text-navy-900">Địa chỉ đang cập nhật.</p>
            )}
            {siteSetting?.hotline ? (
              <p className="pt-1 text-base font-bold leading-tight text-red-600 md:text-xl">
                Hotline: {formatPhoneDisplay(siteSetting.hotline)}
              </p>
            ) : null}
            {siteSetting?.hotline1 ? (
              <p className="text-base font-bold leading-tight text-red-600 md:text-xl">
                Hotline: {formatPhoneDisplay(siteSetting.hotline1)}
              </p>
            ) : null}
            {siteSetting?.hotline2 ? (
              <p className="text-base font-bold leading-tight text-red-600 md:text-xl">
                Hotline: {formatPhoneDisplay(siteSetting.hotline2)}
              </p>
            ) : null}
            {siteSetting?.email ? <p className="font-semibold italic text-slate-700">Email: {siteSetting.email}</p> : null}
            {siteSetting?.website ? <p className="font-semibold italic text-slate-700">Website: {siteSetting.website}</p> : null}
          </div>

          <div className="my-5 border-t border-slate-300" />

          <div className="space-y-3 text-sm leading-relaxed text-slate-700 md:text-base">
            <p>
              <span className="font-semibold text-red-600">XE TẢI 365 GROUP</span> xin trân trọng chào mừng và cảm ơn sâu
              sắc đến quý khách hàng, đối tác trong suốt thời gian qua đã đặt niềm tin và đồng hành cùng chúng tôi.
            </p>
            <p>
              Công ty chúng tôi chuyên phân phối chính thức các dòng sản phẩm xe thương mại bao gồm: TERACO, HYUNDAI,
              HINO, ISUZU, JAC, FOTON THANH CÔNG, DONGFENG, HOWO, CHENGLONG. Ngoài ra chúng tôi còn cung cấp thêm
              sơmi rơmoóc: <span className="font-semibold text-navy-900">CIMC - DOOSUNG - THACO - PATEC - TÂN THANH</span>
            </p>
            <p className="font-medium text-navy-900">
              ■ Nhận thiết kế - Gia công - Lắp ráp - cải tạo các dòng xe chuyên dùng theo yêu cầu khách hàng.
            </p>
            <p className="font-medium text-navy-900">■ Trạm bảo hành 3S được ủy quyền của nhà máy tại miền Nam.</p>
            <p className="font-medium text-navy-900">
              ■ <span className="text-red-600">XE TẢI 365 GROUP</span> hứa hẹn sẽ mang lại những giá trị đích thực, sự hài
              lòng cao nhất cho tất cả quý khách hàng.
            </p>
            {addresses[0] ? <p className="font-semibold text-navy-900">{addresses[0]}</p> : null}
          </div>
        </div>

        <div className="mt-6 grid gap-4 md:mt-8 md:grid-cols-2">
          {introImages.map((imgSrc, index) => (
            <img
              key={imgSrc}
              src={imgSrc}
              alt={`Giới thiệu xe tải 365 - ảnh ${index + 1}`}
              className="h-full w-full rounded-md border border-slate-300 bg-white object-cover shadow-card"
              loading="lazy"
            />
          ))}
        </div>
      </div>
    </section>
  );
}
