import React from "react";

const MintedValuesBar = ({weight}: {weight: number}) => {
  return (
    <div className="w-36 h-8 rounded-xl border-2 p-1 flex flex-row justify-between">
      <div className="flex flex-row first:pl-0 gap-1">
        {Array.from({length: weight}).map((_, index) => {
          return (
            <div
              key={index}
              className="w-2 h-full bg-gray-400 rounded-xl px-1"
            ></div>
          );
        })}
      </div>
      <div className="w-3 h-full rounded-xl px-1 font-bold pr-4">{weight}</div>
    </div>
  );
};

export default MintedValuesBar;
