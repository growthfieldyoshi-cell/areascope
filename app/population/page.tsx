// app/population/page.tsx
import type { Metadata } from 'next';
import PopulationClient from './PopulationClient';

export const metadata: Metadata = {
  title: '市区町村人口推移検索｜AreaScope',
  description: '市区町村ごとの人口推移データを確認できます。',
  alternates: {
    canonical: 'https://areascope.jp/population',
  },
};

export default function PopulationPage() {
  return <PopulationClient />;
}