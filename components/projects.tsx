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
      <h2 className="scroll-m-20 text-center border-b pb-2 text-3xl font-semibold tracking-tight first:mt-0 text-muted-foreground mb-2">
        || community mint
      </h2>

      <p className="text-2xl font-semibold text-center mt-4 mb-4">
        Coming Soon
      </p>

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
              className="cursor-pointer relative group"
            >
              <TableCell>
                <div className="relative">{project.name}</div>
              </TableCell>
              <TableCell>
                <div className="flex flex-col md:grid md:grid-cols-4 gap-2">
                  {project.values.map((value: string, index: number) => (
                    <Badge
                      key={index}
                      variant="default"
                      className="rounded-sm text-[18px] bg-transparent border border-primary text-primary"
                    >
                      {value}
                    </Badge>
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
    </div>
  );
};

export default Projects;
