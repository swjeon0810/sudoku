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
      <div className="place-self-center h-72 border rounded-lg shadow relative max-w-sm">
        <div className="flex justify-end p-2">
          <button
            type="button"
            className="text-gray-400 bg-transparent hover:bg-gray-200 hover:text-gray-900 rounded-lg text-sm p-1.5 ml-auto inline-flex items-center"
          >
            <svg
              className="w-5 h-5"
              fill="currentColor"
              viewBox="0 0 20 20"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                fillRule="evenodd"
                d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z"
                clipRule="evenodd"
              ></path>
            </svg>
          </button>
        </div>

        <div className="p-6 pt-0 text-center">
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
            className="text-gray-900 dark:text-white bg-white hover:bg-gray-100 focus:ring-4 focus:ring-cyan-200 border border-gray-200 font-medium inline-flex items-center rounded-lg text-base px-3 py-2.5 text-center"
            onClick={() => setShowResetModal(false)}
          >
            취소
          </a>
        </div>
      </div>
    </div>
  );
}
