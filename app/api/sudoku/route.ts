import axios from 'axios';
import { timeStamp } from 'console';
import { NextResponse } from 'next/server';

export async function GET() {
  // 난이도: easy, medium, hard, 답은 data에 담겨있음
  try {
    const currentTime = new Date().getTime(); // Unix 타임스탬프 (밀리초 단위)
    const response = await axios.get('https://sudoku-game-and-api.netlify.app/api/sudoku', {
      params: {
        timestamp: currentTime,  // timestamp를 추가하여 매번 새로운 요청을 보내기
      },
      headers: {
        'Cache-Control': 'no-cache'  // 캐시를 방지하기 위한 헤더 추가
      }
    }); // 실제 API URL로 변경

    const res = NextResponse.json(response.data);
    res.headers.set('Cache-Control', 'no-store');
    return res;

  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: 'Error fetching sudoku puzzle' }, { status: 500 });
  }
}