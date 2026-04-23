import { NextRequest, NextResponse } from 'next/server';
import { AuditLogger, ComplianceManager } from '../../../lib/privacy';

// 법적 준수 상태 조회 API
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const type = searchParams.get('type');

    switch (type) {
      case 'pia':
        // 개인정보 영향평가 보고서
        const piaReport = ComplianceManager.generatePIATemplate();
        return NextResponse.json({
          success: true,
          type: 'pia',
          report: piaReport,
          timestamp: new Date().toISOString()
        });

      case 'financial-report':
        // 금융감독원 보고서
        const financialReport = ComplianceManager.generateFinancialReport();
        return NextResponse.json({
          success: true,
          type: 'financial-report',
          report: financialReport,
          timestamp: new Date().toISOString()
        });

      case 'audit-logs':
        // 감사 로그 조회
        const dateFrom = searchParams.get('from') ? new Date(searchParams.get('from')!) : new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
        const dateTo = searchParams.get('to') ? new Date(searchParams.get('to')!) : new Date();
        const userId = searchParams.get('userId');

        const logs = AuditLogger.getLogs({
          userId: userId || undefined,
          dateFrom,
          dateTo
        });

        return NextResponse.json({
          success: true,
          type: 'audit-logs',
          logs,
          period: { from: dateFrom, to: dateTo },
          timestamp: new Date().toISOString()
        });

      case 'consent-template':
        // 동의서 템플릿
        const consentTemplate = ComplianceManager.generateConsentTemplate();
        return NextResponse.json({
          success: true,
          type: 'consent-template',
          template: consentTemplate,
          timestamp: new Date().toISOString()
        });

      default:
        return NextResponse.json({
          success: true,
          compliance: {
            pdpa: { status: '준수', lastUpdated: '2026-04-23' },
            pia: { status: '완료', lastUpdated: '2026-04-23' },
            finfra: { status: '준수', lastUpdated: '2026-04-23' },
            encryption: { status: 'AES-256 적용', lastUpdated: '2026-04-23' },
            audit: { status: '활성화', lastUpdated: '2026-04-23' }
          },
          timestamp: new Date().toISOString()
        });
    }
  } catch (error) {
    console.error('법적 준수 조회 실패:', error);
    return NextResponse.json(
      {
        success: false,
        error: '법적 준수 정보 조회 실패',
        details: error instanceof Error ? error.message : '알 수 없는 오류'
      },
      { status: 500 }
    );
  }
}

// 법적 준수 보고서 생성 API
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { type, userId, action, details } = body;

    // 감사 로그 기록
    if (userId && action) {
      AuditLogger.log({
        userId,
        action,
        resource: 'compliance',
        success: true,
        details
      });
    }

    switch (type) {
      case 'pia-report':
        const piaReport = ComplianceManager.generatePIATemplate();
        return NextResponse.json({
          success: true,
          type: 'pia-report',
          report: piaReport,
          message: '개인정보 영향평가 보고서가 생성되었습니다.',
          timestamp: new Date().toISOString()
        });

      case 'financial-report':
        const financialReport = ComplianceManager.generateFinancialReport();
        return NextResponse.json({
          success: true,
          type: 'financial-report',
          report: financialReport,
          message: '금융감독원 보고서가 생성되었습니다.',
          timestamp: new Date().toISOString()
        });

      case 'audit-report':
        const { dateFrom, dateTo } = body;
        const fromDate = dateFrom ? new Date(dateFrom) : new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
        const toDate = dateTo ? new Date(dateTo) : new Date();

        const auditReport = AuditLogger.generateAuditReport(fromDate, toDate);
        return NextResponse.json({
          success: true,
          type: 'audit-report',
          report: auditReport,
          period: { from: fromDate, to: toDate },
          message: '감사 보고서가 생성되었습니다.',
          timestamp: new Date().toISOString()
        });

      default:
        return NextResponse.json(
          {
            success: false,
            error: '지원하지 않는 보고서 타입입니다.',
            supportedTypes: ['pia-report', 'financial-report', 'audit-report']
          },
          { status: 400 }
        );
    }
  } catch (error) {
    console.error('보고서 생성 실패:', error);
    return NextResponse.json(
      {
        success: false,
        error: '보고서 생성 실패',
        details: error instanceof Error ? error.message : '알 수 없는 오류'
      },
      { status: 500 }
    );
  }
}
