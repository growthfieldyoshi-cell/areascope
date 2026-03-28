import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: '住みやすい街ランキングの見方｜上位＝正解ではない理由 | AreaScope',
  description: '住みやすい街ランキングの正しい読み方を解説。人口・乗降者数・商業集積の視点から、ランキングに頼りすぎない街の選び方を紹介します。',
};

export default function ArticleLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
