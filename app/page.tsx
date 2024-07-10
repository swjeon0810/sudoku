"use client";
import { useRef, useState } from "react";
import { VscDebugRestart } from "react-icons/vsc";
import { MdUndo } from "react-icons/md";
import { TfiPencilAlt, TfiEraser } from "react-icons/tfi";
import _ from "lodash";
import ResetModal from "./components/ResetModal";
import SudokuCell from "./components/Cell";

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

export type SudokuCell = {
  row: number; // 행
  col: number; // 열
  value: number; // 값
  subgrid: number; // 0~8 중 속한 그리드
  fixed: boolean; // 고정값 여부
  duplicated: boolean; // 중복 여부
  memo: Set<number>;
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
        fixed: value != 0,
        duplicated: false,
        memo: new Set<number>(),
      });
    }
    grid.push(currentRow);
  }
  return grid;
};

export default function Home() {
  const [sudokuGrid, setSudokuGrid] = useState<SudokuGrid>(generateEmptyGrid());
  const [showResetModal, setShowResetModal] = useState(false);
  const [inputNum, setInputNum] = useState<number | null>(null);
  const [onRemove, setOnRemove] = useState(false);
  const [onMemo, setOnMemo] = useState(false);

  const [targetCell, setTargetCell] = useState<SudokuCell | null>(null); // 포커스된 셀
  const historyRef = useRef<SudokuGrid[]>([]); // 그리드 기록을 저장해둠
  const handleResetBtn = () => {
    setShowResetModal(true);
  };
  const reset = () => {
    // 다시 시작 이벤트
    setTargetCell(null); // 셀 선택 해제
    setInputNum(null);
    setSudokuGrid(generateEmptyGrid());
    historyRef.current = [];
  };
  const undo = () => {
    // 실행 취소 이벤트
    setTargetCell(null); // 셀 선택 해제
    const lastest = historyRef.current.pop();
    lastest != undefined && setSudokuGrid(lastest);
  };
  const cellClickEvent = (cell: SudokuCell) => {
    //셀 클릭 이벤트
    const { row, col, fixed, value } = cell;
    if (onMemo && fixed) return;
    if (!onMemo) setTargetCell(cell);

    if (onRemove) {
      // "제거 모드인 경우"
      !fixed && remove(row, col);
      return;
    }

    if (fixed) {
      //고정값인 경우
      setInputNum(-1);
      return;
    }
    if (inputNum === null) return;

    if (inputNum === value) {
      // 똑같은 값이 들어가있는 경우 지우기
      remove(row, col);
    } else {
      // 고정값이 아닌 경우, 새로운 값 입력
      updateGrid(cell, inputNum);
    }
  };

  const updateGrid = (cell: SudokuCell, newValue: number) => {
    //셀 값 변경
    const { row, col, memo } = cell;

    historyRef.current.push(_.cloneDeep(sudokuGrid));

    setSudokuGrid((prevGrid) => {
      const newGrid: SudokuGrid = [...prevGrid]; // 복사하여 새로운 배열 생성

      if (onMemo) {
        // 메모 모드일경우
        newGrid[row][col] = {
          ...newGrid[row][col],
          memo: memo.add(newValue),
        };
      } else {
        newGrid[row][col] = {
          ...newGrid[row][col],
          value: newValue,
        };
        const duplicateCells: SudokuCell[] = checkDuplicates(
          newGrid,
          row,
          col,
          newValue
        );

        duplicateCells.map(({ row, col }) => {
          newGrid[row][col] = { ...newGrid[row][col], duplicated: true };
        });
      }

      return newGrid;
    });
  };
  const remove = (row: number, col: number) => {
    // 숫자 지우기
    setSudokuGrid((prevGrid) => {
      const newGrid: SudokuGrid = [...prevGrid]; // 복사하여 새로운 배열 생성
      newGrid[row][col] = {
        ...newGrid[row][col],
        value: -1,
        duplicated: false,
      };

      return newGrid;
    });
  };
  const checkDuplicates = (
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

    return allDuplicateCells;
  };
  const handleRemoveButton = () => {
    if (targetCell !== null && !targetCell.fixed)
      remove(targetCell.row, targetCell.col);
    else setOnRemove((prevOnRemove) => !prevOnRemove);
  };
  const handleNumberBarClick = (num: number) => {
    setOnRemove(false);
    if (!targetCell) setInputNum(num); // 현재 클릭한 숫자 "쓰기 모드" 활성화
    else {
      if (targetCell.fixed) {
        setTargetCell(null);
        setInputNum(num);
      } else updateGrid(targetCell, num);
    }
  };

  return (
    <main className="flex min-h-screen flex-col items-center justify-between p-24">
      <div className="flex flex-col z-10 w-full max-w-5xl items-center justify-between font-mono text-sm lg:flex border gap-5 py-10">
        <p>Welcome !</p>
        {/* Toolbar */}
        <div className="flex w-full ">
          <button
            className="border rounded bg-purple-300"
            onClick={handleResetBtn}
          >
            <VscDebugRestart className="w-8 h-8 " />
          </button>
          <button className="border rounded bg-green-300" onClick={undo}>
            <MdUndo className="w-8 h-8 " />
          </button>
        </div>
        <div className="grid ">
          {sudokuGrid.map((row, rowIndex) => (
            <div key={rowIndex} className="grid grid-cols-9 ">
              {row.map((cell, colIndex) => (
                <SudokuCell
                  key={colIndex}
                  {...{
                    rowIndex,
                    colIndex,
                    cell,
                    cellClickEvent,
                    onMemo,
                    inputNum,
                    targetCell,
                  }}
                />
              ))}
            </div>
          ))}
        </div>
        {/* Number Bar*/}
        <div className="flex gap-0.5">
          <label className="inline-flex items-center me-5 cursor-pointer">
            <input
              type="checkbox"
              value=""
              className="sr-only peer"
              onChange={(e) => console.log(e.target.checked)}
            />
            <div className="relative w-11 h-6 bg-gray-200 rounded-full peer dark:bg-gray-700 peer-focus:ring-4 peer-focus:ring-orange-300 dark:peer-focus:ring-orange-800 peer-checked:after:translate-x-full rtl:peer-checked:after:-translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-0.5 after:start-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-orange-500"></div>
            <span className="ms-3 text-sm font-medium text-gray-900 dark:text-gray-300">
              Orange
            </span>
          </label>
          {Array(9)
            .fill(null)
            .map((_: any, index: number) => (
              <button
                key={index}
                className={`w-auto h-auto px-2 text-center text-white text-2xl border ${
                  inputNum === index + 1 ? "bg-pink-600" : ""
                }`}
                onClick={() => handleNumberBarClick(index + 1)}
              >
                {index + 1}
              </button>
            ))}
        </div>
        <div className="flex w-full">
          <button
            className={`border rounded  ${
              onMemo ? "bg-green-300" : "bg-gray-300"
            }`}
            onClick={() => setOnMemo(!onMemo)}
          >
            <TfiPencilAlt className="w-8 h-8 " />
          </button>
          <button
            className={`border rounded  ${
              onRemove ? "bg-green-300" : "bg-gray-300"
            }`}
            onClick={handleRemoveButton}
          >
            <TfiEraser className="w-8 h-8 " />
          </button>
        </div>
      </div>
      {/* reset modal */}
      {showResetModal && <ResetModal {...{ setShowResetModal, reset }} />}
    </main>
  );
}
