import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: '熊本県の駅乗降者数ランキング｜利用者数TOP20 | AreaScope',
  description: '熊本県の駅別乗降者数ランキング。熊本・新水前寺など県内主要駅TOP20の特徴を解説します。',
};

export default function ArticleLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
