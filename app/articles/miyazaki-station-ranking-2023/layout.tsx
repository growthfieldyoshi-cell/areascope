import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: '宮崎県の駅乗降者数ランキング｜利用者数TOP20 | AreaScope',
  description: '宮崎県の駅別乗降者数ランキング。宮崎・南宮崎など県内主要駅TOP20の利用状況を解説します。',
};

export default function ArticleLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
