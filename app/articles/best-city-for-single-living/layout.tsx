import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: '一人暮らしに向いている街の特徴とは？ | AreaScope',
  description: '一人暮らしに向いている街の特徴を解説。駅距離・商業集積・人口構成の視点から、家賃だけに頼らないエリア選びの考え方を紹介します。',
};

export default function ArticleLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
