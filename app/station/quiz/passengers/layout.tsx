import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'あなたの感覚は正しい？駅の乗降者数クイズ | AreaScope',
  description: '新宿・渋谷・金沢など、有名駅の1日あたり乗降者数を当てるクイズ！全10問で日本の鉄道スケールを体感しよう。',
};

export default function PassengersQuizLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
