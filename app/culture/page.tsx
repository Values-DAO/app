import Image from "next/image";
import React from "react";

const CulturePage = () => {
  return (
    <div className="flex flex-col gap-8 items-center justify-center h-[80vh] my-auto flex-grow">
      <p className="text-5xl md:text-8xl">Coming Soon</p>
      <Image
        src="/200.gif"
        width={500}
        height={500}
        alt="Steve Jobs GIF"
        className="w-[95%] md:w-[800px]"
      />
      <iframe
        width="760"
        height="315"
        className="w-[95%] md:w-[800px] h-[250px] md:h-[400px]"
        src="https://www.youtube.com/embed/kGrVhM_Gi8k?si=JXazhz_LgmWJUGaS"
        title="YouTube video player"
        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
      ></iframe>
    </div>
  );
};

export default CulturePage;
