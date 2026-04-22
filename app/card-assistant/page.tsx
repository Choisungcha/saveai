'use client';

import Link from 'next/link';
import { useMemo, useState } from 'react';
import { ArrowRight, ChevronRight, CreditCard } from 'lucide-react';
import { cards, categories, locations, recommendBestCard } from '../../lib/cardAssistant';

export default function CardAssistantPage() {
  const [location, setLocation] = useState(locations[0]);
  const [category, setCategory] = useState(categories[0]);
  const recommendedCard = useMemo(() => recommendBestCard(category, location), [category, location]);

  return (
    <main className="min-h-screen bg-navy text-white">
      <div className="mx-auto max-w-xl px-5 pb-24 pt-6">
        <header className="mb-6 flex items-center justify-between gap-4">
          <div>
            <p className="text-sm text-slate-400">AI 카드 비서</p>
            <h1 className="mt-2 text-3xl font-semibold tracking-tight">지금 가장 유리한 카드를 추천합니다</h1>
          </div>
          <Link
            href="/"
            className="inline-flex items-center gap-2 rounded-2xl border border-white/10 bg-white/5 px-4 py-2 text-sm text-slate-200 transition hover:border-slate-500"
          >
            홈으로
            <ChevronRight size={16} />
          </Link>
        </header>

        <section className="mb-5 rounded-[2rem] border border-white/5 bg-surface p-5">
          <div className="mb-4 flex items-center justify-between">
            <div>
              <p className="text-sm text-slate-400">위치</p>
              <p className="mt-2 text-lg font-semibold">현재 위치를 선택하세요</p>
            </div>
            <div className="rounded-3xl bg-white/5 px-4 py-2 text-sm text-slate-200">{location}</div>
          </div>
          <div className="flex flex-wrap gap-3">
            {locations.map((item) => (
              <button
                key={item}
                type="button"
                onClick={() => setLocation(item)}
                className={`rounded-2xl border px-4 py-3 text-sm transition ${
                  item === location ? 'border-green bg-green/10 text-green' : 'border-white/10 bg-[#111829] text-slate-300 hover:border-white/20'
                }`}
              >
                {item}
              </button>
            ))}
          </div>
        </section>

        <section className="mb-5 rounded-[2rem] border border-white/5 bg-surface p-5">
          <div className="mb-4 flex items-center justify-between">
            <div>
              <p className="text-sm text-slate-400">업종 선택</p>
              <p className="mt-2 text-lg font-semibold">어디서 결제하시나요?</p>
            </div>
            <div className="rounded-3xl bg-white/5 px-4 py-2 text-sm text-slate-200">{category}</div>
          </div>
          <div className="flex flex-wrap gap-3">
            {categories.map((item) => (
              <button
                key={item}
                type="button"
                onClick={() => setCategory(item)}
                className={`rounded-2xl border px-4 py-3 text-sm transition ${
                  item === category ? 'border-green bg-green/10 text-green' : 'border-white/10 bg-[#111829] text-slate-300 hover:border-white/20'
                }`}
              >
                {item}
              </button>
            ))}
          </div>
        </section>

        <section className="mb-6 rounded-[2rem] border border-white/5 bg-[#151B2F] p-5 shadow-glow">
          <div className="mb-4 flex items-center justify-between gap-4">
            <div>
              <p className="text-sm text-slate-400">추천 카드</p>
              <p className="mt-2 text-2xl font-semibold">이 카드를 지금 사용하세요</p>
            </div>
            <div className="rounded-3xl bg-green/10 px-4 py-2 text-sm font-semibold text-green">우수 카드</div>
          </div>
          <div className="rounded-[2rem] border border-green/20 bg-[#111829] p-5">
            <div className="flex items-center justify-between gap-4">
              <div>
                <p className="text-sm text-slate-400">{location} · {category}</p>
                <p className="mt-3 text-2xl font-semibold text-white">{recommendedCard.name}</p>
                <p className="mt-2 text-sm text-slate-400">{recommendedCard.bank}</p>
              </div>
              <div className="flex h-16 w-16 items-center justify-center rounded-3xl bg-white/10 text-2xl font-semibold text-green">
                {recommendedCard.logo}
              </div>
            </div>
            <div className="mt-5 rounded-[1.5rem] bg-[#0f1720] p-4 text-sm text-slate-300">
              <p className="text-slate-400">추천 이유</p>
              <p className="mt-2 text-lg font-semibold text-white">이 카드는 {recommendedCard.recommendedBenefit?.label}.</p>
              <p className="mt-3 text-sm text-slate-400">
                {recommendedCard.remainingThreshold?.label} {recommendedCard.remainingThreshold?.amount.toLocaleString()}원 남았습니다.
              </p>
            </div>
            <button className="mt-5 inline-flex items-center gap-2 rounded-3xl bg-green px-5 py-3 text-sm font-semibold text-navy transition hover:bg-green/90">
              이 카드로 결제하기
              <ArrowRight size={16} />
            </button>
          </div>
        </section>

        <section className="rounded-[2rem] border border-white/5 bg-surface p-5">
          <div className="mb-5 flex items-center justify-between">
            <div>
              <p className="text-sm text-slate-400">카드 스택</p>
              <p className="mt-2 text-xl font-semibold">다른 혜택도 한눈에 보기</p>
            </div>
            <div className="rounded-2xl bg-[#182339] px-3 py-2 text-slate-200">옆으로 넘기세요</div>
          </div>

          <div className="relative overflow-hidden rounded-[2rem] bg-[#0f1720] p-5">
            <div className="relative flex gap-4 overflow-x-auto pb-2 pr-2">
              {cards.map((card, index) => {
                const offset = index * 20;
                const benefit = card.benefits[category];
                return (
                  <div
                    key={card.id}
                    className="min-w-[260px] shrink-0 transform rounded-[2rem] border border-white/10 bg-gradient-to-br from-[#111827] to-[#0b1220] p-5 shadow-[0_30px_70px_rgba(0,0,0,0.25)] transition duration-300"
                    style={{ marginLeft: `${offset}px` }}
                  >
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm text-slate-400">{card.bank}</p>
                        <p className="mt-2 text-xl font-semibold text-white">{card.name}</p>
                      </div>
                      <div className="flex h-12 w-12 items-center justify-center rounded-3xl bg-white/10 text-lg font-semibold text-green">
                        {card.logo}
                      </div>
                    </div>
                    <div className="mt-6 space-y-3 text-sm text-slate-300">
                      <p>{category} 혜택: {benefit?.label ?? '혜택 없음'}</p>
                      <p>{card.remainingThreshold?.label} {card.remainingThreshold?.amount.toLocaleString()}원</p>
                      <p className="rounded-2xl bg-white/5 px-3 py-2 text-xs text-slate-300">
                        {recommendedCard.id === card.id ? '이번 선택지 추천 카드' : '다른 카드 보기'}
                      </p>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </section>
      </div>
    </main>
  );
}
