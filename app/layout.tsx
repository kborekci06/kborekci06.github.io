import type { Metadata } from "next";
import { Archivo } from "next/font/google";
import "./globals.css";

// One variable family for the whole app; each experiment decides its own weights, widths and sizes.
const archivo = Archivo({ subsets: ["latin"], axes: ["wdth"], variable: "--font-archivo", display: "swap" });

export const metadata: Metadata = {
  title: { default: "Kaan Borekci", template: "%s · Kaan Borekci" },
  description: "Engineering and AI for improving quality of life for all.",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={archivo.variable}>
      <body>{children}</body>
    </html>
  );
}
