import Hero from "@/components/hero";
import MembersSection from "@/components/members-section";

export default function MembersPage({ params }: { params: { id: string } }) {
  return (
    <div className="pb-20">
      <Hero trustPoolId={params.id} />
      <MembersSection trustPoolId={params.id} />
    </div>
  );
}
