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

export const metadata: Metadata = {
  title: "TuTask",
  description:
    "Manage your tasks efficiently with TuTask, the ultimate task management app.",
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
