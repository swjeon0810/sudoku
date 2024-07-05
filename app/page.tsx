"use client";
import { useState } from "react";
import NumberBar from "./components/NumberBar";

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

type SudokuCell = {
  row: number;
  col: number;
  value: number;
  subgrid: number;
  fix: boolean;
};

type SudokuGrid = SudokuCell[][];
const generateEmptyGrid = (): SudokuGrid => {
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
        fix: value != 0,
      });
    }
    grid.push(currentRow);
  }
  return grid;
};

export default function Home() {
  const [sudokuGrid, setSudokuGrid] = useState<SudokuGrid>(generateEmptyGrid());

  const [activeNum, setActiveNum] = useState(-1);
  const initialCellSelection = {
    grid: -1,
    row: -1,
    col: -1,
    value: -1,
  };
  const [cellSelected, setCellSelected] = useState(initialCellSelection);

  const cellClickEvent = (cell: SudokuCell) => {
    //셀 클릭 이벤트
    console.log(
      `선택값: ${cell.value}\nsubgrid: ${cell.subgrid} \nrow: ${cell.row} \ncol: ${cell.col}`
    );
    setCellSelected({
      grid: cell.subgrid,
      row: cell.row,
      col: cell.col,
      value: cell.value,
    });
    if (activeNum != -1 && !cell.fix) {
      // Number Bar 활성화되어 있는 경우 active Num 값을 입력해줌
      setSudokuGrid((prevGrid) => {
        const newGrid = [...prevGrid]; // 복사하여 새로운 배열 생성
        newGrid[cell.row] = [...newGrid[cell.row]];
        newGrid[cell.row][cell.col] = {
          ...newGrid[cell.row][cell.col],
          value: activeNum,
        };
        return newGrid;
      });
    }
    //setActiveNum(-1);
  };

  const handleNumberBarClick = (number: number) => {
    setActiveNum(number);
    setCellSelected(initialCellSelection);
  };

  return (
    <main className="flex min-h-screen flex-col items-center justify-between p-24">
      <div className="flex flex-col z-10 w-full max-w-5xl items-center justify-between font-mono text-sm lg:flex border gap-5 py-10">
        <p>Welcome !</p>
        <div className="grid gap-y-1">
          {sudokuGrid.map((row, rowIndex) => (
            <div key={rowIndex} className="grid grid-cols-9 gap-x-1 ">
              {row.map((cell, colIndex) => (
                <input
                  key={colIndex}
                  type="text"
                  className={`w-8 h-8 sm:w-10 sm:h-10 border text-center text-xl cursor-pointer 
                    ${
                      cell.row == cellSelected.row &&
                      cell.col == cellSelected.col &&
                      " border-pink-300 border-4 "
                    } 
                  ${
                    cellSelected.row == cell.row || cellSelected.col == cell.col
                      ? " bg-slate-600 "
                      : " bg-slate-950 "
                  } 
                  ${cell.subgrid == cellSelected.grid && " bg-slate-600 "}
                  ${
                    cell.value == activeNum ? " bg-pink-600 " : " bg-slate-950 "
                  }  
                  ${cell.value == cellSelected.value && " text-pink-400 "}`}
                  onClick={() => cellClickEvent(cell)}
                  value={cell.value != 0 ? cell.value : ""}
                  readOnly
                />
              ))}
            </div>
          ))}
        </div>
        {/* Number Bar*/}
        <div className="flex gap-0.5">
          {Array(9)
            .fill(null)
            .map((_: any, index: number) => (
              <NumberBar
                key={index}
                index={index}
                selectedNum={activeNum}
                handleNumberBarClick={handleNumberBarClick}
              />
            ))}
        </div>
      </div>
    </main>
  );
}
