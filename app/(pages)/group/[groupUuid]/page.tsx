import { redirect } from "next/navigation";

interface PageProps {
  params: Promise<{
    groupUuid: string;
  }>;
}

export default async function GroupPage({ params }: PageProps) {
  const { groupUuid } = await params;
  redirect(`/group/${groupUuid}/feed`);
}
