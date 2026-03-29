import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: '東京都の駅乗降者数ランキング（2023年）｜利用者数TOP100 | AreaScope',
  description: '2023年の東京都における駅別乗降者数ランキングを掲載。新宿・渋谷・池袋など利用者数の多い駅TOP20の特徴と、エリア分析に役立つデータの見方を解説します。',
};

export default function ArticleLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
