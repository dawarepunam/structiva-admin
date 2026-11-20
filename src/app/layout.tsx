import type { Metadata, Viewport } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "STRUCTIVA Enterprise OS",
  description: "Enterprise Construction & Infrastructure ERP",
  applicationName: "STRUCTIVA",
  appleWebApp: {
    capable: true,
    statusBarStyle: "default",
    title: "STRUCTIVA"
  }
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
  themeColor: "#203A3B"
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html
      lang="en"
      className="h-full antialiased font-sans"
    >
      <body className="min-h-full flex flex-col">{children}</body>
    </html>
  );
}
