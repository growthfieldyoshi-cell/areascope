import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: '佐賀県の駅乗降者数ランキング｜利用者数TOP20 | AreaScope',
  description: '佐賀県の駅別乗降者数ランキング。佐賀・鳥栖など県内主要駅TOP20の利用状況を解説します。',
};

export default function ArticleLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
