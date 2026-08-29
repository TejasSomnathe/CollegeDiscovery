import type { Metadata } from "next";
import type { ReactNode } from "react";
import "./globals.css";
import { Providers } from "@/components/providers";
import { Navbar } from "@/components/layout/navbar";
import { CompareTray } from "@/components/compare/compare-tray";
import { ToastContainer } from "@/components/ui/toast-container";

export const metadata: Metadata = {
  title: {
    default: "CampusPath — Find Your Perfect College",
    template: "%s | CampusPath",
  },
  description:
    "Discover, compare, and shortlist colleges across India. Search by stream, fees, location, and ratings to make the best enrollment decision.",
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="en">
      <body>
        <Providers>
          <Navbar />
          <main className="min-h-screen">{children}</main>
          <CompareTray />
          <ToastContainer />
        </Providers>
      </body>
    </html>
  );
}
