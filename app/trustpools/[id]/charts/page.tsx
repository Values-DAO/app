import {TokenCharts} from "@/components/TokenCharts";

export default function CulturePage({ params }: { params: { id: string } }) {
  return <TokenCharts trustPoolId={params.id} />;
}
