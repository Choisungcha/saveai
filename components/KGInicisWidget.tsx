'use client';

import { useState, useEffect } from 'react';
import { CreditCard, Smartphone, Building2, CheckCircle, AlertCircle, Shield } from 'lucide-react';

declare global {
  interface Window {
    IMP?: any;
  }
}

export default function KGInicisWidget() {
  const [isLoaded, setIsLoaded] = useState(false);
  const [paymentMethods, setPaymentMethods] = useState<any[]>([]);

  useEffect(() => {
    // KG이니시스(아임포트) SDK 로드
    const loadIMP = () => {
      if (window.IMP) {
        window.IMP.init('imp00000000'); // 테스트용 가맹점 식별코드
        setIsLoaded(true);
        return;
      }

      const script = document.createElement('script');
      script.src = 'https://cdn.iamport.kr/js/iamport.payment-1.1.5.js';
      script.onload = () => {
        if (window.IMP) {
          window.IMP.init('imp00000000'); // 테스트용
          setIsLoaded(true);
        }
      };
      script.onerror = () => {
        console.log('KG이니시스 SDK 로드 실패 - 모의 모드로 실행');
        setIsLoaded(true); // 모의 모드로 진행
      };
      document.head.appendChild(script);
    };

    loadIMP();

    // 모의 결제 수단 데이터
    setPaymentMethods([
      { id: 'kg_card1', type: '카드', name: 'IBK카드', last4: '9012' },
      { id: 'kg_bank1', type: '계좌', name: '기업은행 계좌', accountNumber: '123-456-789' }
    ]);
  }, []);

  const handlePayment = async () => {
    if (!isLoaded || !window.IMP) {
      // 모의 결제
      alert('KG이니시스 결제 테스트\n결제 금액: ₩10,000\n결제 수단: IBK카드 ****9012\n\n실제 결제는 이루어지지 않습니다.');
      return;
    }

    try {
      // 실제 KG이니시스 결제 요청
      window.IMP.request_pay({
        pg: 'html5_inicis',
        pay_method: 'card',
        merchant_uid: 'merchant_' + new Date().getTime(),
        name: 'SaveAI 프리미엄 구독',
        amount: 10000,
        buyer_email: 'test@example.com',
        buyer_name: '테스터',
        buyer_tel: '010-1234-5678',
        buyer_addr: '서울특별시',
        buyer_postcode: '123-456',
        m_redirect_url: `${window.location.origin}/payment/kg/success`
      }, function (rsp: any) {
        if (rsp.success) {
          alert('결제 성공!');
        } else {
          alert('결제 실패: ' + rsp.error_msg);
        }
      });
    } catch (error) {
      console.error('KG이니시스 결제 실패:', error);
    }
  };

  const handleSecurePay = async () => {
    alert('KG이니시스 보안결제 인증이 완료되었습니다!\n등록된 카드: IBK카드 ****9012\n기업은행 계좌: 123-456-789');
  };

  return (
    <div className="space-y-6">
      <div className="rounded-[2rem] border border-white/10 bg-[#111827] p-5">
        <div className="flex items-center gap-3 mb-4">
          <div className="w-10 h-10 rounded-2xl bg-red-500/10 flex items-center justify-center">
            <Shield size={20} className="text-red-500" />
          </div>
          <div>
            <h3 className="text-lg font-semibold">KG이니시스 결제</h3>
            <p className="text-sm text-slate-400">안전하고 신뢰할 수 있는 PG사</p>
          </div>
        </div>

        {!isLoaded ? (
          <div className="flex items-center justify-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-red-500"></div>
            <span className="ml-3 text-slate-400">KG이니시스 로딩 중...</span>
          </div>
        ) : (
          <div className="space-y-4">
            <div className="rounded-3xl bg-[#0f1720] p-4">
              <div className="flex items-center justify-between mb-3">
                <span className="font-semibold">IBK기업카드</span>
                <span className="text-sm text-slate-400">****9012</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-slate-400">카드 한도</span>
                <span className="font-semibold">₩8,000,000</span>
              </div>
            </div>

            <div className="rounded-3xl bg-[#0f1720] p-4">
              <div className="flex items-center justify-between mb-3">
                <span className="font-semibold">기업은행 계좌</span>
                <span className="text-sm text-green">인증됨</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-slate-400">계좌번호</span>
                <span className="font-semibold">123-456-789</span>
              </div>
            </div>
          </div>
        )}
      </div>

      <div className="rounded-[2rem] border border-white/10 bg-[#111827] p-5">
        <div className="flex items-center gap-3 mb-4">
          <div className="w-10 h-10 rounded-2xl bg-green-500/10 flex items-center justify-center">
            <Smartphone size={20} className="text-green-500" />
          </div>
          <div>
            <h3 className="text-lg font-semibold">KG이니시스 보안결제</h3>
            <p className="text-sm text-slate-400">기업용 안전한 결제 시스템</p>
          </div>
        </div>

        <div className="space-y-3">
          <button
            onClick={handleSecurePay}
            className="w-full rounded-3xl bg-green-500 px-6 py-3 text-sm font-semibold text-white hover:bg-green-600"
          >
            보안결제로 인증하기
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
          <div className="w-10 h-10 rounded-2xl bg-blue-500/10 flex items-center justify-center">
            <Building2 size={20} className="text-blue-500" />
          </div>
          <div>
            <h3 className="text-lg font-semibold">기업은행 연동</h3>
            <p className="text-sm text-slate-400">IBK 시스템 연동</p>
          </div>
        </div>

        <div className="space-y-3">
          <div className="rounded-3xl bg-[#0f1720] p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="font-semibold">IBK 입출금통장</p>
                <p className="text-sm text-slate-400">123-456-789012</p>
              </div>
              <div className="text-right">
                <p className="font-semibold">₩3,200,000</p>
                <p className="text-sm text-slate-400">잔액</p>
              </div>
            </div>
          </div>

          <div className="rounded-3xl bg-[#0f1720] p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="font-semibold">IBK 정기예금</p>
                <p className="text-sm text-slate-400">1년 만기</p>
              </div>
              <div className="text-right">
                <p className="font-semibold text-green">+3.0%</p>
                <p className="text-sm text-slate-400">금리</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="rounded-[2rem] border border-red-500/20 bg-red-500/5 p-5">
        <div className="flex items-start gap-3">
          <AlertCircle size={20} className="text-red-500 mt-0.5" />
          <div>
            <p className="font-semibold text-red-500">KG이니시스 연동</p>
            <p className="text-sm text-red-200 mt-1">
              실제 KG이니시스 서비스를 사용하려면 가맹점 계약과 승인이 필요합니다.
              현재는 아임포트 테스트 환경에서 모의 데이터를 표시합니다.
            </p>
          </div>
        </div>
      </div>

      <button
        onClick={handlePayment}
        disabled={!isLoaded}
        className="w-full rounded-3xl bg-red-500 px-6 py-4 text-lg font-semibold text-white hover:bg-red-600 disabled:opacity-50 disabled:cursor-not-allowed"
      >
        ₩10,000 KG이니시스로 결제하기
      </button>
    </div>
  );
}
