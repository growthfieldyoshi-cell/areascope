import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: '島根県の駅乗降者数ランキング｜利用者数TOP20 | AreaScope',
  description: '島根県の駅別乗降者数ランキング。松江・出雲市など県内主要駅の利用状況とエリア特徴を解説します。',
};

export default function ArticleLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
