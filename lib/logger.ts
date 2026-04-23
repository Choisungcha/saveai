import winston from 'winston';
import DailyRotateFile from 'winston-daily-rotate-file';

const logFormat = winston.format.combine(
  winston.format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
  winston.format.errors({ stack: true }),
  winston.format.json()
);

const consoleFormat = winston.format.combine(
  winston.format.colorize(),
  winston.format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
  winston.format.printf(({ timestamp, level, message, ...meta }) => {
    let metaStr = Object.keys(meta).length ? `\n${JSON.stringify(meta, null, 2)}` : '';
    return `${timestamp} [${level}]: ${message}${metaStr}`;
  })
);

const logger = winston.createLogger({
  level: process.env.LOG_LEVEL || 'info',
  format: logFormat,
  transports: [
    // 콘솔 출력 (개발 환경에서만 컬러 출력)
    new winston.transports.Console({
      format: process.env.NODE_ENV === 'production' ? logFormat : consoleFormat,
      level: process.env.NODE_ENV === 'production' ? 'warn' : 'debug'
    }),

    // 애플리케이션 로그 파일 (일별 로테이션)
    new DailyRotateFile({
      filename: 'logs/app-%DATE%.log',
      datePattern: 'YYYY-MM-DD',
      maxSize: '20m',
      maxFiles: '14d',
      level: 'info'
    }),

    // 에러 로그 파일 (일별 로테이션)
    new DailyRotateFile({
      filename: 'logs/error-%DATE%.log',
      datePattern: 'YYYY-MM-DD',
      maxSize: '20m',
      maxFiles: '14d',
      level: 'error'
    }),

    // 감사 로그 파일 (일별 로테이션)
    new DailyRotateFile({
      filename: 'logs/audit-%DATE%.log',
      datePattern: 'YYYY-MM-DD',
      maxSize: '20m',
      maxFiles: '30d',
      level: 'info',
      format: winston.format.combine(
        winston.format.timestamp(),
        winston.format.json()
      )
    })
  ],

  // 프로덕션에서는 에러가 발생해도 로그가 중단되지 않도록
  exitOnError: false
});

// 프로덕션 환경에서만 파일 로깅 디렉토리 생성
if (process.env.NODE_ENV === 'production') {
  import('fs').then(fs => {
    if (!fs.existsSync('logs')) {
      fs.mkdirSync('logs');
    }
  });
}

// 스트림 인터페이스 (morgan 미들웨어용)
export const stream = {
  write: (message: string) => {
    logger.info(message.trim());
  }
};

export default logger;