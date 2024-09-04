import type {Metadata} from "next";
import {Inter} from "next/font/google";
import "./globals.css";
import {cn} from "@/lib/utils";
import Providers from "@/providers/privy-provider";
import Navbar from "@/components/ui/navbar";
import Footer from "@/components/ui/footer";
import {UserContextProvider} from "@/providers/user-context-provider";
import GoogleAnalytics from "@/components/google-analytics";

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
      <GoogleAnalytics />
      <body
        className={cn(
          "flex flex-col min-h-screen bg-background font-sans antialiased",
          inter.variable
        )}
      >
        <Providers>
          <UserContextProvider>
            <Navbar />
            <section className="flex-grow"> {children}</section>
          </UserContextProvider>
        </Providers>
        <Footer />
      </body>
    </html>
  );
}
