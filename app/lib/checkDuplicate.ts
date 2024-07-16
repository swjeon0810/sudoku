import { SudokuGrid } from "./type";
export const checkDuplicateMemo = (
  newGrid: SudokuGrid,
  row: number,
  col: number,
  targetNum: number
) => {
  // 셀에 숫자를 입력할 때 연관 그리드 메모 중 중복값이 있는 지 체크한다.
  const duplicateInRow = newGrid[row].filter((c) => c.memo.has(targetNum));
  const cellsInCol = newGrid.map((row) => row[col]);
  const duplicateInCol = cellsInCol.filter((c) => c.memo.has(targetNum));
  const subgridRowStart = Math.floor(row / 3) * 3;
  const subgridColStart = Math.floor(col / 3) * 3;
  const duplicateInSubgrid = [];
  for (let r = subgridRowStart; r < subgridRowStart + 3; r++) {
    for (let c = subgridColStart; c < subgridColStart + 3; c++) {
      newGrid[r][c].memo.has(targetNum) &&
        duplicateInSubgrid.push(newGrid[r][c]);
    }
  }
  const allDuplicateCellsMemo = [
    ...new Set([...duplicateInRow, ...duplicateInCol, ...duplicateInSubgrid]),
  ];

  return allDuplicateCellsMemo;
};

export const checkDuplicateCell = (
  newGrid: SudokuGrid,
  row: number,
  col: number,
  targetNum: number
) => {
  // 셀에 숫자를 입력할 때 연관 그리드에 중복값이 있는지 체크하는 함수.
  const duplicateInRow = newGrid[row].filter((c) => c.value == targetNum);
  const cellsInCol = newGrid.map((row) => row[col]);
  const duplicateInCol = cellsInCol.filter((c) => c.value == targetNum);
  const subgridRowStart = Math.floor(row / 3) * 3;
  const subgridColStart = Math.floor(col / 3) * 3;
  const duplicateInSubgrid = [];
  for (let r = subgridRowStart; r < subgridRowStart + 3; r++) {
    for (let c = subgridColStart; c < subgridColStart + 3; c++) {
      newGrid[r][c].value === targetNum &&
        duplicateInSubgrid.push(newGrid[r][c]);
    }
  }
  const allDuplicateCells = [
    ...new Set([...duplicateInRow, ...duplicateInCol, ...duplicateInSubgrid]),
  ];
  console.log(allDuplicateCells);
  return allDuplicateCells;
};
