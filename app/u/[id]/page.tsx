"use client";

import SpectrumCard from "@/components/ui/spectrum-card";
import ValueBadge from "@/components/ui/value-badge";
import {getFarcasterUser} from "@/lib/get-farcaster-user";
import {IUser} from "@/types";
import {parse} from "path";
import React, {useEffect, useState} from "react";

const UserPage = ({
  params,
}: {
  params: {
    id: string;
  };
}) => {
  const [user, setUser] = useState<IUser | null>(null);
  const [farcasterUser, setFarcasterUser] = useState<any | null>(null);
  const {id} = params;

  const getUser = async () => {
    const response = await fetch(`/api/users?fid=${parseInt(id)}`);
    const data = await response.json();

    setUser(data);
  };

  const getUserFarcasterName = async () => {
    const info = await getFarcasterUser(parseInt(id));
    setFarcasterUser(info);
  };
  useEffect(() => {
    Promise.all([getUser(), getUserFarcasterName()]);
  }, [id]);

  if (Number.isNaN(parseInt(id))) {
    return (
      <div className="fixed inset-0 flex flex-col items-center justify-center bg-opacity-50 backdrop-filter backdrop-blur-lg">
        <h4 className="scroll-m-20 text-lg font-light tracking-tight">
          Invalid User Id
        </h4>
      </div>
    );
  }
  return (
    <>
      {user ? (
        <section className="p-4">
          <h3 className="scroll-m-20 text-2xl font-semibold tracking-tight">
            Profile
          </h3>
          {farcasterUser && (
            <div className="w-full flex flex-row gap-2 items-center flex-wrap">
              <a
                className="scroll-m-20 text-lg font-medium tracking-tight"
                href={`https://app.wildcard.lol/profile/${farcasterUser?.profileHandle}`}
                target="_blank"
                rel="noreferrer"
              >
                {farcasterUser?.profileHandle}
              </a>
            </div>
          )}

          <h4 className="scroll-m-20 border-b text-3xl font-medium tracking-tight mb-2 mt-4">
            Values
          </h4>
          <div className="w-full flex flex-row gap-2 items-center flex-wrap">
            {user?.generatedValuesWithWeights?.warpcast &&
              Object.keys(user?.generatedValuesWithWeights?.warpcast)
                .slice(0, 7)
                .map((value, index) => (
                  <ValueBadge
                    key={index}
                    value={value}
                    weight={user?.generatedValuesWithWeights?.warpcast[value]}
                  />
                ))}
          </div>
          <div className="w-full flex flex-col gap-4 mt-8">
            <h4 className="scroll-m-20 border-b text-3xl font-medium tracking-tight mb-2 mt-4">
              Value Spectrum
            </h4>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {user?.spectrum?.warpcast.map((value, index) => (
                <SpectrumCard
                  key={index}
                  name={value.name}
                  score={value.score}
                  description={value.description}
                />
              ))}
            </div>
          </div>
        </section>
      ) : (
        <div className="fixed inset-0 flex flex-col items-center justify-center bg-opacity-50 backdrop-filter backdrop-blur-lg">
          <div className="animate-spin rounded-full h-14 w-14 border-t-2 border-b-2 border-primary"></div>
          <h4 className="scroll-m-20 text-lg font-light tracking-tight">
            Loading...
          </h4>
        </div>
      )}
    </>
  );
};

export default UserPage;
