import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: '人口増加エリアランキングの見方｜増えている街を正しく読む | AreaScope',
  description: '人口増加エリアの正しい読み方を解説。増加率・絶対数・推移の組み合わせで、本当に注目すべき街を見極める方法を紹介します。',
};

export default function ArticleLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
