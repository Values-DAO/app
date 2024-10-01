"use client";
import {Badge} from "@/components/ui/badge";
import SpectrumCard from "@/components/ui/spectrum-card";

import {Alert, AlertDescription, AlertTitle} from "@/components/ui/alert";
import ValueBadge from "@/components/ui/value-badge";
import useValuesHook from "@/hooks/useValuesHook";
import {IUser} from "@/types";
import {useSearchParams} from "next/navigation";
import React, {useEffect, useState} from "react";
import {MessageCircleWarningIcon} from "lucide-react";
import {Button} from "@/components/ui/button";
import Link from "next/link";

interface UserData {
  spectrum: {name: string; score: number; description: string}[];
  values: string[];
}

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

const getSpectrumForUser = (user: IUser) => {
  const {warpcast, twitter} = user.spectrum;
  const maxLength = Math.max(warpcast?.length ?? 0, twitter?.length ?? 0);

  return Array.from({length: maxLength}, (_, i) => {
    const warpcastItem = warpcast?.[i];
    const twitterItem = twitter?.[i];
    return {
      name: warpcastItem?.name ?? twitterItem?.name ?? `Item ${i + 1}`,
      score: calculateAverageScore([warpcastItem?.score, twitterItem?.score]),
      description: warpcastItem?.description ?? twitterItem?.description ?? "",
    };
  });
};

