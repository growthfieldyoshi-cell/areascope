import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'この駅はどの路線？路線当てクイズ | AreaScope',
  description: '祐天寺・雑色・千駄ヶ谷など、知ってるようで知らない駅の路線を当てるクイズ！全10問の4択形式で挑戦しよう。',
};

export default function LineQuizLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
