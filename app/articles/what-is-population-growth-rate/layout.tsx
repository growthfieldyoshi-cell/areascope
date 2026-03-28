import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: '人口増加率とは？意味と見方をわかりやすく解説 | AreaScope',
  description: '人口増加率の意味と正しい見方を解説。増加率と絶対数の違い、継続性の重要性、NG例まで含めてわかりやすく整理します。',
};

export default function ArticleLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
