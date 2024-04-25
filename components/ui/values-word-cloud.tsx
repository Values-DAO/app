"use client";
import React, {useEffect, useState} from "react";
import ReactWordcloud from "react-wordcloud";
interface Word {
  text: string;
  value: number;
}

export default function ValuesWordCloud() {
  const [words, setWords] = useState<Word[]>([]);
  const fetchWords = async () => {
    const response = await fetch("/api/value");
    const data = await response.json();
    if (data) {
      console.log(data);
      const words: Word[] = [];

      for (const key in data) {
        if (Object.prototype.hasOwnProperty.call(data, key)) {
          const text = key;
          const value = data[key].minters.length + 1;
          words.push({text, value});
        }
      }
      console.log(words);
      setWords(words);
    }
  };

  useEffect(() => {
    fetchWords();
  }, []);

  return (
    <div className="h-[250px] w-[96%] m-auto flex justify-center">
      <ReactWordcloud words={words} size={[600, 250]} minSize={"100px"} />
    </div>
  );
}
