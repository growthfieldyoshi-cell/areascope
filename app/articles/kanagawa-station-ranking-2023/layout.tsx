import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: '神奈川県の駅乗降者数ランキング｜利用者数TOP100 | AreaScope',
  description: '神奈川県の駅別乗降者数ランキングを掲載。横浜・武蔵小杉・川崎など利用者数の多い駅TOP20の特徴と、エリア分析に役立つデータの見方を解説します。',
};

export default function ArticleLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
