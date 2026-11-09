import type { Metadata, Viewport } from "next";
import { Barlow, Barlow_Condensed, JetBrains_Mono } from "next/font/google";
import "./globals.css";

const condensed = Barlow_Condensed({ subsets: ["latin"], variable: "--font-condensed", weight: ["500", "600", "700", "800"], style: ["normal", "italic"] });
const barlow = Barlow({ subsets: ["latin"], variable: "--font-barlow", weight: ["400", "500", "600"] });
const jb = JetBrains_Mono({ subsets: ["latin"], variable: "--font-jb" });

export const metadata: Metadata = {
  title: "Sicla Equipamentos — Caldeiraria de alta qualidade",
  description:
    "Vasos de pressão, tanques, trocadores de calor, silos e estruturas metálicas sob projeto. Da chapa ao equipamento pronto.",
};

export const viewport: Viewport = { themeColor: "#07090c" };

const RootLayout = ({ children }: { children: React.ReactNode }) => (
  <html lang="pt-BR" className={`${condensed.variable} ${barlow.variable} ${jb.variable}`}>
    <body>{children}</body>
  </html>
);

export default RootLayout;
