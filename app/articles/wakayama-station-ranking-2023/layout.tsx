import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: '和歌山県の駅乗降者数ランキング｜利用者数TOP100 | AreaScope',
  description: '和歌山県の駅別乗降者数ランキング。和歌山・和歌山市など県内主要駅の利用状況を解説します。',
};

export default function ArticleLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
