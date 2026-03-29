import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: '山形県の駅乗降者数ランキング｜利用者数TOP100 | AreaScope',
  description: '山形県の駅別乗降者数ランキング。山形・米沢など県内主要駅TOP20の利用状況を解説します。',
};

export default function ArticleLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
