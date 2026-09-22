import type { Metadata } from "next";
import Form from "@/components/componants/client/Form";

export const metadata: Metadata = {
  title: "Submit a Task",
  description:
    "Submit a task request through TuTask and keep your work organized.",
};

export default function Home() {
  return (
    <div>
      <Form />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            "@context": "https://schema.org",
            "@type": "WebApplication",
            name: "TuTask",
            applicationCategory: "BusinessApplication",
            description:
              "A focused workspace for submitting and tracking task requests.",
            operatingSystem: "Any",
          }),
        }}
      />
    </div>
  );
}
