"use client"

import React, {useEffect, useState} from 'react';
import {useSearchParams} from "next/navigation";
import useValuesHook from "@/hooks/useValuesHook";
import {capitalizeFirstLetter, getSpectrumForUser} from "@/lib/utils";
import {UserData} from "@/types";
import {Alert, AlertDescription, AlertTitle} from "@/components/ui/alert";
import {MessageCircleWarningIcon} from "lucide-react";
import {Button} from "@/components/ui/button";
import Link from "next/link";
import {Badge} from "@/components/ui/badge";
import {AlignmentSearchSheet} from "@/components/alignment-search-sheet";
import SpectrumCard from "@/components/ui/spectrum-card";

const Page = () => {
	const searchParams = useSearchParams();
	const viewer = searchParams.get("viewer");
	const target = searchParams.get("target");

	const [error, setError] = useState<string | null>(null);
	const [alignmentScore, setAlignmentScore] = useState<number | null>(null);
	const [isLoading, setIsLoading] = useState<boolean>(true);

	const [viewerUserInfo, setViewerUserInfo] = useState<UserData | null>(null)
	const [targetUserInfo, setTargetUserInfo] = useState<UserData | null>(null)


	const {getAlignment} = useValuesHook()

	// get alignment score and user info from backend
	useEffect(() => {
		if (!viewer || !target) {
			setError("Please provider viewer and target usernames")
			return
		}

		const getAlignmentScoreAndUserInfo = async () => {
			try {
				const response = await getAlignment({viewer, target})

				if ("error" in response) {
					setError(response.error)
					return
				}

				console.log("RESPONSE: ", response)

				const alignment = response.alignment

				setAlignmentScore(alignment.alignmentScore)

				setTargetUserInfo(alignment.targetInfo)
				setViewerUserInfo(alignment.viewerInfo)
			} catch (error) {
				setError(`An error occurred while processing the request. ${error}`)
			} finally {
				setIsLoading(false)
			}
		}

		getAlignmentScoreAndUserInfo()
	}, []);


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
		<div className={"container"}>
			{error ? (
				<Alert variant="destructive" className="w-[96%] m-auto mt-8">
					<MessageCircleWarningIcon className="h-4 w-4" />
					<AlertTitle>Error</AlertTitle>
					<AlertDescription>
						An error occurred while processing the request. Maybe the users haven't generated their values yet. {error}
					</AlertDescription>
					<Button className="mt-4 w-full" asChild>
						<Link href="/">Generate Values</Link>
					</Button>
				</Alert>
			) : (
				<section className="p-4">
					{alignmentScore &&
						viewerUserInfo?.username &&
						targetUserInfo?.username && (
							<div className="  scroll-m-20 text-2xl font-semibold tracking-tight">
								Alignment between{" "}
								{capitalizeFirstLetter(viewerUserInfo.username) ??
									viewer}{" "}
								and{" "}
								{capitalizeFirstLetter(targetUserInfo.username) ?? target}
								<Badge
									className={`text-white text-sm ml-2 w-fit text-center ${
										Number(alignmentScore) > 50 ? "bg-green-500" : "bg-red-500"
									}`}
								>
									|| {alignmentScore}%
								</Badge>
							</div>
						)}

					{viewerUserInfo && viewerUserInfo.spectrum && viewerUserInfo.spectrum.length > 0 && (
						<div className="w-full flex flex-col gap-4 mt-8">
							{viewerUserInfo &&
								targetUserInfo &&
								targetUserInfo.spectrum &&
								targetUserInfo.spectrum.length > 0 &&
								viewerUserInfo.spectrum &&
								viewerUserInfo.spectrum.length > 0 &&
								(
									<div className="flex flex-col gap-2">
										<AlignmentSearchSheet />
										<div className="flex flex-col gap-2 border-[1px] border-gray-300 p-2 rounded-md">
											<div className="flex flex-row gap-2 items-center">
												<span className="w-4 h-4 rounded-full bg-primary"></span>
												<span className="text-sm">
                          {`${capitalizeFirstLetter(
														viewerUserInfo?.username
													)}'s
                  Score`}
                        </span>
											</div>
											<div className="flex flex-row gap-2 items-center">
												<span className="w-4 h-4 rounded-full bg-green-400"></span>
												<span className="text-sm">
                          {" "}
													{`${capitalizeFirstLetter(
														targetUserInfo?.username
													)}'s
                  Score`}
                        </span>
											</div>
											<div className="flex flex-row gap-2 items-center">
												<span className="w-4 h-4 rounded-full bg-blue-400"></span>
												<span className="text-sm">If both scores are same</span>
											</div>
										</div>
									</div>
								)}

							<h4 className="scroll-m-20 border-b text-xl font-medium tracking-tight mb-2 mt-4">
								{viewer
									? "Value Spectrum"
									: `${capitalizeFirstLetter(viewerUserInfo.username)}'s
                  Value Spectrum`}
							</h4>
							<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
								{viewerUserInfo.spectrum.map((value, index) => (
									<SpectrumCard
										key={index}
										name={value.name}
										score={value.score}
										description={value.description}
										scoreOfViewer={targetUserInfo?.spectrum[index]?.score}
									/>
								))}
							</div>
						</div>
					)}
				</section>
			)}
		</div>
	);
};

export default Page;