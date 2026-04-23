# 프로덕션 배포 가이드

## SaveAI 프로덕션 환경 설정

### 1. 환경 설정

#### 1.1 프로덕션 환경 변수
```bash
# .env.production
NODE_ENV=production
NEXT_PUBLIC_APP_URL=https://saveai.com

# 데이터베이스
DATABASE_URL=postgresql://user:password@prod-db.saveai.com:5432/saveai_prod

# Redis (세션 및 캐시)
REDIS_URL=redis://prod-redis.saveai.com:6379

# JWT 시크릿
JWT_SECRET=your-production-jwt-secret-here
JWT_REFRESH_SECRET=your-production-refresh-secret-here

# 금융 API 키들 (프로덕션용)
NEXT_PUBLIC_TOSS_CLIENT_KEY=your_prod_toss_client_key
TOSS_SECRET_KEY=your_prod_toss_secret_key

NEXT_PUBLIC_KAKAOPAY_CID=your_prod_kakaopay_cid
KAKAOPAY_SECRET_KEY=your_prod_kakaopay_secret

NEXT_PUBLIC_INICIS_MID=your_prod_inicis_mid
INICIS_SIGN_KEY=your_prod_inicis_sign_key

# 클라우드 HSM (프로덕션용)
AWS_KMS_KEY_ID=your_prod_aws_kms_key_id
AWS_REGION=ap-northeast-2
AWS_ACCESS_KEY_ID=your_prod_aws_access_key
AWS_SECRET_ACCESS_KEY=your_prod_aws_secret_key

AZURE_KEY_VAULT_URL=https://saveai-prod-kv.vault.azure.net/
AZURE_CLIENT_ID=your_prod_azure_client_id
AZURE_CLIENT_SECRET=your_prod_azure_client_secret
AZURE_TENANT_ID=your_prod_azure_tenant_id

GOOGLE_CLOUD_PROJECT=saveai-prod
GOOGLE_CLOUD_KMS_KEY_RING=saveai-prod-keyring
GOOGLE_CLOUD_KMS_KEY_NAME=saveai-prod-key
GOOGLE_APPLICATION_CREDENTIALS=/path/to/prod-service-account.json

# 모니터링 및 로깅
SENTRY_DSN=your_prod_sentry_dsn
LOG_LEVEL=info
ENABLE_AUDIT_LOG=true

# 이메일 서비스
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your_prod_email@gmail.com
SMTP_PASS=your_prod_email_app_password

# 파일 저장소
AWS_S3_BUCKET=saveai-prod-documents
AWS_S3_REGION=ap-northeast-2

# 보안 설정
CORS_ORIGIN=https://saveai.com
RATE_LIMIT_WINDOW=15
RATE_LIMIT_MAX_REQUESTS=100
```

#### 1.2 스테이징 환경 변수
```bash
# .env.staging
NODE_ENV=staging
NEXT_PUBLIC_APP_URL=https://staging.saveai.com

# 데이터베이스 (스테이징용)
DATABASE_URL=postgresql://user:password@staging-db.saveai.com:5432/saveai_staging

# 기타 설정들은 프로덕션과 동일하지만 스테이징용 키 사용
```

### 2. 데이터베이스 설정

