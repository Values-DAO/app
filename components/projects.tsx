"use client";
import {IProject} from "@/models/project";
import React, {useEffect} from "react";
import {
  Table,
  TableBody,
  TableCaption,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

import {SquareArrowOutUpRight, VerifiedIcon} from "lucide-react";
import ValueBadge from "./ui/value-badge";
import {Skeleton} from "./ui/skeleton";
import Link from "next/link";
import {Button} from "./ui/button";

const Projects = ({limit, style}: {limit?: number; style?: string}) => {
  const [projects, setProjects] = React.useState<IProject[]>([]);
  const [loader, setLoader] = React.useState<boolean>(true);
  useEffect(() => {
    async function fetchProjects() {
      setLoader(true);
      const res = await fetch(`/api/v2/community?limit=${limit}`, {
        headers: {
          "x-api-key": process.env.NEXT_PUBLIC_NEXT_API_KEY as string,
        },
      });
      const data = await res.json();

      setProjects(data.projects);
      setLoader(false);
    }
    fetchProjects();
  }, []);
  return (
    <div className="p-4 py-12">
      <h2 className="scroll-m-20 text-center border-b pb-2 text-3xl font-semibold tracking-tight first:mt-0 text-muted-foreground mb-2">
        || community mint
      </h2>

      <Table>
        <TableHeader>
          <TableRow>
            <TableHead className="font-bold">Name</TableHead>
            <TableHead className="font-bold">Values</TableHead>
            <TableHead className="font-bold">Verified</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {projects.map((project) => (
            <TableRow
              key={project.id}
              className="cursor-pointer relative group"
              onClick={() => {
                window.location.href = `/community/${project.name.replace(
                  /\s/g,
                  "-"
                )}-${project.id}`;
              }}
            >
              <TableCell>
                <div className="relative font-semibold">{project.name}</div>
              </TableCell>
              <TableCell>
                <div className="flex flex-row flex-wrap gap-2">
                  {project.values.map((value: string, index: number) => (
                    <ValueBadge key={index} value={value} />
                  ))}
                </div>
              </TableCell>
              <TableCell>
                <div className="flex justify-center items-center">
                  {project.verified ? <VerifiedIcon /> : <p>AI</p>}
                </div>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
      {!loader && limit && limit < 4 && (
        <Button
          asChild
          variant={"link"}
          className="text-lg flex items-center justify-center mt-4"
        >
          <Link href="/community">
            Show all communities
            <SquareArrowOutUpRight className="ml-2" />
          </Link>
        </Button>
      )}
      {loader && (
        <div className="flex flex-col gap-2">
          <div className="space-y-2">
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-[75%]" />
          </div>{" "}
          <div className="space-y-2">
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-[75%]" />
          </div>{" "}
          <div className="space-y-2">
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-[75%]" />
          </div>
        </div>
      )}
    </div>
  );
};

export default Projects;
