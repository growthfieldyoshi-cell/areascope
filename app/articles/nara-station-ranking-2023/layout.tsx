import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: '奈良県の駅乗降者数ランキング｜利用者数TOP100 | AreaScope',
  description: '奈良県の駅別乗降者数ランキング。近鉄奈良・王寺など主要駅TOP20の利用状況を解説します。',
};

export default function ArticleLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
