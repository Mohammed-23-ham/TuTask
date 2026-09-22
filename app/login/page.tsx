import type { Metadata } from "next";
import { DraftForm } from "@/components/componants/dashboard/Login";

export const metadata: Metadata = {
  title: "Sign In",
  description: "Sign in to access your TuTask dashboard.",
  robots: {
    index: false,
    follow: false,
  },
};

export default function Home() {
  return (
    <DraftForm />
  );
}
