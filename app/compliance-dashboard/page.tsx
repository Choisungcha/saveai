'use client';

import { useState, useEffect } from 'react';

interface ComplianceStatus {
  pdpa: { status: string; lastUpdated: string };
  pia: { status: string; lastUpdated: string };
  finfra: { status: string; lastUpdated: string };
  encryption: { status: string; lastUpdated: string };
  audit: { status: string; lastUpdated: string };
}

interface AuditLog {
  id: string;
  timestamp: Date;
  userId: string;
  action: string;
  resource: string;
  success: boolean;
  details?: any;
}

export default function ComplianceDashboard() {
  const [complianceStatus, setComplianceStatus] = useState<ComplianceStatus | null>(null);
  const [auditLogs, setAuditLogs] = useState<AuditLog[]>([]);
  const [piaReport, setPiaReport] = useState<any>(null);
  const [financialReport, setFinancialReport] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [activeTab, setActiveTab] = useState<'status' | 'pia' | 'financial' | 'audit'>('status');

  // 준수 상태 조회
  const fetchComplianceStatus = async () => {
    setIsLoading(true);
    try {
      const response = await fetch('/api/compliance');
      const result = await response.json();
      if (result.success) {
        setComplianceStatus(result.compliance);
      }
    } catch (error) {
      console.error('준수 상태 조회 실패:', error);
    } finally {
      setIsLoading(false);
    }
  };

  // 감사 로그 조회
  const fetchAuditLogs = async () => {
    setIsLoading(true);
    try {
      const response = await fetch('/api/compliance?type=audit-logs&from=2026-04-01&to=2026-04-30');
      const result = await response.json();
      if (result.success) {
        setAuditLogs(result.logs);
      }
    } catch (error) {
      console.error('감사 로그 조회 실패:', error);
    } finally {
      setIsLoading(false);
    }
  };

  // PIA 보고서 조회
  const fetchPiaReport = async () => {
    setIsLoading(true);
    try {
      const response = await fetch('/api/compliance?type=pia');
      const result = await response.json();
      if (result.success) {
        setPiaReport(result.report);
      }
    } catch (error) {
      console.error('PIA 보고서 조회 실패:', error);
    } finally {
      setIsLoading(false);
    }
  };

  // 금융 보고서 조회
  const fetchFinancialReport = async () => {
    setIsLoading(true);
    try {
      const response = await fetch('/api/compliance?type=financial-report');
      const result = await response.json();
      if (result.success) {
        setFinancialReport(result.report);
      }
    } catch (error) {
      console.error('금융 보고서 조회 실패:', error);
    } finally {
      setIsLoading(false);
    }
  };

  // 보고서 생성
  const generateReport = async (type: string) => {
    setIsLoading(true);
    try {
      const response = await fetch('/api/compliance', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          type,
          userId: 'admin',
          action: 'report_generation',
          details: { reportType: type }
        }),
      });

      const result = await response.json();
      if (result.success) {
        alert(`${type} 보고서가 생성되었습니다.`);
        // 데이터를 다시 로드
        if (type === 'pia-report') fetchPiaReport();
        if (type === 'financial-report') fetchFinancialReport();
      } else {
        alert(`보고서 생성 실패: ${result.error}`);
      }
    } catch (error) {
      alert(`네트워크 오류: ${error instanceof Error ? error.message : '알 수 없는 오류'}`);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchComplianceStatus();
  }, []);

  useEffect(() => {
    if (activeTab === 'audit') fetchAuditLogs();
    if (activeTab === 'pia') fetchPiaReport();
    if (activeTab === 'financial') fetchFinancialReport();
  }, [activeTab]);

  const getStatusColor = (status: string) => {
    if (status.includes('준수') || status.includes('완료') || status.includes('활성화')) return 'text-green-600 bg-green-50';
    if (status.includes('진행중')) return 'text-yellow-600 bg-yellow-50';
    return 'text-red-600 bg-red-50';
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-8">
      <div className="max-w-6xl mx-auto">
        <div className="bg-white rounded-2xl shadow-xl p-8">
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-gray-900 mb-2">
              ⚖️ 법적 준수 대시보드
            </h1>
            <p className="text-gray-600">
              금융감독원 등록 및 개인정보 보호 준수 상태를 모니터링합니다.
            </p>
          </div>

          {/* 탭 네비게이션 */}
          <div className="flex space-x-1 mb-8 bg-gray-100 p-1 rounded-lg">
            {[
              { id: 'status', label: '준수 상태', icon: '📊' },
              { id: 'pia', label: 'PIA 보고서', icon: '🔍' },
              { id: 'financial', label: '금융 보고서', icon: '🏦' },
              { id: 'audit', label: '감사 로그', icon: '📝' }
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={`flex-1 py-2 px-4 rounded-md text-sm font-medium transition-colors ${
                  activeTab === tab.id
                    ? 'bg-white text-blue-600 shadow-sm'
                    : 'text-gray-600 hover:text-gray-900'
                }`}
              >
                {tab.icon} {tab.label}
              </button>
            ))}
          </div>

          {/* 준수 상태 탭 */}
          {activeTab === 'status' && (
            <div>
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-2xl font-bold text-gray-900">준수 상태 현황</h2>
                <button
                  onClick={fetchComplianceStatus}
                  disabled={isLoading}
                  className="bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 text-white px-4 py-2 rounded-lg text-sm"
                >
                  {isLoading ? '로딩 중...' : '새로고침'}
                </button>
              </div>

              {complianceStatus && (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {Object.entries(complianceStatus).map(([key, value]) => (
                    <div key={key} className="bg-gray-50 rounded-lg p-6">
                      <div className="flex items-center justify-between mb-2">
                        <h3 className="font-semibold text-gray-900 capitalize">
                          {key === 'pdpa' ? '개인정보보호법' :
                           key === 'pia' ? '개인정보 영향평가' :
                           key === 'finfra' ? '금융보안원' :
                           key === 'encryption' ? '암호화' : '감사'}
                        </h3>
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(value.status)}`}>
                          {value.status}
                        </span>
                      </div>
                      <p className="text-sm text-gray-600">
                        마지막 업데이트: {value.lastUpdated}
                      </p>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* PIA 보고서 탭 */}
          {activeTab === 'pia' && (
            <div>
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-2xl font-bold text-gray-900">개인정보 영향평가 (PIA)</h2>
                <button
                  onClick={() => generateReport('pia-report')}
                  disabled={isLoading}
                  className="bg-green-600 hover:bg-green-700 disabled:bg-gray-400 text-white px-4 py-2 rounded-lg text-sm"
                >
                  {isLoading ? '생성 중...' : '보고서 생성'}
                </button>
              </div>

              {piaReport && (
                <div className="space-y-6">
                  <div className="bg-blue-50 rounded-lg p-6">
                    <h3 className="font-semibold text-blue-900 mb-2">프로젝트 개요</h3>
                    <p className="text-blue-800">{piaReport.projectName}</p>
                    <p className="text-blue-800 mt-1">{piaReport.purpose}</p>
                  </div>

                  <div className="bg-green-50 rounded-lg p-6">
                    <h3 className="font-semibold text-green-900 mb-2">보안 조치</h3>
                    <ul className="text-green-800 space-y-1">
                      {piaReport.securityMeasures.map((measure: string, index: number) => (
                        <li key={index}>• {measure}</li>
                      ))}
                    </ul>
                  </div>

                  <div className="bg-yellow-50 rounded-lg p-6">
                    <h3 className="font-semibold text-yellow-900 mb-2">위험 완화 전략</h3>
                    <ul className="text-yellow-800 space-y-1">
                      {piaReport.riskAssessment.mitigationStrategies.map((strategy: string, index: number) => (
                        <li key={index}>• {strategy}</li>
                      ))}
                    </ul>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* 금융 보고서 탭 */}
          {activeTab === 'financial' && (
            <div>
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-2xl font-bold text-gray-900">금융감독원 보고서</h2>
                <button
                  onClick={() => generateReport('financial-report')}
                  disabled={isLoading}
                  className="bg-purple-600 hover:bg-purple-700 disabled:bg-gray-400 text-white px-4 py-2 rounded-lg text-sm"
                >
                  {isLoading ? '생성 중...' : '보고서 생성'}
                </button>
              </div>

              {financialReport && (
                <div className="space-y-6">
                  <div className="bg-purple-50 rounded-lg p-6">
                    <h3 className="font-semibold text-purple-900 mb-2">기관 정보</h3>
                    <p className="text-purple-800"><strong>기관명:</strong> {financialReport.institutionName}</p>
                    <p className="text-purple-800"><strong>업무 유형:</strong> {financialReport.businessType}</p>
                    <p className="text-purple-800"><strong>보고서 작성일:</strong> {financialReport.reportDate}</p>
                  </div>

                  <div className="bg-red-50 rounded-lg p-6">
                    <h3 className="font-semibold text-red-900 mb-2">보안 현황</h3>
                    <p className="text-red-800"><strong>암호화 방식:</strong> {financialReport.complianceStatus.encryption}</p>
                    <p className="text-red-800"><strong>감사 시스템:</strong> {financialReport.complianceStatus.audit}</p>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* 감사 로그 탭 */}
          {activeTab === 'audit' && (
            <div>
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-2xl font-bold text-gray-900">감사 로그</h2>
                <button
                  onClick={fetchAuditLogs}
                  disabled={isLoading}
                  className="bg-orange-600 hover:bg-orange-700 disabled:bg-gray-400 text-white px-4 py-2 rounded-lg text-sm"
                >
                  {isLoading ? '로딩 중...' : '로그 조회'}
                </button>
              </div>

              <div className="bg-white border rounded-lg overflow-hidden">
                <div className="overflow-x-auto">
                  <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          시간
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          사용자
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          작업
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          리소스
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          상태
                        </th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {auditLogs.map((log) => (
                        <tr key={log.id}>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                            {new Date(log.timestamp).toLocaleString()}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                            {log.userId}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                            {log.action}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                            {log.resource}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <span className={`px-2 py-1 text-xs font-medium rounded-full ${
                              log.success
                                ? 'bg-green-100 text-green-800'
                                : 'bg-red-100 text-red-800'
                            }`}>
                              {log.success ? '성공' : '실패'}
                            </span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
