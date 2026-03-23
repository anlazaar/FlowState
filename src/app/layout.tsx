import type { Metadata } from "next";
import { Inter, Playfair_Display, Fira_Code, Space_Grotesk } from "next/font/google";
import "./globals.css";
import { AuthProvider } from "@/components/AuthProvider";
import { Notifications } from "@/components/Notifications";

const inter = Inter({ subsets: ["latin"], variable: "--font-sans" });
const playfair = Playfair_Display({ subsets: ["latin"], variable: "--font-serif" });
const firaCode = Fira_Code({ subsets: ["latin"], variable: "--font-mono" });
const spaceGrotesk = Space_Grotesk({ subsets: ["latin"], variable: "--font-display" });

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
      <body className={`${inter.variable} ${playfair.variable} ${firaCode.variable} ${spaceGrotesk.variable} ${inter.className}`}>
        <AuthProvider>
          {children}
          <Notifications />
        </AuthProvider>
      </body>
    </html>
  );
}
