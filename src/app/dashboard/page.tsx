import { redirect } from "next/navigation";
import { DashboardClient } from "@/components/DashboardClient";
import { getSession, getUserWithHive } from "@/lib/auth";

export default async function DashboardPage() {
  const session = await getSession();
  if (!session) {
    redirect("/login");
  }

  const user = await getUserWithHive(session.id);
  if (!user?.hive) {
    redirect("/register");
  }

  return (
    <DashboardClient
      userName={user.name}
      hive={user.hive}
    />
  );
}