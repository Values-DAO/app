import CurateTab from "@/components/CurateTab";

export default function CuratePage({ params }: { params: { id: string } }) {
  return <CurateTab trustPoolId={params.id} />;
}