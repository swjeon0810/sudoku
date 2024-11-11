import React from "react";
import { FaRegSmileWink } from "react-icons/fa";

type FinishModalType = {
  setFinishGame: any;
  initGame: any;
};

export default function FinishModal({
  setFinishGame,
  initGame,
}: FinishModalType) {
  return (
    <div className="flex justify-center absolute z-10 h-screen w-full dark:bg-slate-900 bg-slate-900 bg-opacity-50">
      <div className="place-self-center px-10 py-5 content-center border rounded-lg shadow relative max-w-sm bg-white">
          <div className="flex w-full justify-center">
            <FaRegSmileWink className="w-14 h-14"/>
          </div>
          <h3 className="w-full text-center text-lg font-normal text-black dark:text-white mt-5">
            축하합니다! 
          </h3>
          <h4 className="w-full text-center text-lg font-normal text-black dark:text-white mb-6">
            새로운 게임을 시작할까요? 
          </h4>
          <div className="flex justify-center">
          <a
            href="#"
            className="text-white bg-red-600 hover:bg-red-800 focus:ring-4 focus:ring-red-300 font-medium rounded-lg text-base inline-flex items-center px-3 py-2.5 text-center mr-2"
            onClick={() => {
              setFinishGame(false);
              initGame("new");}}
          >
            예
          </a>
          <a
            href="#"
            className="text-gray-900 bg-white hover:bg-gray-100 focus:ring-4 focus:ring-cyan-200 border border-gray-200 font-medium inline-flex items-center rounded-lg text-base px-3 py-2.5 text-center"
              onClick={()=> setFinishGame(false)}
          >
            취소
          </a>
          </div>
        </div>
    </div>
  );
}
