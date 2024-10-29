import axios from 'axios';
import { NextResponse } from 'next/server';

// export default async function handler(req: any, res:any) {
//   try {
//     const response = await axios.get('https://sudoku-game-and-api.netlify.app/api/sudoku'); // 실제 API URL로 변경
//     console.log(response)
//     res.status(200).json(response.data);
//   } catch (error) {
//     console.error(error);
//     res.status(500).json({ error: 'Error fetching sudoku puzzle' });
//   }
// }
export async function GET() {
  // 난이도: easy, medium, hard, 답은 data에 담겨있음
  try {
    const response = await axios.get('https://sudoku-game-and-api.netlify.app/api/sudoku'); // 실제 API URL로 변경
    return NextResponse.json(response.data);
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: 'Error fetching sudoku puzzle' }, { status: 500 });
  }
}