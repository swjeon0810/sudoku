"use client";
import { useEffect, useRef, useState } from "react";
import { VscDebugRestart } from "react-icons/vsc";
import {
  MdUndo,
  MdDarkMode,
  MdSunny,
  MdEdit,
  MdDelete,
} from "react-icons/md";
import _ from "lodash";
import ResetModal from "./components/ResetModal";
import Cell from "./components/Cell";
import FinishModal from "./components/FinishModal";
import { SudokuGrid, SudokuCell } from "./lib/type";
// import { generateEmptyGrid } from "./lib/generate";
import { checkDuplicateCell, checkDuplicateMemo } from "./lib/checkDuplicate";
import Loading from "./components/Loading";

export default function Home() {

  const historyRef = useRef<SudokuGrid[]>([]); // 그리드 기록을 저장해둠
  const initFocusCell = { row: -1, col: -1, value: -1, subgrid: -1 };
  const [sudokuGrid, setSudokuGrid] = useState<any>(null);
  const [focusCell, setFocusCell] = useState(initFocusCell); // 포커스된 셀
  const [showResetModal, setShowResetModal] = useState(false);
  const [activatedNum, setActivatedNum] = useState<number | null>(null);
  const [onRemove, setOnRemove] = useState(false);
  const [onMemo, setOnMemo] = useState(false);
  const [finishedNum, setFinishedNum] = useState<Set<number>>(new Set());
  const [finishGame, setFinishGame] = useState(false); // 게임 완료 여부
  const [darkMode, setDarkMode] = useState(false); // 다크모드 여부
  const [loading, setLoading] = useState(true); // 스도쿠를 세팅하는 동안 로딩화면 여부

  useEffect(() => {
    if (darkMode) {
      document.documentElement.classList.add("dark");
    } else {
      document.documentElement.classList.remove("dark");
    }
  }, [darkMode]);

  const fetchSudoku = async () => {
    setLoading(true);
    // API 를 통해 새로운 게임 데이터를 받아와서 그리드에 세팅.
    try {
      const response = await fetch('/api/sudoku');
      const data = await response.json();
      const rawData = data.medium

      const grid: SudokuGrid = [];
      for (let row = 0; row < 9; row++) {
        const currentRow: SudokuCell[] = [];
        for (let col = 0; col < 9; col++) {
          let newValue = rawData[row][col]
          currentRow.push({
            row,
            col,
            value:newValue,
            subgrid: Math.floor(row / 3) * 3 + Math.floor(col / 3),
            fixed: newValue !== 0,
            duplicated: false,
            memo: new Set<number>(),
          });
        }
        grid.push(currentRow);
      }

      setSudokuGrid(grid);
      setLoading(false);
    } catch (error) {
      console.error('Error fetching sudoku:', error);
    }
  };

  useEffect(() => {
    fetchSudoku();
  }, []);

  const toggleDarkMode = () => {
    setDarkMode((prevMode) => !prevMode);
  };

  const handleResetBtn = () => {
    setShowResetModal(true);
  };
  const reset = () => {
    // 다시 시작 이벤트
    setFocusCell(initFocusCell); // 셀 선택 해제
    setActivatedNum(null);
    fetchSudoku();
    historyRef.current = [];
  };
  const undo = () => {
    // 실행 취소 이벤트
    setFocusCell(initFocusCell); // 셀 선택 해제
    const lastest = historyRef.current.pop();
    lastest != undefined && setSudokuGrid(lastest);
  };

  /////////////////////셀 클릭 이벤트
  const cellClickEvent = (cell: SudokuCell) => {
    const { row, col, fixed, value, memo } = cell;
    setFocusCell(cell);

    if (fixed) { //고정값인 경우
      if (onMemo || onRemove) return;
      else {
        setActivatedNum(null);
        return;
      }
    }

    if (onRemove) {
      // "제거 모드인 경우"
      remove(row, col);
      return;
    }

    if (activatedNum === null) return;

    if (activatedNum === value) {
      // 똑같은 값이 들어가있는 경우 지우기

      remove(row, col);
    } else {
      // 새로운 값 입력
      historyRef.current.push(_.cloneDeep(sudokuGrid));

      setSudokuGrid((prevGrid:any) => {
        const newGrid: SudokuGrid = [...prevGrid]; // 복사하여 새로운 배열 생성

        if (onMemo) {
          // 메모 모드일경우
          if (memo.has(activatedNum)) {
            memo.delete(activatedNum);
            //메모에서 숫자 제거
            newGrid[row][col] = {
              ...newGrid[row][col],
              memo: memo,
            };
          } else {
            //메모에 숫자 추가
            newGrid[row][col] = {
              ...newGrid[row][col],
              memo: memo.add(activatedNum),
            };
          }
        } else {
          // 메모 모드 아닐 경우
          newGrid[row][col] = {
            ...newGrid[row][col],
            value: activatedNum,
          };

          //입력한 값 유효성 검사. 연관 그리드에 중복된 값이 있는지 체크.
          const duplicateCells: SudokuCell[] = checkDuplicateCell(
            newGrid,
            row,
            col,
            activatedNum
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
            activatedNum
          );

          duplicateCellsMemo.map(({ row, col, memo }) => {
            memo.delete(activatedNum);
            newGrid[row][col] = { ...newGrid[row][col], memo };
          });
        }

        // 해당 숫자가 9개 이상 입력된 경우 더이상 입력하지 못하도록 비활성화.
        checkFinished(newGrid);

        validate(newGrid);

        return newGrid;
      });
    }
  };

  const validate = (grid: SudokuGrid) => {
    // 현재 그리드를 검증한다. 중복값이 없고, 숫자가 모두 9개씩 입력되었으면 문제 없음 => 정답!
    let duplicateCnt = 0;
    let emptyCnt = 0;
    grid.map((row) => {
      row.map((cell) => {
        if (cell.duplicated) {
          duplicateCnt++;
        }
        if (cell.value < 1) {
          emptyCnt++;
        }
      });
    });
    console.log(`{ 중복 개수: ${duplicateCnt}, 비어있는 값: ${emptyCnt}}`);

    if (duplicateCnt === 0 && emptyCnt === 0) {
      //둘다 0 일 경우 정답!
      setFinishGame(true);
    } else return;
  };

  const remove = (row: number, col: number) => {
    // 숫자 지우기
    setSudokuGrid((prevGrid:any) => {
      const newGrid: SudokuGrid = [...prevGrid]; // 복사하여 새로운 배열 생성

      if (onMemo) {
        // 메모모드인 경우 메모에서 제거하기

        const newMemo = newGrid[row][col].memo;
        activatedNum && newMemo.delete(activatedNum);
        newGrid[row][col] = {
          ...newGrid[row][col],
          memo: newMemo,
        };
      } else {
        // 메모모드 아닌경우, 해당 셀을 비우기

        newGrid[row][col] = {
          ...newGrid[row][col],
          value: -1,
          duplicated: false,
        };

        if (activatedNum) {
          checkFinished(newGrid);
        }
      }

      return newGrid;
    });
  };

  const checkFinished = (newGrid: SudokuGrid) => {
    // 전체 그리드를 스캔하여 각 숫자 별 소진된 개수 카운트
    // 9개 이상일 경우 finished 리스트에 추가한 후 상태 업데이트.
    // number Panel에서 해당 숫자들을 비활성화하기 위함.

    const finishedList: Set<number> = new Set();
    for (let num = 1; num < 10; num++) {
      let cnt = 0;
      for (let i = 0; i < 9; i++) {
        for (let j = 0; j < 9; j++) {
          if (newGrid[i][j].value === num) cnt++;
        }
      }
      cnt >= 9 && finishedList.add(num);
    }

    setFinishedNum(finishedList);
  };
  const handleNumberBarClick = (num: number) => {
    setActivatedNum(num); // 현재 클릭한 숫자 "쓰기 모드" 활성화
    setFocusCell(initFocusCell);
  };
  const deselect= ()=>{
    setActivatedNum(null);
    setFocusCell(initFocusCell);
  }

  return (
    <main className="flex min-h-screen flex-col items-center justify-between bg-white dark:bg-slate-900 dark:text-white">
      <div className="pt-20 flex flex-col z-10 w-full max-w-5xl items-center justify-between font-mono text-sm lg:flex gap-5 pt-3">
        {/* 다크모드 토글*/}

        <label className="caret-transparent w-full flex justify-end inline-flex items-center cursor-pointer pe-2 space-x-2">
          {darkMode ? (
            <MdDarkMode className="text-black dark:text-white" />
          ) : (
            <MdSunny className="text-black dark:text-white" />
          )}

          <input
            type="checkbox"
            value=""
            className="sr-only peer"
            onChange={toggleDarkMode}
          />
          <div className="relative w-11 h-6 bg-gray-600 rounded-full dark:bg-gray-700  peer-checked:after:translate-x-full rtl:peer-checked:after:-translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-0.5 after:start-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-blue-500"></div>
        </label>
        <p>Welcome !</p>
        {/* Toolbar */}
        <div className="flex w-full justify-center space-x-1">
          {/* 다시 시작 버튼 */}
          <button className="btn" onClick={handleResetBtn}>
            <VscDebugRestart className="w-full h-full" />
          </button>
          {/* 실행취소 버튼*/}
          <button className="btn" onClick={undo}>
            <MdUndo className="w-full h-full" />
          </button>
        </div>
        <div className="grid ">
          {
          sudokuGrid !== null && sudokuGrid.map((row:any, rowIndex:number) => (
            <div key={rowIndex} className="grid grid-cols-9 ">
              {row.map((cell:any, colIndex:number) => (
                <Cell
                  key={colIndex}
                  {...{
                    rowIndex,
                    colIndex,
                    cell,
                    cellClickEvent,
                    onMemo,
                    activatedNum,
                    focusCell,
                  }}
                />
              ))}
            </div>
          ))}
        </div>
        <div className="flex w-full justify-center space-x-1">
        {/* 메모 모드 토글*/}
        <label className="caret-transparent w-full flex inline-flex justify-center items-center cursor-pointer pe-2 space-x-2">
            <MdEdit className="w-7 h-7 text-black dark:text-white" />
          <input
            type="checkbox"
            value=""
            className="sr-only peer "
            onChange={()=>{setOnMemo(!onMemo);deselect()}}
          />
          <div className="relative w-11 h-6 bg-gray-600 rounded-full dark:bg-gray-700  peer-checked:after:translate-x-full rtl:peer-checked:after:-translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-0.5 after:start-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-blue-500"></div>
        </label>
        {/* 제거모드 토글*/}
        <label className="caret-transparent w-full flex inline-flex justify-center items-center cursor-pointer pe-2 space-x-2">
            <MdDelete className="w-7 h-7 text-black dark:text-white" />

          <input
            type="checkbox"
            value=""
            className="sr-only peer"
            onChange={() => {
              deselect();
              setOnRemove((prevOnRemove) => !prevOnRemove);
              
            }}
          />
          <div className="relative w-11 h-6 bg-gray-600 rounded-full dark:bg-gray-700  peer-checked:after:translate-x-full rtl:peer-checked:after:-translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-0.5 after:start-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-blue-500"></div>
        </label>
          
        </div>
        {/* Number Bar*/}
        <div className="flex gap-0.5">
          {Array(9)
            .fill(null)
            .map((_: any, index: number) => (
              <button
                key={index}
                className={`caret-transparent w-auto h-auto px-2 text-center text-black dark:text-white text-2xl border border-black dark:border-slate-100 ${
                  activatedNum === index + 1
                    ? " bg-black text-white dark:bg-white dark:text-black"
                    : ""
                } 
              ${
                finishedNum.has(index + 1)
                  ? " bg-gray-500 dark:bg-gray-400"
                  : " hover:bg-slate-100 hover:text-black dark:hover:bg-slate-100 dark:hover:text-black"
              }`}
                onClick={() => {
                  handleNumberBarClick(index + 1);
                }}
                disabled={finishedNum.has(index + 1)}
              >
                {index + 1}
              </button>
            ))}
        </div>
      </div>
      {/* 로딩 화면 */}
      {loading && <Loading/>}
      {/* reset modal */}
      {showResetModal && <ResetModal {...{ setShowResetModal, reset }} />}
      {/* Finish modal */}
      {finishGame && <FinishModal />}
    </main>
  );
}
