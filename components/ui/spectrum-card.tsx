import React from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {Progress} from "@/components/ui/progress";

const SpectrumCard = ({
  name,
  score,
  description,
}: {
  name: string;
  score: number;
  description: string;
}) => {
  const spectrumScore = 100 - score;

  return (
    <Card className="p-1 flex flex-col justify-between">
      <CardHeader>
        <CardTitle>{name}</CardTitle>
        <CardDescription>{description}</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="flex flex-row justify-between my-1">
          <span className="font-semibold">{name.split(" vs ")[0]}</span>
          <span className="font-semibold">{name.split(" vs ")[1]}</span>
        </div>

        <div className="relative w-full h-[20px] border-2 rounded-md bg-gray-100">
          <div
            className={`absolute min-w-[10px] w-[10px] h-4 border-[0.5px] border-black bg-primary top-0`}
            style={{left: `${spectrumScore}%`}}
          ></div>
        </div>
      </CardContent>
    </Card>
  );
};

export default SpectrumCard;
