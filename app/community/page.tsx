"use client";
import Project, {IProject} from "@/models/project";
import React, {useEffect} from "react";
import {Card, CardContent, CardHeader, CardTitle} from "@/components/ui/card";

import {Button} from "@/components/ui/button";
import Link from "next/link";
import {Badge} from "@/components/ui/badge";
import {Separator} from "@/components/ui/separator";

import {VerifiedIcon} from "lucide-react";
import mongoose from "mongoose";
interface Project {
  limit?: number;
  style?: string;
}
const Projects: React.FC<Project> = ({limit, style}) => {
  const [projects, setProjects] = React.useState<IProject[]>([]);
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
  }, [limit]);
  return (
    <div className="p-4">
      <div
        className={`grid gap-4 ${
          style ?? "grid-cols-1 md:grid-cols-2 lg:grid-cols-5 "
        }`}
      >
        {projects &&
          projects.length > 0 &&
          projects.map((project) => (
            <Card
              key={project.id}
              className="m-2 flex flex-col justify-between"
            >
              <CardHeader>
                {" "}
                <div className="flex flex-row items-center gap-2 h-6 mb-2 font-medium">
                  {project.name}
                  {project.verified && <VerifiedIcon size={20} />}
                </div>
                {/* <Image
                  src={project.coverImage}
                  alt={project.name}
                  width={200}
                  height={200}
                  className="rounded-lg mb-2 w-full h-36 object-cover"
                /> */}
                <CardTitle className=" flex flex-col gap-2">
                  <Separator />

                  <p className="text-xl font-bold tracking-tight">Values </p>
                  <div className="flex flex-wrap flex-row gap-2 font-medium">
                    {project?.values.map((value: string, index: number) => (
                      <Badge
                        key={index}
                        variant={"default"}
                        className="rounded-sm text-[18px] "
                      >
                        {value}
                      </Badge>
                    ))}
                  </div>
                </CardTitle>
              </CardHeader>
              <CardContent>
                {project.verified === true ? (
                  <Button className="w-full" variant={"secondary"} asChild>
                    <Link
                      href={`/community/${project.name.replace(/ /g, "-")}-${
                        project.id
                      }`}
                    >
                      View Community
                    </Link>
                  </Button>
                ) : (
                  <Button className="w-full" variant={"secondary"} disabled>
                    Coming Soon
                  </Button>
                )}
              </CardContent>
            </Card>
          ))}
      </div>
    </div>
  );
};

export default Projects;
