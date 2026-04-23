import { PrivacyManager, AuditLogger, ComplianceManager, DataSensitivity, DataClassification } from './privacy';

// 데이터 분류 등록
export function initializeDataClassifications(): void {
  // 금융 계좌 정보
  PrivacyManager.registerDataType({
    id: 'account_info',
    sensitivity: DataSensitivity.RESTRICTED,
    category: '금융정보',
    retentionPeriod: 1825, // 5년
    encryptionRequired: true,
    maskingRequired: true,
    auditRequired: true
  });

  // 신용카드 정보
  PrivacyManager.registerDataType({
    id: 'card_info',
    sensitivity: DataSensitivity.RESTRICTED,
    category: '금융정보',
    retentionPeriod: 1825,
    encryptionRequired: true,
    maskingRequired: true,
    auditRequired: true
  });

  // 거래 내역
  PrivacyManager.registerDataType({
    id: 'transaction_history',
    sensitivity: DataSensitivity.CONFIDENTIAL,
    category: '금융정보',
    retentionPeriod: 1825,
    encryptionRequired: true,
    maskingRequired: false,
    auditRequired: true
  });

  // 사용자 프로필
  PrivacyManager.registerDataType({
    id: 'user_profile',
    sensitivity: DataSensitivity.CONFIDENTIAL,
    category: '개인정보',
    retentionPeriod: 1825,
    encryptionRequired: true,
    maskingRequired: true,
    auditRequired: false
  });

  // 앱 설정
  PrivacyManager.registerDataType({
    id: 'app_settings',
    sensitivity: DataSensitivity.INTERNAL,
    category: '운영정보',
    retentionPeriod: 365,
    encryptionRequired: false,
    maskingRequired: false,
    auditRequired: false
  });
}

// 개인정보 보호 데몬스트레이션
export class PrivacyDemo {
  static async demonstratePrivacyFeatures(): Promise<void> {
    console.log('🔒 개인정보 보호 기능 데몬스트레이션\n');

    // 1. 데이터 분류 초기화
    initializeDataClassifications();
    console.log('✅ 데이터 분류 등록 완료');

    // 2. 데이터 처리 검증
    console.log('\n📋 데이터 처리 검증:');
    try {
      const isValid = PrivacyManager.validateDataProcessing('account_info', 'read');
      console.log(`계좌 정보 읽기 검증: ${isValid ? '승인' : '거부'}`);
    } catch (error) {
      console.log(`계좌 정보 읽기 검증 실패: ${error instanceof Error ? error.message : '알 수 없는 오류'}`);
    }

    // 3. 데이터 마스킹 데몬스트레이션
    console.log('\n🎭 데이터 마스킹 데몬스트레이션:');
    const originalData = {
      accountNumber: '1234567890123456',
      cardNumber: '4111 1111 1111 1111',
      userName: '김철수',
      email: 'kim@example.com',
      balance: 1000000
    };

    const maskedData = PrivacyManager.maskSensitiveData(originalData, 'account_info');
    console.log('원본 데이터:', originalData);
    console.log('마스킹된 데이터:', maskedData);

    // 4. 감사 로그 기록
    console.log('\n📝 감사 로그 기록:');
    AuditLogger.log({
      userId: 'user123',
      action: 'account_access',
      resource: 'account_info',
      ipAddress: '192.168.1.100',
      userAgent: 'SaveAI/1.0',
      success: true,
      details: { accountId: 'acc_001' }
    });

    AuditLogger.log({
      userId: 'user123',
      action: 'data_export',
      resource: 'transaction_history',
      success: false,
      details: { reason: '권한 부족' }
    });

    console.log('감사 로그 기록 완료');

    // 5. 감사 보고서 생성
    console.log('\n📊 감사 보고서:');
    const report = AuditLogger.generateAuditReport(
      new Date(Date.now() - 7 * 24 * 60 * 60 * 1000), // 7일 전
      new Date()
    );
    console.log(JSON.stringify(report, null, 2));

    // 6. 법적 준수 문서 생성
    console.log('\n⚖️ 법적 준수 문서:');

    console.log('개인정보 영향평가 (PIA) 템플릿:');
    const piaTemplate = ComplianceManager.generatePIATemplate();
    console.log(`프로젝트: ${piaTemplate.projectName}`);
    console.log(`목적: ${piaTemplate.purpose}`);
    console.log(`보안 조치: ${piaTemplate.securityMeasures.join(', ')}`);

    console.log('\n금융감독원 보고서 템플릿:');
    const financialReport = ComplianceManager.generateFinancialReport();
    console.log(`기관명: ${financialReport.institutionName}`);
    console.log(`업무 유형: ${financialReport.businessType}`);
    console.log(`암호화 방식: ${financialReport.complianceStatus.encryption}`);

    console.log('\n📄 동의서 템플릿 샘플:');
    const consentTemplate = ComplianceManager.generateConsentTemplate();
    console.log(consentTemplate.substring(0, 200) + '...');
  }
}

// 개인정보 보호 정책 적용 유틸리티
export class PrivacyUtils {
  // 데이터 익스포트 시 개인정보 필터링
  static filterExportData(data: any[], dataType: string): any[] {
    return data.map(item => {
      // 데이터 처리 검증
      PrivacyManager.validateDataProcessing(dataType, 'read');

      // 민감한 필드 마스킹
      return PrivacyManager.maskSensitiveData(item, dataType);
    });
  }

  // API 응답 시 개인정보 보호 적용
  static protectApiResponse(data: any, dataType: string, userId: string): any {
    // 감사 로그 기록
    AuditLogger.log({
      userId,
      action: 'api_access',
      resource: dataType,
      success: true,
      details: { endpoint: 'data_export' }
    });

    // 데이터 마스킹 적용
    return PrivacyManager.maskSensitiveData(data, dataType);
  }

  // 데이터 삭제 시 감사 로그
  static logDataDeletion(userId: string, dataType: string, recordCount: number): void {
    AuditLogger.log({
      userId,
      action: 'data_deletion',
      resource: dataType,
      success: true,
      details: { recordCount }
    });
  }
}
