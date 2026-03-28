import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: '再開発エリアは本当に伸びるのか？データで解説 | AreaScope',
  description: '再開発エリアが本当に伸びるかをデータで解説。一時的な増加と継続的な成長の違い、人口推移との関係から正しい判断方法を紹介します。',
};

export default function ArticleLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
