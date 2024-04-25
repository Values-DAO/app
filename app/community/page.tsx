import Project from "@/models/project";
import React from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import Image from "next/image";
import {Button} from "@/components/ui/button";
import Link from "next/link";
import {Badge} from "@/components/ui/badge";
import {VerifiedIcon} from "lucide-react";
import mongoose from "mongoose";

const Projects = async () => {
  await mongoose.connect(process.env.MONGODB_URI || "");

  const projects = await Project.find({}, {__v: 0, _id: 0});
  console.log(projects);
  return (
    <div className="p-4">
      <h1 className="scroll-m-20 text-4xl font-extrabold tracking-tight lg:text-5xl my-2 pl-1">
        Projects
      </h1>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {projects &&
          projects.length > 0 &&
          projects.map((project) => (
            <Card
              key={project.id}
              className="m-2 h-[480px] flex flex-col justify-between"
            >
              <CardHeader>
                <Image
                  src={project.coverImage}
                  alt={project.name}
                  width={500}
                  height={500}
                  className="rounded-lg mb-2"
                />
                <CardTitle className="text-2xl font-semibold tracking-tight flex flex-col gap-2">
                  <div className="flex flex-row items-center gap-2">
                    {project.name}
                    {project.verified && <VerifiedIcon size={24} />}
                  </div>
                  <div className="flex flex-wrap flex-row gap-2">
                    {project?.values.map((value: string, index: number) => (
                      <Badge
                        key={index}
                        variant={"secondary"}
                        className="rounded-sm"
                      >
                        {value}
                      </Badge>
                    ))}
                  </div>
                </CardTitle>
              </CardHeader>
              <CardContent>
                {" "}
                <Button className="w-full" asChild>
                  <Link
                    href={`/community/${project.name.replace(/ /g, "-")}-${
                      project.id
                    }`}
                  >
                    View Project
                  </Link>
                </Button>
              </CardContent>
            </Card>
          ))}
      </div>
    </div>
  );
};

export default Projects;
