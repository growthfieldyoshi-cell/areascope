import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: '長崎県の駅乗降者数ランキング｜利用者数TOP20 | AreaScope',
  description: '長崎県の駅別乗降者数ランキング。長崎・諫早など県内主要駅の利用状況とエリア特徴を解説します。',
};

export default function ArticleLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
