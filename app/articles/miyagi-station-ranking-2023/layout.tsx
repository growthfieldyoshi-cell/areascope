import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: '宮城県の駅乗降者数ランキング｜利用者数TOP100 | AreaScope',
  description: '宮城県の駅別乗降者数ランキングを掲載。仙台・泉中央など利用者数の多い駅TOP20の特徴とエリア分析を解説します。',
};

export default function ArticleLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
