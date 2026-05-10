import type { Metadata } from "next";
import "./globals.css";

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
    <html lang="ja">
      <body>{children}</body>
    </html>
  );
}
