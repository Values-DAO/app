"use client";

import AlignmentSection from "@/components/alignment-section";
import Hero from "@/components/hero";

export default function AlignmentPage({ params }: { params: { id: string } }) {
  return (
    <div className="pb-20">
      <Hero trustPoolId={params.id} />
      <AlignmentSection trustPoolId={params.id} />
    </div>
  );
}
