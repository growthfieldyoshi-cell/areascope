import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: '長野県の駅乗降者数ランキング｜利用者数TOP100 | AreaScope',
  description: '長野県の駅別乗降者数ランキング。長野・松本など県内主要駅TOP20の特徴とエリア分析を解説します。',
};

export default function ArticleLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
