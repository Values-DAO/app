"use client";

import {Card} from "@/components/ui/card";
import {usePrivy} from "@privy-io/react-auth";
import {useUserContext} from "@/providers/user-context-provider";
import {Button} from "@/components/ui/button";
import ValueBadge from "@/components/ui/value-badge";
const ProfilePage = () => {
  const {authenticated, login, ready, user} = usePrivy();
  const {userInfo, isLoading} = useUserContext();
  return (
    <div className="p-4">
      {authenticated && userInfo && !isLoading && (
        <div>
          <h2 className="scroll-m-20 text-center border-b pb-2 text-3xl font-semibold tracking-tight first:mt-0 text-muted-foreground mb-2">
            || profile
          </h2>

          <div>
            <h3>
              <span className="font-semibold">Hello</span>{" "}
              {user?.farcaster?.displayName}
            </h3>
            <div className="flex flex-wrap flex-row gap-2 my-4 font-medium">
              {userInfo.mintedValues &&
                userInfo.mintedValues.map((value) => (
                  <ValueBadge
                    key={value.value}
                    value={value.value}
                    weight={value.weightage!.toString()}
                  />
                ))}
            </div>
          </div>
        </div>
      )}

      {!authenticated && (
        <section className="w-full mt-24 md:mt-[15%]  flex flex-col items-center ">
          <span className="font-semibold  text-gray-300 text-lg">
            Login to view
          </span>
          <Button
            variant="default"
            onClick={login}
            disabled={!ready || authenticated || isLoading}
            className="my-4"
          >
            {isLoading ? "Loading.." : "Login"}
          </Button>
        </section>
      )}
    </div>
  );
};

export default ProfilePage;
