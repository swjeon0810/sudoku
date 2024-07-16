import React, { memo } from "react";
import { IoCloseOutline } from "react-icons/io5";
import { SudokuCell } from "../lib/type";

type CellType = {
  rowIndex: number;
  colIndex: number;
  cell: SudokuCell;
  cellClickEvent: any;
  onMemo: boolean;
  inputNum: number | null;
  focusCell: { row: number; col: number; value: number; subgrid: number };
};
export default function Cell({
  rowIndex,
  colIndex,
  cell,
  cellClickEvent,
  onMemo,
  inputNum,
  focusCell,
}: CellType) {
  const { row, col, value, subgrid, duplicated, memo } = cell;

  return (
    <div className="relative" onClick={() => cellClickEvent(cell)}>
      {/* 틀렸을 때 엑스자 */}
      {cell.duplicated && !cell.fixed && (
        <IoCloseOutline className="absolute z-10 w-8 h-8 text-red-700 sm:w-10 sm:h-10 " />
      )}
      {/* 메모 모드 */}
      <div className="flex items-center grid grid-cols-3 grid-rows-3 absolute w-8 h-8 text-gray-300 sm:w-10 sm:h-10 text-center p-0.5 cursor-pointer">
        {Array(9)
          .fill(0)
          .map((_: any, index: number) => (
            <p
              key={index}
              className={`text-[9px] p-0 m-0 ${
                onMemo ? "text-red-200" : "text-white text-opacity-50"
              }`}
            >
              {memo.has(index + 1) && index + 1}
            </p>
          ))}
      </div>
      {/* 숫자 */}
      <input
        type="text"
        className={`font-bold w-8 h-8 sm:w-10 sm:h-10 border border-black dark:border-gray-300 text-center text-xl cursor-pointer ${
          (colIndex === 2 || colIndex === 5) && " border-r-4 "
        } ${(rowIndex === 2 || rowIndex === 5) && " border-b-4 "}
        
          ${
            value === inputNum ||
            (row == focusCell?.row && col == focusCell.col) ||
            (inputNum && memo.has(inputNum))
              ? " bg-orange-600 "
              : row === focusCell?.row ||
                col === focusCell?.col ||
                subgrid === focusCell?.subgrid
              ? " bg-orange-100 dark:bg-orange-700 "
              : [1, 3, 5, 7].includes(subgrid)
              ? " bg-slate-200 dark:bg-slate-800 "
              : " dark:bg-slate-950 bg-white"
          }
          ${
            onMemo
              ? " text-black dark:text-white text-opacity-60 "
              : value === focusCell?.value
              ? " text-blue-500 dark:text-blue-500 "
              : " dark:text-white text-black"
          }
        `}
        value={cell.value > 0 ? cell.value : ""}
        readOnly
      />
    </div>
  );
}
