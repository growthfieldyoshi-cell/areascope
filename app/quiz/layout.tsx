import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'AreaScope クイズ一覧 | 駅名・地名・路線・乗降者数クイズ',
  description: '難読駅名、難読地名、都道府県当て、路線当て、乗降者数クイズなど、AreaScopeで楽しめるクイズを一覧で紹介。',
};

export default function QuizIndexLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
