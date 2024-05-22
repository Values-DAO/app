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

import {Button} from "@/components/ui/button";
import Link from "next/link";
import {Badge} from "@/components/ui/badge";
import {Separator} from "@/components/ui/separator";

import {VerifiedIcon} from "lucide-react";

const Projects = ({limit, style}: {limit?: number; style?: string}) => {
  const [projects, setProjects] = React.useState<IProject[]>([]);
  useEffect(() => {
    async function fetchProjects() {
      const res = await fetch(`/api/project?limit=${limit}`, {
        headers: {
          "x-api-key": process.env.NEXT_PUBLIC_NEXT_API_KEY as string,
        },
      });
      const data = await res.json();
      console.log(data.projects);
      setProjects(data.projects);
    }
    fetchProjects();
  }, []);
  return (
    <div className="p-4">
      <h2 className="scroll-m-20 text-center border-b pb-2 text-3xl font-semibold tracking-tight first:mt-0 max-w-5xl text-muted-foreground mb-2">
        ||Community
      </h2>
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Name</TableHead>
            <TableHead>Values</TableHead>
            <TableHead>Verified</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {projects.map((project) => (
            <TableRow
              key={project.id}
              className="cursor-pointer"
              onClick={() => {
                window.location.href = `/community/${project.name.replace(
                  / /g,
                  "-"
                )}-${project.id}`;
              }}
            >
              <Link
                href={`/community/${project.name.replace(/ /g, "-")}-${
                  project.id
                }`}
                key={project.id}
              >
                <TableCell>{project.name}</TableCell>
              </Link>
              <TableCell className="">
                {project.values.map((value: string, index: number) => (
                  <Badge
                    key={index}
                    variant={"default"}
                    className="rounded-sm text-[18px] m-2"
                  >
                    {value}
                  </Badge>
                ))}
              </TableCell>
              <TableCell>
                {project.verified ? <VerifiedIcon /> : <p>AI</p>}
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
};

export default Projects;
