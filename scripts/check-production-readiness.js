#!/usr/bin/env node

/**
 * 프로덕션 준비 상태 확인 스크립트
 * SaveAI 애플리케이션의 프로덕션 배포 준비 상태를 종합적으로 검증합니다.
 */

const fs = require('fs');
const path = require('path');

class ProductionReadinessChecker {
  constructor() {
    this.checks = [];
    this.errors = [];
    this.warnings = [];
  }

  // 설정 파일 존재 확인
  checkConfigFiles() {
    console.log('🔍 환경 설정 파일 확인 중...');

    const requiredFiles = [
      '.env.production',
      'prisma/schema.prisma',
      'lib/config.ts',
      'lib/logger.ts',
      'lib/metrics.ts'
    ];

    requiredFiles.forEach(file => {
      if (fs.existsSync(file)) {
        this.checks.push(`✅ ${file} 존재`);
      } else {
        this.errors.push(`❌ ${file} 파일이 존재하지 않습니다`);
      }
    });
  }

  // 환경 변수 검증
  checkEnvironmentVariables() {
    console.log('🔍 환경 변수 검증 중...');

    const requiredVars = [
      'DATABASE_URL',
      'JWT_SECRET',
      'JWT_REFRESH_SECRET',
      'NEXT_PUBLIC_TOSS_CLIENT_KEY',
      'NEXT_PUBLIC_KAKAOPAY_CID',
      'NEXT_PUBLIC_INICIS_MID'
    ];

    const prodEnvPath = path.join(process.cwd(), '.env.production');
    if (fs.existsSync(prodEnvPath)) {
      const envContent = fs.readFileSync(prodEnvPath, 'utf8');
      const envVars = {};

      envContent.split('\n').forEach(line => {
        const [key, value] = line.split('=');
        if (key && value) {
          envVars[key.trim()] = value.trim();
        }
      });

      requiredVars.forEach(varName => {
        if (envVars[varName] && envVars[varName] !== `your_${varName.toLowerCase()}` && !envVars[varName].startsWith('test_')) {
          this.checks.push(`✅ ${varName} 설정됨`);
        } else {
          this.warnings.push(`⚠️ ${varName}이(가) 설정되지 않았거나 기본값을 사용 중입니다`);
        }
      });
    } else {
      this.errors.push('❌ .env.production 파일이 존재하지 않습니다');
    }
  }

  // 데이터베이스 스키마 검증
  checkDatabaseSchema() {
    console.log('🔍 데이터베이스 스키마 검증 중...');

    const schemaPath = path.join(process.cwd(), 'prisma/schema.prisma');
    if (fs.existsSync(schemaPath)) {
      const schema = fs.readFileSync(schemaPath, 'utf8');

      const requiredModels = ['User', 'FinancialAccount', 'Transaction', 'AuditLog', 'Session'];
      requiredModels.forEach(model => {
        if (schema.includes(`model ${model}`)) {
          this.checks.push(`✅ ${model} 모델 존재`);
        } else {
          this.errors.push(`❌ ${model} 모델이 스키마에 존재하지 않습니다`);
        }
      });
    } else {
      this.errors.push('❌ Prisma 스키마 파일이 존재하지 않습니다');
    }
  }

  // 보안 설정 검증
  checkSecuritySettings() {
    console.log('🔍 보안 설정 검증 중...');

    const securityChecks = [
      { file: 'lib/encryption.ts', description: '데이터 암호화 모듈' },
      { file: 'lib/cloudHSM.ts', description: '클라우드 HSM 모듈' },
      { file: 'lib/privacy.ts', description: '개인정보 보호 모듈' }
    ];

    securityChecks.forEach(check => {
      if (fs.existsSync(check.file)) {
        this.checks.push(`✅ ${check.description} 존재`);
      } else {
        this.errors.push(`❌ ${check.description} 파일이 존재하지 않습니다`);
      }
    });
  }

