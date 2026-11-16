import type { Metadata } from "next";
import ConvexClientProvider from "../components/ConvexClientProvider";
import { ToastProvider } from "../components/Toast";
import Navbar from "../components/Navbar";
import "./globals.css";

export const metadata: Metadata = {
  title: "LendLoop - Neighborhood Tool Lending",
  description:
    "Borrow what you need. Lend what you don’t. A secure community tool-sharing platform powered by Next.js, Clerk, Convex, and n8n.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className="bg-slate-50 text-slate-900 antialiased min-h-screen flex flex-col">
        <ConvexClientProvider>
          <ToastProvider>
            <Navbar />
            <main className="flex-grow">{children}</main>
          </ToastProvider>
        </ConvexClientProvider>
      </body>
    </html>
  );
}
