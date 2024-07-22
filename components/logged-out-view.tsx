import React from "react";
import {Card, CardDescription, CardTitle} from "./ui/card";
import {Button} from "./ui/button";
import {usePrivy} from "@privy-io/react-auth";

const LoggedOutView = () => {
  const {ready, login, authenticated} = usePrivy();
  return (
    <>
      {authenticated ? (
        <></>
      ) : (
        <div className="fixed top-0 left-0 w-screen h-screen flex items-center justify-center bg-gray-500 bg-opacity-50 backdrop-blur-lg">
          <Card className="w-[300px] h-[300px] p-6 flex flex-col justify-center items-center gap-4">
            <CardTitle className="scroll-m-20 border-b pb-2 text-3xl font-semibold tracking-tight first:mt-0">
              Login to continue
            </CardTitle>
            <CardDescription>
              <Button onClick={login} disabled={!ready}>
                {ready ? "Login" : "Loading..."}
              </Button>
            </CardDescription>
          </Card>
        </div>
      )}
    </>
  );
};

export default LoggedOutView;
