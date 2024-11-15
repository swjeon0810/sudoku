import axios from 'axios';
import { NextResponse } from 'next/server';

export async function GET() {
  // 난이도: easy, medium, hard, 답은 data에 담겨있음
  try {
    const response = await axios.get('https://sudoku-game-and-api.netlify.app/api/sudoku'); // 실제 API URL로 변경
    const res = NextResponse.json(response.data);
    res.headers.set('Cache-Control', 'no-store, must-revalidate'); // 캐시를 무효화하고 새 데이터로 요청하도록 설정

    return res;

  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: 'Error fetching sudoku puzzle' }, { status: 500 });
  }
}