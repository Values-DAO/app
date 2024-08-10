import type {Metadata} from "next";
import {Inter} from "next/font/google";
import "./globals.css";
import Providers from "../providers/privy-provider";
import {cn} from "@/lib/utils";
import Navbar from "@/components/ui/navbar";
import Footer from "@/components/ui/footer";
import {Toaster} from "@/components/ui/toaster";
import {UserContextProvider} from "@/providers/user-context-provider";
import {NextAuthProvider} from "@/providers/nextauth-provider";

const inter = Inter({subsets: ["latin"], variable: "--font-sans"});

export const metadata: Metadata = {
  title: "ValuesDAO",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <head>
        <link rel="icon" href="/favicon.png" sizes="any" />
      </head>
      <body
        className={cn(
          "flex flex-col min-h-screen bg-background font-sans antialiased",
          inter.variable
        )}
      >
        <NextAuthProvider>
          <Providers>
            <UserContextProvider>
              <Navbar />
              <section className="flex-grow"> {children}</section>
              <Toaster />
            </UserContextProvider>
          </Providers>
        </NextAuthProvider>
        <Footer />
      </body>
    </html>
  );
}
