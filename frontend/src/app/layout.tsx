import React from "react";

import Providers from "./providers";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Home Again Furniture Bank",
  description: "Furniture donation and delivery management system",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body>
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
