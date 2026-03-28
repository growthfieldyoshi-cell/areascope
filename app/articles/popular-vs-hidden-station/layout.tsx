import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: '人気駅と穴場駅の違いとは？ | AreaScope',
  description: '人気駅と穴場駅の違いをデータで解説。乗降者数・需要と供給・生活バランスの視点から、自分に合った駅の見つけ方を紹介します。',
};

export default function ArticleLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
