import './globals.css';

import { PreviewBanner } from '@/components/preview-banner';
import { PreviewWrapper } from '@/components/preview-wrapper';
import { draftMode } from 'next/headers';

import type { Metadata } from "next";
import type { ReactNode } from "react";
export const metadata: Metadata = {
  title: "Sports World | The home of the game",
  description:
    "Your home for fixtures, club stories and the teams that make the game.",
};

export default async function RootLayout({
  children,
}: {
  children: ReactNode;
}) {
  const { isEnabled } = await draftMode();

  return (
    <html lang="en">
      <body>
        <PreviewBanner enabled={isEnabled} />
        <PreviewWrapper
          enabled={isEnabled}
          endpoint={process.env.HYGRAPH_ENDPOINT}
          studioUrl={process.env.HYGRAPH_STUDIO_URL}>
          {children}
        </PreviewWrapper>
      </body>
    </html>
  );
}
