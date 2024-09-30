"use client";

import React, {useEffect, useState} from "react";
import {useSearchParams} from "next/navigation";
import {Badge} from "@/components/ui/badge";
import SpectrumCard from "@/components/ui/spectrum-card";
import ValueBadge from "@/components/ui/value-badge";
import {getFarcasterUser} from "@/lib/get-farcaster-user";
import axios from "axios";
import {Alert, AlertTitle} from "@/components/ui/alert";
import {Terminal} from "lucide-react";
import {IUser} from "@/types";

type SpectrumItem = {
  name: string;
  score: number;
  description: string;
};

const capitalizeFirstLetter = (str: string) =>
  str.charAt(0).toUpperCase() + str.slice(1);

const calculateAverageScore = (scores: (number | undefined)[]): number => {
  const validScores = scores.filter(
    (score): score is number => score !== undefined
  );
  return validScores.length
    ? validScores.reduce((sum, score) => sum + score, 0) / validScores.length
    : 0;
};

const UserPage = ({params}: {params: {id: string}}) => {
  const [userValues, setUserValues] = useState<string[] | null>(null);
  const [userSpectrum, setUserSpectrum] = useState<SpectrumItem[] | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [farcasterUser, setFarcasterUser] = useState<any | null>(null);
  const [alignmentScore, setAlignmentScore] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const searchParams = useSearchParams();
  const viewingUser = searchParams.get("viewing");

  const {id} = params;

  const getUser = async () => {
    try {
      const response = await fetch(`/api/users?fid=${parseInt(id)}`);
      const data = await response.json();
      if (data.error) throw new Error(data.error);

      const values = Array.from(
        new Set([
          ...(data.generatedValues.warpcast || []),
          ...(data.generatedValues.twitter || []),
        ])
      );
      setUserValues(values);

      const spectrum = getSpectrumForUser(data);

      if (spectrum.length > 0) setUserSpectrum(spectrum);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  };
  const calculateAverageScore = (scores: (number | undefined)[]): number => {
    const validScores = scores.filter(
      (score): score is number => score !== undefined
    );
    return validScores.length
      ? validScores.reduce((sum, score) => sum + score, 0) / validScores.length
      : 0;
  };

  const getSpectrumForUser = (user: IUser): SpectrumItem[] => {
    const {warpcast, twitter} = user.spectrum;
    const maxLength = Math.max(warpcast?.length ?? 0, twitter?.length ?? 0);

    return Array.from({length: maxLength}, (_, i) => {
      const warpcastItem = warpcast?.[i];
      const twitterItem = twitter?.[i];
      return {
        name: warpcastItem?.name ?? twitterItem?.name ?? `Item ${i + 1}`,
        score: calculateAverageScore([warpcastItem?.score, twitterItem?.score]),
        description:
          warpcastItem?.description ?? twitterItem?.description ?? "",
      };
    });
  };
  const getUserFarcasterName = async () => {
    const target = await getFarcasterUser(parseInt(id));
    const viewer = viewingUser
      ? await getFarcasterUser(parseInt(viewingUser))
      : null;
    setFarcasterUser({target, ...(viewer && {viewer})});
  };

  const getAlignmentScore = async () => {
    if (viewingUser && !isNaN(parseInt(viewingUser))) {
      try {
        const response = await axios.get(
          `/api/users/alignment-score?fid=${parseInt(
            viewingUser
          )}&targetFid=${parseInt(id)}`
        );
        setAlignmentScore(response.data.alignmentScore);
      } catch (err) {
        console.error("Failed to fetch alignment score:", err);
      }
    }
  };

  useEffect(() => {
    if (!isNaN(parseInt(id))) {
      Promise.all([getUser(), getUserFarcasterName(), getAlignmentScore()]);
    }
  }, [id, viewingUser]);

  if (isNaN(parseInt(id))) {
    return (
      <div className="fixed inset-0 flex flex-col items-center justify-center bg-opacity-50 backdrop-filter backdrop-blur-lg">
        <h4 className="scroll-m-20 text-lg font-light tracking-tight">
          Invalid User Id
        </h4>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="fixed inset-0 flex flex-col items-center justify-center bg-opacity-50 backdrop-filter backdrop-blur-lg">
        <div className="animate-spin rounded-full h-14 w-14 border-t-2 border-b-2 border-primary"></div>
        <h4 className="scroll-m-20 text-lg font-light tracking-tight">
          Loading...
        </h4>
      </div>
    );
  }

  return (
    <section className="p-4">
      {alignmentScore && farcasterUser?.viewer && farcasterUser?.target && (
        <div className="flex items-center scroll-m-20 text-2xl font-semibold tracking-tight">
          Alignment between{" "}
          {capitalizeFirstLetter(farcasterUser.viewer.profileName)} and{" "}
          {capitalizeFirstLetter(farcasterUser.target.profileName)} :
          <Badge
            className={`text-white text-sm ml-2 w-[150px] md:w-fit text-center ${
              Number(alignmentScore) > 50 ? "bg-green-500" : "bg-red-500"
            }`}
          >
            || {alignmentScore}%
          </Badge>
        </div>
      )}
      {error && (
        <Alert variant="destructive">
          <Terminal className="h-4 w-4" />
          <AlertTitle>User not found</AlertTitle>
        </Alert>
      )}
      {userValues && userValues.length > 0 && (
        <>
          <h4 className="scroll-m-20 border-b text-xl font-medium tracking-tight mb-2 mt-4">
            {farcasterUser?.target.profileName
              ? `${capitalizeFirstLetter(
                  farcasterUser?.target?.profileName
                )}'s Values`
              : "Values"}
          </h4>
          <div className="w-full flex flex-row gap-2 items-center flex-wrap">
            {userValues.map((value, index) => (
              <ValueBadge key={index} value={value} />
            ))}
          </div>
        </>
      )}
      {userSpectrum && userSpectrum.length > 0 && (
        <div className="w-full flex flex-col gap-4 mt-8">
          <h4 className="scroll-m-20 border-b text-xl font-medium tracking-tight mb-2 mt-4">
            {farcasterUser?.target.profileName
              ? `${capitalizeFirstLetter(
                  farcasterUser?.target?.profileName
                )}'s Value Spectrum`
              : "Value Spectrum"}
          </h4>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {userSpectrum.map((value, index) => (
              <SpectrumCard
                key={index}
                name={value.name}
                score={value.score}
                description={value.description}
              />
            ))}
          </div>
        </div>
      )}
    </section>
  );
};

export default UserPage;
