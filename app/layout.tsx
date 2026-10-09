import './globals.css';

import type { Metadata } from "next";
import type { ReactNode } from "react";
export const metadata: Metadata = {
  title: "Sports World | The home of the game",
  description:
    "Your home for fixtures, club stories and the teams that make the game.",
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
