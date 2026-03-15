import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "FlyMy.Pet — Pet Relocation from UAE to Europe",
  description:
    "Safe and reliable pet relocation from the UAE to Spain, Portugal, Romania and Russia. Start your pet's journey via Telegram.",
  keywords: [
    "pet relocation",
    "pet transport",
    "UAE",
    "Europe",
    "cat relocation",
    "Dubai pet transport",
  ],
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className="min-h-screen flex flex-col bg-white text-gray-900 antialiased">
        {children}
      </body>
    </html>
  );
}
