import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'この駅どこにある？都道府県当てクイズ | AreaScope',
  description: '函館・軽井沢・別府など、有名駅の都道府県を当てるクイズに挑戦！全10問の4択形式で気軽に楽しめます。',
};

export default function PrefQuizLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
