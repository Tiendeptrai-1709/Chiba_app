import type { Metadata, Viewport } from 'next';
import './globals.css';
import Providers from '@/lib/providers';


export const metadata: Metadata = {
  title: 'Chiba - Tea, Coffee & Foods',
  description: 'Đặt trà, cà phê và đồ ăn ngon nhất tại Chiba. Trải nghiệm mượt mà, giao hàng tiện lợi.',
  keywords: 'Chiba, trà sữa Chiba, đặt cà phê Chiba, Chiba Tea Coffee Foods',
  applicationName: 'Chiba',
  icons: {
    icon: [
      { url: '/icons/icon-192.png', sizes: '192x192', type: 'image/png' },
      { url: '/icons/icon-512.png', sizes: '512x512', type: 'image/png' },
    ],
    apple: [{ url: '/icons/apple-touch-icon.png', sizes: '180x180' }],
  },
  // iPhone: "Thêm vào MH chính" mở toàn màn hình, tên hiển thị dưới icon là "Chiba"
  appleWebApp: { capable: true, title: 'Chiba', statusBarStyle: 'default' },
  formatDetection: { telephone: false },
};

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
  viewportFit: 'cover',
  themeColor: '#1E4620',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="vi">
      <body className="bg-neutral-100 min-h-screen flex justify-center overflow-x-hidden">
        {/* Mobile Mockup Wrapper for Premium Feel */}
        <div className="w-full max-w-2xl bg-background min-h-screen flex flex-col shadow-premium border-x border-border/30 relative">
          <Providers>
            <main className="flex-grow flex flex-col">
              {children}
            </main>
          </Providers>
        </div>
      </body>
    </html>
  );
}
