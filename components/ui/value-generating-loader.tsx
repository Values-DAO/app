import React, {useEffect, useState} from "react";

const ValueGeneratingLoader = () => {
  const [loaderText, setLoaderText] = useState("Analyzing your values");

  const loaderTexts: string[] = [
    "Analyzing your social content...",
    "Extracting values from your interactions...",
    "Gleaning insights from your digital footprint...",
    "Mapping your social values...",
    "Interpreting the essence of your online presence...",
  ];

  useEffect(() => {
    const intervalId = setInterval(() => {
      setLoaderText((prevText) => {
        const currentIndex = loaderTexts.indexOf(prevText);
        const nextIndex = (currentIndex + 1) % loaderTexts.length;
        return loaderTexts[nextIndex];
      });
    }, 2000); // Change text every 2 seconds

    return () => clearInterval(intervalId); // Cleanup interval on component unmount
  }, []);
  return (
    <h2 className="w-full scroll-m-20 border-b pb-2 text-xl font-semibold tracking-tight first:mt-0 max-w-5xl text-muted-foreground text-center">
      {loaderText}
    </h2>
  );
};

export default ValueGeneratingLoader;
