import { redirect } from "next/navigation";

export default function Dashboard({ params }: { params: { id: string } }) {
  redirect(`/trustpools/${params.id}/culture`);
}
