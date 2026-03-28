import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: '住宅地と商業地の違い｜住みやすさの本質 | AreaScope',
  description: '住宅地と商業地の違いをデータで解説。駅利用・人口構造・生活利便性の視点から、便利そうに見えても住みにくい街の見分け方を紹介します。',
};

export default function ArticleLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
