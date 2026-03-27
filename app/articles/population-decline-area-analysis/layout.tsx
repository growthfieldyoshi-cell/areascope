import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: '人口が減っている街の特徴｜データから見るエリアの変化 | AreaScope',
  description: '人口減少エリアの特徴をデータで解説。高齢化・若年層流出の傾向と、観光地やコンパクトシティなど魅力が残るケースも紹介します。',
};

export default function ArticleLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
