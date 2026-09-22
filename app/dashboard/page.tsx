import type { Metadata } from "next";
import Dashboard from "@/components/componants/dashboard/Dashboard";

export const metadata: Metadata = {
  title: "Dashboard",
  description: "Manage and track your TuTask tasks.",
  robots: {
    index: false,
    follow: false,
  },
};

export default function Home() {
  return (
    <Dashboard />
  );
}
