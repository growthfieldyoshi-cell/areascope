import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: '鳥取県の駅乗降者数ランキング｜利用者数TOP20 | AreaScope',
  description: '鳥取県の駅別乗降者数ランキング。鳥取・米子など県内主要駅TOP20の利用状況を解説します。',
};

export default function ArticleLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
