import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: '鹿児島県の駅乗降者数ランキング｜利用者数TOP20 | AreaScope',
  description: '鹿児島県の駅別乗降者数ランキング。鹿児島中央・谷山など県内主要駅の利用状況を解説します。',
};

export default function ArticleLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
