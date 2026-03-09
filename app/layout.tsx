import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "AI Proposal / Brief Builder",
  description: "快速生成专业项目提案和需求文档",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="zh-CN">
      <body className="antialiased">
        {children}
      </body>
    </html>
  );
}
