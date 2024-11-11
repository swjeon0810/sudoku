import React from "react";
type ResetModalType = {
  setShowResetModal: any;
  initGame: any;
};
export default function ResetModal({
  setShowResetModal,
  initGame,
}: ResetModalType) {
  return (
    <div className="flex justify-center absolute z-10 h-screen w-full bg-white dark:bg-slate-900 bg-opacity-90">
      <div className="px-10 py-5 place-self-center content-center border rounded-lg shadow relative max-w-sm">
          <svg
            className="w-16 h-16 text-red-600 mx-auto"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth="2"
              d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
            ></path>
          </svg>
          <h3 className="text-lg font-normal text-black dark:text-gray-300 mt-5 mb-6">
            게임을 다시 시작할까요?
          </h3>
          <div className="flex justify-center">
          <a
            href="#"
            className="text-black dark:text-white bg-red-600 hover:bg-red-800 focus:ring-4 focus:ring-red-300 font-medium rounded-lg text-base inline-flex items-center px-3 py-2.5 text-center mr-2"
            onClick={() => {
              setShowResetModal(false);
              initGame("reset");
            }}
          >
            예
          </a>
          <a
            href="#"
            className="text-gray-900 dark:text-black bg-white hover:bg-gray-100 focus:ring-4 focus:ring-cyan-200 border border-gray-200 font-medium inline-flex items-center rounded-lg text-base px-3 py-2.5 text-center"
            onClick={() => setShowResetModal(false)}
          >
            취소
          </a>
          </div>
        </div>
    </div>
  );
}
