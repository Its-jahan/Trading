'use client';

interface UpdateBannerProps {
  visible: boolean;
  message?: string;
}

export function UpdateBanner({ visible, message }: UpdateBannerProps) {
  if (!visible) {
    return null;
  }

  return (
    <div className="rounded-3xl border border-amber-300 bg-amber-100 px-5 py-4 text-sm font-medium text-amber-900 shadow-sm dark:border-amber-500/50 dark:bg-amber-500/10 dark:text-amber-100">
      {message ?? 'نرخ‌ها موقتاً با تأخیر به‌روزرسانی می‌شوند (استفاده از داده‌های کش شده).'}
    </div>
  );
}
