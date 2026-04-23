import { NextRequest, NextResponse } from 'next/server';
import { PrivacyDemo, PrivacyUtils, initializeDataClassifications } from '../../../lib/privacy-demo';

// 개인정보 보호 기능 데몬스트레이션 API
export async function GET(request: NextRequest) {
  try {
    // 데이터 분류 초기화
    initializeDataClassifications();

    // 개인정보 보호 기능 데몬스트레이션 실행
    await PrivacyDemo.demonstratePrivacyFeatures();

    return NextResponse.json({
      success: true,
      message: '개인정보 보호 기능 데몬스트레이션이 완료되었습니다.',
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    console.error('개인정보 보호 데몬스트레이션 실패:', error);
    return NextResponse.json(
      {
        success: false,
        error: '개인정보 보호 데몬스트레이션 실패',
        details: error instanceof Error ? error.message : '알 수 없는 오류'
      },
      { status: 500 }
    );
  }
}

// 개인정보 보호 데이터 필터링 API
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { data, dataType, userId } = body;

    if (!data || !dataType || !userId) {
      return NextResponse.json(
        {
          success: false,
          error: '필수 파라미터가 누락되었습니다 (data, dataType, userId)'
        },
        { status: 400 }
      );
    }

    // 데이터 분류 초기화
    initializeDataClassifications();

    // 개인정보 보호 적용
    const protectedData = PrivacyUtils.protectApiResponse(data, dataType, userId);

    return NextResponse.json({
      success: true,
      originalData: data,
      protectedData,
      dataType,
      userId,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    console.error('데이터 보호 실패:', error);
    return NextResponse.json(
      {
        success: false,
        error: '데이터 보호 처리 실패',
        details: error instanceof Error ? error.message : '알 수 없는 오류'
      },
      { status: 500 }
    );
  }
}
