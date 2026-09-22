import type { Metadata } from "next";
import Image from "next/image";
import { Roboto, Inter } from "next/font/google";
import Script from "next/script";
import "./globals.css";
import { cn } from "@/lib/utils";
import { AnimatedThemeToggler } from "@/components/ui/animated-theme-toggler";
import { TypingAnimation } from "@/components/ui/typing-animation";


const inter = Inter({ subsets: ["latin"], variable: "--font-sans" });

const robotoSans = Roboto({
  variable: "--font-Roboto-sans",
  subsets: ["latin"],
});

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000";

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: {
    default: "TuTask | Task Management",
    template: "%s | TuTask",
  },
  description:
    "TuTask helps teams submit, organize, and track tasks from one focused workspace.",
  applicationName: "TuTask",
  keywords: ["task management", "task tracking", "team tasks", "TuTask"],
  authors: [{ name: "TuTask" }],
  creator: "TuTask",
  alternates: {
    canonical: "/",
  },
  openGraph: {
    type: "website",
    url: "/",
    siteName: "TuTask",
    title: "TuTask | Task Management",
    description:
      "Submit, organize, and track tasks from one focused workspace.",
    images: [
      {
        url: "/imgs/favicon.png",
        width: 32,
        height: 32,
        alt: "TuTask logo",
      },
    ],
  },
  twitter: {
    card: "summary",
    title: "TuTask | Task Management",
    description:
      "Submit, organize, and track tasks from one focused workspace.",
    images: ["/imgs/favicon.png"],
  },
  icons: {
    icon: "/imgs/favicon.png",
  },
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html
      lang="en"
      suppressHydrationWarning
      translate="yes"
      className={cn(
        "h-full",
        "antialiased",
        robotoSans.variable,
        "font-sans",
        inter.variable,
      )}
    >
      <head>
        <Script id="theme-init" strategy="beforeInteractive">
          {`(() => {
            try {
              const theme = localStorage.getItem("theme") || "dark";
              document.documentElement.classList.toggle("dark", theme === "dark");
            } catch {}
          })();`}
        </Script>
      </head>
      <body className="min-h-full flex flex-col ">
        <div className="flex flex-row justify-between px-4 border-b porder-primery mb-5">
          <div className="flex flex-row items-center gap-2">
            <Image
              src="/imgs/favicon.png"
              alt="TuTask logo"
              width={32}
              height={32}
              priority
            />
            <TypingAnimation className="text-primary" as='span' delay={1} duration={300} loop={true} pauseDelay={20}>TuTask</TypingAnimation>
          </div>
          <AnimatedThemeToggler variant="square" className="text-primary">TuTaske</AnimatedThemeToggler>
        </div>
        {children}
      </body>
    </html>
  );
}
