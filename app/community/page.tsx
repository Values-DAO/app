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
import {Separator} from "@/components/ui/separator";

import {VerifiedIcon} from "lucide-react";
import mongoose from "mongoose";

const Projects = async () => {
  await mongoose.connect(process.env.MONGODB_URI || "");

  const projects = await Project.find({}, {__v: 0, _id: 0});

  return (
    <div className="p-4">
      <h1 className="scroll-m-20 text-4xl font-extrabold tracking-tight lg:text-5xl my-2 pl-1">
        Communities
      </h1>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
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
                <Image
                  src={project.coverImage}
                  alt={project.name}
                  width={200}
                  height={200}
                  className="rounded-lg mb-2 w-full h-36 object-cover"
                />
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
                <Button className="w-full" variant={"secondary"} asChild>
                  <Link
                    href={`/community/${project.name.replace(/ /g, "-")}-${
                      project.id
                    }`}
                  >
                    View Community
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
