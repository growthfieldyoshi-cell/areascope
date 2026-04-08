// app/population/page.tsx
import type { Metadata } from 'next';
import PopulationClient from './PopulationClient';

export const metadata: Metadata = {
  title: '市区町村の人口推移・増減ランキング【最新】｜検索・比較できる',
  description: '市区町村ごとの人口推移データを確認できます。',
  alternates: {
    canonical: 'https://areascope.jp/population',
  },
  openGraph: {
    type: 'website',
    title: '市区町村の人口推移・増減ランキング【最新】｜検索・比較できる',
    description: '市区町村ごとの人口推移データを確認できます。',
    url: 'https://areascope.jp/population',
    siteName: 'AreaScope',
  },
};

export default function PopulationPage() {
  return <PopulationClient />;
}