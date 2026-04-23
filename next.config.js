/** @type {import('next').NextConfig} */
const nextConfig = {
  // 출력 설정 (프로덕션 Docker용)
  output: 'standalone',

  // 환경 변수 설정
  env: {
    CUSTOM_KEY: process.env.CUSTOM_KEY,
  },

  // 이미지 도메인 설정
  images: {
    domains: ['saveai.com', 'localhost'],
    unoptimized: process.env.NODE_ENV === 'development',
  },

  // 헤더 보안 설정
  async headers() {
    return [
      {
        source: '/(.*)',
        headers: [
          {
            key: 'X-Frame-Options',
            value: 'DENY'
          },
          {
            key: 'X-Content-Type-Options',
            value: 'nosniff'
          },
          {
            key: 'Referrer-Policy',
            value: 'origin-when-cross-origin'
          },
          {
            key: 'Permissions-Policy',
            value: 'camera=(), microphone=(), geolocation=()'
          }
        ]
      },
      {
        source: '/api/(.*)',
        headers: [
          {
            key: 'Cache-Control',
            value: 'no-cache, no-store, must-revalidate'
          }
        ]
      }
    ];
  },

  // 리다이렉트 설정
  async redirects() {
    return [
      {
        source: '/home',
        destination: '/',
        permanent: true,
      },
    ];
  },

  // 리라이트 설정
  async rewrites() {
    return [
      {
        source: '/api/:path*',
        destination: '/api/:path*',
      },
    ];
  },

  // 실험적 기능
  experimental: {
    // 서버 컴포넌트에서 Node.js API 사용
    serverComponentsExternalPackages: ['@prisma/client', 'bcryptjs'],
  },

  // 웹팩 설정
  webpack: (config, { buildId, dev, isServer, defaultLoaders, webpack }) => {
    // 로깅 최적화
    if (!dev && !isServer) {
      config.resolve.alias = {
        ...config.resolve.alias,
        'winston': false,
        'winston-daily-rotate-file': false,
      };
    }

    return config;
  },

  // 컴파일러 설정
  compiler: {
    removeConsole: process.env.NODE_ENV === 'production' ? {
      exclude: ['error', 'warn']
    } : false,
  },

  // 타입스크립트 설정
  typescript: {
    ignoreBuildErrors: false,
  },

  // ESLint 설정
  eslint: {
    ignoreDuringBuilds: false,
  },

  // 전력 소비 모니터링 비활성화
  poweredByHeader: false,

  // 컴프레션 활성화
  compress: true,

  // React 엄격 모드
  reactStrictMode: true,

  // SWC 미니파이어 사용
  swcMinify: true,
};

module.exports = nextConfig;