  // API 엔드포인트 검증
  checkApiEndpoints() {
    console.log('🔍 API 엔드포인트 검증 중...');

    const requiredApis = [
      'app/api/health/route.ts',
      'app/api/metrics/route.ts',
      'app/api/compliance/route.ts',
      'app/api/privacy-demo/route.ts'
    ];

    requiredApis.forEach(api => {
      if (fs.existsSync(api)) {
        this.checks.push(`✅ ${api} 존재`);
      } else {
        this.errors.push(`❌ ${api} 파일이 존재하지 않습니다`);
      }
    });
  }

  // 빌드 및 의존성 검증
  async checkBuildAndDependencies() {
    console.log('🔍 빌드 및 의존성 검증 중...');

    // package.json 확인
    if (fs.existsSync('package.json')) {
      this.checks.push('✅ package.json 존재');

      const packageJson = JSON.parse(fs.readFileSync('package.json', 'utf8'));

      const requiredDeps = [
        'prisma', '@prisma/client', 'winston', '@sentry/nextjs', 'prom-client'
      ];

      requiredDeps.forEach(dep => {
        if (packageJson.dependencies && packageJson.dependencies[dep]) {
          this.checks.push(`✅ ${dep} 의존성 설치됨`);
        } else if (packageJson.devDependencies && packageJson.devDependencies[dep]) {
          this.checks.push(`✅ ${dep} 개발 의존성 설치됨`);
        } else {
          this.warnings.push(`⚠️ ${dep} 의존성이 설치되지 않았습니다`);
        }
      });
    } else {
      this.errors.push('❌ package.json 파일이 존재하지 않습니다');
    }

    // next.config.js 확인
    if (fs.existsSync('next.config.js')) {
      this.checks.push('✅ next.config.js 존재');
    } else {
      this.warnings.push('⚠️ next.config.js 파일이 존재하지 않습니다');
    }
  }

  // 결과 출력
  printResults() {
    console.log('\n' + '='.repeat(60));
    console.log('🏭 SaveAI 프로덕션 준비 상태 검사 결과');
    console.log('='.repeat(60));

    if (this.checks.length > 0) {
      console.log('\n✅ 통과한 항목:');
      this.checks.forEach(check => console.log(`  ${check}`));
    }

    if (this.warnings.length > 0) {
      console.log('\n⚠️ 경고 항목:');
      this.warnings.forEach(warning => console.log(`  ${warning}`));
    }

    if (this.errors.length > 0) {
      console.log('\n❌ 오류 항목:');
      this.errors.forEach(error => console.log(`  ${error}`));
    }

    console.log('\n' + '='.repeat(60));
    console.log('📊 요약:');
    console.log(`  ✅ 통과: ${this.checks.length}`);
    console.log(`  ⚠️ 경고: ${this.warnings.length}`);
    console.log(`  ❌ 오류: ${this.errors.length}`);

    const readiness = this.errors.length === 0 ? '준비 완료' : '준비 필요';
    console.log(`  🎯 프로덕션 준비 상태: ${readiness}`);
    console.log('='.repeat(60));

    if (this.errors.length > 0) {
      console.log('\n🔧 해결 방법:');
      console.log('  1. 누락된 파일들을 생성하세요');
      console.log('  2. 환경 변수를 올바르게 설정하세요');
      console.log('  3. 필요한 의존성을 설치하세요');
      console.log('  4. 데이터베이스 스키마를 검증하세요');
      process.exit(1);
    } else {
      console.log('\n🎉 프로덕션 배포 준비가 완료되었습니다!');
      console.log('  다음 단계: 실제 서버에 배포를 진행하세요');
    }
  }

  // 전체 검증 실행
  async run() {
    console.log('🚀 SaveAI 프로덕션 준비 상태 검증을 시작합니다...\n');

    this.checkConfigFiles();
    this.checkEnvironmentVariables();
    this.checkDatabaseSchema();
    this.checkSecuritySettings();
    this.checkApiEndpoints();
    await this.checkBuildAndDependencies();

    this.printResults();
  }
}

// 스크립트 실행
if (require.main === module) {
  const checker = new ProductionReadinessChecker();
  checker.run().catch(error => {
    console.error('검증 중 오류 발생:', error);
    process.exit(1);
  });
}

module.exports = ProductionReadinessChecker;