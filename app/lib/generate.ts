import { SudokuGrid, SudokuCell } from "./type";

const example2 = [
  [0, 3, 0, 0, 6, 2, 0, 7, 0],
  [2, 7, 6, 8, 1, 5, 0, 0, 9],
  [9, 0, 0, 0, 3, 0, 2, 5, 0],
  [0, 0, 0, 5, 8, 0, 0, 0, 7],
  [8, 0, 7, 0, 0, 0, 9, 0, 0],
  [0, 2, 4, 0, 0, 0, 0, 0, 0],
  [0, 4, 9, 6, 0, 0, 1, 3, 0],
  [6, 1, 0, 7, 4, 0, 5, 0, 0],
  [0, 0, 8, 2, 9, 0, 0, 6, 4],
];

export const generateEmptyGrid = (): SudokuGrid => {
  // 비어있는 네모칸들 만들기
  const grid: SudokuGrid = [];
  for (let row = 0; row < 9; row++) {
    const currentRow: SudokuCell[] = [];
    for (let col = 0; col < 9; col++) {
      let value = example2[row][col];

      currentRow.push({
        row,
        col,
        value,
        subgrid: Math.floor(row / 3) * 3 + Math.floor(col / 3),
        fixed: value !== 0,
        duplicated: false,
        memo: new Set<number>(),
      });
    }
    grid.push(currentRow);
  }
  return grid;
};
