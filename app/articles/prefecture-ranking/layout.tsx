import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: '都道府県別駅乗降者数ランキング一覧｜全国47都道府県まとめ | AreaScope',
  description: '全国47都道府県の駅乗降者数ランキングを一覧で掲載。東京・大阪・神奈川など主要エリアの駅利用者数を比較できます。',
  alternates: { canonical: 'https://areascope.jp/articles/prefecture-ranking' },
};

export default function PrefRankingHubLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
