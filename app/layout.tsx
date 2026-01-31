import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: 'Team Assignment Tool',
  description: 'Upload an Excel file, create teams, and export results — all in-browser.',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        <div className="app-shell">
          <main className="app-main">{children}</main>
          <footer className="app-footer">
            © {new Date().getFullYear()} GroupeD - by Amar Jyoti. All rights reserved.
          </footer>
        </div>
      </body>
    </html>
  );
}
