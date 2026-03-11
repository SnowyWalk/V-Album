import { redirect } from "next/navigation";

interface PageProps {
  params: Promise<{
    groupId: string;
  }>;
}

export default async function GroupPage({ params }: PageProps) {
  const { groupId } = await params;
  redirect(`/group/${groupId}/feed`);
}
