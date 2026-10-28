import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Height Increase Admin",
  description: "Admin panel for the Height Increase mobile app"
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
