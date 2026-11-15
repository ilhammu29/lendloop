import type { Metadata } from "next";
import ConvexClientProvider from "../components/ConvexClientProvider";
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
          <Navbar />
          <main className="flex-grow">{children}</main>
          <footer className="bg-white border-t border-slate-200 py-6 text-center text-xs text-slate-500">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-2">
              <p>
                © {new Date().getFullYear()} <strong>LendLoop</strong>. Borrow what you need. Lend what you don’t.
              </p>
              <p className="text-slate-400">
                Engineered for Fluence with Next.js App Router, Clerk, Convex & n8n
              </p>
            </div>
          </footer>
        </ConvexClientProvider>
      </body>
    </html>
  );
}
