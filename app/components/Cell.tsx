import React from "react";
import { IoCloseOutline } from "react-icons/io5";
import { SudokuCell } from "../lib/type";

type CellType = {
  rowIndex: number;
  colIndex: number;
  cell: SudokuCell;
  cellClickEvent: any;
  state: string;
  activatedNum: number | null;
  focusCell: { row: number; col: number; value: number; subgrid: number };
};
export default function Cell({
  rowIndex,
  colIndex,
  cell,
  cellClickEvent,
  state,
  activatedNum,
  focusCell,
}: CellType) {
  const { row, col, value, subgrid, fixed, memo } = cell;

  return (
    <div className="relative" onClick={() => cellClickEvent(cell)}>
      {/* 틀렸을 때 엑스자 */}
      {cell.duplicated && !cell.fixed && (
        <IoCloseOutline className="absolute z-10 w-10 h-10 sm:w-12 sm:h-12 text-red-700 " />
      )}
      {/* 메모 모드 */}
      <div className="flex items-center grid grid-cols-3 grid-rows-3 absolute w-10 h-10 sm:w-12 sm:h-12 text-gray-200 text-center p-0.5 cursor-pointer">
        {Array(9)
          .fill(0)
          .map((_: any, index: number) => (
            <p
              key={index}
              className={`caret-transparent text-[9px] p-0 m-0 font-black text-black dark:text-white ${
                state==="memo"
                  ? " text-opacity-100"
                  : " text-opacity-50"
              }`}
            >
              {memo.has(index + 1) && index + 1}
            </p>
          ))}
      </div>
      {/* 숫자 */}
      <input
        type="text"
        className={`caret-transparent w-10 h-10 sm:w-12 sm:h-12 border font-bold border-white bg-opacity-60 dark:bg-opacity-80 dark:border-blue-100 text-center text-3xl sm:text-4xl cursor-pointer 
 
          ${ /* 2, 5번째 열 오른쪽 테두리 */ (colIndex === 2 || colIndex === 5) && " border-r-2 "} 
          ${ /* 2, 5번째 행 아래 테두리 */  (rowIndex === 2 || rowIndex === 5) && " border-b-2 "}
          ${ /* 고정값인 경우 텍스트 색상 */ fixed ? " text-black dark:text-white " : " text-blue-800 dark:text-sky-400"}
          ${
            value === activatedNum ||
            (activatedNum && memo.has(activatedNum))
              ? " bg-purple-400 dark:bg-purple-500 "
              : (row === focusCell?.row ||
                col === focusCell?.col ||
                subgrid === focusCell?.subgrid ) && state!=="memo"
              ? " bg-rose-200 dark:bg-rose-900 "
              : [1, 3, 5, 7].includes(subgrid)
              ? " bg-slate-400 dark:bg-slate-600 "
              : " dark:bg-slate-950 bg-slate-100" 
          }
          
        `}
        value={cell.value > 0 ? cell.value : ""}
        readOnly
        
      />
    </div>
  );
}
