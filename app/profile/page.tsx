"use client";

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
import {usePrivy} from "@privy-io/react-auth";
import {useEffect, useState} from "react";
const ProfilePage = () => {
  const {authenticated, login, ready, user} = usePrivy();

  const [values, setValues] = useState([]);

  const fetchValues = async () => {
    if (!user?.email?.address) return;
    const response = await fetch(`/api/user?email=${user?.email?.address}`, {
      method: "GET",
    });
    const data = await response.json();
    console.log(data);
    setValues(data.user.mintedValues);
  };
  useEffect(() => {
    fetchValues();
  }, [user]);
  return (
    <div className="p-4">
      {user ? (
        <div className="flex flex-col  gap-4">
          {values && values.length > 0 && (
            <Card>
              <p className="font-semibold p-4 text-gray-300">Minted Values</p>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="w-[30%]"> Values</TableHead>
                    <TableHead className="w-full">tx hash</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {values.map((value: any, index: number) => (
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
                  ))}
                </TableBody>
              </Table>
            </Card>
          )}
        </div>
      ) : (
        <section className="w-full mt-24 md:mt-[15%]  flex flex-col items-center ">
          <span className="font-semibold  text-gray-300 text-lg">
            Login to view
          </span>
          <Button
            variant="default"
            onClick={login}
            disabled={!ready || authenticated}
            className="my-4"
          >
            Login
          </Button>
        </section>
      )}
    </div>
  );
};

export default ProfilePage;
