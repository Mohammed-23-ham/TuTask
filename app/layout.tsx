import type { Metadata } from "next";
import { Roboto, Inter } from "next/font/google";
import Script from "next/script";
import "./globals.css";
import { cn } from "@/lib/utils";
import { AnimatedThemeToggler } from "@/components/ui/animated-theme-toggler"

const inter = Inter({subsets:['latin'],variable:'--font-sans'});

const robotoSans = Roboto({
  variable: "--font-Roboto-sans",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "TuTask",
  description: "Manage your tasks efficiently with TuTask, the ultimate task management app.",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html
      lang="en"
      suppressHydrationWarning
      tramslate="yes"
      className={cn("h-full", "antialiased", robotoSans.variable, "font-sans", inter.variable)}
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
        <div className="flex flex-row justify-end py-1 px-4">
           <AnimatedThemeToggler variant="square" />
        </div>
        {children}
        </body>
    </html>
  );
}
