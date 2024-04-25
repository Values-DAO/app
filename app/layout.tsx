import type {Metadata} from "next";
import {Inter} from "next/font/google";
import "./globals.css";
import Providers from "../providers/privy-provider";
import {cn} from "@/lib/utils";
import Navbar from "@/components/ui/navbar";
import Footer from "@/components/ui/footer";
import {Toaster} from "@/components/ui/toaster";

const inter = Inter({subsets: ["latin"], variable: "--font-sans"});

export const metadata: Metadata = {
  title: "Values DAO",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={cn(
          "flex flex-col min-h-screen bg-background font-sans antialiased",
          inter.variable
        )}
      >
        <Providers>
          <Navbar />
          <section className="flex-grow"> {children}</section>
          <Toaster />
        </Providers>
        <Footer />
      </body>
    </html>
  );
}
