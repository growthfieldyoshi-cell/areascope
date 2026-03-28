import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: '人口減少している街は本当に危険なのか？ | AreaScope',
  description: '人口減少イコール危険とは限りません。減少でも安定する街のパターン、地方と都市の違い、減少の質の見方を解説します。',
};

export default function ArticleLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
