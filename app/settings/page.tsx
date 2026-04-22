'use client';

import Link from 'next/link';
import { useState } from 'react';
import { ChevronRight, Mail, Settings, ShieldCheck, Sparkles } from 'lucide-react';
import ThemeToggle from '../../components/ThemeToggle';

export default function SettingsPage() {
  const [notifications, setNotifications] = useState({
    expenditures: true,
    cardRecommendations: true,
    monthlyReport: false,
  });
  const [privacy, setPrivacy] = useState({
    biometricLogin: true,
    dataSync: true,
    personalizedOffers: false,
  });

  const notificationItems = [
    { label: '지출 분석 알림', key: 'expenditures' },
    { label: '카드 추천 알림', key: 'cardRecommendations' },
    { label: '월간 리포트', key: 'monthlyReport' },
  ] as const;

  type NotificationKey = (typeof notificationItems)[number]['key'];

  return (
    <main className="min-h-screen bg-navy text-white">
      <div className="mx-auto max-w-xl px-5 pb-24 pt-6">
        <header className="mb-6 rounded-[2rem] border border-white/10 bg-surface p-5 shadow-glow">
          <div className="flex items-start justify-between gap-4">
            <div>
              <p className="text-sm text-slate-400">설정</p>
              <h1 className="mt-2 text-3xl font-semibold tracking-tight">앱 환경을 개인화하세요</h1>
              <p className="mt-3 max-w-lg text-sm text-slate-400">
                푸시, 보안, 테마 등을 한 곳에서 관리할 수 있습니다.
              </p>
            </div>
            <Link
              href="/"
              className="inline-flex items-center gap-2 rounded-3xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-slate-200 transition hover:border-white/20"
            >
              홈으로
              <ChevronRight size={16} />
            </Link>
          </div>
        </header>

        <section className="mb-5 rounded-[2rem] border border-white/10 bg-[#111827] p-5 shadow-glow">
          <div className="mb-5 flex items-center justify-between gap-4">
            <div>
              <p className="text-sm text-slate-400">계정 설정</p>
              <p className="mt-2 text-lg font-semibold">기본 프로필 정보</p>
            </div>
            <Settings size={22} className="text-green" />
          </div>
          <div className="space-y-4 rounded-[1.75rem] bg-[#0f1720] p-5">
            <div>
              <p className="text-sm text-slate-400">이메일</p>
              <p className="mt-1 text-base font-semibold text-white">user@example.com</p>
            </div>
            <div>
              <p className="text-sm text-slate-400">이름</p>
              <p className="mt-1 text-base font-semibold text-white">홍길동</p>
            </div>
            <div className="rounded-[1.5rem] border border-white/10 bg-[#111827] p-4 text-sm text-slate-300">
              <p className="font-semibold text-white">프리미엄 멤버십</p>
              <p className="mt-2 text-slate-400">SaveAI 프로 사용 중 - 프리미엄 혜택을 누리고 있습니다.</p>
            </div>
          </div>
        </section>

        <section className="mb-5 rounded-[2rem] border border-white/10 bg-[#111827] p-5 shadow-glow">
          <div className="mb-5 flex items-center justify-between gap-4">
            <div>
              <p className="text-sm text-slate-400">알림 설정</p>
              <p className="mt-2 text-lg font-semibold">중요 알림을 선택하세요</p>
            </div>
            <Mail size={22} className="text-green" />
          </div>

          <div className="space-y-3">
            {notificationItems.map((item) => (
              <button
                key={item.key}
                type="button"
                onClick={() =>
                  setNotifications((prev) => ({
                    ...prev,
                    [item.key]: !prev[item.key as NotificationKey],
                  }))
                }
                className={`w-full rounded-[1.75rem] border px-4 py-4 text-left transition ${
                  notifications[item.key]
                    ? 'border-green bg-green/10 text-white'
                    : 'border-white/10 bg-[#0f1720] text-slate-200 hover:border-white/20'
                }`}
              >
                <div className="flex items-center justify-between gap-4">
                  <div>
                    <p className="font-semibold">{item.label}</p>
                    <p className="mt-1 text-sm text-slate-400">중요 알림을 켜고 맞춤 추천을 받아보세요.</p>
                  </div>
                  <span className="text-sm text-slate-300">
                    {notifications[item.key] ? '켜짐' : '끔'}
                  </span>
                </div>
              </button>
            ))}
          </div>
        </section>

        <section className="mb-5 rounded-[2rem] border border-white/10 bg-[#111827] p-5 shadow-glow">
          <div className="mb-5 flex items-center justify-between gap-4">
            <div>
              <p className="text-sm text-slate-400">보안 & 개인정보</p>
              <p className="mt-2 text-lg font-semibold">안전한 금융 관리를 위해</p>
            </div>
            <ShieldCheck size={22} className="text-green" />
          </div>

          <div className="space-y-3 rounded-[1.75rem] bg-[#0f1720] p-5 text-sm text-slate-300">
            <div className="flex items-center justify-between">
              <div>
                <p className="font-semibold text-white">생체 인식 잠금</p>
                <p className="mt-1 text-slate-400">지문 또는 얼굴 인식으로 보안을 강화합니다.</p>
              </div>
              <span className="text-sm text-green">사용 중</span>
            </div>
            <div className="flex items-center justify-between">
              <div>
                <p className="font-semibold text-white">데이터 동기화</p>
                <p className="mt-1 text-slate-400">클라우드 백업 및 다른 기기와 동기화합니다.</p>
              </div>
              <span className="text-sm text-slate-400">활성화됨</span>
            </div>
            <div className="flex items-center justify-between">
              <div>
                <p className="font-semibold text-white">맞춤 제안 사용</p>
                <p className="mt-1 text-slate-400">개인 정보 기반 혜택 추천을 활성화합니다.</p>
              </div>
              <span className="text-sm text-slate-400">비활성화</span>
            </div>
          </div>
        </section>

        <section className="rounded-[2rem] border border-white/10 bg-[#111827] p-5 shadow-glow">
          <div className="mb-5 flex items-center justify-between gap-4">
            <div>
              <p className="text-sm text-slate-400">앱 환경</p>
              <p className="mt-2 text-lg font-semibold">사용자 인터페이스 설정</p>
            </div>
            <Sparkles size={22} className="text-green" />
          </div>

          <div className="grid gap-4">
            <div className="rounded-[1.75rem] bg-[#0f1720] p-4 text-sm text-slate-300">
              <p className="font-semibold text-white">테마 모드</p>
              <p className="mt-2 text-slate-400">다크/라이트 모드를 즉시 전환할 수 있습니다.</p>
              <div className="mt-4">
                <ThemeToggle />
              </div>
            </div>
            <div className="rounded-[1.75rem] bg-[#0f1720] p-4 text-sm text-slate-300">
              <p className="font-semibold text-white">자동 절약 제안</p>
              <p className="mt-2 text-slate-400">지출 패턴을 분석해 자동으로 절약 아이디어를 제공합니다.</p>
              <div className="mt-4 inline-flex items-center rounded-3xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-slate-200">
                활성화됨
              </div>
            </div>
          </div>
        </section>
      </div>
    </main>
  );
}
