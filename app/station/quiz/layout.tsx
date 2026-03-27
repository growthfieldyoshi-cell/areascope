import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'あなたはいくつ読める？日本の難読駅名クイズ | AreaScope',
  description: '放出・喜連瓜破・男衾など、読めそうで読めない難読駅名クイズに挑戦！全10問の4択形式で気軽に楽しめます。',
};

export default function QuizLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