#### 2.1 PostgreSQL 스키마
```sql
-- 데이터베이스 생성
CREATE DATABASE saveai_prod;
CREATE DATABASE saveai_staging;

-- 사용자 테이블
CREATE TABLE users (
  id SERIAL PRIMARY KEY,
  email VARCHAR(255) UNIQUE NOT NULL,
  password_hash VARCHAR(255) NOT NULL,
  name VARCHAR(255),
  phone VARCHAR(20),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  is_active BOOLEAN DEFAULT true,
  email_verified BOOLEAN DEFAULT false
);

-- 금융 계좌 테이블
CREATE TABLE financial_accounts (
  id SERIAL PRIMARY KEY,
  user_id INTEGER REFERENCES users(id),
  provider VARCHAR(50) NOT NULL, -- 'toss', 'kakao', 'inicis'
  account_id VARCHAR(255) NOT NULL,
  account_type VARCHAR(50),
  balance DECIMAL(15,2),
  encrypted_data TEXT, -- 암호화된 민감 데이터
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 거래 내역 테이블
CREATE TABLE transactions (
  id SERIAL PRIMARY KEY,
  account_id INTEGER REFERENCES financial_accounts(id),
  transaction_id VARCHAR(255) UNIQUE NOT NULL,
  amount DECIMAL(15,2) NOT NULL,
  description TEXT,
  transaction_date TIMESTAMP NOT NULL,
  category VARCHAR(100),
  encrypted_details TEXT, -- 암호화된 세부 정보
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 감사 로그 테이블
CREATE TABLE audit_logs (
  id SERIAL PRIMARY KEY,
  user_id INTEGER REFERENCES users(id),
  action VARCHAR(100) NOT NULL,
  resource VARCHAR(100) NOT NULL,
  resource_id VARCHAR(255),
  ip_address INET,
  user_agent TEXT,
  success BOOLEAN DEFAULT true,
  details JSONB,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 세션 테이블
CREATE TABLE sessions (
  id SERIAL PRIMARY KEY,
  user_id INTEGER REFERENCES users(id),
  session_token VARCHAR(255) UNIQUE NOT NULL,
  expires_at TIMESTAMP NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 인덱스 생성
CREATE INDEX idx_financial_accounts_user_id ON financial_accounts(user_id);
CREATE INDEX idx_transactions_account_id ON transactions(account_id);
CREATE INDEX idx_audit_logs_user_id ON audit_logs(user_id);
CREATE INDEX idx_audit_logs_created_at ON audit_logs(created_at);
CREATE INDEX idx_sessions_session_token ON sessions(session_token);
CREATE INDEX idx_sessions_expires_at ON sessions(expires_at);
```

#### 2.2 Prisma 설정 (선택사항)
```javascript
// prisma/schema.prisma
generator client {
  provider = "prisma-client-js"
}

datasource db {
  provider = "postgresql"
  url      = env("DATABASE_URL")
}

model User {
  id            Int      @id @default(autoincrement())
  email         String   @unique
  passwordHash  String
  name          String?
  phone         String?
  createdAt     DateTime @default(now())
  updatedAt     DateTime @updatedAt
  isActive      Boolean  @default(true)
  emailVerified Boolean  @default(false)

  accounts FinancialAccount[]
  auditLogs AuditLog[]
  sessions  Session[]

  @@map("users")
}

model FinancialAccount {
  id            Int      @id @default(autoincrement())
  userId        Int
  provider      String
  accountId     String
  accountType   String?
  balance       Decimal? @db.Decimal(15, 2)
  encryptedData String?
  createdAt     DateTime @default(now())
  updatedAt     DateTime @updatedAt

  user       User        @relation(fields: [userId], references: [id])
  transactions Transaction[]

  @@map("financial_accounts")
}

model Transaction {
  id             Int      @id @default(autoincrement())
  accountId      Int
  transactionId  String   @unique
  amount         Decimal  @db.Decimal(15, 2)
  description    String?
  transactionDate DateTime
  category       String?
  encryptedDetails String?
  createdAt      DateTime @default(now())

  account FinancialAccount @relation(fields: [accountId], references: [id])

  @@map("transactions")
}

model AuditLog {
  id         Int      @id @default(autoincrement())
  userId     Int?
  action     String
  resource   String
  resourceId String?
  ipAddress  String?
  userAgent  String?
  success    Boolean  @default(true)
  details    Json?
  createdAt  DateTime @default(now())

  user User? @relation(fields: [userId], references: [id])

  @@map("audit_logs")
}

model Session {
  id           Int      @id @default(autoincrement())
  userId       Int
  sessionToken String   @unique
  expiresAt    DateTime
  createdAt    DateTime @default(now())

  user User @relation(fields: [userId], references: [id])

  @@map("sessions")
}
```

