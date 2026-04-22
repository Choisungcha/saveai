import Link from 'next/link';
import { CreditCard, Home, PieChart, Settings, TrendingUp, Wallet } from 'lucide-react';

const navItems = [
  { label: '홈', icon: Home },
  { label: '지출분석', icon: PieChart },
  { label: '카드추천', icon: CreditCard },
  { label: '설정', icon: Settings },
];

const chartData = [
  { label: '구독', value: 42, amount: '₩ 78,000', color: '#22C55E' },
  { label: '통신', value: 25, amount: '₩ 46,000', color: '#8EE158' },
  { label: '카드결제', value: 18, amount: '₩ 33,000', color: '#5BCE52' },
  { label: '기타', value: 15, amount: '₩ 28,000', color: '#3E8E46' },
];

export default function HomePage() {
  const donutBackground = `conic-gradient(${chartData
    .map((item, index) => `${item.color} ${index === 0 ? 0 : chartData
      .slice(0, index)
      .reduce((acc, next) => acc + next.value, 0)}% ${chartData
      .slice(0, index + 1)
      .reduce((acc, next) => acc + next.value, 0)}%`)
    .join(', ')})`;

  return (
    <main className="min-h-screen bg-navy text-white">
      <div className="mx-auto max-w-xl px-5 pb-24 pt-6">
        <header className="mb-5 flex items-center justify-between">
          <div>
            <p className="text-sm text-slate-400">안녕하세요, SaveAI</p>
            <h1 className="mt-2 text-3xl font-semibold tracking-tight">지출 대시보드</h1>
          </div>
          <button className="rounded-2xl border border-slate-700 bg-white/5 px-4 py-2 text-sm text-slate-200 transition hover:border-slate-500">
            새로고침
          </button>
        </header>

        <section className="mb-5 rounded-[2rem] border border-white/5 bg-[#151B2F] p-5 shadow-glow">
          <div className="flex items-start justify-between gap-4">
            <div>
              <p className="text-sm text-slate-400">총 구독료</p>
              <p className="mt-3 text-4xl font-semibold">₩ 189,000</p>
              <p className="mt-2 text-sm text-slate-500">연간 환산 시 64만원</p>
            </div>
            <div className="flex h-14 w-14 items-center justify-center rounded-3xl bg-white/5 text-green">
              <Wallet size={26} />
            </div>
          </div>
        </section>

        <section className="mb-5 rounded-[2rem] border border-white/5 bg-[#111829] p-5">
          <div className="flex items-center justify-between gap-4">
            <div>
              <p className="text-sm text-slate-400">구독 관리</p>
              <p className="mt-2 text-xl font-semibold">구독 서비스 상세 보기</p>
            </div>
            <Link
              href="/subscriptions"
              className="rounded-2xl bg-green px-4 py-3 text-sm font-semibold text-navy transition hover:bg-green/90"
            >
              구독 보기
            </Link>
          </div>
          <p className="mt-4 text-sm text-slate-400">구독 해지 가이드와 교체 제안을 지금 확인하세요.</p>
        </section>

        <section className="mb-5 rounded-[2rem] border border-white/5 bg-[#111829] p-5">
          <div className="mb-4 flex items-center justify-between gap-4">
            <div>
              <p className="text-sm text-slate-400">AI 카드 비서</p>
              <p className="mt-2 text-xl font-semibold">결제 직전, 최적의 카드를 추천받으세요</p>
            </div>
            <Link
              href="/card-assistant"
              className="rounded-2xl bg-green px-4 py-3 text-sm font-semibold text-navy transition hover:bg-green/90"
            >
              카드 비서 보기
            </Link>
          </div>
          <p className="mt-4 text-sm text-slate-400">위치와 업종을 선택하면 가장 혜택이 큰 카드를 자동으로 추천합니다.</p>
        </section>

        <section className="mb-5 rounded-[2rem] border border-white/5 bg-surface p-5">
          <div className="flex items-center gap-4 rounded-3xl border border-green/30 bg-[#163021] p-4 shadow-sm">
            <div className="flex h-12 w-12 items-center justify-center rounded-3xl bg-green/10 text-green">
              <TrendingUp size={22} />
            </div>
            <div>
              <p className="text-sm text-slate-400">AI 절약 알림</p>
              <p className="mt-2 text-base font-semibold text-white">
                최근 3개월간 미사용 중인 넷플릭스를 해지하면 월 17,000원이 세이브됩니다.
              </p>
            </div>
          </div>
        </section>

        <section className="grid gap-4">
          <article className="rounded-[2rem] border border-white/5 bg-surface p-5">
            <div className="mb-5 flex items-center justify-between">
              <div>
                <p className="text-sm text-slate-400">소비 분석</p>
                <p className="mt-2 text-xl font-semibold">이번 달 카테고리별 지출</p>
              </div>
              <div className="rounded-2xl bg-[#182339] p-3 text-slate-200">
                <PieChart size={20} />
              </div>
            </div>

            <div className="grid gap-5 md:grid-cols-[220px_1fr]">
              <div className="flex items-center justify-center">
                <div className="relative h-52 w-52 rounded-full bg-slate-800/70">
                  <div className="absolute inset-0 rounded-full" style={{ background: donutBackground }} />
                  <div className="absolute left-1/2 top-1/2 h-28 w-28 -translate-x-1/2 -translate-y-1/2 rounded-full bg-navy shadow-[0_0_0_8px_rgba(15,23,42,0.85)]">
                    <div className="flex h-full flex-col items-center justify-center text-center">
                      <p className="text-sm text-slate-400">구독</p>
                      <p className="mt-1 text-2xl font-semibold">42%</p>
                    </div>
                  </div>
                </div>
              </div>

              <div className="space-y-4">
                {chartData.map((item) => (
                  <div key={item.label} className="space-y-2">
                    <div className="flex items-center justify-between text-sm text-slate-300">
                      <div className="flex items-center gap-2">
                        <span className="h-2 w-2 rounded-full" style={{ backgroundColor: item.color }} />
                        <span>{item.label}</span>
                      </div>
                      <span>{item.amount}</span>
                    </div>
                    <div className="h-3 overflow-hidden rounded-full bg-slate-800">
                      <div className="h-full rounded-full" style={{ width: `${item.value}%`, backgroundColor: item.color }} />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </article>

          <article className="rounded-[2rem] border border-white/5 bg-surface p-5">
            <div className="mb-4 flex items-center justify-between">
              <div>
                <p className="text-sm text-slate-400">추천 관리</p>
                <p className="mt-2 text-xl font-semibold">오늘 바로 확인해보세요</p>
              </div>
              <div className="rounded-2xl bg-[#182339] p-3 text-slate-200">
                <CreditCard size={20} />
              </div>
            </div>
            <div className="flex flex-col gap-3 text-sm text-slate-300">
              <div className="rounded-3xl bg-[#111829] p-4">
                <p className="font-medium">포인트 적립 카드</p>
                <p className="mt-1 text-slate-500">일상 소비 시 적립률 최대 2%</p>
              </div>
              <div className="rounded-3xl bg-[#111829] p-4">
                <p className="font-medium">해외 결제 카드</p>
                <p className="mt-1 text-slate-500">환전 수수료 절감</p>
              </div>
            </div>
          </article>
        </section>
      </div>

      <nav className="fixed inset-x-0 bottom-0 z-30 border-t border-white/10 bg-navy/95 pb-safe pt-3 backdrop-blur-xl">
        <div className="mx-auto flex max-w-xl items-center justify-between px-5">
          {navItems.map((item) => {
            const Icon = item.icon;
            return (
              <button key={item.label} className="inline-flex flex-col items-center gap-1 text-center text-xs text-slate-400 transition hover:text-white">
                <Icon size={20} />
                <span>{item.label}</span>
              </button>
            );
          })}
        </div>
      </nav>
    </main>
  );
}
