'use client';

import { useEffect, useRef, useState } from 'react';
import { loadPaymentWidget, PaymentWidgetInstance } from '@tosspayments/payment-widget-sdk';
import { CreditCard, Smartphone, Building2, CheckCircle, AlertCircle } from 'lucide-react';

const clientKey = process.env.NEXT_PUBLIC_TOSS_CLIENT_KEY || 'test_ck_D5GePWvyJnrK0W0k6q8gLzN97Eoq';
const customerKey = 'test_customer_key_' + Date.now();

export default function TossPaymentWidget() {
  const paymentWidgetRef = useRef<PaymentWidgetInstance | null>(null);
  const paymentMethodsWidgetRef = useRef<any>(null);
  const [isLoaded, setIsLoaded] = useState(false);
  const [paymentMethods, setPaymentMethods] = useState<any[]>([]);

  useEffect(() => {
    const loadWidget = async () => {
      try {
        // 토스 결제 위젯 로드
        const paymentWidget = await loadPaymentWidget(clientKey, customerKey);
        paymentWidgetRef.current = paymentWidget;

        // 결제 수단 위젯 렌더링
        const paymentMethodsWidget = paymentWidget.renderPaymentMethods(
          '#payment-widget',
          { value: 10000 },
          { variantKey: 'DEFAULT' }
        );
        paymentMethodsWidgetRef.current = paymentMethodsWidget;

        setIsLoaded(true);

        // 저장된 결제 수단 조회 (모의)
        setPaymentMethods([
          { id: 'card1', type: '카드', name: '신한카드', last4: '1234' },
          { id: 'account1', type: '계좌', name: '토스뱅크', accountNumber: '123-456-789' }
        ]);

      } catch (error) {
        console.error('토스 위젯 로드 실패:', error);
      }
    };

    loadWidget();
  }, []);

  const handlePayment = async () => {
    if (!paymentWidgetRef.current) return;

    try {
      await paymentWidgetRef.current.requestPayment({
        orderId: 'order_' + Date.now(),
        orderName: 'SaveAI 프리미엄 구독',
        successUrl: `${window.location.origin}/payment/success`,
        failUrl: `${window.location.origin}/payment/fail`,
      });
    } catch (error) {
      console.error('결제 요청 실패:', error);
    }
  };

  const handleBrandPay = async () => {
    // 브랜드페이는 별도의 인증 플로우가 필요
    // 실제로는 토스 브랜드페이 API를 사용해야 함
    alert('브랜드페이 인증이 완료되었습니다!\n연동된 카드: 신한카드 ****1234\n\n실제 구현에서는 토스 브랜드페이 API를 사용해야 합니다.');
  };

  return (
    <div className="space-y-6">
      <div className="rounded-[2rem] border border-white/10 bg-[#111827] p-5">
        <div className="flex items-center gap-3 mb-4">
          <div className="w-10 h-10 rounded-2xl bg-green/10 flex items-center justify-center">
            <CreditCard size={20} className="text-green" />
          </div>
          <div>
            <h3 className="text-lg font-semibold">토스페이먼츠 결제 위젯</h3>
            <p className="text-sm text-slate-400">실제 토스 API로 결제 기능 체험</p>
          </div>
        </div>

        {!isLoaded ? (
          <div className="flex items-center justify-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-green"></div>
            <span className="ml-3 text-slate-400">토스 위젯 로딩 중...</span>
          </div>
        ) : (
          <div id="payment-widget" className="min-h-[200px]" />
        )}
      </div>

      <div className="rounded-[2rem] border border-white/10 bg-[#111827] p-5">
        <div className="flex items-center gap-3 mb-4">
          <div className="w-10 h-10 rounded-2xl bg-blue-500/10 flex items-center justify-center">
            <Smartphone size={20} className="text-blue-500" />
          </div>
          <div>
            <h3 className="text-lg font-semibold">브랜드페이 연동</h3>
            <p className="text-sm text-slate-400">토스의 간편결제 시스템</p>
          </div>
        </div>

        <div className="space-y-3">
          <button
            onClick={handleBrandPay}
            className="w-full rounded-3xl bg-blue-500 px-6 py-3 text-sm font-semibold text-white hover:bg-blue-600"
          >
            브랜드페이로 인증하기
          </button>

          {paymentMethods.length > 0 && (
            <div className="space-y-2">
              <p className="text-sm font-medium text-slate-300">연동된 결제 수단</p>
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
            <h3 className="text-lg font-semibold">토스뱅크 계좌 연동</h3>
            <p className="text-sm text-slate-400">실제 계좌 정보 조회 (모의)</p>
          </div>
        </div>

        <div className="space-y-3">
          <div className="rounded-3xl bg-[#0f1720] p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="font-semibold">토스뱅크 입출금통장</p>
                <p className="text-sm text-slate-400">123-456-789012</p>
              </div>
              <div className="text-right">
                <p className="font-semibold">₩2,500,000</p>
                <p className="text-sm text-green">잔액</p>
              </div>
            </div>
          </div>

          <div className="rounded-3xl bg-[#0f1720] p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="font-semibold">토스증권 투자계좌</p>
                <p className="text-sm text-slate-400">투자금액: ₩1,500,000</p>
              </div>
              <div className="text-right">
                <p className="font-semibold text-green">+12.5%</p>
                <p className="text-sm text-slate-400">수익률</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="rounded-[2rem] border border-yellow-500/20 bg-yellow-500/5 p-5">
        <div className="flex items-start gap-3">
          <AlertCircle size={20} className="text-yellow-500 mt-0.5" />
          <div>
            <p className="font-semibold text-yellow-500">샌드박스 환경</p>
            <p className="text-sm text-yellow-200 mt-1">
              현재 샌드박스 환경에서 테스트 중입니다. 실제 결제는 이루어지지 않습니다.
              프로덕션에서는 사업자 등록과 토스페이먼츠 계약이 필요합니다.
            </p>
          </div>
        </div>
      </div>

      <button
        onClick={handlePayment}
        disabled={!isLoaded}
        className="w-full rounded-3xl bg-green px-6 py-4 text-lg font-semibold text-navy hover:bg-green/90 disabled:opacity-50 disabled:cursor-not-allowed"
      >
        ₩10,000 결제 테스트하기
      </button>
    </div>
  );
}
