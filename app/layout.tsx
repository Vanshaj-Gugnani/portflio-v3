import type { Metadata } from "next";
import localFont from "next/font/local";
import "./globals.css";

const involve = localFont({
  src: [
    {
      path: "../public/fonts/Involve-Regular.woff2",
      weight: "400",
      style: "normal",
    },
    {
      path: "../public/fonts/Involve-Medium.woff2",
      weight: "500",
      style: "normal",
    },
    {
      path: "../public/fonts/Involve-SemiBold.woff2",
      weight: "600",
      style: "normal",
    },
  ],
  variable: "--font-involve",
  display: "swap",
});

export const metadata: Metadata = {
  title: "Vanshaj - Digital Product Engineer",
  description:
    "Portfolio of Vanshaj, a frontend and full-stack developer building thoughtful digital products.",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="en" className={involve.variable}>
      <body>{children}</body>
    </html>
  );
}
