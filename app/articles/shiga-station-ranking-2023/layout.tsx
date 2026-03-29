import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: '滋賀県の駅乗降者数ランキング｜利用者数TOP100 | AreaScope',
  description: '滋賀県の駅別乗降者数ランキング。草津・南草津など主要駅の利用状況とエリア特徴を解説します。',
};

export default function ArticleLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
