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

import {VerifiedIcon} from "lucide-react";
import ValueBadge from "./ui/value-badge";

const Projects = ({limit, style}: {limit?: number; style?: string}) => {
  const [projects, setProjects] = React.useState<IProject[]>([]);
  console.log(projects);
  useEffect(() => {
    async function fetchProjects() {
      const res = await fetch(`/api/project?limit=${limit}`, {
        headers: {
          "x-api-key": process.env.NEXT_PUBLIC_NEXT_API_KEY as string,
        },
      });
      const data = await res.json();

      setProjects(data.projects);
    }
    fetchProjects();
  }, []);
  return (
    <div className="p-4">
      <h2 className="scroll-m-20 text-center border-b pb-2 text-3xl font-semibold tracking-tight first:mt-0 text-muted-foreground mb-2">
        || community mint
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
              className="cursor-pointer relative group"
              onClick={() => {
                window.location.href = `/community/${project.name.replace(
                  /\s/g,
                  "-"
                )}-${project.id}`;
              }}
            >
              <TableCell>
                <div className="relative text-medium">{project.name}</div>
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
    </div>
  );
};

export default Projects;
