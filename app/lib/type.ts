export type SudokuCell = {
  row: number; // 행
  col: number; // 열
  value: number; // 값
  subgrid: number; // 0~8 중 속한 그리드
  fixed: boolean; // 고정값 여부
  duplicated: boolean; // 중복 여부
  memo: Set<number>; // 메모
};

export type SudokuGrid = SudokuCell[][];
