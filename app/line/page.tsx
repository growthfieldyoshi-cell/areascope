import Link from 'next/link';
import type { Metadata } from 'next';

const BASE_URL = 'https://areascope.jp';
const OG_IMAGE = 'https://areascope.jp/og-default.jpg';

export const metadata: Metadata = {
  title: '日本の鉄道路線別 駅乗降者数ランキング一覧｜AreaScope',
  description: '日本の主要鉄道路線ごとの駅乗降者数ランキングページ一覧です。各路線の駅ランキングや駅一覧を確認できます。',
  alternates: {
    canonical: `${BASE_URL}/line`,
  },
  openGraph: {
    type: 'website',
    title: '日本の鉄道路線別 駅乗降者数ランキング一覧｜AreaScope',
    description: '日本の主要鉄道路線ごとの駅乗降者数ランキングページ一覧です。各路線の駅ランキングや駅一覧を確認できます。',
    url: `${BASE_URL}/line`,
    siteName: 'AreaScope',
    images: [{ url: OG_IMAGE }],
  },
  twitter: {
    card: 'summary_large_image',
    title: '日本の鉄道路線別 駅乗降者数ランキング一覧｜AreaScope',
    description: '日本の主要鉄道路線ごとの駅乗降者数ランキングページ一覧です。各路線の駅ランキングや駅一覧を確認できます。',
    images: [OG_IMAGE],
  },
  robots: {
    index: true,
    follow: true,
  },
};

const LINES: { name: string; slug: string }[] = [
  { name: '山手線', slug: 'yamanote' },
  { name: '中央線', slug: 'chuo' },
  { name: '東横線', slug: 'toyoko' },
  { name: '京王井の頭線', slug: 'keio-inokashira' },
  { name: '京王線', slug: 'keio' },
  { name: '小田急線', slug: 'odakyu' },
  { name: '東海道線', slug: 'tokaido' },
  { name: '総武線', slug: 'sobu' },
  { name: '埼京線', slug: 'saikyo' },
  { name: '丸ノ内線', slug: 'marunouchi' },
  { name: '日比谷線', slug: 'hibiya' },
  { name: '銀座線', slug: 'ginza' },
  { name: '半蔵門線', slug: 'hanzomon' },
  { name: '副都心線', slug: 'fukutoshin' },
  { name: '南北線', slug: 'namboku' },
  { name: '千代田線', slug: 'chiyoda' },
  { name: '有楽町線', slug: 'yurakucho' },
  { name: '東西線', slug: 'tozai' },
  { name: '三田線', slug: 'mita' },
  { name: '新宿線', slug: 'shinjuku' },
  { name: '浅草線', slug: 'asakusa' },
  { name: '大江戸線', slug: 'oedo' },
];

export default function LineListPage() {
  return (
    <main style={{ background: '#0a0e1a', minHeight: '100vh', color: '#e8edf5', padding: '2rem', fontFamily: 'sans-serif', maxWidth: '960px', margin: '0 auto' }}>

      <h1 style={{ fontSize: '1.8rem', color: '#00d4aa', marginBottom: '0.75rem' }}>
        日本の鉄道路線別 駅乗降者数データ
      </h1>
      <p style={{ color: '#aaa', marginBottom: '2rem', lineHeight: '1.9', fontSize: '0.95rem' }}>
        日本の主要鉄道路線ごとの駅乗降者数ランキングと駅一覧を掲載しています。
        各路線ページでは主要駅のランキングや沿線駅一覧を確認できます。
      </p>

      <section>
        <h2 style={{ fontSize: '1.3rem', color: '#00d4aa', marginBottom: '1rem' }}>
          路線一覧
        </h2>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(180px, 1fr))', gap: '0.75rem' }}>
          {LINES.map(line => (
            <Link
              key={line.slug}
              href={`/line/${line.slug}`}
              style={{
                background: '#111827',
                border: '1px solid #1e2d45',
                borderRadius: '8px',
                padding: '0.75rem 1rem',
                color: '#e8edf5',
                textDecoration: 'none',
                fontSize: '0.95rem',
                display: 'block',
              }}
            >
              {line.name}
            </Link>
          ))}
        </div>
      </section>

      <section style={{ marginTop: '3rem' }}>
        <h2 style={{ fontSize: '1.3rem', color: '#00d4aa', marginBottom: '0.5rem' }}>
          ほかの駅データを見る
        </h2>
        <p style={{ color: '#aaa', fontSize: '0.9rem', marginBottom: '1rem' }}>
          全国の駅ランキングや都道府県別データもあわせてご覧ください。
        </p>
        <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap' }}>
          <Link href="/station-ranking" style={{ color: '#00d4aa', textDecoration: 'none', border: '1px solid #00d4aa', borderRadius: '6px', padding: '10px 20px', fontSize: '0.9rem' }}>
            🏆 全国駅乗降者数ランキング
          </Link>
          <Link href="/prefecture" style={{ color: '#00d4aa', textDecoration: 'none', border: '1px solid #00d4aa', borderRadius: '6px', padding: '10px 20px', fontSize: '0.9rem' }}>
            📍 都道府県別データ
          </Link>
          <Link href="/station/list" style={{ color: '#00d4aa', textDecoration: 'none', border: '1px solid #00d4aa', borderRadius: '6px', padding: '10px 20px', fontSize: '0.9rem' }}>
            📋 全国駅一覧
          </Link>
        </div>
      </section>

    </main>
  );
}