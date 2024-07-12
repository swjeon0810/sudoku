"use client";
import { useRef, useState } from "react";
import { VscDebugRestart } from "react-icons/vsc";
import { MdUndo, MdDarkMode, MdSunny } from "react-icons/md";
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
  memo: Set<number>; // 메모
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
        fixed: value !== 0,
        duplicated: false,
        memo: new Set<number>(),
      });
    }
    grid.push(currentRow);
  }
  return grid;
};

export default function Home() {
  const [dark, setDark] = useState(false);
  const [sudokuGrid, setSudokuGrid] = useState<SudokuGrid>(generateEmptyGrid());
  const [showResetModal, setShowResetModal] = useState(false);
  const [inputNum, setInputNum] = useState<number | null>(null);
  const [onRemove, setOnRemove] = useState(false);
  const [onMemo, setOnMemo] = useState(false);
  const initFocusCell = { row: -1, col: -1, value: -1, subgrid: -1 };
  const [focusCell, setFocusCell] = useState(initFocusCell); // 포커스된 셀
  const historyRef = useRef<SudokuGrid[]>([]); // 그리드 기록을 저장해둠
  const [finishedNum, setFinishedNum] = useState<Set<number>>(new Set());

  const handleResetBtn = () => {
    setShowResetModal(true);
  };
  const reset = () => {
    // 다시 시작 이벤트
    setFocusCell(initFocusCell); // 셀 선택 해제
    setInputNum(null);
    setSudokuGrid(generateEmptyGrid());
    historyRef.current = [];
  };
  const undo = () => {
    // 실행 취소 이벤트
    setFocusCell(initFocusCell); // 셀 선택 해제
    const lastest = historyRef.current.pop();
    lastest != undefined && setSudokuGrid(lastest);
  };
  const cellClickEvent = (cell: SudokuCell) => {
    //셀 클릭 이벤트
    const { row, col, fixed, value } = cell;

    if (fixed) {
      if (onMemo || onRemove) return;
      else {
        setInputNum(-1);
        return;
      }
    }

    setFocusCell(cell);

    if (onRemove) {
      // "제거 모드인 경우"
      remove(row, col);
      return;
    }

    if (inputNum === null) return;

    if (inputNum === value) {
      // 똑같은 값이 들어가있는 경우 지우기
      remove(row, col);
    } else {
      // 새로운 값 입력
      updateGrid(cell, inputNum);
    }
  };
  const updateGrid = (cell: SudokuCell, newValue: number) => {
    //셀 값 변경
    const { row, col, value, memo } = cell;

    historyRef.current.push(_.cloneDeep(sudokuGrid));

    setSudokuGrid((prevGrid) => {
      const newGrid: SudokuGrid = [...prevGrid]; // 복사하여 새로운 배열 생성

      if (onMemo) {
        // 메모 모드일경우
        if (memo.has(newValue)) {
          memo.delete(newValue);
          //메모에서 숫자 제거
          newGrid[row][col] = {
            ...newGrid[row][col],
            memo: memo,
          };
        } else {
          //메모에 숫자 추가
          newGrid[row][col] = {
            ...newGrid[row][col],
            memo: memo.add(newValue),
          };
        }
      } else {
        // 메모 모드 아닐 경우
        newGrid[row][col] = {
          ...newGrid[row][col],
          value: newValue,
        };

        //입력한 값 유효성 검사. 연관 그리드에 중복된 값이 있는지 체크.
        const duplicateCells: SudokuCell[] = checkDuplicateCell(
          newGrid,
          row,
          col,
          newValue
        );

        if (duplicateCells.length > 1) {
          // 중복되는 셀이 하나인 경우는 자기 자신이므로 넘긴다.
          // 여러 개인 경우 duplicated 표시함.
          duplicateCells.map(({ row, col }) => {
            newGrid[row][col] = { ...newGrid[row][col], duplicated: true };
          });
        }

        // 연관 그리드 메모에서 해당 값을 지운다.
        const duplicateCellsMemo: SudokuCell[] = checkDuplicateMemo(
          newGrid,
          row,
          col,
          newValue
        );

        duplicateCellsMemo.map(({ row, col, memo }) => {
          memo.delete(newValue);
          newGrid[row][col] = { ...newGrid[row][col], memo };
        });
      }
      const countOfInputNum = countNumber(newGrid, newValue);
      if (countOfInputNum >= 9) setFinishedNum((prev) => prev.add(newValue));
      console.log(`finishedNum : ${finishedNum}`);
      return newGrid;
    });

    // 입력한 값의 개수가 9 이상일 경우.
  };

  const remove = (row: number, col: number) => {
    // 숫자 지우기
    if (onMemo) {
      setSudokuGrid((prevGrid) => {
        const newGrid: SudokuGrid = [...prevGrid]; // 복사하여 새로운 배열 생성
        const newMemo = newGrid[row][col].memo;
        inputNum && newMemo.delete(inputNum);
        newGrid[row][col] = {
          ...newGrid[row][col],
          memo: newMemo,
        };

        return newGrid;
      });
    } else {
      setSudokuGrid((prevGrid) => {
        const newGrid: SudokuGrid = [...prevGrid]; // 복사하여 새로운 배열 생성
        newGrid[row][col] = {
          ...newGrid[row][col],
          value: -1,
          duplicated: false,
        };

        return newGrid;
      });
    }
  };

  const checkDuplicateMemo = (
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
  const checkDuplicateCell = (
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
  const countNumber = (newGrid: SudokuGrid, num: number) => {
    //숫자를 입력할 때마다 해당 숫자가 그리드에 몇개 들어가 있는지 카운트한다.
    // 9개가 들어가 있으면 number Panel에서 비활성화 시킴.
    let cnt = 0;
    for (let i = 0; i < 9; i++) {
      for (let j = 0; j < 9; j++) {
        if (newGrid[i][j].value === num) cnt++;
      }
    }
    console.log(`num: ${num} count: ${cnt}`);
    return cnt;
  };
  const handleNumberBarClick = (num: number) => {
    setOnRemove(false);
    setInputNum(num); // 현재 클릭한 숫자 "쓰기 모드" 활성화
  };

  return (
    <main className="flex min-h-screen flex-col items-center justify-between p-24">
      <div className="flex flex-col z-10 w-full max-w-5xl items-center justify-between font-mono text-sm lg:flex border gap-5 py-10">
        <p>Welcome !</p>
        {/* Toolbar */}
        <div className="flex w-full ">
          {/* 다시 시작 버튼 */}
          <button
            className="border rounded bg-purple-300"
            onClick={handleResetBtn}
          >
            <VscDebugRestart className="w-8 h-8 " />
          </button>
          {/* 실행취소 버튼*/}
          <button className="border rounded bg-green-300" onClick={undo}>
            <MdUndo className="w-8 h-8 " />
          </button>
          {/* 다크모드 토글*/}
          <label className="inline-flex items-center me-5 cursor-pointer">
            <MdSunny />
            <input
              type="checkbox"
              value=""
              className="sr-only peer"
              onChange={(e) => setDark(e.target.checked)}
            />
            <div className="relative w-11 h-6 bg-gray-200 rounded-full peer dark:bg-gray-700 peer-focus:ring-4 peer-focus:ring-orange-300 dark:peer-focus:ring-orange-800 peer-checked:after:translate-x-full rtl:peer-checked:after:-translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-0.5 after:start-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-orange-500"></div>
            <MdDarkMode />
          </label>
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
                    focusCell,
                  }}
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
              <button
                key={index}
                className={`w-auto h-auto px-2 text-center text-white text-2xl border ${
                  inputNum === index + 1 ? "bg-pink-600" : ""
                } 
              ${finishedNum.has(index + 1) ? " bg-gray-500 " : ""}`}
                onClick={() => {
                  handleNumberBarClick(index + 1);
                }}
                disabled={finishedNum.has(index + 1)}
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
            onClick={() => {
              setOnRemove((prevOnRemove) => !prevOnRemove);
            }}
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
