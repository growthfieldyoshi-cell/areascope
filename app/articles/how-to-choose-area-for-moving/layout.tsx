import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: '引越しで失敗しないエリアの選び方｜データで見るチェックポイント | AreaScope',
  description: '引越し先の選び方をデータで解説。人口推移や駅の乗降者数を使って、住みやすいエリアを見極めるためのポイントを紹介します。',
};

export default function ArticleLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
