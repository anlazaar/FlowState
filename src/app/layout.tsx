import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { AuthProvider } from "@/components/AuthProvider";
import { Notifications } from "@/components/Notifications";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "FlowState",
  description: "Gamified Deep-work and Focus Tracking",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className="dark">
      <body className={inter.className}>
        <AuthProvider>
          {children}
          <Notifications />
        </AuthProvider>
      </body>
    </html>
  );
}
