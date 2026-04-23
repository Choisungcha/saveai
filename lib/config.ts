interface DatabaseConfig {
  url: string;
  ssl: boolean;
  maxConnections: number;
  idleTimeoutMillis: number;
  connectionTimeoutMillis: number;
}

interface RedisConfig {
  url: string;
  password?: string;
  db?: number;
  retryDelayOnFailover: number;
  maxRetriesPerRequest: number;
}

interface JwtConfig {
  secret: string;
  refreshSecret: string;
  accessTokenExpiresIn: string;
  refreshTokenExpiresIn: string;
}

interface CorsConfig {
  origin: string[];
  credentials: boolean;
  methods: string[];
  allowedHeaders: string[];
}

interface RateLimitConfig {
  windowMs: number;
  max: number;
  message: string;
  standardHeaders: boolean;
  legacyHeaders: boolean;
}

interface SecurityConfig {
  enableAuditLog: boolean;
  enableRateLimit: boolean;
  enableCors: boolean;
  enableHelmet: boolean;
  enableCompression: boolean;
  sessionTimeout: number;
}

interface MonitoringConfig {
  enableSentry: boolean;
  sentryDsn?: string;
  enablePrometheus: boolean;
  enableLogging: boolean;
  logLevel: string;
}

interface EmailConfig {
  host: string;
  port: number;
  secure: boolean;
  auth: {
    user: string;
    pass: string;
  };
  from: string;
}

interface FileStorageConfig {
  provider: 'local' | 's3' | 'gcs';
  localPath?: string;
  s3?: {
    bucket: string;
    region: string;
    accessKeyId: string;
    secretAccessKey: string;
  };
  gcs?: {
    bucket: string;
    keyFilename: string;
  };
}

interface FinancialApiConfig {
  toss: {
    clientKey: string;
    secretKey: string;
    baseUrl: string;
  };
  kakaopay: {
    cid: string;
    secretKey: string;
    baseUrl: string;
  };
  inicis: {
    mid: string;
    signKey: string;
    baseUrl: string;
  };
}

interface CloudHsmConfig {
  provider: 'aws' | 'azure' | 'gcp' | 'local';
  aws?: {
    keyId: string;
    region: string;
  };
  azure?: {
    keyVaultUrl: string;
  };
  gcp?: {
    projectId: string;
    keyRing: string;
    keyName: string;
  };
}

export interface AppConfig {
  nodeEnv: string;
  port: number;
  baseUrl: string;
  database: DatabaseConfig;
  redis: RedisConfig;
  jwt: JwtConfig;
  cors: CorsConfig;
  rateLimit: RateLimitConfig;
  security: SecurityConfig;
  monitoring: MonitoringConfig;
  email: EmailConfig;
  fileStorage: FileStorageConfig;
  financialApi: FinancialApiConfig;
  cloudHsm: CloudHsmConfig;
}

