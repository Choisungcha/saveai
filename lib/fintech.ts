// 금융 API 게이트웨이 통합 모듈
export interface FintechProvider {
  id: string;
  name: string;
  baseUrl: string;
  authType: 'oauth' | 'certificate' | 'api_key';
  features: string[];
  clientKey?: string;
  secretKey?: string;
}

export const fintechProviders: FintechProvider[] = [
  {
    id: 'toss',
    name: '토스페이먼츠',
    baseUrl: 'https://api.tosspayments.com',
    authType: 'oauth',
    features: ['계좌조회', '카드내역', '결제연동', '송금'],
    clientKey: process.env.NEXT_PUBLIC_TOSS_CLIENT_KEY,
    secretKey: process.env.TOSS_SECRET_KEY
  },
  {
    id: 'kakao',
    name: '카카오페이',
    baseUrl: 'https://kapi.kakao.com',
    authType: 'oauth',
    features: ['간편결제', '계좌연동', '카드관리', '송금']
  },
  {
    id: 'kg',
    name: 'KG이니시스',
    baseUrl: 'https://api.inicis.com',
    authType: 'api_key',
    features: ['결제대행', '계좌이체', '카드결제', '정기결제']
  }
];

// OAuth 인증 URL 생성
export function generateAuthUrl(providerId: string, redirectUri: string): string {
  const provider = fintechProviders.find(p => p.id === providerId);
  if (!provider) throw new Error('Provider not found');

  const baseUrls = {
    toss: 'https://auth.tosspayments.com/authorize',
    kakao: 'https://kauth.kakao.com/oauth/authorize',
    kg: 'https://auth.inicis.com/oauth'
  };

  const clientIds = {
    toss: process.env.NEXT_PUBLIC_TOSS_CLIENT_ID || 'sandbox_client_id',
    kakao: process.env.NEXT_PUBLIC_KAKAO_CLIENT_ID || 'sandbox_client_id',
    kg: process.env.NEXT_PUBLIC_KG_CLIENT_ID || 'sandbox_client_id'
  };

  return `${baseUrls[providerId as keyof typeof baseUrls]}?client_id=${clientIds[providerId as keyof typeof clientIds]}&redirect_uri=${encodeURIComponent(redirectUri)}&response_type=code&scope=account`;
}

// 금융 데이터 조회 (모의 구현)
export async function fetchFinancialData(providerId: string, accessToken: string) {
  // 실제로는 각 제공업체의 API를 호출
  const mockData = {
    accounts: [
      { id: 'acc1', name: '입출금통장', balance: 1500000, bank: '신한은행' },
      { id: 'acc2', name: '적금통장', balance: 500000, bank: '국민은행' }
    ],
    cards: [
      { id: 'card1', name: '삼성카드', limit: 5000000, used: 1200000 },
      { id: 'card2', name: '신한카드', limit: 3000000, used: 800000 }
    ],
    transactions: [
      { id: 'tx1', amount: -50000, description: '스타벅스', date: '2024-01-15', category: '카페' },
      { id: 'tx2', amount: 150000, description: '급여', date: '2024-01-14', category: '수입' }
    ]
  };

  // 실제 구현에서는 여기서 API 호출
  return new Promise(resolve => {
    setTimeout(() => resolve(mockData), 1000);
  });
}

// 데이터 동기화
export async function syncAllFinancialData(userId: string, connectedProviders: string[]) {
  const results = await Promise.allSettled(
    connectedProviders.map(providerId =>
      fetchFinancialData(providerId, 'mock_token')
    )
  );

  return results.map((result, index) => ({
    provider: connectedProviders[index],
    success: result.status === 'fulfilled',
    data: result.status === 'fulfilled' ? result.value : null,
    error: result.status === 'rejected' ? result.reason : null
  })) as Array<{
    provider: string;
    success: boolean;
    data: any;
    error: any;
  }>;
}
