import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: '乗降者数が多い駅は住みやすい？データで見る街の実態 | AreaScope',
  description: '乗降者数が多い駅周辺は便利な反面、混雑や騒音などのデメリットも。データを使って住みやすさを正しく判断する方法を解説します。',
};

export default function ArticleLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
