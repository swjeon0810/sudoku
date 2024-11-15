import axios from 'axios';
import { timeStamp } from 'console';
import { NextResponse } from 'next/server';

export async function GET() {
  // 난이도: easy, medium, hard, 답은 data에 담겨있음
  try {
    const currentTime = new Date().getTime();
    const response = await axios.get('https://sudoku-game-and-api.netlify.app/api/sudoku', {
      params: {
        timeStamp:currentTime
      }
    }); // 실제 API URL로 변경

    const res = NextResponse.json(response.data);
    return res;

  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: 'Error fetching sudoku puzzle' }, { status: 500 });
  }
}