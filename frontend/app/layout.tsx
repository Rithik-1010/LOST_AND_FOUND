import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import QueryProvider from "@/components/QueryProvider";
import Link from "next/link";
import { PlusCircle, User, Home } from "lucide-react";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Campus Lost & Found",
  description: "AI-powered Campus Lost & Found Portal",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className={`${inter.className} bg-gray-50 text-gray-900 pb-20 md:pb-0 min-h-screen`}>
        <QueryProvider>
          {/* Top Nav (Desktop) */}
          <nav className="hidden md:flex bg-white shadow-sm p-4 justify-between items-center sticky top-0 z-10">
            <Link href="/" className="text-xl font-bold text-indigo-600">L&F Portal</Link>
            <div className="flex gap-6 items-center">
              <Link href="/" className="hover:text-indigo-600">Home</Link>
              <Link href="/items/new" className="bg-indigo-600 text-white px-4 py-2 rounded-lg font-medium hover:bg-indigo-700 transition">Post Item</Link>
            </div>
          </nav>
          
          <main className="max-w-5xl mx-auto p-4 md:p-8">
            {children}
          </main>

          {/* Bottom Nav (Mobile) */}
          <nav className="md:hidden fixed bottom-0 left-0 right-0 bg-white border-t p-3 flex justify-around items-center z-10 text-xs text-gray-500">
            <Link href="/" className="flex flex-col items-center gap-1 hover:text-indigo-600">
              <Home size={24} />
              <span>Home</span>
            </Link>
            <Link href="/items/new" className="flex flex-col items-center gap-1 text-indigo-600">
              <div className="bg-indigo-100 p-2 rounded-full -mt-5 shadow-sm border-2 border-white">
                <PlusCircle size={28} />
              </div>
              <span className="font-medium">Post</span>
            </Link>
            <Link href="/profile" className="flex flex-col items-center gap-1 hover:text-indigo-600">
              <User size={24} />
              <span>Profile</span>
            </Link>
          </nav>
        </QueryProvider>
      </body>
    </html>
  );
}
