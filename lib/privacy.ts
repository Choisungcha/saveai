import { DataEncryption } from './encryption';
import { CloudHSM } from './cloudHSM';

// 개인정보 보호 등급
export enum DataSensitivity {
  PUBLIC = 'public',           // 공개 정보
  INTERNAL = 'internal',       // 내부 정보
  CONFIDENTIAL = 'confidential', // 기밀 정보
  RESTRICTED = 'restricted'    // 제한된 정보 (금융 데이터 등)
}

// 데이터 분류 인터페이스
export interface DataClassification {
  id: string;
  sensitivity: DataSensitivity;
  category: string;
  retentionPeriod: number; // 보존 기간 (일)
  encryptionRequired: boolean;
  maskingRequired: boolean;
  auditRequired: boolean;
}

// 개인정보 보호 관리자
export class PrivacyManager {
  private static dataClassifications: Map<string, DataClassification> = new Map();

  // 데이터 분류 등록
  static registerDataType(classification: DataClassification): void {
    this.dataClassifications.set(classification.id, classification);
  }

  // 데이터 처리 전 검증
  static validateDataProcessing(dataType: string, operation: 'create' | 'read' | 'update' | 'delete'): boolean {
    const classification = this.dataClassifications.get(dataType);
    if (!classification) {
      throw new Error(`등록되지 않은 데이터 타입: ${dataType}`);
    }

    // 민감도에 따른 접근 제어
    if (classification.sensitivity === DataSensitivity.RESTRICTED) {
      // 추가적인 인증/인가 로직
      console.log(`🔒 제한된 데이터 접근: ${dataType}, 작업: ${operation}`);
      return this.checkAccessPermission(dataType, operation);
    }

    return true;
  }

  // 접근 권한 확인 (모의 구현)
  private static checkAccessPermission(dataType: string, operation: string): boolean {
    // 실제로는 사용자 역할, IP, 시간 등으로 검증
    const allowedOperations = ['read']; // 예: 읽기만 허용
    return allowedOperations.includes(operation);
  }

  // 데이터 마스킹
  static maskSensitiveData(data: any, dataType: string): any {
    const classification = this.dataClassifications.get(dataType);
    if (!classification?.maskingRequired) {
      return data;
    }

    const masked = { ...data };

    // 계좌번호 마스킹
    if (masked.accountNumber) {
      masked.accountNumber = this.maskAccountNumber(masked.accountNumber);
    }

    // 카드번호 마스킹
    if (masked.cardNumber) {
      masked.cardNumber = this.maskCardNumber(masked.cardNumber);
    }

    // 이름 마스킹
    if (masked.userName) {
      masked.userName = this.maskName(masked.userName);
    }

    // 이메일 마스킹
    if (masked.email) {
      masked.email = this.maskEmail(masked.email);
    }

    return masked;
  }

  // 계좌번호 마스킹 (뒤 4자리만 표시)
  private static maskAccountNumber(accountNumber: string): string {
    if (accountNumber.length <= 4) return accountNumber;
    const visible = accountNumber.slice(-4);
    const masked = '*'.repeat(accountNumber.length - 4);
    return masked + visible;
  }

  // 카드번호 마스킹 (앞 6자리, 뒤 4자리 표시)
  private static maskCardNumber(cardNumber: string): string {
    const cleaned = cardNumber.replace(/\s+/g, '');
    if (cleaned.length < 10) return cleaned;

    const first6 = cleaned.substring(0, 6);
    const last4 = cleaned.substring(cleaned.length - 4);
    const masked = '*'.repeat(cleaned.length - 10);

    return `${first6}${masked}${last4}`;
  }

  // 이름 마스킹 (첫 글자만 표시)
  private static maskName(name: string): string {
    if (name.length <= 1) return name;
    return name.charAt(0) + '*'.repeat(name.length - 1);
  }

  // 이메일 마스킹
  private static maskEmail(email: string): string {
    const [local, domain] = email.split('@');
    if (local.length <= 2) return email;

    const first2 = local.substring(0, 2);
    const masked = '*'.repeat(local.length - 2);

    return `${first2}${masked}@${domain}`;
  }
}

// 감사 로그 관리
export class AuditLogger {
  private static logs: Array<{
    id: string;
    timestamp: Date;
    userId: string;
    action: string;
    resource: string;
    ipAddress: string;
    userAgent: string;
    success: boolean;
    details?: any;
  }> = [];

  // 감사 로그 기록
  static log(params: {
    userId: string;
    action: string;
    resource: string;
    ipAddress?: string;
    userAgent?: string;
    success: boolean;
    details?: any;
  }): void {
    const logEntry = {
      id: this.generateLogId(),
      timestamp: new Date(),
      ipAddress: params.ipAddress || 'unknown',
      userAgent: params.userAgent || 'unknown',
      ...params
    };

    this.logs.push(logEntry);

    // 실시간 모니터링 (민감한 작업의 경우)
    if (this.isSensitiveAction(params.action)) {
      this.alertSecurityTeam(logEntry);
    }

    // 로그 보존 기간 초과시 삭제
    this.cleanupOldLogs();
  }

  // 민감한 작업 판별
  private static isSensitiveAction(action: string): boolean {
    const sensitiveActions = [
      'certificate_access',
      'financial_data_export',
      'admin_login',
      'data_deletion'
    ];
    return sensitiveActions.includes(action);
  }

  // 보안팀 알림 (모의 구현)
  private static alertSecurityTeam(logEntry: any): void {
    console.log('🚨 보안팀 알림:', {
      timestamp: logEntry.timestamp,
      userId: logEntry.userId,
      action: logEntry.action,
      resource: logEntry.resource,
      success: logEntry.success
    });
  }

