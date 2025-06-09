// src/app/layout.js
import { Geist } from "next/font/google";
import "./globals.css";
import Header from "./../components/Header"; // <-- 1. IMPORT THE HEADER

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

// You can update this metadata for your app!
export const metadata = {
  title: "PintFinder",
  description: "Find the best pint prices in your city",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body className={geistSans.variable}>
        <Header /> {/* <-- 2. ADD THE HEADER COMPONENT */}
        <main>{children}</main>
      </body>
    </html>
  );
}