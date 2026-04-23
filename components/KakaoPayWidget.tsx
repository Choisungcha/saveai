'use client';

import { useState, useEffect } from 'react';
import { CreditCard, Smartphone, Building2, CheckCircle, AlertCircle, Zap } from 'lucide-react';

declare global {
  interface Window {
    KakaoPay?: any;
    IMP?: any;
  }
}

export default function KakaoPayWidget() {
  const [isLoaded, setIsLoaded] = useState(false);
  const [paymentMethods, setPaymentMethods] = useState<any[]>([]);

  useEffect(() => {
    // 카카오페이 SDK 로드 (실제로는 CDN 사용)
    const loadKakaoPaySDK = () => {
      if (window.KakaoPay) {
        setIsLoaded(true);
        return;
      }

      const script = document.createElement('script');
      script.src = 'https://t1.kakaocdn.net/kakaopay/sdk/js/kakaopay.min.js';
      script.onload = () => setIsLoaded(true);
      script.onerror = () => {
        console.log('카카오페이 SDK 로드 실패 - 모의 모드로 실행');
        setIsLoaded(true); // 모의 모드로 진행
      };
      document.head.appendChild(script);
    };

    loadKakaoPaySDK();

    // 모의 결제 수단 데이터
    setPaymentMethods([
      { id: 'kakao_card1', type: '카드', name: '카카오페이카드', last4: '5678' },
      { id: 'kakao_money', type: '머니', name: '카카오페이 머니', balance: 50000 }
    ]);
  }, []);

  const handlePayment = async () => {
    if (!isLoaded) return;

    try {
      // 실제 카카오페이 결제 요청
      if (window.KakaoPay) {
        // 실제 SDK 사용
        window.KakaoPay.requestPayment({
          cid: 'TC0ONETIME',
          partner_order_id: 'partner_order_id',
          partner_user_id: 'partner_user_id',
          item_name: 'SaveAI 프리미엄 구독',
          quantity: 1,
          total_amount: 10000,
          vat_amount: 0,
          tax_free_amount: 0,
          approval_url: `${window.location.origin}/payment/kakao/success`,
          fail_url: `${window.location.origin}/payment/kakao/fail`,
          cancel_url: `${window.location.origin}/payment/kakao/cancel`,
        });
      } else {
        // 모의 결제
        alert('카카오페이 결제 테스트\n결제 금액: ₩10,000\n결제 수단: 카카오페이카드 ****5678\n\n실제 결제는 이루어지지 않습니다.');
      }
    } catch (error) {
      console.error('카카오페이 결제 실패:', error);
    }
  };

  const handleQuickPay = async () => {
    alert('카카오페이 퀵페이 인증이 완료되었습니다!\n바로결제 가능한 카드: 카카오페이카드 ****5678\n카카오페이 머니: ₩50,000');
  };

  return (
    <div className="space-y-6">
      <div className="rounded-[2rem] border border-white/10 bg-[#111827] p-5">
        <div className="flex items-center gap-3 mb-4">
          <div className="w-10 h-10 rounded-2xl bg-yellow-500/10 flex items-center justify-center">
            <Zap size={20} className="text-yellow-500" />
          </div>
          <div>
            <h3 className="text-lg font-semibold">카카오페이 결제</h3>
            <p className="text-sm text-slate-400">간편하고 빠른 금융 서비스</p>
          </div>
        </div>

        {!isLoaded ? (
          <div className="flex items-center justify-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-yellow-500"></div>
            <span className="ml-3 text-slate-400">카카오페이 로딩 중...</span>
          </div>
        ) : (
          <div className="space-y-4">
            <div className="rounded-3xl bg-[#0f1720] p-4">
              <div className="flex items-center justify-between mb-3">
                <span className="font-semibold">카카오페이카드</span>
                <span className="text-sm text-slate-400">****5678</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-slate-400">카드 한도</span>
                <span className="font-semibold">₩5,000,000</span>
              </div>
            </div>

            <div className="rounded-3xl bg-[#0f1720] p-4">
              <div className="flex items-center justify-between mb-3">
                <span className="font-semibold">카카오페이 머니</span>
                <span className="text-sm text-green">사용 가능</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-slate-400">잔액</span>
                <span className="font-semibold">₩50,000</span>
              </div>
            </div>
          </div>
        )}
      </div>

      <div className="rounded-[2rem] border border-white/10 bg-[#111827] p-5">
        <div className="flex items-center gap-3 mb-4">
          <div className="w-10 h-10 rounded-2xl bg-blue-500/10 flex items-center justify-center">
            <Smartphone size={20} className="text-blue-500" />
          </div>
          <div>
            <h3 className="text-lg font-semibold">카카오페이 퀵페이</h3>
            <p className="text-sm text-slate-400">바로 사용할 수 있는 간편결제</p>
          </div>
        </div>

        <div className="space-y-3">
          <button
            onClick={handleQuickPay}
            className="w-full rounded-3xl bg-blue-500 px-6 py-3 text-sm font-semibold text-white hover:bg-blue-600"
          >
            퀵페이로 인증하기
          </button>

          {paymentMethods.length > 0 && (
            <div className="space-y-2">
              <p className="text-sm font-medium text-slate-300">등록된 결제 수단</p>
              {paymentMethods.map((method) => (
                <div key={method.id} className="flex items-center justify-between rounded-3xl bg-[#0f1720] p-4">
                  <div className="flex items-center gap-3">
                    {method.type === '카드' ? (
                      <CreditCard size={16} className="text-slate-400" />
                    ) : (
                      <Building2 size={16} className="text-slate-400" />
                    )}
                    <span className="text-sm font-semibold">{method.name}</span>
                  </div>
                  <CheckCircle size={16} className="text-green" />
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      <div className="rounded-[2rem] border border-white/10 bg-[#111827] p-5">
        <div className="flex items-center gap-3 mb-4">
          <div className="w-10 h-10 rounded-2xl bg-purple-500/10 flex items-center justify-center">
            <Building2 size={20} className="text-purple-500" />
          </div>
          <div>
            <h3 className="text-lg font-semibold">카카오뱅크 연동</h3>
            <p className="text-sm text-slate-400">26주 적금, 모임통장 등</p>
          </div>
        </div>

        <div className="space-y-3">
          <div className="rounded-3xl bg-[#0f1720] p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="font-semibold">카카오뱅크 입출금통장</p>
                <p className="text-sm text-slate-400">3333-12-1234567</p>
              </div>
              <div className="text-right">
                <p className="font-semibold">₩1,800,000</p>
                <p className="text-sm text-slate-400">잔액</p>
              </div>
            </div>
          </div>

          <div className="rounded-3xl bg-[#0f1720] p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="font-semibold">26주 적금</p>
                <p className="text-sm text-slate-400">매주 ₩50,000</p>
              </div>
              <div className="text-right">
                <p className="font-semibold text-green">+2.5%</p>
                <p className="text-sm text-slate-400">이자율</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="rounded-[2rem] border border-yellow-500/20 bg-yellow-500/5 p-5">
        <div className="flex items-start gap-3">
          <AlertCircle size={20} className="text-yellow-500 mt-0.5" />
          <div>
            <p className="font-semibold text-yellow-500">카카오페이 연동</p>
            <p className="text-sm text-yellow-200 mt-1">
              실제 카카오페이 API를 사용하려면 사업자 등록과 카카오페이 가입이 필요합니다.
              현재는 샌드박스 환경에서 모의 데이터를 표시합니다.
            </p>
          </div>
        </div>
      </div>

      <button
        onClick={handlePayment}
        disabled={!isLoaded}
        className="w-full rounded-3xl bg-yellow-500 px-6 py-4 text-lg font-semibold text-black hover:bg-yellow-600 disabled:opacity-50 disabled:cursor-not-allowed"
      >
        ₩10,000 카카오페이로 결제하기
      </button>
    </div>
  );
}
