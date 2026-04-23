# SaveAI - 금융 데이터 통합 서비스

SaveAI는 사용자의 금융 데이터를 안전하게 통합하고 분석하여 맞춤형 금융 상품 추천 및 지출 분석 서비스를 제공하는 Next.js 기반 웹 애플리케이션입니다.

## 🚀 주요 기능

### 금융 데이터 통합
- **토스페이먼츠**: 결제 위젯 및 브랜드 페이 연동
- **카카오페이**: 퀵 페이 및 카카오뱅크 연동
- **KG이니시스**: 보안 결제 시스템 연동

### 개인정보 보호
- **AES-256 암호화**: 민감한 금융 데이터 보호
- **클라우드 HSM**: AWS KMS, Azure Key Vault, Google Cloud KMS 지원
- **데이터 마스킹**: 계좌번호, 카드번호 자동 마스킹
- **감사 로그**: 모든 데이터 접근 기록

### 법적 준수
- **개인정보보호법(PDPA)**: 개인정보 처리 준수
- **개인정보 영향평가(PIA)**: 위험 평가 및 완화 조치
- **금융감독원 등록**: 금융 서비스 등록 준비
- **감사 보고서**: 정기적인 컴플라이언스 보고

## 🛠️ 기술 스택

- **Frontend**: Next.js 14, React, TypeScript, Tailwind CSS
- **Backend**: Next.js API Routes
- **Database**: (통합 예정)
- **Authentication**: (통합 예정)
- **Security**: crypto-js, AWS KMS, Azure Key Vault, Google Cloud KMS
- **Fintech APIs**: Toss Payments, KakaoPay, KG Inicis

## 📁 프로젝트 구조

```
saveai/
├── app/                          # Next.js App Router
│   ├── api/                      # API 엔드포인트
│   │   ├── compliance/           # 법적 준수 API
│   │   ├── privacy-demo/         # 개인정보 보호 데모 API
│   │   └── ...
│   ├── compliance-dashboard/     # 법적 준수 대시보드
│   ├── privacy-demo/             # 개인정보 보호 데모
│   ├── financial-sync/           # 금융 데이터 동기화
│   └── ...
├── lib/                          # 유틸리티 라이브러리
│   ├── encryption.ts             # 데이터 암호화 모듈
│   ├── cloudHSM.ts               # 클라우드 HSM 모듈
│   ├── privacy.ts                # 개인정보 보호 모듈
│   └── ...
├── components/                   # React 컴포넌트
├── docs/                         # 문서화
│   ├── compliance-guide.md       # 법적 준수 가이드
│   ├── pia-report.md             # PIA 보고서
│   ├── privacy-consent.md        # 동의서 템플릿
│   └── ...
└── ...
```

## 🚀 시작하기

### 개발 환경 설정

1. **의존성 설치**
```bash
npm install
```

2. **환경 변수 설정**
```bash
cp .env.example .env.local
```

환경 변수에 다음 값들을 설정하세요:
```env
# 데이터베이스
DATABASE_URL=postgresql://user:password@localhost:5432/saveai_dev

# JWT 시크릿
JWT_SECRET=your-jwt-secret-here
JWT_REFRESH_SECRET=your-refresh-secret-here

# 금융 API 키들
NEXT_PUBLIC_TOSS_CLIENT_KEY=your_toss_client_key
NEXT_PUBLIC_KAKAOPAY_CID=your_kakaopay_cid
NEXT_PUBLIC_INICIS_MID=your_inicis_mid

# Cloud HSM (선택사항)
AWS_KMS_KEY_ID=your_aws_kms_key_id
AZURE_KEY_VAULT_URL=https://your-kv.vault.azure.net/
GOOGLE_CLOUD_KMS_KEY_RING=your_key_ring
```

3. **데이터베이스 설정**
```bash
# Prisma 마이그레이션 실행
npx prisma migrate dev
npx prisma generate
```

4. **개발 서버 실행**
```bash
npm run dev
```

5. **브라우저에서 접속**
```
http://localhost:3005
```

## 🏭 프로덕션 배포

### Docker를 사용한 배포

1. **프로덕션 환경 변수 설정**
```bash
cp .env.production.example .env.production
# 실제 프로덕션 값들로 수정
```

2. **Docker Compose로 배포**
```bash
# 빌드 및 실행
docker-compose up -d

# 로그 확인
docker-compose logs -f app

# 헬스체크
curl http://localhost/api/health
```

3. **모니터링 설정**
```bash
# Prometheus: http://localhost:9090
# Grafana: http://localhost:3001 (admin/admin)
```

### 프로덕션 준비 상태 확인

```bash
# 프로덕션 준비 상태 검증
node scripts/check-production-readiness.js
```

### 환경별 배포

- **개발 환경**: `npm run dev`
- **스테이징 환경**: `NODE_ENV=staging npm run build && npm start`
- **프로덕션 환경**: Docker Compose 또는 Kubernetes

## 📋 사용 가능한 페이지

- **/**: 메인 대시보드
- **/financial-sync**: 금융 데이터 동기화
- **/privacy-demo**: 개인정보 보호 데모
- **/compliance-dashboard**: 법적 준수 대시보드
- **/card-assistant**: 카드 추천 서비스
- **/expense-analysis**: 지출 분석
- **/settings**: 설정

## 🔒 보안 기능

### 데이터 암호화
```typescript
import { DataEncryption } from '@/lib/encryption';

// 데이터 암호화
const encrypted = await DataEncryption.encrypt('민감한 데이터', 'user-key');

// 데이터 복호화
const decrypted = await DataEncryption.decrypt(encrypted, 'user-key');
```

### 개인정보 마스킹
```typescript
import { PrivacyManager } from '@/lib/privacy';

// 데이터 마스킹 적용
const maskedData = PrivacyManager.maskSensitiveData(userData, 'account_info');
```

### 감사 로그
```typescript
import { AuditLogger } from '@/lib/privacy';

// 감사 로그 기록
AuditLogger.log({
  userId: 'user123',
  action: 'data_access',
  resource: 'account_info',
  success: true
});
```

## 📊 법적 준수 API

### 준수 상태 조회
```bash
GET /api/compliance
```

### PIA 보고서 생성
```bash
POST /api/compliance
Content-Type: application/json

{
  "type": "pia-report",
  "userId": "admin"
}
```

### 감사 로그 조회
```bash
GET /api/compliance?type=audit-logs&from=2026-01-01&to=2026-12-31
```

## 🏗️ 빌드 및 배포

### 프로덕션 빌드
```bash
npm run build
```

### 프로덕션 실행
```bash
npm start
```

## 📚 문서

- [개인정보 보호 가이드](./docs/privacy-consent.md)
- [법적 준수 가이드](./docs/compliance-guide.md)
- [PIA 보고서](./docs/pia-report.md)
- [금융감독원 보고서](./docs/financial-supervisory-report.md)

## 🤝 기여

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## 📄 라이선스

이 프로젝트는 MIT 라이선스를 따릅니다.

## ⚠️ 법적 고지

이 서비스는 금융 데이터를 다루므로, 실제 서비스 운영 시 반드시 관련 법규를 준수하고 금융감독원 등록을 완료해야 합니다. 제공되는 코드는 데몬스트레이션 목적으로만 사용하시기 바랍니다.

## 📞 연락처

프로젝트 관리자: SaveAI Team
이메일: contact@saveai.com