import React from "react";

type NumberBarTypes = {
  index: number;
  selectedNum: number;
  handleNumberBarClick: any;
};

export default function NumberBar({
  index,
  selectedNum,
  handleNumberBarClick,
}: NumberBarTypes) {
  return (
    <button
      className={`w-auto h-auto px-2 text-center text-white text-2xl border ${
        selectedNum === index + 1 ? "bg-pink-600" : ""
      }`}
      onClick={() => handleNumberBarClick(index + 1)}
    >
      {index + 1}
    </button>
  );
}
