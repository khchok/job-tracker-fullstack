import type { Metadata } from "next";
import { Geist } from "next/font/google";
import "./globals.css";
import Providers from "@/components/Providers";
import { Toaster } from "sonner";
import AuthorRibbon from "@/components/author/AuthorRibbon";

const geist = Geist({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Job Tracker",
  description: "Track your job applications",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className={geist.className}>
        <Providers>
          {children}
          <Toaster richColors />
          <AuthorRibbon />
        </Providers>
      </body>
    </html>
  );
}
