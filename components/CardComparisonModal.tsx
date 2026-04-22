'use client';

import { X, CheckCircle } from 'lucide-react';
import AnimatedNumber from './AnimatedNumber';
import type { UserCard } from '../lib/cardAssistant';

interface CardComparisonModalProps {
  open: boolean;
  card: UserCard | null;
  category: string;
  onClose: () => void;
  savings: number;
}

export default function CardComparisonModal({ open, card, category, onClose, savings }: CardComparisonModalProps) {
  if (!open || !card) return null;

  const benefit = card.benefits[category];

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center bg-black/60 p-4 sm:items-center">
      <div className="w-full max-w-2xl rounded-[2rem] bg-[#111827] p-6 shadow-2xl sm:p-8">
        <div className="mb-6 flex items-center justify-between gap-4">
          <div>
            <p className="text-sm text-slate-400">카드 상세 비교</p>
            <h2 className="mt-2 text-2xl font-semibold text-white">{card.name}</h2>
            <p className="mt-1 text-sm text-slate-500">{card.bank}</p>
          </div>
          <button onClick={onClose} className="rounded-full bg-white/5 p-2 text-slate-300 transition hover:bg-white/10">
            <X size={18} />
          </button>
        </div>

        <div className="grid gap-4 md:grid-cols-2">
          <div className="rounded-[1.75rem] bg-[#0f1720] p-5">
            <p className="text-sm text-slate-400">선택된 업종</p>
            <p className="mt-2 text-lg font-semibold text-white">{category}</p>
            <p className="mt-3 text-sm text-slate-300">해당 업종에서 얻을 수 있는 대표 혜택입니다.</p>
          </div>
          <div className="rounded-[1.75rem] bg-[#0f1720] p-5">
            <p className="text-sm text-slate-400">예상 절약</p>
            <p className="mt-2 text-3xl font-semibold text-green"><AnimatedNumber value={savings} prefix="₩ " /></p>
            <p className="mt-3 text-sm text-slate-300">해당 카드로 결제했을 때 기대할 수 있는 혜택입니다.</p>
          </div>
        </div>

        <div className="mt-6 grid gap-4 md:grid-cols-3">
          <div className="rounded-[1.75rem] bg-[#0f1720] p-5 text-sm text-slate-300">
            <p className="text-slate-400">혜택 이름</p>
            <p className="mt-2 text-white">{benefit?.label ?? '혜택 없음'}</p>
          </div>
          <div className="rounded-[1.75rem] bg-[#0f1720] p-5 text-sm text-slate-300">
            <p className="text-slate-400">혜택 유형</p>
            <p className="mt-2 text-white">{benefit?.type ?? 'unknown'}</p>
          </div>
          <div className="rounded-[1.75rem] bg-[#0f1720] p-5 text-sm text-slate-300">
            <p className="text-slate-400">월간 예상 소비</p>
            <p className="mt-2 text-white"><AnimatedNumber value={card.monthlySpendEstimate} prefix="₩ " /></p>
          </div>
        </div>

        <div className="mt-6 rounded-[1.75rem] bg-[#0f1720] p-5">
          <div className="mb-4 flex items-center gap-2 text-sm text-slate-400">
            <CheckCircle size={18} className="text-green" />
            <span>추천 포인트</span>
          </div>
          <div className="grid gap-3 text-sm text-slate-300">
            <p>• {card.remainingThreshold?.label ?? '조건 없음'}</p>
            <p>• 월간 소비 대비 혜택을 최대화할 수 있습니다.</p>
            <p>• 선택된 카드가 {category} 소비에서 가장 효율적입니다.</p>
          </div>
        </div>
      </div>
    </div>
  );
}
