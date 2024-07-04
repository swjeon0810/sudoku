"use client";
import { useState } from "react";

type SudokuGridType = {
  index: number;
  values: Array<number>;
};
const SudokuGrid = ({ index, values }: SudokuGridType) => {
  // grid: 몇번째 그리드에 속하는지.
  const buttons = Array(9).fill(null);
  const handleClick = (cellIndex: number) => {
    console.log(`${index} - ${cellIndex}`);
  };
  return (
    <div className="grid grid-cols-3">
      {buttons.map((_: any, index: number) => (
        <button
          key={index}
          className="w-10 h-10 border bg-opacity-0 bg-white text-center text-xl"
          onClick={() => handleClick(index)}
        >
          {values[index] !== 0 ? values[index] : ""}
        </button>
      ))}
    </div>
  );
};

export default function Home() {
  const [selectedNum, setSelectedNum] = useState(-1);
  const example = [
    [0, 3, 0, 2, 7, 6, 9, 0, 0],
    [0, 6, 2, 8, 1, 5, 0, 3, 0],
    [0, 7, 0, 0, 0, 9, 2, 5, 0],
    [0, 0, 0, 8, 0, 7, 0, 2, 4],
    [5, 8, 0, 0, 0, 0, 0, 0, 0],
    [0, 0, 7, 9, 0, 0, 0, 0, 0],
    [0, 4, 9, 6, 1, 0, 0, 0, 8],
    [6, 0, 0, 7, 4, 0, 2, 9, 0],
    [1, 3, 0, 5, 0, 0, 0, 6, 4],
  ];

  return (
    <main className="flex min-h-screen flex-col items-center justify-between p-24">
      <div className="flex flex-col z-10 w-full max-w-5xl items-center justify-between font-mono text-sm lg:flex border gap-5 py-10">
        <p>Welcome !</p>
        <div className="grid grid-cols-3 gap-x-1 gap-y-1">
          {Array(9)
            .fill(null)
            .map((_: any, index: number) => (
              <SudokuGrid key={index} index={index} values={example[index]} />
            ))}
        </div>
        <div className="flex gap-0.5">
          {Array(9)
            .fill(null)
            .map((_: any, index: number) => (
              <button
                key={index}
                className={`w-10 h-10 text-center text-white text-2xl border ${
                  selectedNum === index ? "bg-pink-600" : ""
                }`}
                onClick={() => setSelectedNum(index)}
              >
                {index + 1}
              </button>
            ))}
        </div>
      </div>
    </main>
  );
}
