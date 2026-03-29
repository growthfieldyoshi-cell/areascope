import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: '香川県の駅乗降者数ランキング｜利用者数TOP20 | AreaScope',
  description: '香川県の駅別乗降者数ランキング。高松・瓦町など県内主要駅TOP20の特徴を解説します。',
};

export default function ArticleLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