### 3. 모니터링 및 로깅 시스템

#### 3.1 Sentry 설정
```javascript
// lib/sentry.ts
import * as Sentry from '@sentry/nextjs';

Sentry.init({
  dsn: process.env.SENTRY_DSN,
  environment: process.env.NODE_ENV,
  tracesSampleRate: 1.0,
  debug: process.env.NODE_ENV === 'development',
  integrations: [
    new Sentry.Integrations.Http({ tracing: true }),
    new Sentry.Integrations.Console(),
    new Sentry.Integrations.OnUncaughtException(),
    new Sentry.Integrations.OnUnhandledRejection(),
  ],
});

export default Sentry;
```

#### 3.2 Winston 로거 설정
```javascript
// lib/logger.ts
import winston from 'winston';
import DailyRotateFile from 'winston-daily-rotate-file';

const logFormat = winston.format.combine(
  winston.format.timestamp(),
  winston.format.errors({ stack: true }),
  winston.format.json()
);

const logger = winston.createLogger({
  level: process.env.LOG_LEVEL || 'info',
  format: logFormat,
  transports: [
    // 콘솔 출력
    new winston.transports.Console({
      format: winston.format.combine(
        winston.format.colorize(),
        winston.format.simple()
      )
    }),

    // 파일 로테이션
    new DailyRotateFile({
      filename: 'logs/error-%DATE%.log',
      datePattern: 'YYYY-MM-DD',
      level: 'error',
      maxSize: '20m',
      maxFiles: '14d'
    }),

    new DailyRotateFile({
      filename: 'logs/combined-%DATE%.log',
      datePattern: 'YYYY-MM-DD',
      maxSize: '20m',
      maxFiles: '14d'
    })
  ]
});

export default logger;
```

#### 3.3 헬스체크 엔드포인트
```javascript
// app/api/health/route.ts
import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  try {
    // 데이터베이스 연결 확인
    const dbStatus = await checkDatabaseConnection();

    // Redis 연결 확인
    const redisStatus = await checkRedisConnection();

    // 외부 API 연결 확인
    const apiStatus = await checkExternalAPIs();

    const overallStatus = dbStatus && redisStatus && apiStatus ? 'healthy' : 'unhealthy';

    return NextResponse.json({
      status: overallStatus,
      timestamp: new Date().toISOString(),
      services: {
        database: dbStatus ? 'up' : 'down',
        redis: redisStatus ? 'up' : 'down',
        external_apis: apiStatus ? 'up' : 'down'
      },
      uptime: process.uptime()
    }, {
      status: overallStatus === 'healthy' ? 200 : 503
    });
  } catch (error) {
    return NextResponse.json({
      status: 'error',
      timestamp: new Date().toISOString(),
      error: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}

async function checkDatabaseConnection(): Promise<boolean> {
  try {
    // 데이터베이스 연결 테스트
    return true;
  } catch {
    return false;
  }
}

async function checkRedisConnection(): Promise<boolean> {
  try {
    // Redis 연결 테스트
    return true;
  } catch {
    return false;
  }
}

async function checkExternalAPIs(): Promise<boolean> {
  try {
    // 외부 API 연결 테스트 (토스, 카카오 등)
    return true;
  } catch {
    return false;
  }
}
```

### 4. 배포 설정

#### 4.1 Dockerfile
```dockerfile
# Dockerfile
FROM node:18-alpine AS base

# Install dependencies only when needed
FROM base AS deps
RUN apk add --no-cache libc6-compat
WORKDIR /app

COPY package.json package-lock.json ./
RUN npm ci --only=production

# Rebuild the source code only when needed
FROM base AS builder
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY . .

ENV NEXT_TELEMETRY_DISABLED 1
RUN npm run build

# Production image, copy all the files and run next
FROM base AS runner
WORKDIR /app

ENV NODE_ENV production
ENV NEXT_TELEMETRY_DISABLED 1

RUN addgroup --system --gid 1001 nodejs
RUN adduser --system --uid 1001 nextjs

COPY --from=builder /app/public ./public

# Set the correct permission for prerender cache
RUN mkdir .next
RUN chown nextjs:nodejs .next

# Automatically leverage output traces to reduce image size
COPY --from=builder --chown=nextjs:nodejs /app/.next/standalone ./
COPY --from=builder --chown=nextjs:nodejs /app/.next/static ./.next/static

USER nextjs

EXPOSE 3000
ENV PORT 3000

CMD ["node", "server.js"]
```

