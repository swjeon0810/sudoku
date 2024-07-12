import React, { memo } from "react";
import { IoCloseOutline } from "react-icons/io5";
import { SudokuCell } from "../page";
import classNames from "classnames";

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
  const cellClassName = () => {
    return classNames(
      "w-8 h-8 sm:w-10 sm:h-10 border text-center text-xl cursor-pointer ",
      {
        "bg-pink-600": value === inputNum,
        "bg-pink-700": inputNum && memo.has(inputNum),
        "bg-slate-950": value !== inputNum && !(inputNum && memo.has(inputNum)),
        "bg-pink-900":
          focusCell?.row === row ||
          focusCell?.col === col ||
          focusCell?.subgrid === subgrid,
        "border-r-4": colIndex === 2 || colIndex === 5,
        "border-b-4": rowIndex === 2 || rowIndex === 5,
        "border-pink-300 border-4":
          row == focusCell?.row && col == focusCell.col,

        "text-pink-400": value === focusCell?.value,
        "text-yellow-200": duplicated,
        "text-white text-opacity-60": onMemo,
      }
    );
  };

  return (
    <div className="relative" onClick={() => cellClickEvent(cell)}>
      {/* 틀렸을 때 엑스자 */}
      {cell.duplicated && !cell.fixed && (
        <IoCloseOutline className="absolute w-8 h-8 text-red-500 sm:w-10 sm:h-10 " />
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
        className={cellClassName()}
        value={cell.value > 0 ? cell.value : ""}
        readOnly
      />
    </div>
  );
}
