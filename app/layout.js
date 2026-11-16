import "./globals.css";
import { Space_Grotesk, Playfair_Display } from "next/font/google";
const sans = Space_Grotesk({ subsets: ["latin"], variable: "--f-sans" });
const serif = Playfair_Display({ subsets: ["latin"], style: ["normal", "italic"], variable: "--f-serif" });
export const metadata = { title: "LuxBuild — Luxury Architecture & Construction", description: "Immersive 3D portfolio of a luxury architecture and construction studio." };
export default function RootLayout({ children }) {
  return (<html lang="en" className={`${sans.variable} ${serif.variable}`}><body>{children}</body></html>);
}
