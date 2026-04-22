'use client';

import Link from 'next/link';
import { useMemo, useState, useEffect } from 'react';
import { ArrowRight, ChevronRight, CreditCard } from 'lucide-react';
import AnimatedNumber from '../../components/AnimatedNumber';
import CoinBurst from '../../components/CoinBurst';
import CashbackGraph from '../../components/CashbackGraph';
import CardComparisonModal from '../../components/CardComparisonModal';
import { cards, categories, locations, getCashbackEstimate, UserCard, CardBenefit } from '../../lib/cardAssistant';
import { recommendCard, processPayment } from '../../lib/api';

export default function CardAssistantPage() {
  const [location, setLocation] = useState(locations[0]);
  const [category, setCategory] = useState(categories[0]);
  const [recommendedCard, setRecommendedCard] = useState<UserCard & { score?: number; message?: string; recommendedBenefit?: CardBenefit | null } | null>(null);
  const [selectedCard, setSelectedCard] = useState<UserCard | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [savedAmount, setSavedAmount] = useState(0);
  const [showBurst, setShowBurst] = useState(false);

  useEffect(() => {
    const loadRecommendation = async () => {
      setLoading(true);
      try {
        const result = await recommendCard({
          userId: 'user_123',
          location,
          category,
          cards: cards.map(card => ({
            id: card.id,
            name: card.name,
            bank: card.bank,
            benefits: card.benefits,
            remainingThreshold: card.remainingThreshold,
          })),
        });
        // API 응답을 기존 포맷에 맞게 변환
        const card = cards.find(c => c.id === result.recommendedCardId);
        if (card) {
          setRecommendedCard({
            ...card,
            score: result.score,
            message: result.message,
          });
        }
      } catch (error) {
        console.error('Failed to load recommendation:', error);
        // 폴백: 기존 로직 사용
        const fallback = cards.find((c) => c.id === 'shinhan-classic');
        setRecommendedCard(fallback ?? null);
      } finally {
        setLoading(false);
      }
    };

    loadRecommendation();
  }, [location, category]);

  const handleCheckout = async () => {
    if (!recommendedCard) return;

    try {
      const result = await processPayment(recommendedCard.id, 50000, category); // 예시 금액
      if (result.success) {
        setSavedAmount(result.savings || 0);
        setShowBurst(true);
      }
    } catch (error) {
      console.error('Failed to process payment:', error);
      // 폴백
      setSavedAmount(17000);
      setShowBurst(true);
    }
  };

  const cashbackData = useMemo(
    () =>
      cards.map((card) => ({
        id: card.id,
        label: card.name,
        value: getCashbackEstimate(card, category),
        color: card.color,
        selected: recommendedCard?.id === card.id,
        onSelect: () => {
          setSelectedCard(card);
          setIsModalOpen(true);
        },
      })),
    [category, recommendedCard]
  );

  const openCardDetail = (card: UserCard) => {
    setSelectedCard(card);
    setIsModalOpen(true);
  };

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

        <section className="mb-6 rounded-[2rem] border border-white/5 bg-[#151B2F] p-5 shadow-glow relative overflow-hidden">
          <CoinBurst visible={showBurst} onComplete={() => setShowBurst(false)} />
          <div className="mb-4 flex items-center justify-between gap-4">
            <div>
              <p className="text-sm text-slate-400">추천 카드</p>
              <p className="mt-2 text-2xl font-semibold">이 카드를 지금 사용하세요</p>
            </div>
            <div className="rounded-3xl bg-green/10 px-4 py-2 text-sm font-semibold text-green">우수 카드</div>
          </div>
          {loading ? (
            <div className="rounded-[2rem] border border-green/20 bg-[#111829] p-5 text-center">
              <p className="text-slate-400">카드 추천 중...</p>
            </div>
          ) : recommendedCard ? (
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
                <p className="mt-2 text-lg font-semibold text-white">{recommendedCard.recommendedBenefit?.label || '최적의 혜택을 제공합니다.'}</p>
                <p className="mt-3 text-sm text-slate-400">
                  {recommendedCard.remainingThreshold?.label} <AnimatedNumber value={recommendedCard.remainingThreshold?.amount ?? 0} suffix="원" /> 남았습니다.
                </p>
              </div>
              <div className="mt-5 grid gap-3 sm:grid-cols-2">
                <button
                  type="button"
                  onClick={handleCheckout}
                  className="inline-flex items-center justify-center gap-2 rounded-3xl bg-green px-5 py-3 text-sm font-semibold text-navy transition hover:bg-green/90"
                >
                  이 카드로 결제하기
                  <ArrowRight size={16} />
                </button>
                <button
                  type="button"
                  onClick={() => recommendedCard && openCardDetail(recommendedCard)}
                  className="inline-flex items-center justify-center gap-2 rounded-3xl border border-white/10 bg-white/5 px-5 py-3 text-sm font-semibold text-slate-200 transition hover:border-white/20"
                >
                  상세 비교 보기
                </button>
              </div>
              {savedAmount > 0 ? (
                <p className="mt-4 text-center text-sm text-green">
                  절약 예상: <AnimatedNumber value={savedAmount} prefix="₩ " />
                </p>
              ) : null}
            </div>
          ) : (
            <div className="rounded-[2rem] border border-red-500/20 bg-[#111829] p-5 text-center">
              <p className="text-red-400">카드 추천을 불러올 수 없습니다.</p>
            </div>
          )}
        </section>

        <section className="mb-6 rounded-[2rem] border border-white/5 bg-surface p-5">
          <div className="mb-5 flex items-center justify-between">
            <div>
              <p className="text-sm text-slate-400">캐시백 그래프</p>
              <p className="mt-2 text-xl font-semibold">추천 카드별 예상 혜택</p>
            </div>
            <div className="rounded-2xl bg-[#182339] px-3 py-2 text-slate-200">카드를 눌러 상세 보기</div>
          </div>
          <CashbackGraph data={cashbackData} />
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
                        {recommendedCard?.id === card.id ? '이번 선택지 추천 카드' : '다른 카드 보기'}
                      </p>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </section>
      </div>
      <CardComparisonModal
        open={isModalOpen}
        card={selectedCard}
        category={category}
        savings={savedAmount || (selectedCard ? getCashbackEstimate(selectedCard, category) : 0)}
        onClose={() => setIsModalOpen(false)}
      />
    </main>
  );
}
