import React from "react";
import ReactLoading from 'react-loading';

export default function Loading() {
  return (
    <div className="flex justify-center absolute z-10 h-screen w-full bg-white dark:bg-slate-900 bg-opacity-90">
      <div className="place-self-center">
        <ReactLoading type={"bubbles"} color="#0099ca" height={667} width={375} />
      </div>
    </div>
  );
}
