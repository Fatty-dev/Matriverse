import type { Metadata } from "next";
import localFont from "next/font/local";
import "./globals.css";

const circularStd = localFont({
  src: "../public/fonts/FontsFree-Net-Circular-Std-Medium.ttf",
  variable: "--font-circular",
  display: "swap",
});

export const metadata: Metadata = {
  title: "Matriverrse",
  description: "Matriverrse application",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={`${circularStd.variable} h-full antialiased`}>
      <body className="min-h-full flex flex-col" suppressHydrationWarning>
        {children}
      </body>
    </html>
  );
}