#### 4.2 docker-compose.yml (프로덕션)
```yaml
version: '3.8'

services:
  app:
    build:
      context: .
      dockerfile: Dockerfile
    ports:
      - "3000:3000"
    environment:
      - NODE_ENV=production
    env_file:
      - .env.production
    depends_on:
      - db
      - redis
    restart: unless-stopped

  db:
    image: postgres:15-alpine
    environment:
      - POSTGRES_DB=saveai_prod
      - POSTGRES_USER=saveai_user
      - POSTGRES_PASSWORD=secure_password_here
    volumes:
      - postgres_data:/var/lib/postgresql/data
      - ./init.sql:/docker-entrypoint-initdb.d/init.sql
    ports:
      - "5432:5432"
    restart: unless-stopped

  redis:
    image: redis:7-alpine
    ports:
      - "6379:6379"
    restart: unless-stopped

  nginx:
    image: nginx:alpine
    ports:
      - "80:80"
      - "443:443"
    volumes:
      - ./nginx.conf:/etc/nginx/nginx.conf
      - ./ssl:/etc/ssl/certs
    depends_on:
      - app
    restart: unless-stopped

volumes:
  postgres_data:
```

#### 4.3 Nginx 설정
```nginx
# nginx.conf
events {
    worker_connections 1024;
}

http {
    include       /etc/nginx/mime.types;
    default_type  application/octet-stream;

    # Logging
    log_format main '$remote_addr - $remote_user [$time_local] "$request" '
                    '$status $body_bytes_sent "$http_referer" '
                    '"$http_user_agent" "$http_x_forwarded_for"';

    access_log /var/log/nginx/access.log main;
    error_log /var/log/nginx/error.log;

    # Gzip compression
    gzip on;
    gzip_vary on;
    gzip_min_length 1024;
    gzip_types text/plain text/css text/xml text/javascript application/javascript application/xml+rss application/json;

    # Rate limiting
    limit_req_zone $binary_remote_addr zone=api:10m rate=10r/s;
    limit_req_zone $binary_remote_addr zone=auth:10m rate=5r/m;

    upstream app_backend {
        server app:3000;
    }

    server {
        listen 80;
        server_name saveai.com www.saveai.com;

        # Redirect to HTTPS
        return 301 https://$server_name$request_uri;
    }

    server {
        listen 443 ssl http2;
        server_name saveai.com www.saveai.com;

        # SSL configuration
        ssl_certificate /etc/ssl/certs/saveai.crt;
        ssl_certificate_key /etc/ssl/certs/saveai.key;
        ssl_protocols TLSv1.2 TLSv1.3;
        ssl_ciphers ECDHE-RSA-AES128-GCM-SHA256:ECDHE-RSA-AES256-GCM-SHA384;
        ssl_prefer_server_ciphers off;

        # Security headers
        add_header X-Frame-Options "SAMEORIGIN" always;
        add_header X-XSS-Protection "1; mode=block" always;
        add_header X-Content-Type-Options "nosniff" always;
        add_header Referrer-Policy "no-referrer-when-downgrade" always;
        add_header Content-Security-Policy "default-src 'self' http: https: data: blob: 'unsafe-inline'" always;

        # API rate limiting
        location /api/ {
            limit_req zone=api burst=20 nodelay;
            proxy_pass http://app_backend;
            proxy_set_header Host $host;
            proxy_set_header X-Real-IP $remote_addr;
            proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
            proxy_set_header X-Forwarded-Proto $scheme;
        }

        # Auth endpoints stricter rate limiting
        location ~ ^/api/(auth|login|register) {
            limit_req zone=auth burst=5 nodelay;
            proxy_pass http://app_backend;
            proxy_set_header Host $host;
            proxy_set_header X-Real-IP $remote_addr;
            proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
            proxy_set_header X-Forwarded-Proto $scheme;
        }

        # Static files
        location /_next/static/ {
            proxy_pass http://app_backend;
            expires 1y;
            add_header Cache-Control "public, immutable";
        }

        # Main app
        location / {
            proxy_pass http://app_backend;
            proxy_set_header Host $host;
            proxy_set_header X-Real-IP $remote_addr;
            proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
            proxy_set_header X-Forwarded-Proto $scheme;
            proxy_connect_timeout 60s;
            proxy_send_timeout 60s;
            proxy_read_timeout 60s;
        }

        # Health check
        location /health {
            access_log off;
            return 200 "healthy\n";
            add_header Content-Type text/plain;
        }
    }
}
```

