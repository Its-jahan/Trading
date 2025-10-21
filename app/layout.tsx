import type { Metadata } from 'next';
import { Vazirmatn } from 'next/font/google';
import './globals.css';

const vazirmatn = Vazirmatn({
  subsets: ['arabic'],
  variable: '--font-vazirmatn',
  display: 'swap',
});

export const metadata: Metadata = {
  title: 'کیف‌پول من – IRT Portfolio',
  description: 'مدیریت دارایی‌ها و هزینه‌های شخصی با تبدیل لحظه‌ای به تومان',
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="fa" dir="rtl" suppressHydrationWarning>
      <body
        className={`${vazirmatn.variable} bg-slate-100 text-slate-900 antialiased transition-colors duration-200 dark:bg-slate-950 dark:text-slate-100`}
      >
        {children}
      </body>
    </html>
  );
}
