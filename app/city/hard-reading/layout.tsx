import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: '読めたら凄い！日本の難読市区町村名一覧 | AreaScope',
  description: '匝瑳・蒲郡・揖斐川など、読み方が難しい日本の難読市区町村名を20件厳選して紹介。読み方とエリア情報をあわせて確認できます。',
};

export default function HardReadingCityLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
