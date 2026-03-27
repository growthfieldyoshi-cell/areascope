import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'あなたはいくつ読める？日本の難読市区町村名クイズ | AreaScope',
  description: '匝瑳・蒲郡・揖斐川など、読めそうで読めない難読市区町村名クイズ！全10問の4択形式で気軽に挑戦できます。',
};

export default function CityQuizLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
