import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: '千葉県の駅乗降者数ランキング｜利用者数TOP100 | AreaScope',
  description: '千葉県の駅別乗降者数ランキングを掲載。西船橋・船橋・千葉など利用者数の多い駅TOP20の特徴と、エリア分析に役立つデータの見方を解説します。',
};

export default function ArticleLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
