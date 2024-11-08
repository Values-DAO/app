"use client";

import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { Twitter } from "lucide-react";
import Link from "next/link";

interface TrustPoolCardProps {
  pool: {
    _id: string;
    name: string;
    description: string;
    logo: string;
    twitterHandle?: string;
    farcasterHandle?: string;
    communityLink?: string;
  };
}

export const TrustPoolCard = ({ pool }: TrustPoolCardProps) => {
  const router = useRouter();

  return (
    <Card className="transition-shadow hover:shadow-lg flex flex-col h-full">
      <CardHeader className="flex flex-row items-center gap-3 pb-2">
        <Image
          src={pool.logo || "/valuesDAO.png"}
          alt={`${pool.name} logo`}
          width={32}
          height={32}
          className="rounded-full"
        />
        <CardTitle className="text-lg truncate">{pool.name}</CardTitle>
      </CardHeader>
      <CardContent className="flex-grow pb-2">
        <p className="text-sm text-muted-foreground line-clamp-3">{pool.description}</p>
      </CardContent>
      <CardFooter className="flex flex-col items-stretch gap-2 pt-2">
        <div className="flex justify-between gap-2">
          {pool.twitterHandle && (
            <Button variant="outline" size="sm" className="flex-1" asChild>
              <Link href={`https://twitter.com/${pool.twitterHandle}`} target="_blank" rel="noopener noreferrer">
                <Image src="/x.svg" alt="x icon" height={16} width={16} />
                Twitter
              </Link>
            </Button>
          )}
          {pool.farcasterHandle && (
            <Button
              variant="outline"
              size="sm"
              className="flex-1 hover:bg-[#967fda] bg-[#855DCD] border-[#855DCD] border-none text-white hover:text-white"
              asChild
            >
              <Link href={`https://warpcast.com/${pool.farcasterHandle}`} target="_blank" rel="noopener noreferrer">
                <Image src="/farcaster.svg" alt="farcaster icon" height={20} width={20} />
                Farcaster
              </Link>
            </Button>
          )}
          {pool.communityLink && (
            <Button variant="outline" size="sm" className="flex-1" asChild>
              <Link href={pool.communityLink} target="_blank" rel="noopener noreferrer">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke-width="1.5"
                  stroke="currentColor"
                  className="size-6"
                >
                  <path
                    stroke-linecap="round"
                    stroke-linejoin="round"
                    d="M13.19 8.688a4.5 4.5 0 0 1 1.242 7.244l-4.5 4.5a4.5 4.5 0 0 1-6.364-6.364l1.757-1.757m13.35-.622 1.757-1.757a4.5 4.5 0 0 0-6.364-6.364l-4.5 4.5a4.5 4.5 0 0 0 1.242 7.244"
                  />
                </svg>
                Community
              </Link>
            </Button>
          )}
        </div>
        <div className="flex justify-between gap-2">
          <Button variant="default" size="sm" className="flex-1" onClick={() => router.push(`/trustpools/${pool._id}`)}>
            View Pool
          </Button>
        </div>
      </CardFooter>
    </Card>
  );
};
