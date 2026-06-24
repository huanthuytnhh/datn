import type { Metadata } from "next";
import { Inter, Fira_Code } from "next/font/google";
import "./globals.css";
import { Toaster } from "@/components/ui/toaster";

const inter = Inter({
  variable: "--font-geist-sans",
  subsets: ["latin", "vietnamese"],
  weight: ["300", "400", "500", "600", "700", "900"],
});

const firaCode = Fira_Code({
  variable: "--font-geist-mono",
  subsets: ["latin"],
  weight: ["400", "500"],
});

export const metadata: Metadata = {
  title: "DeepGuard - Integrated Detection Workbench",
  description: "Hệ thống phát hiện deepfake tích hợp cho VietBank. Phân tích ảnh, video bằng AI tiên tiến.",
  keywords: ["DeepGuard", "deepfake detection", "VietBank", "AI", "forensic analysis"],
  icons: {
    icon: "/logo.svg",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="vi" className="light" suppressHydrationWarning>
      <head>
        {/* Apply the saved radius mode before paint to avoid a flash of the
            default radius. Mirrors the appearance store (key: dg_radius). */}
        <script
          dangerouslySetInnerHTML={{
            __html: `(function(){try{var r=localStorage.getItem('dg_radius');if(r!=='slight'&&r!=='sharp'&&r!=='geometric')r='sharp';document.documentElement.setAttribute('data-radius',r);}catch(e){document.documentElement.setAttribute('data-radius','sharp');}})();`,
          }}
        />
        <link
          href="https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:wght@100..700&display=swap"
          rel="stylesheet"
        />
      </head>
      <body
        className={`${inter.variable} ${firaCode.variable} antialiased`}
        suppressHydrationWarning
      >
        {children}
        <Toaster />
      </body>
    </html>
  );
}
