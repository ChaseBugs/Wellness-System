import type { Metadata } from "next";
import "./globals.css";
import "./foodvisor.css";

export const metadata: Metadata = {
  title: "Wellness Admin",
  description: "One admin for the Wellness Platform: accounts, subscriptions, review queues, Foodvisor, BabyGrow and HeightIncrease"
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
