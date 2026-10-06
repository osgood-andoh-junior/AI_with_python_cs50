import type { Metadata } from "next";
import Shell from "../components/shell";
import "./globals.css";
export const metadata: Metadata = {
  title: "Ticket Intelligence · NLP Learning Lab",
  description: "A student-owned support-ticket classification laboratory.",
};
export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en">
      <body>
        <Shell>{children}</Shell>
      </body>
    </html>
  );
}
