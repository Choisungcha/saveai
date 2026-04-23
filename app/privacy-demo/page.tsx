'use client';

import { useState } from 'react';

interface PrivacyTestData {
  accountNumber: string;
  cardNumber: string;
  userName: string;
  email: string;
  balance: number;
}

export default function PrivacyDemoPage() {
  const [isLoading, setIsLoading] = useState(false);
  const [demoResult, setDemoResult] = useState<string>('');
  const [testData, setTestData] = useState<PrivacyTestData>({
    accountNumber: '1234567890123456',
    cardNumber: '4111 1111 1111 1111',
    userName: '김철수',
    email: 'kim@example.com',
    balance: 1000000
  });
  const [protectedResult, setProtectedResult] = useState<any>(null);

  // 개인정보 보호 데몬스트레이션 실행
  const runPrivacyDemo = async () => {
    setIsLoading(true);
    setDemoResult('');

    try {
      const response = await fetch('/api/privacy-demo', {
        method: 'GET',
      });

      const result = await response.json();

      if (result.success) {
        setDemoResult('✅ 개인정보 보호 기능 데몬스트레이션이 성공적으로 완료되었습니다.\n콘솔에서 상세 결과를 확인하세요.');
      } else {
        setDemoResult(`❌ 데몬스트레이션 실패: ${result.error}`);
      }
    } catch (error) {
      setDemoResult(`❌ 네트워크 오류: ${error instanceof Error ? error.message : '알 수 없는 오류'}`);
    } finally {
      setIsLoading(false);
    }
  };

  // 데이터 보호 테스트
  const testDataProtection = async () => {
    setIsLoading(true);
    setProtectedResult(null);

    try {
      const response = await fetch('/api/privacy-demo', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          data: testData,
          dataType: 'account_info',
          userId: 'test_user_123'
        }),
      });

      const result = await response.json();

      if (result.success) {
        setProtectedResult(result);
      } else {
        alert(`데이터 보호 실패: ${result.error}`);
      }
    } catch (error) {
      alert(`네트워크 오류: ${error instanceof Error ? error.message : '알 수 없는 오류'}`);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-8">
      <div className="max-w-4xl mx-auto">
        <div className="bg-white rounded-2xl shadow-xl p-8">
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-gray-900 mb-2">
              🔒 개인정보 보호 데몬스트레이션
            </h1>
            <p className="text-gray-600">
              금융 데이터의 개인정보 보호, 데이터 마스킹, 감사 로그 기능을 테스트합니다.
            </p>
          </div>

          {/* 데몬스트레이션 실행 버튼 */}
          <div className="mb-8">
            <button
              onClick={runPrivacyDemo}
              disabled={isLoading}
              className="bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 text-white px-6 py-3 rounded-lg font-medium transition-colors"
            >
              {isLoading ? '실행 중...' : '개인정보 보호 데몬스트레이션 실행'}
            </button>
          </div>

          {/* 데몬스트레이션 결과 */}
          {demoResult && (
            <div className="mb-8 p-4 bg-gray-50 rounded-lg">
              <h3 className="font-semibold text-gray-900 mb-2">실행 결과</h3>
              <pre className="text-sm text-gray-700 whitespace-pre-wrap">{demoResult}</pre>
            </div>
          )}

          {/* 데이터 보호 테스트 */}
          <div className="border-t pt-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">
              데이터 마스킹 테스트
            </h2>

            {/* 테스트 데이터 입력 */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  계좌번호
                </label>
                <input
                  type="text"
                  value={testData.accountNumber}
                  onChange={(e) => setTestData(prev => ({ ...prev, accountNumber: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  카드번호
                </label>
                <input
                  type="text"
                  value={testData.cardNumber}
                  onChange={(e) => setTestData(prev => ({ ...prev, cardNumber: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  이름
                </label>
                <input
                  type="text"
                  value={testData.userName}
                  onChange={(e) => setTestData(prev => ({ ...prev, userName: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  이메일
                </label>
                <input
                  type="email"
                  value={testData.email}
                  onChange={(e) => setTestData(prev => ({ ...prev, email: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  잔액
                </label>
                <input
                  type="number"
                  value={testData.balance}
                  onChange={(e) => setTestData(prev => ({ ...prev, balance: parseInt(e.target.value) || 0 }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>

            {/* 테스트 실행 버튼 */}
            <button
              onClick={testDataProtection}
              disabled={isLoading}
              className="bg-green-600 hover:bg-green-700 disabled:bg-gray-400 text-white px-6 py-3 rounded-lg font-medium transition-colors mb-6"
            >
              {isLoading ? '처리 중...' : '데이터 보호 적용'}
            </button>

            {/* 보호된 데이터 결과 */}
            {protectedResult && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="p-4 bg-red-50 rounded-lg">
                  <h3 className="font-semibold text-red-900 mb-2">원본 데이터</h3>
                  <pre className="text-sm text-red-800 whitespace-pre-wrap">
                    {JSON.stringify(protectedResult.originalData, null, 2)}
                  </pre>
                </div>

                <div className="p-4 bg-green-50 rounded-lg">
                  <h3 className="font-semibold text-green-900 mb-2">보호된 데이터</h3>
                  <pre className="text-sm text-green-800 whitespace-pre-wrap">
                    {JSON.stringify(protectedResult.protectedData, null, 2)}
                  </pre>
                </div>
              </div>
            )}
          </div>

          {/* 기능 설명 */}
          <div className="mt-8 p-6 bg-blue-50 rounded-lg">
            <h3 className="font-semibold text-blue-900 mb-3">구현된 개인정보 보호 기능</h3>
            <ul className="text-sm text-blue-800 space-y-1">
              <li>• <strong>데이터 분류:</strong> PUBLIC, INTERNAL, CONFIDENTIAL, RESTRICTED 레벨</li>
              <li>• <strong>데이터 마스킹:</strong> 계좌번호, 카드번호, 이름, 이메일 자동 마스킹</li>
              <li>• <strong>접근 제어:</strong> 민감도에 따른 데이터 접근 검증</li>
              <li>• <strong>감사 로그:</strong> 모든 데이터 접근 및 조작 기록</li>
              <li>• <strong>법적 준수:</strong> 개인정보보호법, PIA, 금융감독원 가이드라인 지원</li>
              <li>• <strong>보안 암호화:</strong> AES-256 및 클라우드 HSM 연동</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}
