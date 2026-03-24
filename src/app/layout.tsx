import type { Metadata } from "next";
import { Inter, Outfit, Plus_Jakarta_Sans, Playfair_Display, Lora, Fira_Code, JetBrains_Mono, Space_Grotesk, Syne } from "next/font/google";
import "./globals.css";
import { AuthProvider } from "@/components/AuthProvider";
import { Notifications } from "@/components/Notifications";

const inter = Inter({ subsets: ["latin"], variable: "--font-sans" });
const outfit = Outfit({ subsets: ["latin"], variable: "--font-outfit" });
const jakarta = Plus_Jakarta_Sans({ subsets: ["latin"], variable: "--font-jakarta" });
const playfair = Playfair_Display({ subsets: ["latin"], variable: "--font-serif" });
const lora = Lora({ subsets: ["latin"], variable: "--font-lora" });
const firaCode = Fira_Code({ subsets: ["latin"], variable: "--font-mono" });
const jetbrains = JetBrains_Mono({ subsets: ["latin"], variable: "--font-jetbrains" });
const spaceGrotesk = Space_Grotesk({ subsets: ["latin"], variable: "--font-display" });
const syne = Syne({ subsets: ["latin"], variable: "--font-syne" });

export const metadata: Metadata = {
  title: "FlowState | Premium Focus Tracking",
  description: "Gamified Deep-work, aesthetics and discipline.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className="dark">
      <body className={`${inter.variable} ${outfit.variable} ${jakarta.variable} ${playfair.variable} ${lora.variable} ${firaCode.variable} ${jetbrains.variable} ${spaceGrotesk.variable} ${syne.variable} font-sans antialiased selection:bg-primary/30`}>
        <AuthProvider>
          {children}
          <Notifications />
        </AuthProvider>
      </body>
    </html>
  );
}