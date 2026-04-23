import { collectDefaultMetrics, register, Gauge, Counter, Histogram } from 'prom-client';

// 기본 메트릭 수집 활성화
collectDefaultMetrics({ prefix: 'saveai_' });

// 커스텀 메트릭 정의
export const httpRequestDuration = new Histogram({
  name: 'saveai_http_request_duration_seconds',
  help: 'Duration of HTTP requests in seconds',
  labelNames: ['method', 'route', 'status_code'],
  buckets: [0.1, 0.5, 1, 2, 5, 10]
});

export const activeUsers = new Gauge({
  name: 'saveai_active_users_total',
  help: 'Number of active users currently online',
  labelNames: ['status']
});

export const apiRequests = new Counter({
  name: 'saveai_api_requests_total',
  help: 'Total number of API requests',
  labelNames: ['method', 'endpoint', 'status']
});

export const databaseQueryDuration = new Histogram({
  name: 'saveai_database_query_duration_seconds',
  help: 'Duration of database queries in seconds',
  labelNames: ['operation', 'table'],
  buckets: [0.01, 0.05, 0.1, 0.5, 1, 2]
});

export const financialApiCalls = new Counter({
  name: 'saveai_financial_api_calls_total',
  help: 'Total number of calls to financial APIs',
  labelNames: ['provider', 'endpoint', 'status']
});

export const encryptionOperations = new Counter({
  name: 'saveai_encryption_operations_total',
  help: 'Total number of encryption/decryption operations',
  labelNames: ['operation', 'algorithm']
});

export const auditEvents = new Counter({
  name: 'saveai_audit_events_total',
  help: 'Total number of audit events logged',
  labelNames: ['action', 'resource', 'success']
});

// 메트릭 초기화 함수
export function initializeMetrics() {
  // 초기 값 설정
  activeUsers.set({ status: 'online' }, 0);
  activeUsers.set({ status: 'offline' }, 0);
}

// 메트릭 미들웨어
export function metricsMiddleware() {
  return async (req: any, res: any, next: any) => {
    const start = Date.now();

    // 응답 완료 시 메트릭 기록
    res.on('finish', () => {
      const duration = (Date.now() - start) / 1000;
      const route = req.route?.path || req.path || 'unknown';

      // HTTP 요청 메트릭
      httpRequestDuration
        .labels(req.method, route, res.statusCode.toString())
        .observe(duration);

      // API 요청 카운터
      apiRequests
        .labels(req.method, route, res.statusCode.toString())
        .inc();
    });

    next();
  };
}

// 메트릭 내보내기 함수 (Prometheus용)
export async function getMetrics() {
  return register.metrics();
}

// 헬스체크 함수
export async function healthCheck() {
  const metrics = await register.getMetricsAsJSON();
  const uptime = process.uptime();

  return {
    status: 'healthy',
    timestamp: new Date().toISOString(),
    uptime,
    metrics: {
      totalRequests: 0, // 메트릭 계산은 별도 구현 필요
      activeUsers: 0,
      memoryUsage: process.memoryUsage(),
      version: process.version
    }
  };
}