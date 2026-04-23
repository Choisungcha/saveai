'use client';

import Link from 'next/link';
import { useState } from 'react';
import { ArrowRight, BarChart3, ChartPie, Sparkles, Wallet, X } from 'lucide-react';
import AnimatedNumber from '../../components/AnimatedNumber';
import { expenseCategories, expenseInsights, getEstimatedSavings, getTotalSpend, ExpenseInsight } from '../../lib/expenseAnalysis';

export default function ExpenseAnalysisPage() {
  const totalSpend = getTotalSpend();
  const estimatedSavings = getEstimatedSavings();
  const [selectedInsight, setSelectedInsight] = useState<ExpenseInsight | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const handleActionClick = (insight: ExpenseInsight) => {
    setSelectedInsight(insight);
    setIsModalOpen(true);
  };

  return (
    <main className="min-h-screen bg-navy text-white">
      <div className="mx-auto max-w-xl px-5 pb-24 pt-6">
        <header className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <p className="text-sm text-slate-400">SaveAI</p>
            <h1 className="mt-2 text-3xl font-semibold tracking-tight">지출 분석</h1>
          </div>
          <Link
            href="/"
            className="inline-flex items-center gap-2 rounded-2xl border border-white/10 bg-white/5 px-4 py-2 text-sm text-slate-200 transition hover:border-slate-500"
          >
            홈으로
            <ArrowRight size={16} />
          </Link>
        </header>

        <section className="mb-5 rounded-[2rem] border border-white/5 bg-[#151B2F] p-5 shadow-glow">
          <div className="flex items-start justify-between gap-4">
            <div>
              <p className="text-sm text-slate-400">이번 달 지출</p>
              <p className="mt-3 text-4xl font-semibold">
                <AnimatedNumber value={totalSpend} prefix="₩ " />
              </p>
              <p className="mt-2 text-sm text-slate-500">
                예상 절약 가능액 <AnimatedNumber value={estimatedSavings} prefix="₩ " />
              </p>
            </div>
            <div className="flex h-14 w-14 items-center justify-center rounded-3xl bg-white/5 text-green">
              <ChartPie size={26} />
            </div>
          </div>
        </section>

        <section className="mb-5 rounded-[2rem] border border-white/5 bg-surface p-5">
          <div className="mb-5 flex items-center justify-between gap-4">
            <div>
              <p className="text-sm text-slate-400">카테고리별 지출</p>
              <p className="mt-2 text-xl font-semibold">어디에 돈이 많이 나가나요?</p>
            </div>
            <div className="rounded-3xl bg-[#182339] px-4 py-2 text-sm text-slate-200">자동 분석</div>
          </div>

          <div className="space-y-4">
            {expenseCategories.map((item) => (
              <div key={item.label} className="rounded-[1.75rem] bg-[#111829] p-4">
                <div className="mb-3 flex items-center justify-between gap-4">
                  <div>
                    <p className="font-semibold text-white">{item.label}</p>
                    <p className="text-sm text-slate-400">변동 {item.change > 0 ? `+${item.change}%` : `${item.change}%`}</p>
                  </div>
                  <p className="text-lg font-semibold text-white">
                    <AnimatedNumber value={item.amount} prefix="₩ " />
                  </p>
                </div>
                <div className="h-3 overflow-hidden rounded-full bg-slate-800">
                  <div className="h-full rounded-full" style={{ width: `${(item.amount / totalSpend) * 100}%`, backgroundColor: item.color }} />
                </div>
              </div>
            ))}
          </div>
        </section>

        <section className="mb-5 rounded-[2rem] border border-white/5 bg-[#151B2F] p-5">
          <div className="mb-5 flex items-center justify-between gap-4">
            <div>
              <p className="text-sm text-slate-400">절약 제안</p>
              <p className="mt-2 text-xl font-semibold">서비스가 자동으로 채워준 추천</p>
            </div>
            <div className="rounded-3xl bg-green/10 px-4 py-2 text-sm font-semibold text-green">추천 보기</div>
          </div>

          <div className="grid gap-4">
            {expenseInsights.map((insight) => (
              <article key={insight.title} className="rounded-[1.75rem] bg-[#111829] p-5 shadow-[0_20px_60px_rgba(0,0,0,0.18)]">
                <div className="mb-4 flex items-center justify-between gap-4">
                  <div>
                    <p className="text-sm text-slate-400">{insight.category}</p>
                    <h2 className="mt-2 text-xl font-semibold text-white">{insight.title}</h2>
                  </div>
                  <div className="rounded-3xl bg-white/5 px-3 py-2 text-sm text-green">절약 {insight.impact.toLocaleString()}원</div>
                </div>
                <p className="text-sm leading-7 text-slate-300">{insight.description}</p>
                <div className="mt-5 flex items-center justify-between gap-3">
                  <p className="text-sm text-slate-400">추천 액션</p>
                  <button 
                    className="inline-flex items-center gap-2 rounded-3xl bg-green px-4 py-2 text-sm font-semibold text-navy transition hover:bg-green/90"
                    onClick={() => handleActionClick(insight)}
                  >
                    {insight.action}
                    <Sparkles size={16} />
                  </button>
                </div>
              </article>
            ))}
          </div>
        </section>

        <section className="rounded-[2rem] border border-white/5 bg-surface p-5">
          <div className="mb-5 flex items-center justify-between gap-4">
            <div>
              <p className="text-sm text-slate-400">관련 서비스</p>
              <p className="mt-2 text-xl font-semibold">지출 관리를 더 쉽게</p>
            </div>
            <div className="rounded-3xl bg-[#182339] px-4 py-2 text-sm text-slate-200">한 번에 보기</div>
          </div>
          <div className="grid gap-4 sm:grid-cols-2">
            <Link href="/subscriptions" className="rounded-[1.75rem] border border-white/10 bg-[#111829] p-5 transition hover:border-white/20">
              <div className="mb-3 flex items-center gap-3">
                <Wallet size={20} className="text-green" />
                <p className="font-semibold text-white">구독 관리</p>
              </div>
              <p className="text-sm text-slate-400">중복 구독과 미사용 요금을 자동 분석합니다.</p>
            </Link>
            <Link href="/card-assistant" className="rounded-[1.75rem] border border-white/10 bg-[#111829] p-5 transition hover:border-white/20">
              <div className="mb-3 flex items-center gap-3">
                <BarChart3 size={20} className="text-green" />
                <p className="font-semibold text-white">카드 추천</p>
              </div>
              <p className="text-sm text-slate-400">지출 패턴에 맞는 최적의 카드를 바로 추천합니다.</p>
            </Link>
          </div>
        </section>
      </div>

      {/* 혜택 확인 모달 */}
      {isModalOpen && selectedInsight && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="w-full max-w-md rounded-[2rem] bg-surface p-6 shadow-2xl">
            <div className="mb-4 flex items-center justify-between">
              <h3 className="text-xl font-semibold text-white">{selectedInsight.title}</h3>
              <button
                onClick={() => setIsModalOpen(false)}
                className="rounded-full p-2 text-slate-400 hover:bg-white/10 hover:text-white"
              >
                <X size={20} />
              </button>
            </div>
            
            <div className="mb-6">
              <p className="text-sm text-slate-300">{selectedInsight.description}</p>
            </div>

            <div className="mb-6">
              <h4 className="mb-3 text-lg font-semibold text-white">주요 혜택</h4>
              <ul className="space-y-2">
                {selectedInsight.benefits?.map((benefit, index) => (
                  <li key={index} className="flex items-start gap-2 text-sm text-slate-300">
                    <span className="mt-1 h-1.5 w-1.5 rounded-full bg-green"></span>
                    {benefit}
                  </li>
                ))}
              </ul>
            </div>

            {selectedInsight.alternatives && selectedInsight.alternatives.length > 0 && (
              <div className="mb-6">
                <h4 className="mb-3 text-lg font-semibold text-white">대체 옵션</h4>
                <div className="space-y-3">
                  {selectedInsight.alternatives.map((alt, index) => (
                    <div key={index} className="rounded-lg bg-[#111829] p-3">
                      <div className="flex items-center justify-between">
                        <span className="text-sm font-medium text-white">{alt.name}</span>
                        <span className="text-sm text-green">월 {alt.savings.toLocaleString()}원 절약</span>
                      </div>
                      {alt.price > 0 && (
                        <p className="mt-1 text-xs text-slate-400">월 {alt.price.toLocaleString()}원</p>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}

            <div className="flex gap-3">
              <button
                onClick={() => setIsModalOpen(false)}
                className="flex-1 rounded-3xl border border-white/10 bg-white/5 py-3 text-sm font-semibold text-slate-200 transition hover:border-white/20"
              >
                닫기
              </button>
              <button className="flex-1 rounded-3xl bg-green py-3 text-sm font-semibold text-navy transition hover:bg-green/90">
                적용하기
              </button>
            </div>
          </div>
        </div>
      )}
    </main>
  );
}
