"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { BarChart3, BookOpen, ChartSpline, FileCheck2, Users } from "lucide-react";
import { cn } from "@/lib/utils";

export default function BottomNav() {
  const pathname = usePathname();
  const currentTab = pathname.split("/").pop();

  return (
    <div className="fixed bottom-0 left-0 right-0 border-t bg-background">
      <nav className="flex justify-around items-center h-16">
        <Link
          href="alignment"
          className={cn(
            "flex flex-col items-center justify-center flex-1 h-full",
            currentTab === "alignment" && "text-primary"
          )}
        >
          <BarChart3 className="h-5 w-5" />
          <span className="text-xs mt-1">Alignment</span>
        </Link>
        <Link
          href="members"
          className={cn(
            "flex flex-col items-center justify-center flex-1 h-full",
            currentTab === "members" && "text-primary"
          )}
        >
          <Users className="h-5 w-5" />
          <span className="text-xs mt-1">Members</span>
        </Link>
        <Link
          href="charts"
          className={cn(
            "flex flex-col items-center justify-center flex-1 h-full",
            currentTab === "charts" && "text-primary"
          )}
        >
          <ChartSpline className="h-5 w-5" />
          <span className="text-xs mt-1">Charts</span>
        </Link>
        <Link
          href="curate"
          className={cn(
            "flex flex-col items-center justify-center flex-1 h-full",
            currentTab === "curate" && "text-primary"
          )}
        >
          <FileCheck2 className="h-5 w-5" />
          <span className="text-xs mt-1">Curate</span>
        </Link>
        <Link
          href="culture"
          className={cn(
            "flex flex-col items-center justify-center flex-1 h-full",
            currentTab === "culture" && "text-primary"
          )}
        >
          <BookOpen className="h-5 w-5" />
          <span className="text-xs mt-1">Culture Book</span>
        </Link>
      </nav>
    </div>
  );
}
