// web/src/app/layout.tsx
import "./globals.css";
import type { Metadata } from "next";
import { Inter } from "next/font/google";
import Header from "@/components/Header"; // ✨ 방금 만든 헤더 import

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
    title: "Community App",
    description: "Simple community site",
};

export default function RootLayout({
                                       children,
                                   }: {
    children: React.ReactNode;
}) {
    return (
        <html lang="ko">
        <body className={inter.className}>
        {/* 모든 페이지 상단에 헤더 공통 적용 */}
        <Header />
        {children}
        </body>
        </html>
    );
}
