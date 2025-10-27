import { Metadata } from "next";

export const metadata: Metadata = {
  title: "記事検索",
  description: "タイトル、内容、タグから記事を検索。IELTS対策やビジネス英語の情報を素早く見つけられます。",
};

export default function SearchLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}

