import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: '静岡県の駅乗降者数ランキング｜利用者数TOP100 | AreaScope',
  description: '静岡県の駅別乗降者数ランキングを掲載。静岡・浜松など利用者数の多い駅TOP20の特徴とエリア分析を解説します。',
};

export default function ArticleLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
