import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'AreaScope 記事一覧 | エリア分析・駅データ・人口推移',
  description: '駅の乗降者数・市区町村の人口推移を活用したエリア分析の記事一覧。引越し・投資・出店検討に役立つデータの読み方を解説します。',
};

export default function ArticlesLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
