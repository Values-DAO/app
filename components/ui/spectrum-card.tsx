import React from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {MoveUp, Twitter} from "lucide-react";

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
        <CardTitle className="flex flex-row justify-between mb-4">
          <span className="text-xl">{name}</span>
          {/* <div className="flex flex-col md:flex-row gap-2">
            <Button
              className="flex flex-row px-2"
              variant={"secondary"}
              asChild
            >
              <Link
                href={`https://warpcast.com/~/compose?text=I%20just%20generated%20my%20Value%20Spectrums%20on%20ValuesDAO&embeds[]=${
                  process.env.NEXT_PUBLIC_HOST
                }/api/image/?name=${name.replaceAll(
                  " ",
                  "%20"
                )}&score=${score}&description=${description.replaceAll(
                  " ",
                  "%20"
                )}`}
                target="_blank"
              >
                <Image
                  src="/white-purple.png"
                  width={20}
                  height={20}
                  alt="farcaster"
                />
              </Link>
            </Button>
            <Button
              className="flex flex-row px-2"
              variant={"secondary"}
              asChild
            >
              <Link
                href="https://twitter.com/intent/tweet?url=https%3A%2F%2Fapp.valuesdao.io%2F&text=I%20just%20generated%20my%20Value%20Spectrums%20on%20ValuesDAO."
                target="_blank"
              >
                <Twitter strokeWidth={0} fill="#1DA1F2" className="h-6 w-6" />
              </Link>
            </Button>
          </div> */}
        </CardTitle>
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
