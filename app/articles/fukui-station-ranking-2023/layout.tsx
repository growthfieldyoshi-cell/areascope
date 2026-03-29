import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: '福井県の駅乗降者数ランキング｜利用者数TOP100 | AreaScope',
  description: '福井県の駅別乗降者数ランキング。福井駅を中心とした県内主要駅の利用状況を解説します。',
};

export default function ArticleLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
