import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: '岐阜県の駅乗降者数ランキング｜利用者数TOP20 | AreaScope',
  description: '岐阜県の駅別乗降者数ランキング。岐阜・大垣など県内主要駅TOP20の特徴とエリア分析を解説します。',
};

export default function ArticleLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
