import { ListDetail } from "@/components/ListDetail";

export default async function PopisDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  return <ListDetail id={id} />;
}
