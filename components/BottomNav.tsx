import Link from 'next/link';
import { CreditCard, Home, PieChart, Settings, Wallet, Shield } from 'lucide-react';

const navItems = [
  { label: '홈', icon: Home, href: '/' },
  { label: '지출분석', icon: PieChart, href: '/expense-analysis' },
  { label: '카드추천', icon: CreditCard, href: '/card-assistant' },
  { label: '금융연동', icon: Shield, href: '/financial-sync' },
  { label: '설정', icon: Settings, href: '/settings' },
];

export default function BottomNav() {
  return (
    <nav className="fixed inset-x-0 bottom-0 z-30 border-t border-white/10 bg-navy/95 pb-safe pt-3 backdrop-blur-xl">
      <div className="mx-auto flex max-w-xl items-center justify-between px-5">
        {navItems.map((item) => {
          const Icon = item.icon;
          return (
            <Link
              key={item.label}
              href={item.href as any}
              className="inline-flex flex-col items-center gap-1 text-center text-xs text-slate-400 transition hover:text-white"
            >
              <Icon size={20} />
              <span>{item.label}</span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