function getConfig(): AppConfig {
  const nodeEnv = process.env.NODE_ENV || 'development';
  const isProduction = nodeEnv === 'production';

  return {
    nodeEnv,
    port: parseInt(process.env.PORT || '3000'),
    baseUrl: process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000',

    database: {
      url: process.env.DATABASE_URL || 'postgresql://localhost:5432/saveai_dev',
      ssl: isProduction,
      maxConnections: parseInt(process.env.DB_MAX_CONNECTIONS || '20'),
      idleTimeoutMillis: 30000,
      connectionTimeoutMillis: 2000
    },

    redis: {
      url: process.env.REDIS_URL || 'redis://localhost:6379',
      password: process.env.REDIS_PASSWORD,
      db: parseInt(process.env.REDIS_DB || '0'),
      retryDelayOnFailover: 100,
      maxRetriesPerRequest: 3
    },

    jwt: {
      secret: process.env.JWT_SECRET || 'dev-jwt-secret',
      refreshSecret: process.env.JWT_REFRESH_SECRET || 'dev-refresh-secret',
      accessTokenExpiresIn: process.env.JWT_ACCESS_EXPIRES_IN || '15m',
      refreshTokenExpiresIn: process.env.JWT_REFRESH_EXPIRES_IN || '7d'
    },

    cors: {
      origin: isProduction
        ? (process.env.CORS_ORIGIN?.split(',') || ['https://saveai.com'])
        : ['http://localhost:3000', 'http://localhost:3005'],
      credentials: true,
      methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
      allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With']
    },

    rateLimit: {
      windowMs: parseInt(process.env.RATE_LIMIT_WINDOW || '15') * 60 * 1000,
      max: parseInt(process.env.RATE_LIMIT_MAX_REQUESTS || (isProduction ? '100' : '1000')),
      message: 'Too many requests from this IP, please try again later.',
      standardHeaders: true,
      legacyHeaders: false
    },

    security: {
      enableAuditLog: process.env.ENABLE_AUDIT_LOG === 'true',
      enableRateLimit: isProduction || process.env.ENABLE_RATE_LIMIT === 'true',
      enableCors: true,
      enableHelmet: isProduction,
      enableCompression: true,
      sessionTimeout: parseInt(process.env.SESSION_TIMEOUT || '3600000') // 1 hour
    },

    monitoring: {
      enableSentry: isProduction && !!process.env.SENTRY_DSN,
      sentryDsn: process.env.SENTRY_DSN,
      enablePrometheus: isProduction || process.env.ENABLE_PROMETHEUS === 'true',
      enableLogging: true,
      logLevel: process.env.LOG_LEVEL || (isProduction ? 'info' : 'debug')
    },

    email: {
      host: process.env.SMTP_HOST || 'smtp.gmail.com',
      port: parseInt(process.env.SMTP_PORT || '587'),
      secure: process.env.SMTP_SECURE === 'true',
      auth: {
        user: process.env.SMTP_USER || '',
        pass: process.env.SMTP_PASS || ''
      },
      from: process.env.SMTP_FROM || 'noreply@saveai.com'
    },

    fileStorage: {
      provider: (process.env.FILE_STORAGE_PROVIDER as 'local' | 's3' | 'gcs') || 'local',
      localPath: process.env.FILE_STORAGE_LOCAL_PATH || './uploads',
      s3: {
        bucket: process.env.AWS_S3_BUCKET || 'saveai-dev',
        region: process.env.AWS_S3_REGION || 'ap-northeast-2',
        accessKeyId: process.env.AWS_ACCESS_KEY_ID || '',
        secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY || ''
      }
    },

    financialApi: {
      toss: {
        clientKey: process.env.NEXT_PUBLIC_TOSS_CLIENT_KEY || '',
        secretKey: process.env.TOSS_SECRET_KEY || '',
        baseUrl: isProduction ? 'https://api.tosspayments.com' : 'https://api.tosspayments.com'
      },
      kakaopay: {
        cid: process.env.NEXT_PUBLIC_KAKAOPAY_CID || '',
        secretKey: process.env.KAKAOPAY_SECRET_KEY || '',
        baseUrl: isProduction ? 'https://kapi.kakao.com' : 'https://kapi.kakao.com'
      },
      inicis: {
        mid: process.env.NEXT_PUBLIC_INICIS_MID || '',
        signKey: process.env.INICIS_SIGN_KEY || '',
        baseUrl: isProduction ? 'https://iniapi.inicis.com' : 'https://iniapi.inicis.com'
      }
    },

    cloudHsm: {
      provider: (process.env.CLOUD_HSM_PROVIDER as 'aws' | 'azure' | 'gcp' | 'local') || 'local',
      aws: {
        keyId: process.env.AWS_KMS_KEY_ID || '',
        region: process.env.AWS_REGION || 'ap-northeast-2'
      },
      azure: {
        keyVaultUrl: process.env.AZURE_KEY_VAULT_URL || ''
      },
      gcp: {
        projectId: process.env.GOOGLE_CLOUD_PROJECT || '',
        keyRing: process.env.GOOGLE_CLOUD_KMS_KEY_RING || '',
        keyName: process.env.GOOGLE_CLOUD_KMS_KEY_NAME || ''
      }
    }
  };
}

// 설정 검증 함수
export function validateConfig(config: AppConfig): { isValid: boolean; errors: string[] } {
  const errors: string[] = [];

  // 필수 설정 검증
  if (!config.database.url) {
    errors.push('DATABASE_URL is required');
  }

  if (!config.jwt.secret || config.jwt.secret === 'dev-jwt-secret') {
    errors.push('JWT_SECRET must be set and not use default dev value');
  }

  if (config.nodeEnv === 'production') {
    if (!config.financialApi.toss.clientKey) {
      errors.push('Toss Payments client key is required in production');
    }
    if (!config.financialApi.kakaopay.cid) {
      errors.push('KakaoPay CID is required in production');
    }
    if (!config.monitoring.sentryDsn) {
      errors.push('SENTRY_DSN is required in production');
    }
  }

  return {
    isValid: errors.length === 0,
    errors
  };
}

// 전역 설정 객체
export const config = getConfig();

// 설정 검증 실행
const validation = validateConfig(config);
if (!validation.isValid) {
  console.error('Configuration validation failed:');
  validation.errors.forEach(error => console.error(`- ${error}`));
  if (config.nodeEnv === 'production') {
    throw new Error('Invalid production configuration');
  }
}

export default config;