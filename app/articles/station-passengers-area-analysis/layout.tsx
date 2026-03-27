import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: '駅の乗降者数から見る街の特徴｜エリア分析の基本と見方 | AreaScope',
  description: '駅の乗降者数データを使ったエリア分析の基本を解説。新宿・金沢・高山の具体例を交えながら、乗降者数の読み方と人口データとの組み合わせ方を紹介します。',
};

export default function ArticleLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
