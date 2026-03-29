import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: '福島県の駅乗降者数ランキング｜利用者数TOP100 | AreaScope',
  description: '福島県の駅別乗降者数ランキング。福島・郡山など県内主要駅の利用状況とエリア特徴を解説します。',
};

export default function ArticleLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
