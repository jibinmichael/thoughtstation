import type { Metadata } from "next";
import { DM_Sans, Inter, Orbitron, JetBrains_Mono, Kalam } from "next/font/google";
import "./globals.css";
import "../styles/kawaii.css";

// 🎨 Kawaii Canvas Font Setup
const dmSans = DM_Sans({
  variable: "--font-dm-sans",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  display: "swap",
});

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  display: "swap",
});

const orbitron = Orbitron({
  variable: "--font-orbitron",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700", "800", "900"],
  display: "swap",
});

const jetBrainsMono = JetBrains_Mono({
  variable: "--font-jetbrains-mono",
  subsets: ["latin"],
  weight: ["400", "500", "700"],
  display: "swap",
});

const kalam = Kalam({
  variable: "--font-kalam",
  subsets: ["latin"],
  weight: ["300", "400", "700"],
  display: "swap",
});

export const metadata: Metadata = {
  title: "Kawaii Canvas - Mind Mapping & Creativity",
  description: "Beautiful kawaii-inspired canvas for mind mapping, sticky notes, and creative productivity",
  icons: {
    icon: "/favicon.ico",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="" />
      </head>
      <body
        className={`${dmSans.variable} ${inter.variable} ${orbitron.variable} ${jetBrainsMono.variable} ${kalam.variable} antialiased`}
        style={{
          background: 'linear-gradient(135deg, #FFF8F0, #F7F5F3)',
          fontFamily: 'var(--font-dm-sans), sans-serif',
        }}
      >
        {children}
      </body>
    </html>
  );
}
