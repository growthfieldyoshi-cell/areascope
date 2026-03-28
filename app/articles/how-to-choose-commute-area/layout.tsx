import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: '通勤しやすい街の選び方｜距離より大事なデータの見方 | AreaScope',
  description: '通勤しやすい街の選び方をデータで解説。距離だけでなく、乗降者数・路線・乗り換え回数の視点から、通勤実態に合ったエリアの見つけ方を紹介します。',
};

export default function ArticleLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
