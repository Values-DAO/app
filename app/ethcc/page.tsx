import {Button} from "@/components/ui/button";
import React from "react";

const Ethcc = () => {
  return (
    <div className="p-4  text-center flex flex-col justify-center gap-2">
      {" "}
      <p className="text-xl font-bold mb-4">
        Meeting Value-aligned folks at ETHCC
      </p>{" "}
      <span className="text-blue-500 text-lg font-semibold mt-8">Why?</span>
      <p>
        Meeting value aligned people who you can vibe with and build meaningful
        relationships{" "}
      </p>
      <span className="text-blue-500 text-lg font-semibold mt-8">How?</span>
      <div className="">
        <p className="text-lg font-semibold">1. Mint your values</p>
        <span>
          We fetch all your casts and run them through our AI model to analyze
          your values.{" "}
        </span>
      </div>
      <div>
        <p className="text-lg font-semibold">2. Share the Frame in warpcast</p>
        <span>
          We ask you to share this frame so we can find you the top 3 aligned
          folks who will be at ETHCC.{" "}
        </span>
      </div>
      <div>
        <p className="text-lg font-semibold">
          3. Receive a direct cast with 3 aligned folks that you should meet
        </p>
        <span>
          In a few days, we will send you 3 folks who are attending ETHCC and
          whom you should definitely meet.{" "}
        </span>
      </div>
      <p className="text-primary text-lg font-semibold mt-8">
        {" "}
        Learn more about ValuesDAO{" "}
      </p>
      <Button
        asChild
        className="mx-auto text-center flex justify-center align-center" // Center the button horizontally
      >
        <a
          href="https://talented-debt-219.notion.site/ValuesDAO-eb486194b2bb44ad8b3f264c6e101974"
          target="_blank"
          className="text-center"
        >
          Click here
        </a>
      </Button>
    </div>
  );
};

export default Ethcc;
