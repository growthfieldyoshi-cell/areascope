import Link from 'next/link';
import type { Metadata } from 'next';
import Breadcrumb from '@/components/Breadcrumb';

export const metadata: Metadata = {
  title: '路線一覧｜AreaScope',
  description: '主要路線の駅一覧を掲載。各路線の沿線データを確認できます。',
  alternates: {
    canonical: 'https://areascope.jp/line',
  },
};

const LINE_MAP: Record<string, { display_name: string; line_name: string; operator_name: string }> = {
  yamanote:          { display_name: '山手線',       line_name: '山手線',         operator_name: '東日本旅客鉄道' },
  chuo:              { display_name: '中央線',       line_name: '中央線',         operator_name: '東日本旅客鉄道' },
  toyoko:            { display_name: '東横線',       line_name: '東横線',         operator_name: '東急電鉄' },
  'keio-inokashira': { display_name: '京王井の頭線', line_name: '京王井の頭線',   operator_name: '京王電鉄' },
  keio:              { display_name: '京王線',       line_name: '京王線',         operator_name: '京王電鉄' },
  odakyu:            { display_name: '小田急線',     line_name: '小田急線',       operator_name: '小田急電鉄' },
  tokaido:           { display_name: '東海道線',     line_name: '東海道線',       operator_name: '東日本旅客鉄道' },
  sobu:              { display_name: '総武線',       line_name: '総武線',         operator_name: '東日本旅客鉄道' },
  saikyo:            { display_name: '埼京線',       line_name: '埼京線',         operator_name: '東日本旅客鉄道' },
  marunouchi:        { display_name: '丸ノ内線',     line_name: '4号線丸ノ内線',  operator_name: '東京地下鉄' },
  hibiya:            { display_name: '日比谷線',     line_name: '2号線日比谷線',  operator_name: '東京地下鉄' },
  ginza:             { display_name: '銀座線',       line_name: '3号線銀座線',    operator_name: '東京地下鉄' },
  hanzomon:          { display_name: '半蔵門線',     line_name: '11号線半蔵門線', operator_name: '東京地下鉄' },
  fukutoshin:        { display_name: '副都心線',     line_name: '13号線副都心線', operator_name: '東京地下鉄' },
  namboku:           { display_name: '南北線',       line_name: '7号線南北線',    operator_name: '東京地下鉄' },
  chiyoda:           { display_name: '千代田線',     line_name: '9号線千代田線',  operator_name: '東京地下鉄' },
  yurakucho:         { display_name: '有楽町線',     line_name: '8号線有楽町線',  operator_name: '東京地下鉄' },
  tozai:             { display_name: '東西線',       line_name: '5号線東西線',    operator_name: '東京地下鉄' },
  mita:              { display_name: '三田線',       line_name: '6号線三田線',    operator_name: '東京都' },
  shinjuku:          { display_name: '新宿線',       line_name: '10号線新宿線',   operator_name: '東京都' },
  asakusa:           { display_name: '浅草線',       line_name: '1号線浅草線',    operator_name: '東京都' },
  oedo:              { display_name: '大江戸線',     line_name: '12号線大江戸線', operator_name: '東京都' },
};

export default function LineListPage() {
  return (
    <main style={{ background: '#0a0e1a', minHeight: '100vh', color: '#e8edf5', padding: '2rem', fontFamily: 'sans-serif', maxWidth: '960px', margin: '0 auto' }}>
      <Breadcrumb items={[
        { label: 'TOP', href: '/' },
        { label: '路線一覧' },
      ]} />
      <h1 style={{ fontSize: '1.8rem', fontWeight: 800, marginBottom: '0.5rem' }}>
        路線<span style={{ color: '#00d4aa' }}>一覧</span>
      </h1>
      <p style={{ color: '#aaa', marginBottom: '2rem', fontSize: '0.95rem', lineHeight: 1.8 }}>
        主要路線の駅一覧を掲載しています。各路線ページでは沿線の駅データを確認できます。
      </p>
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: '12px' }}>
        {Object.entries(LINE_MAP).map(([slug, line]) => (
          <Link
            key={slug}
            href={`/line/${slug}`}
            style={{ color: '#e8edf5', textDecoration: 'none', background: '#111827', border: '1px solid #1e2d45', borderRadius: '6px', padding: '10px 20px', fontSize: '0.95rem', fontWeight: 600 }}
          >
            {line.display_name}
          </Link>
        ))}
      </div>
    </main>
  );
}