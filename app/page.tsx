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
import { checkDuplicateCell, checkDuplicateMemo } from "./lib/checkDuplicate";

export default function Home() {

  const historyRef = useRef<SudokuGrid[]>([]); // 그리드 기록을 저장해둠
  const initFocusCell = { row: -1, col: -1, value: -1, subgrid: -1 };
  const [sudokuGrid, setSudokuGrid] = useState<any>(null);
  const [focusCell, setFocusCell] = useState(initFocusCell); // 포커스된 셀
  const [showResetModal, setShowResetModal] = useState(false);
  const [activatedNum, setActivatedNum] = useState<number | null>(null);
  const [finishedNum, setFinishedNum] = useState<Set<number>>(new Set());
  const [finishGame, setFinishGame] = useState(false); // 게임 완료 여부
  const [darkMode, setDarkMode] = useState(false); // 다크모드 여부
  const [loading, setLoading] = useState(true); // 스도쿠를 세팅하는 동안 로딩화면 여부
  const [state, setState] = useState("none") // none, memo, delete

  useEffect(() => {
    if (darkMode) {
      document.documentElement.classList.add("dark");
    } else {
      document.documentElement.classList.remove("dark");
    }
  }, [darkMode]);

  const fetchSudoku = async (option:string) => {
    setLoading(true);
    let newData;
    
    if (option === "reset"){ // 재시작일 경우 reset
    
      const sessionData = sessionStorage.getItem("thisGame")
      if(sessionData){
        const parsed = JSON.parse(sessionData)
        newData = parsed.medium
      }
    
    } else if (option === "new"){ // 새 게임일 경우 new
      
      try {
        const response = await fetch('/api/sudoku'); // API 를 통해 새로운 게임 데이터를 받아와서 그리드에 세팅.
        const data = await response.json();
        newData = data.medium
        sessionStorage.setItem("thisGame", JSON.stringify(data))

      } catch (error) {
        console.error('Error fetching sudoku:', error);
      }
    }

    const grid: SudokuGrid = [];

    for (let row = 0; row < 9; row++) {
      const currentRow: SudokuCell[] = [];
      for (let col = 0; col < 9; col++) {
        let newValue = newData[row][col]
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
    
  };

  useEffect(() => {
    fetchSudoku("new");
  }, []);

  const toggleDarkMode = () => {
    setDarkMode((prevMode) => !prevMode);
  };

  const handleResetBtn = () => { // 재시작 이벤트
    setShowResetModal(true);
  };

  const initGame = (tag: string) => {
    tag==="new"? fetchSudoku("new"):fetchSudoku("reset")
    setFinishedNum(new Set())
    setFocusCell(initFocusCell); // 셀 선택 해제
    setActivatedNum(null);
    historyRef.current = []; // 기록 지우기
  }

  const undo = () => {
    // 실행 취소 이벤트
    setFocusCell(initFocusCell); // 셀 선택 해제
    const lastest = historyRef.current.pop();
    if (lastest != undefined){
      setSudokuGrid(lastest);
      checkFinishedNumber(lastest)
    }  
  };

  /////////////////////셀 클릭 이벤트
  const cellClickEvent = (cell:SudokuCell)=>{
    const { row, col, fixed, value, memo, duplicated } = cell;

    if (fixed){ 
      if (activatedNum !== null) return // 고정값인데 활성 숫자가 있는 경우 그냥 리턴
      else {
        setFocusCell(cell);             // 고정값인데 활성 숫자가 없는 경우 경우 
        return;
      }
    }

    // 고정값이 아닌 경우
    setFocusCell(cell);

    // 2. 어떤 모드인지에 따라 나눈다.
    switch (state) {

      case 'delete':

        deleteEvent(row, col);
        return;

      case 'memo':

        if (activatedNum === null){  
          return; // 활성화 숫자 없을 경우 리턴
        
        } else { // 활성화된 숫자가 존재할경우 메모하기
          
          // 새로운 값 입력
          historyRef.current.push(_.cloneDeep(sudokuGrid));

          setSudokuGrid((prevGrid:any) => {
            const newGrid: SudokuGrid = [...prevGrid]; // 복사하여 새로운 배열 생성

            if (memo.has(activatedNum)) { // 이미 숫자가 메모되어 있는 경우는 제거
              memo.delete(activatedNum);
              newGrid[row][col] = {
                ...newGrid[row][col],
                memo: memo,
              };
            } else { //메모에 숫자 추가
              newGrid[row][col] = {
                ...newGrid[row][col],
                memo: memo.add(activatedNum),
              };
            }
            return newGrid;
          });
        }
        return;

      case 'none':

        if (activatedNum === null){  
          return; // 활성화 숫자 없을 경우 리턴

        } else{
            // 새로운 값 입력
            historyRef.current.push(_.cloneDeep(sudokuGrid));
      
            setSudokuGrid((prevGrid:any) => {
                const newGrid: SudokuGrid = [...prevGrid]; // 복사하여 새로운 배열 생성

                const newValue = activatedNum === value ? -1 : activatedNum; // 입력하려는 값(activatedNum)이 기존 값(value)과 같으면 지우기

                newGrid[row][col] = {
                  ...newGrid[row][col],
                  value: newValue,
                  duplicated: newValue === -1? false : duplicated,
                  memo: new Set<number>()
                };
      
                //입력한 값 유효성 검사. 연관 그리드에 중복된 값이 있는지 체크.
                const duplicateCells: SudokuCell[] = checkDuplicateCell(
                  newGrid,
                  row,
                  col,
                  activatedNum
                );
      
                if (duplicateCells.length > 1 && newValue !== -1) {
                  // 중복되는 셀이 하나인 경우는 자기 자신이므로 넘긴다.
                  // 여러 개인 경우 duplicated 표시함.
                  newGrid[row][col] = { ...newGrid[row][col], duplicated: true };

                }else{ // 중복셀이 없는 경우 다시 duplicated 를 false로 변경
                  newGrid[row][col] = { ...newGrid[row][col], duplicated: false };
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
      
              // 해당 숫자가 9개 이상 입력된 경우 더이상 입력하지 못하도록 비활성화.
              const finishedList = checkFinishedNumber(newGrid);
              finishedList.has(activatedNum) && setActivatedNum(null)
      
              validate(newGrid);
      
              return newGrid;
            });
          }

        return

      default :
        return;
    }
  }

  const deleteEvent = (row: number, col: number) => {

     // 메모든 값이 있든 싹다 지우기
    setSudokuGrid((prevGrid:any) => {
      const newGrid: SudokuGrid = [...prevGrid]; // 복사하여 새로운 배열 생성

      newGrid[row][col] = {
        ...newGrid[row][col],
        value: -1,                // 값을 0? -1 ?
        duplicated: false,        // 값이 없으므로 중복여부 해제
        memo: new Set<number>(), // 메모 초기화
      };
      checkFinishedNumber(newGrid);

      return newGrid;
    });
  }

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

  const checkFinishedNumber = (newGrid: SudokuGrid) => {
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
    return finishedList
  };

  const handleNumberBarClick = (num: number) => {
    if (state === "delete") setState("none");
    setActivatedNum(num); // 현재 클릭한 숫자 "쓰기 모드" 활성화
    setFocusCell(initFocusCell);
  };

  const deselect= ()=>{
    setFocusCell(initFocusCell);
  }

  return (
    <main className="w-full h-full flex items-center justify-center text-black dark:text-white overflow-hidden">
      
      <div className="my-3 w-full h-full flex-col z-10 items-center justify-center gap-3 md:w-1/2 lg:3/4">
        
        <div className="w-full h-auto">
              {/* 다크모드 토글*/}
              <label className="caret-transparent w-full flex justify-end inline-flex items-center cursor-pointer pe-2 space-x-2">
                {darkMode ? (
                  <MdDarkMode />
                ) : (
                  <MdSunny  />
                )}

                <input
                  type="checkbox"
                  value=""
                  className="sr-only peer"
                  onChange={toggleDarkMode}
                />
                <div className="relative w-11 h-6 bg-gray-600 rounded-lg dark:bg-gray-700  peer-checked:after:translate-x-full rtl:peer-checked:after:-translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-0.5 after:start-[2px] after:bg-white after:border-gray-300 after:border after:rounded-lg after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-blue-500"></div>
              </label>
        </div>

        {/* 타이틀 */}
        <h1 className="my-5 font-serif dark:text-pink-200 w-full text-center font-bold tracking-widest text-lg ">Happy SUDOKU</h1>
       
        {/* content  */}
        <div className="flex flex-col w-full px-2 gap-3">
                {/* Toolbar */}
                <div className="flex space-x-1">
                    {/* 새 게임 버튼 */}
                    <button className="space-x-1 text-black dark:text-white bg-slate-100 dark:bg-slate-900 pointer-events-auto active:bg-pink-300 dark:active:bg-pink-300 md:hover:bg-pink-300 dark:md:hover:bg-pink-300 dark:md:hover:text-black py-1 w-full flex inline-flex justify-center items-center cursor-pointer border rounded-lg" onClick={()=>initGame("new")}>
                      <p className="font-bold tracking-widest">새게임</p>
                    </button>
                    {/* 재시작 버튼 */}
                    <button className="space-x-1 text-black dark:text-white bg-slate-100 dark:bg-slate-900 hover:bg-green-300 dark:hover:bg-green-300 dark:hover:text-black py-1 w-full flex inline-flex justify-center items-center cursor-pointer border rounded-lg" onClick={handleResetBtn}>
                      <VscDebugRestart className="w-7 h-7" />
                      <p className="font-bold tracking-widest">재시작</p>
                    </button>
                    {/* 실행취소 버튼*/}
                    <button className="space-x-1 text-black dark:text-white bg-slate-100 dark:bg-slate-900 active:bg-pink-300 md:hover:bg-pink-300 dark:active:bg-pink-300 dark:md:hover:bg-pink-300 dark:md:hover:text-black py-1 w-full flex inline-flex justify-center items-center cursor-pointer border rounded-lg" onClick={undo}>
                      <MdUndo className="w-7 h-7" />
                      <p className="font-bold tracking-widest">뒤로가기</p>
                    </button>
                </div>
                <div className="flex w-full justify-center">
                  {loading ? 
                        <div className="grid grid-cols-9 grid-rows-9 w-fit">
                          {Array(81)
                            .fill(0)
                            .map((_, index) => (
                              <div key={index} className="bg-slate-400 dark:bg-slate-600 border border-white bg-opacity-50 dark:bg-opacity-80 dark:border-blue-100 animate-pulse w-10 h-10 sm:w-12 sm:h-12 "></div>
                            ))}
                        </div>
                        :
                        <div className="grid w-fit ">
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
                                    state,
                                    activatedNum,
                                    focusCell,
                                  }}
                                />
                              ))}
                            </div>
                          ))}
                        </div>
                        }
                </div>

                {/* Number Bar*/}
                <div className="flex w-full justify-center space-x-1">
                  {Array(9)
                    .fill(null)
                    .map((_: any, index: number) => (
                      <button
                        key={index}
                        className={` caret-transparent w-10 h-10 sm:w-12 sm:h-12 px-2 text-center  text-2xl border border-black dark:border-slate-100 ${
                          activatedNum === index + 1
                            && " bg-black text-white dark:bg-white dark:text-black"
                        } 
                      ${
                        finishedNum.has(index + 1)
                          ? " bg-gray-500 dark:bg-gray-400 text-black " : "dark:hover:bg-slate-100 dark:hover:text-black hover:bg-black hover:text-white"
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
              <div className="flex w-full space-x-2">
                {/* 메모 버튼*/}
                <button className={`${state==="memo"? "bg-green-300 dark:bg-green-300 text-black dark:text-black": "bg-slate-100 dark:bg-slate-900 text-black dark:text-white "} space-x-1 md:hover:bg-green-300 dark:md:hover:bg-green-300 hover:text-black dark:md:hover:text-black py-1 w-full flex inline-flex justify-center items-center cursor-pointer border rounded-lg`}
                  onClick={()=>{deselect();state==="memo"?setState("none"):setState("memo")}}>
                  <MdEdit className="w-7 h-7 " />
                  <p className="font-bold tracking-widest">메모하기</p>
                </button>
                {/* 지우기 버튼*/}
                <button className={`${state==="delete"? "bg-green-300 dark:bg-green-300 text-black dark:text-black ": "bg-slate-100 dark:bg-slate-900 text-black dark:text-white "} space-x-1 md:hover:bg-green-300 dark:md:hover:bg-green-300 hover:text-black dark:md:hover:text-black py-1 w-full flex inline-flex justify-center items-center cursor-pointer border rounded-lg`}
                  onClick={()=>{deselect();state==="delete"?setState("none"):setState("delete")}}>
                  <MdDelete className="w-7 h-7 " />
                  <p className="font-bold tracking-widest">지우기</p>
                </button>
              </div>
      </div>
      </div>
      
      {/* reset modal */}
      {showResetModal && <ResetModal {...{ setShowResetModal, initGame }} />}
      {/* Finish modal */}
      {finishGame && <FinishModal {...{ setFinishGame, initGame }}/>}
    </main>
  );
}
