import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: '駅ランキングから見る住みやすい街｜乗降者数だけで判断しない | AreaScope',
  description: '乗降者数ランキングと住みやすさの関係を解説。ターミナル駅・住宅特化・バランス型の3パターンで、自分に合った街の選び方を紹介します。',
};

export default function ArticleLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
