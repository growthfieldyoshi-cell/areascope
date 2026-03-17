// app/station/page.tsx
import type { Metadata } from 'next';
import StationSearchClient from './StationSearchClient';

export const metadata: Metadata = {
  title: '駅検索｜AreaScope',
  description: '駅名を入力して駅別乗降者数データを検索できます。',
  alternates: {
    canonical: 'https://areascope.jp/station',
  },
};

export default function StationPage() {
  return <StationSearchClient />;
}