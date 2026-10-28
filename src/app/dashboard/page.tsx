import type { Metadata } from "next";
import { Dashboard } from "./_components/dashboard";

export const metadata: Metadata = {
  title: "Owner dashboard · Crumb Bakehouse",
  description: "Today’s pickups, weekly revenue, missed pickups, menu and hours, all in one place.",
};

export default function DashboardPage() {
  return <Dashboard />;
}
