import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: '地方都市は住みやすいのか？｜データで見る3つのパターン | AreaScope',
  description: '地方都市の住みやすさをデータで解説。コンパクトシティ・車依存・衰退型の3パターンで、地方移住や引越しの判断に役立つ見方を紹介します。',
};

export default function ArticleLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
