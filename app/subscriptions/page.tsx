'use client';

import Link from 'next/link';
import { useState, useEffect } from 'react';
import { ChevronRight, ShieldCheck, Sparkles } from 'lucide-react';
import AnimatedNumber from '../../components/AnimatedNumber';
import CoinBurst from '../../components/CoinBurst';
import { fetchSubscriptions, cancelSubscription } from '../../lib/api';
import { ApiSubscriptionItem } from '../../lib/apiSchemas';

const replacementOffers = [
  {
    title: '알뜰폰 요금제로 변경',
    subtitle: '매달 3만원 절약 + 신세계 상품권 5만원',
    color: 'from-[#163a28] to-[#1f4c35]',
  },
  {
    title: '정수기 렌탈 교체',
    subtitle: '월 2만원 할인 + 설치비 면제',
    color: 'from-[#1d2734] to-[#23334b]',
  },
  {
    title: '카드 혜택 변경',
    subtitle: '캐시백 1.5% + 연회비 최대 5만원 할인',
    color: 'from-[#1f2331] to-[#2c3649]',
  },
];

export default function SubscriptionsPage() {
  const [subscriptions, setSubscriptions] = useState<ApiSubscriptionItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeId, setActiveId] = useState<string>('');
  const [savedAmount, setSavedAmount] = useState(0);
  const [showBurst, setShowBurst] = useState(false);

  useEffect(() => {
    const loadSubscriptions = async () => {
      try {
        const data = await fetchSubscriptions();
        setSubscriptions(data);
        if (data.length > 0) {
          setActiveId(data[0].id);
        }
      } catch (error) {
        console.error('Failed to load subscriptions:', error);
      } finally {
        setLoading(false);
      }
    };

    loadSubscriptions();
  }, []);

  const active = subscriptions.find((item) => item.id === activeId) ?? subscriptions[0];

  const handleCancel = async () => {
    if (!active) return;

    try {
      const result = await cancelSubscription(active.id);
      if (result.success) {
        setSavedAmount(active.estimatedAnnualSavings);
        setShowBurst(true);
        // 구독 목록 새로고침
        const updatedSubscriptions = await fetchSubscriptions();
        setSubscriptions(updatedSubscriptions);
      }
    } catch (error) {
      console.error('Failed to cancel subscription:', error);
    }
  };

  if (loading) {
    return (
      <main className="min-h-screen bg-navy text-white">
        <div className="mx-auto max-w-xl px-5 pb-24 pt-6">
          <div className="text-center">로딩 중...</div>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-navy text-white">
      <div className="mx-auto max-w-xl px-5 pb-24 pt-6">
        <header className="mb-6 flex items-center justify-between gap-4">
          <div>
            <p className="text-sm text-slate-400">SaveAI</p>
            <h1 className="mt-2 text-3xl font-semibold tracking-tight">구독 서비스 관리</h1>
          </div>
          <Link
            href="/"
            className="inline-flex items-center gap-2 rounded-2xl border border-white/10 bg-white/5 px-4 py-2 text-sm text-slate-200 transition hover:border-slate-500"
          >
            홈으로
            <ChevronRight size={16} />
          </Link>
        </header>

        <section className="mb-5 rounded-[2rem] border border-white/5 bg-[#151B2F] p-5 shadow-glow relative overflow-hidden">
          <CoinBurst visible={showBurst} onComplete={() => setShowBurst(false)} />
          <div className="flex items-center justify-between gap-4">
            <div>
              <p className="text-sm text-slate-400">추천 절약</p>
              <p className="mt-2 text-2xl font-semibold">지금 바로 해지하면 최대 절약</p>
            </div>
            <div className="rounded-3xl bg-green/10 px-3 py-2 text-sm font-semibold text-green">
              연간 <AnimatedNumber value={204000} prefix="₩ " />
            </div>
          </div>
          <p className="mt-4 text-sm text-slate-400">선택한 구독 서비스를 확인하고, 해지 또는 교체 제안으로 바로 이동해보세요.</p>
        </section>

        <section className="space-y-4">
          <div className="rounded-[2rem] border border-white/5 bg-surface p-5">
            <div className="mb-5 flex items-center justify-between">
              <div>
                <p className="text-sm text-slate-400">구독 리스트</p>
                <p className="mt-2 text-xl font-semibold">내 구독 서비스 현황</p>
              </div>
              <div className="rounded-2xl bg-[#182339] px-3 py-2 text-slate-200">총 {subscriptions.length}개</div>
            </div>

            <div className="space-y-3">
              {subscriptions.map((item) => {
                const dueDate = new Date(item.dueDate);
                const dueLabel = `${dueDate.getMonth() + 1}월 ${dueDate.getDate()}일`;
                const statusLabel = item.status === 'active' ? '사용 중' : item.status === 'inactive' ? '미사용 중' : '반복 결제';

                return (
                  <button
                    key={item.id}
                    type="button"
                    onClick={() => setActiveId(item.id)}
                    className={`w-full rounded-[1.75rem] border px-4 py-4 text-left transition ${
                      active?.id === item.id
                        ? 'border-green bg-white/5 shadow-[0_8px_30px_rgba(34,197,94,0.12)]'
                        : 'border-white/10 bg-[#111829] hover:border-white/20'
                    }`}
                  >
                    <div className="flex items-center justify-between gap-4">
                      <div className="flex items-center gap-3">
                        <div className="flex h-12 w-12 items-center justify-center rounded-3xl bg-white/5 text-xl font-semibold text-green">
                          {item.name.slice(0, 1)}
                        </div>
                        <div>
                          <p className="text-base font-semibold text-white">{item.name}</p>
                          <p className="text-sm text-slate-400">{item.plan}</p>
                        </div>
                      </div>
                      <div className="text-right text-sm text-slate-300">
                        <p className="font-semibold text-white">
                          <AnimatedNumber value={item.amount} prefix="₩ " />
                        </p>
                        <p className="mt-1 text-slate-500">{dueLabel}</p>
                      </div>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          <div className="rounded-[2rem] border border-white/5 bg-surface p-5">
            <div className="mb-5 flex items-center justify-between gap-4">
              <div>
                <p className="text-sm text-slate-400">해지 가이드</p>
                <p className="mt-2 text-xl font-semibold">{active?.name} 해지 안내</p>
              </div>
              <div className="rounded-3xl bg-green/10 px-3 py-2 text-sm font-semibold text-green">
                지금 해지하면 연간 <AnimatedNumber value={active?.estimatedAnnualSavings || 0} prefix="₩ " /> 절약
              </div>
            </div>

            <div className="rounded-[1.75rem] bg-[#111829] p-4 text-sm text-slate-300">
              <p className="font-medium text-white">{active?.name} 해지 추천 이유</p>
              <p className="mt-3 leading-7">
                현재 {active?.status === 'active' ? '사용 중' : active?.status === 'inactive' ? '미사용 중' : '반복 결제'} 상태인 구독 서비스입니다. 미사용 중인 서비스라면 지금 해지하여 월별 비용을 줄이고 현명한 소비를 시작하세요.
              </p>
              <ol className="mt-4 space-y-3 text-slate-400">
                <li>1. 계정에 로그인 후 구독 관리 메뉴로 이동합니다.</li>
                <li>2. 자동 갱신 설정을 해지합니다.</li>
                <li>3. 바로 해지 완료 후 절감액을 확인하세요.</li>
              </ol>
            </div>
            <button
              type="button"
              onClick={handleCancel}
              className="mt-5 inline-flex w-full items-center justify-center gap-2 rounded-3xl bg-green px-5 py-3 text-sm font-semibold text-navy transition hover:bg-green/90"
            >
              지금 해지하기
              <Sparkles size={16} />
            </button>
            {savedAmount > 0 ? (
              <p className="mt-4 text-center text-sm text-green">절약된 금액: <AnimatedNumber value={savedAmount} prefix="₩ " /></p>
            ) : null}
          </div>

          <div className="rounded-[2rem] border border-white/5 bg-surface p-5">
            <div className="mb-5 flex items-center justify-between">
              <div>
                <p className="text-sm text-slate-400">교체 제안</p>
                <p className="mt-2 text-xl font-semibold">더 나은 혜택을 제안합니다</p>
              </div>
              <ShieldCheck className="text-green" size={22} />
            </div>

            <div className="space-y-4">
              {replacementOffers.map((item) => (
                <div
                  key={item.title}
                  className={`rounded-[1.75rem] bg-gradient-to-r ${item.color} p-4 text-sm text-slate-100 shadow-[0_12px_40px_rgba(0,0,0,0.15)]`}
                >
                  <p className="font-semibold">{item.title}</p>
                  <p className="mt-2 text-slate-200">{item.subtitle}</p>
                  <div className="mt-4 inline-flex items-center gap-2 rounded-2xl bg-white/10 px-3 py-2 text-xs text-green">
                    <Sparkles size={16} />
                    혜택 확인하기
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>
      </div>
    </main>
  );
}
