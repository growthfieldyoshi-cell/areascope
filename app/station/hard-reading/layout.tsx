import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: '読めたら凄い！日本の難読駅名一覧 | AreaScope',
  description: '放出・喜連瓜破・男衾など、読み方が難しい日本の難読駅名を24駅厳選して紹介。読み方と駅情報をあわせて確認できます。',
};

export default function HardReadingLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
