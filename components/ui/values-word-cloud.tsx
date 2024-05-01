"use client";
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
  const fetchWords = async () => {
    const response = await fetch("/api/value", {
      headers: {
        "Content-Type": "application/json",
        "x-api-key": process.env.NEXT_PUBLIC_NEXT_API_KEY as string,
      },
    });
    const data = await response.json();
    if (data) {
      const words: Word[] = [];

      for (const key in data) {
        if (Object.prototype.hasOwnProperty.call(data, key)) {
          const text = key;
          const value = data[key].minters.length + 1;
          words.push({text, value});
        }
      }

      setWords(words);
    }
  };

  useEffect(() => {
    fetchWords();
  }, [refresh]);

  return (
    <div className="h-[250px] w-[96%] m-auto flex justify-center">
      <ReactWordcloud words={words} />
    </div>
  );
};
export default ValuesWordCloud;
