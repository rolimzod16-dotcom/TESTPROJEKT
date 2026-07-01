import { redirect } from "next/navigation";
import { MobileDashboard } from "@/components/mobile/MobileDashboard";
import { getSession, getUserWithHive } from "@/lib/auth";

export default async function MobileDashboardPage() {
  const session = await getSession();
  if (!session) {
    redirect("/app/login");
  }

  const user = await getUserWithHive(session.id);
  if (!user?.hive) {
    redirect("/app/register");
  }

  return <MobileDashboard userName={user.name} hive={user.hive} />;
}