  // 로그 ID 생성
  private static generateLogId(): string {
    return `audit_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  // 오래된 로그 정리 (90일 보존)
  private static cleanupOldLogs(): void {
    const retentionPeriod = 90 * 24 * 60 * 60 * 1000; // 90일
    const cutoffDate = new Date(Date.now() - retentionPeriod);

    this.logs = this.logs.filter(log => log.timestamp > cutoffDate);
  }

  // 감사 로그 조회
  static getLogs(filters?: {
    userId?: string;
    action?: string;
    dateFrom?: Date;
    dateTo?: Date;
  }): any[] {
    let filteredLogs = this.logs;

    if (filters?.userId) {
      filteredLogs = filteredLogs.filter(log => log.userId === filters.userId);
    }

    if (filters?.action) {
      filteredLogs = filteredLogs.filter(log => log.action === filters.action);
    }

    if (filters?.dateFrom) {
      filteredLogs = filteredLogs.filter(log => log.timestamp >= filters.dateFrom!);
    }

    if (filters?.dateTo) {
      filteredLogs = filteredLogs.filter(log => log.timestamp <= filters.dateTo!);
    }

    return filteredLogs.sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime());
  }

  // 감사 보고서 생성
  static generateAuditReport(dateFrom: Date, dateTo: Date): any {
    const logs = this.getLogs({ dateFrom, dateTo });

    return {
      period: { from: dateFrom, to: dateTo },
      totalEvents: logs.length,
      successfulOperations: logs.filter(log => log.success).length,
      failedOperations: logs.filter(log => !log.success).length,
      topActions: this.getTopActions(logs),
      securityIncidents: logs.filter(log => !log.success && this.isSensitiveAction(log.action)).length
    };
  }

  private static getTopActions(logs: any[]): Array<{ action: string; count: number }> {
    const actionCounts: Map<string, number> = new Map();

    logs.forEach(log => {
      actionCounts.set(log.action, (actionCounts.get(log.action) || 0) + 1);
    });

    return Array.from(actionCounts.entries())
      .map(([action, count]) => ({ action, count }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 10);
  }
}

// 법적 준수 관리자
export class ComplianceManager {
  private static regulations = {
    pdpa: { name: '개인정보보호법', lastUpdated: '2023-09-15' },
    pia: { name: '개인정보 영향평가', required: true },
    finfra: { name: '금융보안원 가이드라인', lastUpdated: '2024-01-01' }
  };

  // 개인정보 영향평가 (PIA) 템플릿
  static generatePIATemplate(): any {
    return {
      projectName: 'SaveAI 금융 데이터 통합 서비스',
      purpose: '사용자의 금융 데이터를 안전하게 통합하고 분석',
      dataSubjects: ['개인 사용자', '법인 사용자'],
      dataCategories: [
        '계좌정보', '카드정보', '거래내역', '개인식별정보',
        '금융상품 정보', '신용정보'
      ],
      processingActivities: [
        '데이터 수집', '저장', '분석', '표시', '전송'
      ],
      legalBasis: '개인정보 보호법 제15조 (정보주체의 동의)',
      retentionPeriod: '서비스 이용 기간 + 5년',
      securityMeasures: [
        'AES-256 암호화', '클라우드 HSM', '접근 제어',
        '감사 로그', '데이터 마스킹'
      ],
      riskAssessment: {
        highRiskData: ['계좌번호', '카드번호', '거래내역'],
        mitigationStrategies: [
          '강력한 암호화', '최소 권한 원칙', '정기 보안 감사'
        ]
      },
      dataSharing: {
        thirdParties: ['토스페이먼츠', '카카오페이', 'KG이니시스'],
        purposes: ['결제 처리', '계좌 조회', '데이터 동기화'],
        legalBasis: '위탁 처리 계약'
      }
    };
  }

  // 금융감독원 보고용 데이터
  static generateFinancialReport(): any {
    return {
      institutionName: 'SaveAI',
      businessType: '금융 데이터 통합 서비스',
      dataVolume: {
        totalUsers: 0, // 실제 사용자 수
        totalAccounts: 0, // 연동된 계좌 수
        dataProcessed: '0GB' // 처리된 데이터량
      },
      securityIncidents: [], // 보안 사고 기록
      complianceStatus: {
        pdpa: '준수',
        pia: '완료',
        encryption: 'AES-256',
        audit: '활성화'
      },
      reportDate: new Date().toISOString().split('T')[0]
    };
  }

  // 동의서 템플릿 생성
  static generateConsentTemplate(): string {
    return `
개인정보 수집 및 이용 동의서

SaveAI는 다음과 같이 귀하의 개인정보를 수집 및 이용합니다:

1. 수집하는 개인정보 항목
   - 금융기관 계좌정보
   - 신용카드 정보
   - 거래내역 정보
   - 개인식별정보 (이름, 생년월일, 연락처)

2. 개인정보의 수집 및 이용 목적
   - 금융 데이터 통합 및 분석 서비스 제공
   - 맞춤형 금융 상품 추천
   - 지출 분석 및 절약 제안

3. 개인정보의 보유 및 이용 기간
   - 서비스 이용 기간 동안 및 법령에 따른 보존 기간

4. 동의 거부 권리 및 불이익
   - 귀하는 개인정보 수집 및 이용에 대한 동의를 거부할 권리가 있습니다.
   - 다만, 동의를 거부할 경우 서비스 이용이 제한될 수 있습니다.

본인은 위의 내용에 대해 충분히 이해하였으며, 개인정보 수집 및 이용에 동의합니다.

동의일: ________
성명: ________
    `;
  }
}
