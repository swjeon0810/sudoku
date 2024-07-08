"use client";
import { useState } from "react";
import NumberBar from "./components/NumberBar";
import { IoCloseOutline } from "react-icons/io5";
import { VscDebugRestart } from "react-icons/vsc";
import { MdUndo } from "react-icons/md";
import classNames from "classnames";

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
  duplicate: boolean;
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
        duplicate: false,
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
      `선택값: ${cell.value}\nsubgrid: ${cell.subgrid} \nrow: ${cell.row} \ncol: ${cell.col} \nfix: ${cell.fix} \nduplicated: ${cell.duplicate}`
    );

    setCellSelected({
      grid: cell.subgrid,
      row: cell.row,
      col: cell.col,
      value: cell.value,
    });

    validateGrid();
    if (activeNum == -1) {
      // "쓰기 모드 활성화 아닌경우"
      return;
    } else {
      // "쓰기모드" 활성화인 경우
      if (cell.fix) {
        setActiveNum(-1);
        return;
      } else if (cell.value === activeNum) {
        // 똑같은 값이 들어가있는 경우 지우기
        setSudokuGrid((prevGrid) => {
          const newGrid = [...prevGrid]; // 복사하여 새로운 배열 생성
          newGrid[cell.row][cell.col] = {
            ...newGrid[cell.row][cell.col],
            value: 0,
            duplicate: false,
          };
          return newGrid;
        });
      } else {
        // 고정값이 아닌 경우, 새로운 값 입력
        setSudokuGrid((prevGrid) => {
          const newGrid = [...prevGrid]; // 복사하여 새로운 배열 생성
          newGrid[cell.row][cell.col] = {
            ...newGrid[cell.row][cell.col],
            value: activeNum,
          };
          // 중복 체크: 행, 열, 그리드 내에서만 직접 체크

          const duplicateCells: SudokuCell[] = checkDuplicates(
            newGrid,
            cell.row,
            cell.col
          );

          duplicateCells.map(({ row, col }) => {
            newGrid[row][col] = { ...newGrid[row][col], duplicate: true };
          });

          return newGrid;
        });
      }
    }
  };
  const checkDuplicates = (newGrid: SudokuGrid, row: number, col: number) => {
    const duplicateInRow = newGrid[row].filter((c) => c.value == activeNum);
    const cellsInCol = newGrid.map((row) => row[col]);
    const duplicateInCol = cellsInCol.filter((c) => c.value == activeNum);
    const subgridRowStart = Math.floor(row / 3) * 3;
    const subgridColStart = Math.floor(col / 3) * 3;
    const duplicateInSubgrid = [];
    for (let r = subgridRowStart; r < subgridRowStart + 3; r++) {
      for (let c = subgridColStart; c < subgridColStart + 3; c++) {
        newGrid[r][c].value === activeNum &&
          duplicateInSubgrid.push(newGrid[r][c]);
      }
    }
    const allDuplicateCells = [
      ...new Set([...duplicateInRow, ...duplicateInCol, ...duplicateInSubgrid]),
    ];

    return allDuplicateCells;
  };

  const validateGrid = () => {
    // 각 row 별 검색
    sudokuGrid.map((row, rowIndex) => {
      const values = row.map((cell) => cell.value);
      const duplicates = values.filter(
        (value, index) => values.indexOf(value) !== index
      ); // 중복되는 value 를 반환

      row = row.map((cell) => {
        if (cell.value in duplicates) {
          return { ...cell, duplicate: true };
        }
        return cell;
      });
    });
  };

  const handleNumberBarClick = (number: number) => {
    setCellSelected(initialCellSelection); // 셀이 선택된 상태였다면 초기화.
    setActiveNum(number); // 현재 클릭한 숫자 "쓰기 모드" 활성화
  };

  const cellClassName = (
    cell: SudokuCell,
    colIndex: number,
    rowIndex: number,
    activeNum: number,
    cellSelected: Record<string, number>
  ) => {
    return classNames(
      "w-8 h-8 sm:w-10 sm:h-10 border text-center text-xl cursor-pointer ",
      {
        "border-r-4": colIndex === 2 || colIndex === 5,
        "border-b-4": rowIndex === 2 || rowIndex === 5,
        "bg-pink-600": cell.value == activeNum,
        "bg-slate-950": cell.value != activeNum,
        "border-pink-300 border-4":
          cell.row == cellSelected.row && cell.col == cellSelected.col,
        "bg-pink-900":
          cellSelected.row == cell.row ||
          cellSelected.col == cell.col ||
          cell.subgrid == cellSelected.grid,
        "text-pink-400": cell.value == cellSelected.value,
        "text-yellow-200": cell.duplicate,
      }
    );
  };

  return (
    <main className="flex min-h-screen flex-col items-center justify-between p-24">
      <div className="flex flex-col z-10 w-full max-w-5xl items-center justify-between font-mono text-sm lg:flex border gap-5 py-10">
        <p>Welcome !</p>
        {/* Toolbar */}
        <div className="flex w-full ">
          <VscDebugRestart />
          <MdUndo />
        </div>
        <div className="grid ">
          {sudokuGrid.map((row, rowIndex) => (
            <div key={rowIndex} className="grid grid-cols-9 ">
              {row.map((cell, colIndex) => (
                <div
                  key={colIndex}
                  className="relative"
                  onClick={() => cellClickEvent(cell)}
                >
                  {cell.duplicate && !cell.fix && (
                    <IoCloseOutline className="absolute w-8 h-8 text-red-500" />
                  )}

                  <input
                    type="text"
                    className={cellClassName(
                      cell,
                      colIndex,
                      rowIndex,
                      activeNum,
                      cellSelected
                    )}
                    value={cell.value != 0 ? cell.value : ""}
                    readOnly
                  />
                </div>
              ))}
            </div>
          ))}
        </div>
        {/* Number Bar*/}
        <div className="flex gap-0.5">
          {Array(9)
            .fill(null)
            .map((_: any, index: number) => (
              <button
                key={index}
                className={`w-auto h-auto px-2 text-center text-white text-2xl border ${
                  activeNum === index + 1 ? "bg-pink-600" : ""
                }`}
                onClick={() => handleNumberBarClick(index + 1)}
              >
                {index + 1}
              </button>
            ))}
        </div>
      </div>
    </main>
  );
}
