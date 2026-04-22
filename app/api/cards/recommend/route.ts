import { NextRequest, NextResponse } from 'next/server';
import { ApiCardRecommendationRequest, ApiCardRecommendationResponse } from '../../../../lib/apiSchemas';
import { recommendBestCard } from '../../../../lib/cardAssistant';

export async function POST(request: NextRequest) {
  try {
    const body: ApiCardRecommendationRequest = await request.json();
    const { category, location } = body;

    // 입력 검증
    if (!category || !location) {
      return NextResponse.json(
        { error: 'Category and location are required' },
        { status: 400 }
      );
    }

    // 카드 추천 로직 실행
    const recommendedCard = recommendBestCard(category, location);

    if (!recommendedCard) {
      return NextResponse.json(
        { error: 'No suitable card found' },
        { status: 404 }
      );
    }

    const response: ApiCardRecommendationResponse = {
      recommendedCardId: recommendedCard.id,
      recommendedBenefit: {
        type: recommendedCard.recommendedBenefit?.type || 'percent',
        label: recommendedCard.recommendedBenefit?.label || '혜택 없음',
        value: recommendedCard.recommendedBenefit?.value || 0,
      },
      score: Math.round(recommendedCard.score),
      message: `${location}의 ${category}에서 ${recommendedCard.name}을(를) 사용하시면 ${recommendedCard.recommendedBenefit?.bonusText || '최적의 혜택'}을 받을 수 있어요!`,
    };

    return NextResponse.json(response);
  } catch (error) {
    console.error('Error processing card recommendation:', error);
    return NextResponse.json(
      { error: 'Failed to process card recommendation' },
      { status: 500 }
    );
  }
}