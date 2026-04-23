import type { Metadata } from 'next';
import type { ReactNode } from 'react';
import './globals.css';
import BottomNav from '../components/BottomNav';

export const metadata: Metadata = {
  title: 'SaveAI',
  description: '세이브AI 금융 지출 관리 앱',
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="ko" className="dark">
      <body>
        {children}
        <BottomNav />
      </body>
    </html>
  );
}
