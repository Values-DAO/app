"use client";
import React, {useEffect, useState} from "react";
import useValuesHook from "@/hooks/useValuesHook";
import ReactWordcloud from "react-wordcloud";
import {useUserContext} from "@/providers/user-context-provider";
interface Word {
  text: string;
  value: number;
}

const ValuesWordCloud = () => {
  const [words, setWords] = useState<Word[]>([]);
  const {getAllValues} = useValuesHook();
  const {userInfo} = useUserContext();
  const fetchWords = async () => {
    const data = await getAllValues();
    const words = data.map((value) => ({
      text: value.name,
      value: value.mintersCount,
    }));

    setWords(words);
  };

  useEffect(() => {
    fetchWords();
  }, [userInfo]);

  return (
    <div className="h-[250px] w-[96%] m-auto flex justify-center">
      <ReactWordcloud words={words} />
    </div>
  );
};
export default ValuesWordCloud;