const Page = ({params}: {params: {id: string}}) => {
  const {id} = params;
  const searchParams = useSearchParams();
  const viewer = searchParams.get("viewer");

  const [userData, setUserData] = useState<UserData | null>(null);
  const [viewerData, setViewerData] = useState<UserData | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [alignmentScore, setAlignmentScore] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [userFarcasterInfo, setUserFarcasterInfo] = useState<any | null>(null);
  const [viewerFarcasterInfo, setViewerFarcasterInfo] = useState<any | null>(
    null
  );

  const {getUserData, getFarcaterUserName, getAlignmentScore} = useValuesHook();

  useEffect(() => {
    const fetchData = async () => {
      if (!id || isNaN(parseInt(id))) return;
      try {
        setIsLoading(true);
        const targetUser = await getUserData({fid: Number(id)});
        if ("error" in targetUser) {
          setError(targetUser.error);
          setIsLoading(false);
          return;
        }

        const targetUserValues = Array.from(
          new Set([
            ...(targetUser.generatedValues.warpcast || []),
            ...(targetUser.generatedValues.twitter || []),
          ])
        );
        const targetUserSpectrum = getSpectrumForUser(targetUser);
        if (targetUserSpectrum.length === 0) {
          setError(
            "Values not generated, Visit ValuesDAO app to generate values."
          );
        }
        setUserData({
          values: targetUserValues,
          spectrum: targetUserSpectrum,
        });

        if (!viewer || isNaN(parseInt(viewer))) return;
        const viewerUser = viewer
          ? await getUserData({fid: Number(viewer)})
          : null;
        if (viewerUser) {
          if ("error" in viewerUser) {
            setError(viewerUser.error);
            setIsLoading(false);
            return;
          }
          const viewerUserValues = Array.from(
            new Set([
              ...(viewerUser.generatedValues.warpcast || []),
              ...(viewerUser.generatedValues.twitter || []),
            ])
          );
          const viewerUserSpectrum = getSpectrumForUser(viewerUser);
          if (viewerUserSpectrum.length === 0) {
            setError(
              "Values not generated, Visit ValuesDAO app to generate values."
            );
          }
          setViewerData({
            values: viewerUserValues,
            spectrum: viewerUserSpectrum,
          });
        }
        setIsLoading(false);
      } catch (err: any) {
        setError(err.message);
        setIsLoading(false);
      } finally {
        setIsLoading(false);
      }
    };
    fetchData();
  }, [id, viewer]);

  useEffect(() => {
    if (!viewer) return;

    const fetchViewerInfo = async () => {
      const viewerInfo = await getFarcaterUserName({fid: Number(viewer)});
      setViewerFarcasterInfo(viewerInfo);
    };
    fetchViewerInfo();
  }, [viewer]);

  useEffect(() => {
    if (!id) return;
    const fetchUserInfo = async () => {
      const userInfo = await getFarcaterUserName({fid: Number(id)});
      setUserFarcasterInfo(userInfo);
    };
    fetchUserInfo();
  }, [id]);

  useEffect(() => {
    if (!id || !viewer) return;
    const calculateAlignmentScore = async () => {
      const score = await getAlignmentScore({
        fid: parseInt(id),
        viewerFid: parseInt(viewer),
      });
      if ("error" in score) {
        return;
      }
      setAlignmentScore(score.alignmentScore);
    };

    calculateAlignmentScore();
  }, [userData, viewerData]);

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
    <>
      {error ? (
        <Alert variant="destructive" className="w-[96%] m-auto mt-8">
          <MessageCircleWarningIcon className="h-4 w-4" />
          <AlertTitle>Error</AlertTitle>
          <AlertDescription>
            {id && viewer
              ? `Either one of the users hasn't generated their Values. If you haven't, click the button below.\n\nYou will be able to see the alignment only after your values are generated. If you think the other user hasn't generated their Values, DM them on Warpcast so they can do so. You can then check your % alignment.`
              : "The user hasn't generated their Values. DM them on Warpcast so they can do so. You can then check your % alignment."}
          </AlertDescription>
          <Button className="mt-4 w-full" asChild>
            <Link href="/">Generate Values</Link>
          </Button>
        </Alert>
      ) : (
        <section className="p-4">
          {alignmentScore &&
            userFarcasterInfo?.profileName &&
            viewerFarcasterInfo?.profileName && (
              <div className="flex items-center scroll-m-20 text-2xl font-semibold tracking-tight">
                Alignment between{" "}
                {capitalizeFirstLetter(viewerFarcasterInfo?.profileName) ??
                  viewer}{" "}
                and{" "}
                {capitalizeFirstLetter(userFarcasterInfo?.profileName) ?? id} :
                <Badge
                  className={`text-white text-sm ml-2 w-[150px] md:w-fit text-center ${
                    Number(alignmentScore) > 50 ? "bg-green-500" : "bg-red-500"
                  }`}
                >
                  || {alignmentScore}%
                </Badge>
              </div>
            )}
          {userData && userData.values && userData.values.length > 0 && (
            <>
              <h4 className="scroll-m-20 border-b text-xl font-medium tracking-tight mb-2 mt-4">
                {userFarcasterInfo?.profileName
                  ? `${capitalizeFirstLetter(
                      userFarcasterInfo?.profileName
                    )}'s Values`
                  : "Values"}
              </h4>
              <div className="w-full flex flex-row gap-2 items-center flex-wrap">
                {userData.values.map((value, index) => (
                  <ValueBadge key={index} value={value} />
                ))}
              </div>
            </>
          )}

          {userData && userData.spectrum && userData.spectrum.length > 0 && (
            <div className="w-full flex flex-col gap-4 mt-8">
              <h4 className="scroll-m-20 border-b text-xl font-medium tracking-tight mb-2 mt-4">
                {userFarcasterInfo?.profileName
                  ? `${capitalizeFirstLetter(
                      userFarcasterInfo?.profileName
                    )}'s Value Spectrum`
                  : "Value Spectrum"}
              </h4>
              {userData &&
                userFarcasterInfo &&
                viewerFarcasterInfo &&
                viewerData &&
                viewerData.spectrum &&
                viewerData.spectrum.length > 0 && (
                  <div className="flex flex-col gap-2 border-[1px] border-gray-300 p-2 rounded-md">
                    <div className="flex flex-row gap-2 items-center">
                      <span className="w-4 h-4 rounded-full bg-primary"></span>
                      <span className="text-sm">
                        {`${capitalizeFirstLetter(
                          userFarcasterInfo?.profileName
                        )}'s
                  Score`}
                      </span>
                    </div>
                    <div className="flex flex-row gap-2 items-center">
                      <span className="w-4 h-4 rounded-full bg-green-400"></span>
                      <span className="text-sm">
                        {" "}
                        {`${capitalizeFirstLetter(
                          viewerFarcasterInfo?.profileName
                        )}'s
                  Score`}
                      </span>
                    </div>
                    <div className="flex flex-row gap-2 items-center">
                      <span className="w-4 h-4 rounded-full bg-blue-400"></span>
                      <span className="text-sm">If both scores are same</span>
                    </div>
                  </div>
                )}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {userData.spectrum.map((value, index) => (
                  <SpectrumCard
                    key={index}
                    name={value.name}
                    score={value.score}
                    description={value.description}
                    scoreOfViewer={viewerData?.spectrum[index]?.score}
                  />
                ))}
              </div>
            </div>
          )}
        </section>
      )}
    </>
  );
};

export default Page;
