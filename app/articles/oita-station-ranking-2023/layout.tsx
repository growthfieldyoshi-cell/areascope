import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: '大分県の駅乗降者数ランキング｜利用者数TOP20 | AreaScope',
  description: '大分県の駅別乗降者数ランキング。別府・中津など県内主要駅の利用状況を解説します。',
};

export default function ArticleLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
