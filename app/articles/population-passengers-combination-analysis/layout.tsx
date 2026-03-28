import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: '人口と乗降者数を組み合わせて見るエリア分析｜本当に見るべき指標とは | AreaScope',
  description: '人口と駅の乗降者数を組み合わせたエリア分析の方法を解説。単一指標では見えない街の特徴や将来性の読み方を紹介します。',
};

export default function ArticleLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
