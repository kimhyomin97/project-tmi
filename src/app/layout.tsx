import type { Metadata } from "next";
import { Geist_Mono } from "next/font/google";
import { Providers } from "@/lib/providers";
import "./globals.css";

// 본문 서체는 globals.css의 Pretendard. 여기서는 코드용 고정폭 서체만 불러온다.
const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "TMI Console",
  description: "Personal console for project-tmi backend services",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html
      lang="ko"
      // 다크 모드 고정(사용자 선호). 라이트 색 변수는 globals.css에 남겨 두어 나중에 전환을 붙일 수 있다.
      className={`dark ${geistMono.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col">
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
