'use client';

import AnimatedNumber from './AnimatedNumber';

interface CashbackBar {
  id: string;
  label: string;
  value: number;
  color: string;
  selected?: boolean;
  onSelect?: () => void;
}

interface CashbackGraphProps {
  data: CashbackBar[];
}

export default function CashbackGraph({ data }: CashbackGraphProps) {
  const maxValue = Math.max(...data.map((item) => item.value), 1);

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between text-sm text-slate-400">
        <span>카드별 예상 캐시백</span>
        <span className="font-semibold text-white">
          <AnimatedNumber value={Math.round(maxValue)} prefix="최대 ₩ " />
        </span>
      </div>
      <div className="space-y-3">
        {data.map((item) => (
          <button
            key={item.id}
            type="button"
            onClick={item.onSelect}
            className={`group w-full overflow-hidden rounded-[1.5rem] border px-4 py-3 text-left transition ${
              item.selected ? 'border-green bg-green/10' : 'border-white/10 bg-[#111829] hover:border-white/20'
            }`}
          >
            <div className="flex items-center justify-between gap-4">
              <div>
                <p className={`font-semibold ${item.selected ? 'text-white' : 'text-slate-100'}`}>{item.label}</p>
                <p className="mt-1 text-xs text-slate-400">예상 캐시백 금액</p>
              </div>
              <p className="text-sm font-semibold text-white">
                <AnimatedNumber value={Math.round(item.value)} prefix="₩ " />
              </p>
            </div>
            <div className="mt-3 h-2 rounded-full bg-slate-800">
              <div
                className="h-full rounded-full bg-gradient-to-r from-green to-emerald-400"
                style={{ width: `${(item.value / maxValue) * 100}%` }}
              />
            </div>
          </button>
        ))}
      </div>
    </div>
  );
}