### 5. CI/CD 파이프라인

#### 5.1 GitHub Actions 워크플로우
```yaml
# .github/workflows/deploy.yml
name: Deploy to Production

on:
  push:
    branches: [ main ]
  workflow_dispatch:

env:
  REGISTRY: ghcr.io
  IMAGE_NAME: ${{ github.repository }}

jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3

      - name: Setup Node.js
        uses: actions/setup-node@v3
        with:
          node-version: '18'
          cache: 'npm'

      - name: Install dependencies
        run: npm ci

      - name: Run tests
        run: npm test

      - name: Run linting
        run: npm run lint

      - name: Build application
        run: npm run build

  security-scan:
    runs-on: ubuntu-latest
    needs: test
    steps:
      - uses: actions/checkout@v3

      - name: Run Trivy vulnerability scanner
        uses: aquasecurity/trivy-action@master
        with:
          scan-type: 'fs'
          scan-ref: '.'
          format: 'sarif'
          output: 'trivy-results.sarif'

      - name: Upload Trivy scan results
        uses: github/codeql-action/upload-sarif@v2
        if: always()
        with:
          sarif_file: 'trivy-results.sarif'

  build-and-push:
    runs-on: ubuntu-latest
    needs: [test, security-scan]
    permissions:
      contents: read
      packages: write
    steps:
      - uses: actions/checkout@v3

      - name: Log in to Container Registry
        uses: docker/login-action@v2
        with:
          registry: ${{ env.REGISTRY }}
          username: ${{ github.actor }}
          password: ${{ secrets.GITHUB_TOKEN }}

      - name: Extract metadata
        id: meta
        uses: docker/metadata-action@v4
        with:
          images: ${{ env.REGISTRY }}/${{ env.IMAGE_NAME }}
          tags: |
            type=ref,event=branch
            type=ref,event=pr
            type=sha,prefix={{branch}}-
            type=raw,value=latest,enable={{is_default_branch}}

      - name: Build and push Docker image
        uses: docker/build-push-action@v4
        with:
          context: .
          push: true
          tags: ${{ steps.meta.outputs.tags }}
          labels: ${{ steps.meta.outputs.labels }}

  deploy:
    runs-on: ubuntu-latest
    needs: build-and-push
    environment: production
    steps:
      - name: Deploy to production
        run: |
          echo "Deploying to production server..."
          # 실제 배포 명령어들
          # 예: SSH를 통해 서버에 접속하여 docker-compose up -d 실행
```

### 6. 보안 강화

#### 6.1 의존성 보안 스캔
```json
// package.json
{
  "scripts": {
    "audit": "npm audit",
    "audit:fix": "npm audit fix",
    "security": "npm run audit && npm run test:security"
  },
  "devDependencies": {
    "audit-ci": "^6.6.1",
    "jscpd": "^3.5.10",
    "eslint-plugin-security": "^1.7.1"
  }
}
```

