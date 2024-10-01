import React from "react";
import {Card, CardContent, CardHeader, CardTitle} from "@/components/ui/card";
import {MoveUp} from "lucide-react";
import {Badge} from "./badge";

const SpectrumCard = ({
  name,
  score,
  description,
  scoreOfViewer,
}: {
  name: string;
  score: number;
  description: string;
  scoreOfViewer?: number;
}) => {
  const spectrumScore = 100 - score;

  return (
    <Card className="p-1 flex flex-col justify-between">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 mb-4">
          <span className="text-xl">{name}</span>{" "}
        </CardTitle>
        {/* <CardDescription>{description}</CardDescription> */}
      </CardHeader>
      <CardContent>
        <div className="flex flex-row justify-between my-1">
          <span className="font-semibold text-muted-foreground">
            {name.split(" vs ")[0]}
          </span>
          <span className="font-semibold text-muted-foreground">
            {name.split(" vs ")[1]}
          </span>
        </div>

        <div className="relative w-full h-[20px] border-2 rounded-md bg-gray-100">
          <div
            className={`absolute min-w-[8px] w-[8px] h-full border-black bg-primary top-0`}
            style={{left: `${spectrumScore}%`}}
          ></div>
          {scoreOfViewer && (
            <div
              className={`absolute min-w-[8px] w-[8px] h-full border-black bg-green-400 top-0`}
              style={{left: `${100 - scoreOfViewer}%`}}
            ></div>
          )}

          {scoreOfViewer && scoreOfViewer === score && (
            <div
              className={`absolute min-w-[8px] w-[8px] h-full border-black bg-blue-400 top-0`}
              style={{left: `${100 - scoreOfViewer}%`}}
            ></div>
          )}
        </div>

        <div className="mt-1 w-full h-[20px] flex flex-row justify-between">
          <div className="flex flex-col h-12 items-start">
            <MoveUp size={"12px"} className="text-left text-primary" />
            <span className="text-right"> 1</span>
          </div>{" "}
          <div className="flex flex-col h-12 items-center">
            <MoveUp size={"12px"} className="text-center text-primary" />
            <span className="text-right"> 50</span>
          </div>
          <div className="flex flex-col h-12 items-end">
            <MoveUp size={"12px"} className="text-right text-primary" />
            <span className="text-right"> 100</span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default SpectrumCard;
