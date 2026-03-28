import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'ベッドタウンの見つけ方｜データで見る住宅地の特徴 | AreaScope',
  description: 'ベッドタウンの特徴をデータで解説。駅の乗降者数・人口推移・商業集積の視点から、住宅地として適したエリアの見つけ方を紹介します。',
};

export default function ArticleLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
