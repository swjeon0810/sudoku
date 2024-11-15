import axios from 'axios';
import { NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';
export async function GET() {
  // 난이도: easy, medium, hard, 답은 data에 담겨있음
  try {
    const response = await axios.get('https://sudoku-game-and-api.netlify.app/api/sudoku', {
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