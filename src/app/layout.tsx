import type { Metadata } from "next";
import { Yusei_Magic, Zen_Kaku_Gothic_New, Zen_Old_Mincho } from "next/font/google";
import "./globals.css";

const yuseiMagic = Yusei_Magic({
  weight: "400",
  subsets: ["latin"],
  variable: "--font-marker",
  display: "swap"
});

const zenKakuGothic = Zen_Kaku_Gothic_New({
  weight: ["400", "500", "700"],
  subsets: ["latin"],
  variable: "--font-sans",
  display: "swap"
});

const zenOldMincho = Zen_Old_Mincho({
  weight: ["500", "700"],
  subsets: ["latin"],
  variable: "--font-heading",
  display: "swap"
});

export const metadata: Metadata = {
  title: "キャリアけいかくん",
  description:
    "職務経歴と求人票から、次のキャリアに向けた証拠づくりを支援する AI デモアプリ"
};

export default function RootLayout({
  children
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="ja"
      className={`${yuseiMagic.variable} ${zenKakuGothic.variable} ${zenOldMincho.variable}`}
    >
      <body>{children}</body>
    </html>
  );
}
