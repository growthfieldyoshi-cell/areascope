import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'ファミリー向けの街の選び方｜失敗しない判断基準 | AreaScope',
  description: 'ファミリー向けの街の選び方を解説。人口構成・学校・生活インフラ・駅利用のバランスから、子育て世帯に合ったエリアの見つけ方を紹介します。',
};

export default function ArticleLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
