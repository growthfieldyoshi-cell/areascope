import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: '駅の乗降者数が多い街は住みやすいのか？ | AreaScope',
  description: '乗降者数が多い駅周辺は本当に住みやすいのか？ターミナル型と住宅駅型の違い、混雑・商業の視点から住みやすさの正しい判断方法を解説します。',
};

export default function ArticleLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
