import Link from 'next/link';
import type { Metadata } from 'next';
import Breadcrumb from '@/components/Breadcrumb';

export const metadata: Metadata = {
  title: '路線一覧｜AreaScope',
  description: '主要路線の駅一覧と乗降者数データを掲載しています。各路線ページでは沿線駅の人の流れを比較できます。',
  alternates: {
    canonical: 'https://areascope.jp/line',
  },
};

const LINE_SLUGS: { slug: string; display_name: string }[] = [
  { slug: 'yamanote',          display_name: '山手線' },
  { slug: 'chuo',              display_name: '中央線' },
  { slug: 'toyoko',            display_name: '東横線' },
  { slug: 'keio-inokashira',   display_name: '京王井の頭線' },
  { slug: 'keio',              display_name: '京王線' },
  { slug: 'odakyu',            display_name: '小田急線' },
  { slug: 'tokaido',           display_name: '東海道線' },
  { slug: 'sobu',              display_name: '総武線' },
  { slug: 'saikyo',            display_name: '埼京線' },
  { slug: 'marunouchi',        display_name: '丸ノ内線' },
  { slug: 'hibiya',            display_name: '日比谷線' },
  { slug: 'ginza',             display_name: '銀座線' },
  { slug: 'hanzomon',          display_name: '半蔵門線' },
  { slug: 'fukutoshin',        display_name: '副都心線' },
  { slug: 'namboku',           display_name: '南北線' },
  { slug: 'chiyoda',           display_name: '千代田線' },
  { slug: 'yurakucho',         display_name: '有楽町線' },
  { slug: 'tozai',             display_name: '東西線' },
  { slug: 'mita',              display_name: '三田線' },
  { slug: 'shinjuku',          display_name: '新宿線' },
  { slug: 'asakusa',           display_name: '浅草線' },
  { slug: 'oedo',              display_name: '大江戸線' },
];

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
      <p style={{ color: '#aaa', marginBottom: '8px', fontSize: '0.95rem', lineHeight: 1.8 }}>
        主要路線の駅一覧と乗降者数データを掲載しています。各路線ページでは沿線駅の人の流れを比較できます。
      </p>
      <p style={{ color: '#6b7a99', marginBottom: '2rem', fontSize: '12px', fontFamily: 'monospace' }}>
        ※ 現在主要路線に対応
      </p>

      <section style={{ marginBottom: '3rem' }}>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '12px' }}>
          {LINE_SLUGS.map((line) => (
            <Link
              key={line.slug}
              href={`/line/${line.slug}`}
              style={{
                color: '#e8edf5',
                textDecoration: 'none',
                background: '#111827',
                border: '1px solid #1e2d45',
                borderRadius: '6px',
                padding: '10px 20px',
                fontSize: '0.95rem',
                fontWeight: 600,
              }}
            >
              {line.display_name}
            </Link>
          ))}
        </div>
      </section>

      <section>
        <h2 style={{ fontSize: '1.1rem', color: '#00d4aa', marginBottom: '1rem' }}>関連ページ</h2>
        <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap' }}>
          <Link href="/station-ranking" style={{ color: '#00d4aa', textDecoration: 'none', border: '1px solid #00d4aa', borderRadius: '6px', padding: '10px 20px', fontSize: '0.9rem' }}>
            🏆 全国駅ランキング
          </Link>
          <Link href="/station" style={{ color: '#00d4aa', textDecoration: 'none', border: '1px solid #00d4aa', borderRadius: '6px', padding: '10px 20px', fontSize: '0.9rem' }}>
            🚃 駅検索
          </Link>
        </div>
      </section>
    </main>
  );
}