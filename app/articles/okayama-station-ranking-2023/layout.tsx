import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: '岡山県の駅乗降者数ランキング｜利用者数TOP100 | AreaScope',
  description: '岡山県の駅別乗降者数ランキング。岡山駅を中心とした県内主要駅TOP20の特徴を解説します。',
};

export default function ArticleLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
