import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: '山口県の駅乗降者数ランキング｜利用者数TOP100 | AreaScope',
  description: '山口県の駅別乗降者数ランキング。下関・新山口など県内主要駅の利用状況とエリア特徴を解説します。',
};

export default function ArticleLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
