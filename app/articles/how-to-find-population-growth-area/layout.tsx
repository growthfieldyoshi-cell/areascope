import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: '人口が増えている街の見つけ方｜エリア選びの基本とデータの見方 | AreaScope',
  description: '人口増加エリアの見つけ方を解説。川崎・流山・守谷など実例を交えながら、人口推移データと乗降者数を組み合わせたエリア分析の基本を紹介します。',
};

export default function ArticleLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
