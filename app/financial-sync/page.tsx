'use client';

import { useState } from 'react';
import { Shield, CheckCircle, AlertCircle, Smartphone, CreditCard, Building2 } from 'lucide-react';
import { fintechProviders, generateAuthUrl, syncAllFinancialData } from '../../lib/fintech';
import TossPaymentWidget from '../../components/TossPaymentWidget';
import KakaoPayWidget from '../../components/KakaoPayWidget';
import KGInicisWidget from '../../components/KGInicisWidget';

const providerLogos = {
  toss: '💳',
  kakao: '💰',
  kg: '🏦'
};

const providerDescriptions = {
  toss: '토스의 결제 및 금융 API',
  kakao: '카카오의 금융 서비스 API',
  kg: '국내 대표 PG사'
};

const providerFeatures = {
  toss: ['계좌조회', '카드내역', '결제연동', '송금'],
  kakao: ['간편결제', '계좌연동', '카드관리', '송금'],
  kg: ['결제대행', '계좌이체', '카드결제', '정기결제']
};

const providerPricing = {
  toss: '거래건당 0.3-1.5%',
  kakao: '거래건당 0.3-1.0%',
  kg: '월 50만원 + 거래건당'
};

export default function FinancialSyncPage() {
  const [selectedProvider, setSelectedProvider] = useState<string | null>(null);
  const [syncStatus, setSyncStatus] = useState<'idle' | 'connecting' | 'syncing' | 'completed'>('idle');
  const [connectedAccounts, setConnectedAccounts] = useState<any[]>([]);
  const [syncResults, setSyncResults] = useState<any[]>([]);
  const [showTossWidget, setShowTossWidget] = useState(false);
  const [showKakaoWidget, setShowKakaoWidget] = useState(false);
  const [showKGWidget, setShowKGWidget] = useState(false);

  const handleProviderSelect = async (providerId: string) => {
    setSelectedProvider(providerId);
    setSyncStatus('connecting');

    try {
      if (providerId === 'toss') {
        // 토스페이먼츠의 경우 실제 위젯 표시
        setTimeout(() => {
          setSyncStatus('completed');
          setShowTossWidget(true);
          setConnectedAccounts([
            { id: 'toss_acc1', name: '토스뱅크 통장', balance: 2500000, bank: '토스뱅크', type: 'account' },
            { id: 'toss_card1', name: '토스카드', limit: 10000000, used: 2500000, type: 'card' }
          ]);
        }, 1500);
      } else if (providerId === 'kakao') {
        // 카카오페이의 경우 실제 위젯 표시
        setTimeout(() => {
          setSyncStatus('completed');
          setShowKakaoWidget(true);
          setConnectedAccounts([
            { id: 'kakao_acc1', name: '카카오뱅크 통장', balance: 1800000, bank: '카카오뱅크', type: 'account' },
            { id: 'kakao_card1', name: '카카오페이카드', limit: 5000000, used: 800000, type: 'card' }
          ]);
        }, 1500);
      } else if (providerId === 'kg') {
        // KG이니시스의 경우 실제 위젯 표시
        setTimeout(() => {
          setSyncStatus('completed');
          setShowKGWidget(true);
          setConnectedAccounts([
            { id: 'kg_acc1', name: '기업은행 통장', balance: 3200000, bank: '기업은행', type: 'account' },
            { id: 'kg_card1', name: 'IBK카드', limit: 8000000, used: 1500000, type: 'card' }
          ]);
        }, 1500);
      } else {
        // 다른 제공업체는 기존 모의 구현
        setTimeout(async () => {
          setSyncStatus('syncing');

          try {
            const results = await syncAllFinancialData('user123', [providerId]);
            setSyncResults(results);

            const accounts: any[] = [];
            results.forEach(result => {
              if (result.success && result.data?.data) {
                const data = result.data.data;
                if (data.accounts) accounts.push(...data.accounts);
                if (data.cards) accounts.push(...data.cards.map((card: any) => ({ ...card, type: 'card' })));
              }
            });

            setConnectedAccounts(accounts);
            setSyncStatus('completed');
          } catch (error) {
            console.error('Sync error:', error);
            setSyncStatus('idle');
          }
        }, 1500);
      }
    } catch (error) {
      console.error('Provider selection error:', error);
      setSyncStatus('idle');
    }
  };

  const handleBulkSync = async () => {
    if (connectedAccounts.length === 0) return;

    setSyncStatus('syncing');
    try {
      const results = await syncAllFinancialData('user123', ['toss', 'kakao', 'kg']);
      setSyncResults(results);

      const accounts: any[] = [];
      results.forEach(result => {
        if (result.success && result.data?.data) {
          const data = result.data.data;
          if (data.accounts) accounts.push(...data.accounts);
          if (data.cards) accounts.push(...data.cards.map((card: any) => ({ ...card, type: 'card' })));
        }
      });

      setConnectedAccounts(accounts);
      setSyncStatus('completed');
    } catch (error) {
      console.error('Bulk sync error:', error);
      setSyncStatus('idle');
    }
  };

  return (
    <main className="min-h-screen bg-navy text-white">
      <div className="mx-auto max-w-xl px-5 pb-24 pt-6">
        <header className="mb-6 rounded-[2rem] border border-white/10 bg-surface p-5 shadow-glow">
          <div className="flex items-center gap-4">
            <Shield size={24} className="text-green" />
            <div>
              <p className="text-sm text-slate-400">금융 연동</p>
              <h1 className="mt-2 text-3xl font-semibold">핀테크 API로 안전하게 연동</h1>
              <p className="mt-3 text-sm text-slate-400">
                토스, 카카오페이 등 검증된 금융 API를 통해 데이터를 안전하게 가져옵니다.
              </p>
            </div>
          </div>
        </header>

        <section className="mb-5 rounded-[2rem] border border-white/10 bg-[#111827] p-5">
          <h2 className="mb-4 text-lg font-semibold">API 제공업체 선택</h2>
          <div className="space-y-3">
            {fintechProviders.map((provider) => (
              <button
                key={provider.id}
                onClick={() => handleProviderSelect(provider.id)}
                disabled={syncStatus !== 'idle'}
                className={`w-full rounded-[1.5rem] border p-4 text-left transition ${
                  selectedProvider === provider.id
                    ? 'border-green bg-green/10 text-white'
                    : 'border-white/10 bg-[#0f1720] text-slate-200 hover:border-white/20'
                } ${syncStatus !== 'idle' ? 'opacity-50 cursor-not-allowed' : ''}`}
              >
                <div className="flex items-start justify-between gap-4">
                  <div className="flex items-center gap-3">
                    <span className="text-2xl">{providerLogos[provider.id as keyof typeof providerLogos]}</span>
                    <div>
                      <p className="font-semibold">{provider.name}</p>
                      <p className="text-sm text-slate-400">{providerDescriptions[provider.id as keyof typeof providerDescriptions]}</p>
                    </div>
                  </div>
                  {selectedProvider === provider.id && (
                    <CheckCircle size={20} className="text-green mt-1" />
                  )}
                </div>
                <div className="mt-3 grid grid-cols-2 gap-2 text-xs text-slate-400">
                  <div>
                    <p className="font-medium text-white">주요 기능</p>
                    <p>{providerFeatures[provider.id as keyof typeof providerFeatures].slice(0, 2).join(', ')}</p>
                  </div>
                  <div>
                    <p className="font-medium text-white">수수료</p>
                    <p>{providerPricing[provider.id as keyof typeof providerPricing]}</p>
                  </div>
                </div>
              </button>
            ))}
          </div>
        </section>

        {syncStatus === 'connecting' && (
          <section className="mb-5 rounded-[2rem] border border-white/10 bg-[#111827] p-5">
            <div className="text-center">
              <Smartphone size={48} className="mx-auto mb-4 text-green animate-pulse" />
              <p className="text-lg font-semibold">API 연결 중...</p>
              <p className="text-sm text-slate-400 mt-2">선택한 제공업체와 인증을 진행합니다</p>
            </div>
          </section>
        )}

        {syncStatus === 'syncing' && (
          <section className="mb-5 rounded-[2rem] border border-white/10 bg-[#111827] p-5">
            <div className="text-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green mx-auto mb-4"></div>
              <p className="text-lg font-semibold">금융 데이터 동기화 중...</p>
              <p className="text-sm text-slate-400 mt-2">계좌, 카드, 투자 정보를 가져옵니다</p>
            </div>
          </section>
        )}

        {syncStatus === 'completed' && selectedProvider === 'toss' && showTossWidget && (
          <div className="mb-5">
            <TossPaymentWidget />
          </div>
        )}

        {syncStatus === 'completed' && selectedProvider === 'kakao' && showKakaoWidget && (
          <div className="mb-5">
            <KakaoPayWidget />
          </div>
        )}

        {syncStatus === 'completed' && selectedProvider === 'kg' && showKGWidget && (
          <div className="mb-5">
            <KGInicisWidget />
          </div>
        )}

        {syncStatus === 'completed' && selectedProvider !== 'toss' && (
          <section className="mb-5 rounded-[2rem] border border-white/10 bg-[#111827] p-5">
            <div className="text-center mb-6">
              <CheckCircle size={48} className="mx-auto mb-4 text-green" />
              <h2 className="text-xl font-semibold text-green">연동 완료!</h2>
              <p className="text-sm text-slate-400">총 {connectedAccounts.length}개 계좌/카드 연결됨</p>
            </div>

            <div className="space-y-3 mb-4">
              {connectedAccounts.map((account, index) => (
                <div key={index} className="flex items-center justify-between rounded-3xl bg-[#0f1720] p-4">
                  <div className="flex items-center gap-3">
                    {account.type === 'card' ? (
                      <CreditCard size={20} className="text-slate-400" />
                    ) : (
                      <Building2 size={20} className="text-slate-400" />
                    )}
                    <div>
                      <span className="font-semibold">{account.name}</span>
                      <p className="text-sm text-slate-400">{account.bank}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="font-semibold">
                      {account.balance ? `${account.balance.toLocaleString()}원` :
                       account.limit ? `한도: ${account.limit.toLocaleString()}원` : ''}
                    </p>
                    {account.used && (
                      <p className="text-sm text-slate-400">사용: {account.used.toLocaleString()}원</p>
                    )}
                  </div>
                </div>
              ))}
            </div>

            <button
              onClick={() => handleProviderSelect(selectedProvider!)}
              className="w-full rounded-3xl bg-green px-6 py-3 text-sm font-semibold text-navy hover:bg-green/90"
            >
              데이터 재동기화
            </button>
          </section>
        )}

        <section className="rounded-[2rem] border border-white/10 bg-[#111827] p-5">
          <h3 className="mb-4 text-lg font-semibold">연동되는 데이터</h3>
          <div className="grid gap-3">
            {[
              '계좌 잔액 및 거래내역',
              '카드 사용 내역 및 혜택',
              '투자 상품 및 수익률',
              '대출 및 보험 정보',
              '자동 분류 및 분석'
            ].map((item, index) => (
              <div key={index} className="flex items-center gap-3 rounded-3xl bg-[#0f1720] p-4">
                <CheckCircle size={16} className="text-green" />
                <span className="text-sm">{item}</span>
              </div>
            ))}
          </div>

          <div className="mt-6 rounded-3xl bg-yellow-500/10 border border-yellow-500/20 p-4">
            <div className="flex items-start gap-3">
              <AlertCircle size={20} className="text-yellow-500 mt-0.5" />
              <div>
                <p className="font-semibold text-yellow-500">프로덕션 준비</p>
                <p className="text-sm text-yellow-200 mt-1">
                  실제 서비스에서는 사업자등록과 금융감독원 승인이 필요합니다.
                  현재는 샌드박스 환경에서 테스트 중입니다.
                </p>
              </div>
            </div>
          </div>
        </section>
      </div>
    </main>
  );
}