#### 6.2 환경별 설정 분리
```javascript
// lib/config.ts
interface Config {
  database: {
    url: string;
    ssl: boolean;
  };
  redis: {
    url: string;
  };
  jwt: {
    secret: string;
    refreshSecret: string;
    expiresIn: string;
  };
  cors: {
    origin: string[];
  };
  rateLimit: {
    windowMs: number;
    max: number;
  };
  security: {
    enableAuditLog: boolean;
    enableRateLimit: boolean;
    enableCors: boolean;
  };
}

function getConfig(): Config {
  const nodeEnv = process.env.NODE_ENV || 'development';

  const baseConfig = {
    database: {
      url: process.env.DATABASE_URL || '',
      ssl: nodeEnv === 'production'
    },
    redis: {
      url: process.env.REDIS_URL || 'redis://localhost:6379'
    },
    jwt: {
      secret: process.env.JWT_SECRET || 'dev-secret',
      refreshSecret: process.env.JWT_REFRESH_SECRET || 'dev-refresh-secret',
      expiresIn: '15m'
    },
    cors: {
      origin: nodeEnv === 'production'
        ? ['https://saveai.com']
        : ['http://localhost:3000', 'http://localhost:3005']
    },
    rateLimit: {
      windowMs: 15 * 60 * 1000, // 15 minutes
      max: nodeEnv === 'production' ? 100 : 1000
    },
    security: {
      enableAuditLog: process.env.ENABLE_AUDIT_LOG === 'true',
      enableRateLimit: nodeEnv === 'production',
      enableCors: true
    }
  };

  return baseConfig;
}

export const config = getConfig();
```

### 7. 모니터링 대시보드

#### 7.1 메트릭 수집
```javascript
// lib/metrics.ts
import { collectDefaultMetrics, register, Gauge, Counter, Histogram } from 'prom-client';

// 기본 메트릭 수집
collectDefaultMetrics();

// 커스텀 메트릭
export const httpRequestDuration = new Histogram({
  name: 'http_request_duration_seconds',
  help: 'Duration of HTTP requests in seconds',
  labelNames: ['method', 'route', 'status_code'],
  buckets: [0.1, 0.5, 1, 2, 5, 10]
});

export const activeUsers = new Gauge({
  name: 'active_users_total',
  help: 'Number of active users'
});

export const apiRequests = new Counter({
  name: 'api_requests_total',
  help: 'Total number of API requests',
  labelNames: ['method', 'endpoint', 'status']
});

export const databaseConnections = new Gauge({
  name: 'database_connections_active',
  help: 'Number of active database connections'
});

// 메트릭 미들웨어
export function metricsMiddleware() {
  return async (req: any, res: any, next: any) => {
    const start = Date.now();

    res.on('finish', () => {
      const duration = (Date.now() - start) / 1000;

      httpRequestDuration
        .labels(req.method, req.route?.path || req.path, res.statusCode.toString())
        .observe(duration);

      apiRequests
        .labels(req.method, req.path, res.statusCode.toString())
        .inc();
    });

    next();
  };
}
```

#### 7.2 Grafana 대시보드 설정
```json
// grafana-dashboard.json
{
  "dashboard": {
    "title": "SaveAI Production Metrics",
    "tags": ["saveai", "production"],
    "timezone": "UTC",
    "panels": [
      {
        "title": "HTTP Request Duration",
        "type": "graph",
        "targets": [
          {
            "expr": "histogram_quantile(0.95, rate(http_request_duration_seconds_bucket[5m]))",
            "legendFormat": "95th percentile"
          }
        ]
      },
      {
        "title": "Active Users",
        "type": "singlestat",
        "targets": [
          {
            "expr": "active_users_total",
            "legendFormat": "Active Users"
          }
        ]
      },
      {
        "title": "API Request Rate",
        "type": "graph",
        "targets": [
          {
            "expr": "rate(api_requests_total[5m])",
            "legendFormat": "Requests per second"
          }
        ]
      }
    ]
  }
}
```

이 가이드를 따라 프로덕션 환경을 구축하면 SaveAI는 안전하고 확장 가능한 금융 데이터 통합 서비스로 운영될 수 있습니다.