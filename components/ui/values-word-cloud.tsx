"use client";
import {useUserContext} from "@/providers/user-context-provider";
import axios from "axios";

import React, {useEffect, useState} from "react";
import ReactWordcloud from "react-wordcloud";
interface Word {
  text: string;
  value: number;
}
interface WordCloudProps {
  refresh: any;
}
const ValuesWordCloud: React.FC<WordCloudProps> = ({refresh}) => {
  const [words, setWords] = useState<Word[]>([]);
  const {userInfo} = useUserContext();
  const fetchWords = async () => {
    const {data} = await axios.get("/api/v2/value?withCount=true", {
      headers: {
        "Content-Type": "application/json",
        "x-api-key": process.env.NEXT_PUBLIC_NEXT_API_KEY as string,
      },
    });
    const words = data.values.map((value: any) => ({
      text: value.name,
      value: value.timesMinted,
    }));
    setWords(words);
  };

  useEffect(() => {
    fetchWords();
  }, [refresh, userInfo]);

  return (
    <div className="h-[250px] w-[96%] m-auto flex justify-center">
      <ReactWordcloud words={words} />
    </div>
  );
};
export default ValuesWordCloud;
