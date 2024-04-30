"use client";

import InviteCodeModal from "@/components/invite-code-modal";
import {Button} from "@/components/ui/button";
import {Card} from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCaption,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {toast} from "@/components/ui/use-toast";
import {IUser} from "@/models/user";
import {usePrivy} from "@privy-io/react-auth";
import {Copy} from "lucide-react";
import {useEffect, useState} from "react";
const ProfilePage = () => {
  const {authenticated, login, ready, user} = usePrivy();

  const [isUserVerified, setIsUserVerified] = useState(false);
  const [userInfo, setUserInfo] = useState<IUser | null>(null);
  const [loading, setLoading] = useState(false);
  const fetchValues = async () => {
    if (!user?.email?.address) return;
    setLoading(true);
    const response = await fetch(`/api/user?email=${user?.email?.address}`, {
      method: "GET",
    });
    const data = await response.json();

    setUserInfo(data.user);
    if (data?.user?.isVerified) {
      setIsUserVerified(true);
    }
    setLoading(false);
  };
  useEffect(() => {
    fetchValues();
  }, [user]);
  return (
    <div className="p-4">
      {user && !loading ? (
        <>
          {isUserVerified ? (
            <div>
              {userInfo && userInfo?.inviteCodes!.length > 0 && (
                <Card className="flex flex-col  gap-4 p-4">
                  <h3 className="scroll-m-20 text-2xl font-semibold tracking-tight mb-4">
                    Invite your ||aligned friend
                  </h3>

                  <ul className="mt-2 mb-6 md:ml-6 list-disc [&>li]:mt-2">
                    {userInfo?.inviteCodes!.map((code, index) => {
                      const claimed = code.claimed;
                      if (claimed) {
                        return (
                          <li key={index} className="text-lg font-light ml-4">
                            {code.code} was claimed by {code.claimedBy}
                          </li>
                        );
                      }
                      return (
                        <li
                          key={index}
                          className="text-lg font-medium flex flex-row gap-4 justify-between md:justify-start"
                        >
                          <span className="w-24">{code.code}</span>

                          <Button
                            variant="outline"
                            className="flex flex-row gap-2 items-center"
                            onClick={() => {
                              toast({
                                title: "Copied to clipboard",
                              });
                              navigator.clipboard.writeText(code.code);
                            }}
                          >
                            <Copy /> <span>Copy</span>
                          </Button>
                        </li>
                      );
                    })}
                  </ul>

                  <p className="text-xl text-muted-foreground">
                    Why only one invite? <br></br>
                    <br></br>We are not here to get million random users. We are
                    giving it out only to ||aligned users and specific
                    communities. <br></br>
                    <br></br> We are giving you ONE invite only for your best
                    friend because that is the person you are most ||aligned
                    with
                  </p>
                </Card>
              )}
              {userInfo && userInfo.mintedValues.length > 0 && (
                <Card>
                  <p className="font-semibold p-4 text-gray-300">
                    Minted Values
                  </p>
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead className="w-[30%]"> Values</TableHead>
                        <TableHead className="w-full">tx hash</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {userInfo.mintedValues.map(
                        (value: any, index: number) => (
                          <TableRow key={index}>
                            <TableCell className="font-medium truncate w-[30%]">
                              {value.value}
                            </TableCell>
                            <TableCell className="font-medium truncate">
                              <Button
                                variant="link"
                                className="m-0 p-0 h-2"
                                onClick={() => {
                                  window.open(
                                    `${process.env.NEXT_PUBLIC_BASESCAN_URL}/tx/${value.txHash}`,
                                    "_blank"
                                  );
                                }}
                              >
                                {`${value.txHash.substring(
                                  0,
                                  5
                                )}...${value.txHash.slice(-5)}`}
                              </Button>
                            </TableCell>
                          </TableRow>
                        )
                      )}
                    </TableBody>
                  </Table>
                </Card>
              )}
            </div>
          ) : (
            <div className="flex flex-col items-center px-6 mt-[40%] md:mt-[15%]">
              <InviteCodeModal setVerified={setIsUserVerified} />
            </div>
          )}
        </>
      ) : (
        <section className="w-full mt-24 md:mt-[15%]  flex flex-col items-center ">
          <span className="font-semibold  text-gray-300 text-lg">
            Login to view
          </span>
          <Button
            variant="default"
            onClick={login}
            disabled={!ready || authenticated || loading}
            className="my-4"
          >
            {loading ? "Loading.." : "Login"}
          </Button>
        </section>
      )}
    </div>
  );
};

export default ProfilePage;
