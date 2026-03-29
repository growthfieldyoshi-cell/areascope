import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: '茨城県の駅乗降者数ランキング｜利用者数TOP100 | AreaScope',
  description: '茨城県の駅別乗降者数ランキングを掲載。守谷・水戸など利用者数の多い駅TOP20の特徴とエリア分析を解説します。',
};

export default function ArticleLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
