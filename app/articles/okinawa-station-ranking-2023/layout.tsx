import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: '沖縄県の駅乗降者数ランキング｜利用者数TOP100 | AreaScope',
  description: '沖縄県の駅別乗降者数ランキングを掲載。ゆいレールのおもろまち・県庁前など利用者数の多い駅TOP20の特徴と、沖縄独自の交通事情を解説します。',
};

export default function ArticleLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
