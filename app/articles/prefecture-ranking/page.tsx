import Link from 'next/link';
import type { Metadata } from 'next';
import Breadcrumb from '@/components/Breadcrumb';

export const metadata: Metadata = {
  title: '都道府県別駅乗降者数ランキング一覧｜AreaScope',
  description: '全国47都道府県の駅乗降者数ランキングを地方別にまとめています。',
  alternates: {
    canonical: 'https://areascope.jp/articles/prefecture-ranking',
  },
};

const REGIONS = [
  {
    name: '北海道',
    prefs: [
      { name: '北海道', slug: 'hokkaido-station-ranking-2023' },
    ],
  },
  {
    name: '東北',
    prefs: [
      { name: '青森県', slug: 'aomori-station-ranking-2023' },
      { name: '岩手県', slug: 'iwate-station-ranking-2023' },
      { name: '宮城県', slug: 'miyagi-station-ranking-2023' },
      { name: '秋田県', slug: 'akita-station-ranking-2023' },
      { name: '山形県', slug: 'yamagata-station-ranking-2023' },
      { name: '福島県', slug: 'fukushima-station-ranking-2023' },
    ],
  },
  {
    name: '関東',
    prefs: [
      { name: '東京都', slug: 'tokyo-station-ranking-2023' },
      { name: '神奈川県', slug: 'kanagawa-station-ranking-2023' },
      { name: '埼玉県', slug: 'saitama-station-ranking-2023' },
      { name: '千葉県', slug: 'chiba-station-ranking-2023' },
      { name: '茨城県', slug: 'ibaraki-station-ranking-2023' },
      { name: '栃木県', slug: 'tochigi-station-ranking-2023' },
      { name: '群馬県', slug: 'gunma-station-ranking-2023' },
    ],
  },
  {
    name: '中部',
    prefs: [
      { name: '愛知県', slug: 'aichi-station-ranking-2023' },
      { name: '静岡県', slug: 'shizuoka-station-ranking-2023' },
      { name: '新潟県', slug: 'niigata-station-ranking-2023' },
      { name: '長野県', slug: 'nagano-station-ranking-2023' },
      { name: '山梨県', slug: 'yamanashi-station-ranking-2023' },
      { name: '岐阜県', slug: 'gifu-station-ranking-2023' },
      { name: '富山県', slug: 'toyama-station-ranking-2023' },
      { name: '石川県', slug: 'ishikawa-station-ranking-2023' },
      { name: '福井県', slug: 'fukui-station-ranking-2023' },
    ],
  },
  {
    name: '関西',
    prefs: [
      { name: '大阪府', slug: 'osaka-station-ranking-2023' },
      { name: '京都府', slug: 'kyoto-station-ranking-2023' },
      { name: '兵庫県', slug: 'hyogo-station-ranking-2023' },
      { name: '奈良県', slug: 'nara-station-ranking-2023' },
      { name: '滋賀県', slug: 'shiga-station-ranking-2023' },
      { name: '三重県', slug: 'mie-station-ranking-2023' },
      { name: '和歌山県', slug: 'wakayama-station-ranking-2023' },
    ],
  },
  {
    name: '中国',
    prefs: [
      { name: '広島県', slug: 'hiroshima-station-ranking-2023' },
      { name: '岡山県', slug: 'okayama-station-ranking-2023' },
      { name: '山口県', slug: 'yamaguchi-station-ranking-2023' },
      { name: '島根県', slug: 'shimane-station-ranking-2023' },
      { name: '鳥取県', slug: 'tottori-station-ranking-2023' },
    ],
  },
  {
    name: '四国',
    prefs: [
      { name: '香川県', slug: 'kagawa-station-ranking-2023' },
      { name: '愛媛県', slug: 'ehime-station-ranking-2023' },
      { name: '徳島県', slug: 'tokushima-station-ranking-2023' },
      { name: '高知県', slug: 'kochi-station-ranking-2023' },
    ],
  },
  {
    name: '九州・沖縄',
    prefs: [
      { name: '福岡県', slug: 'fukuoka-station-ranking-2023' },
      { name: '佐賀県', slug: 'saga-station-ranking-2023' },
      { name: '長崎県', slug: 'nagasaki-station-ranking-2023' },
      { name: '熊本県', slug: 'kumamoto-station-ranking-2023' },
      { name: '大分県', slug: 'oita-station-ranking-2023' },
      { name: '宮崎県', slug: 'miyazaki-station-ranking-2023' },
      { name: '鹿児島県', slug: 'kagoshima-station-ranking-2023' },
      { name: '沖縄県', slug: 'okinawa-station-ranking-2023' },
    ],
  },
];

const sectionStyle = {
  background: '#111827',
  border: '1px solid #1e2d45',
  borderRadius: '12px',
  padding: '24px',
  marginBottom: '20px',
};

export default function PrefectureRankingHubPage() {
  return (
    <main style={{ background: '#0a0e1a', minHeight: '100vh', color: '#e8edf5', fontFamily: 'sans-serif' }}>
      <div style={{ maxWidth: '800px', margin: '0 auto', padding: '48px 20px' }}>
        <Breadcrumb items={[
          { label: 'TOP', href: '/' },
          { label: '記事一覧', href: '/articles' },
          { label: '都道府県別駅乗降者数ランキング一覧' },
        ]} />
        <h1 style={{ fontSize: '28px', fontWeight: 800, marginBottom: '12px' }}>
          都道府県別駅<span style={{ color: '#00d4aa' }}>乗降者数</span>ランキング一覧
        </h1>
        <p style={{ color: '#aaa', fontSize: '15px', lineHeight: 1.8, marginBottom: '32px' }}>
          全国47都道府県の駅乗降者数ランキングをまとめています。各地域の主要駅や利用者数の多い駅を比較しながら、エリアの特徴を把握できます。
        </p>

        {/* 人気記事 */}
        <div style={{ ...sectionStyle, marginBottom: '32px' }}>
          <h2 style={{ fontSize: '18px', fontWeight: 700, color: '#00d4aa', marginBottom: '14px' }}>注目の都道府県</h2>
          <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
            <Link href="/articles/tokyo-station-ranking-2023" style={{ color: '#e8edf5', textDecoration: 'none', background: '#0a0e1a', border: '1px solid #00d4aa', borderRadius: '6px', padding: '8px 16px', fontSize: '14px' }}>
              東京都
            </Link>
            <Link href="/articles/osaka-station-ranking-2023" style={{ color: '#e8edf5', textDecoration: 'none', background: '#0a0e1a', border: '1px solid #00d4aa', borderRadius: '6px', padding: '8px 16px', fontSize: '14px' }}>
              大阪府
            </Link>
            <Link href="/articles/kanagawa-station-ranking-2023" style={{ color: '#e8edf5', textDecoration: 'none', background: '#0a0e1a', border: '1px solid #00d4aa', borderRadius: '6px', padding: '8px 16px', fontSize: '14px' }}>
              神奈川県
            </Link>
            <Link href="/station-ranking" style={{ color: '#00d4aa', textDecoration: 'none', background: '#0a0e1a', border: '1px solid #1e2d45', borderRadius: '6px', padding: '8px 16px', fontSize: '14px' }}>
              全国ランキング
            </Link>
          </div>
        </div>

        {/* 地方別セクション */}
        {REGIONS.map((region) => (
          <div key={region.name} style={sectionStyle}>
            <h2 style={{ fontSize: '18px', fontWeight: 700, color: '#00d4aa', marginBottom: '14px' }}>{region.name}</h2>
            <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
              {region.prefs.map((pref) => (
                <Link
                  key={pref.slug}
                  href={`/articles/${pref.slug}`}
                  style={{
                    color: '#e8edf5',
                    textDecoration: 'none',
                    background: '#0a0e1a',
                    border: '1px solid #1e2d45',
                    borderRadius: '4px',
                    padding: '6px 14px',
                    fontSize: '0.85rem',
                  }}
                >
                  {pref.name}
                </Link>
              ))}
            </div>
          </div>
        ))}

        {/* CTA */}
        <div style={{ marginTop: '32px', borderTop: '1px solid #1e2d45', paddingTop: '24px', textAlign: 'center' }}>
          <p style={{ color: '#aaa', fontSize: '14px', marginBottom: '16px' }}>
            気になるエリアの駅利用状況をチェックして、住みやすさや利便性の参考にしてください。
          </p>
          <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap', justifyContent: 'center' }}>
            <Link href="/station-ranking" style={{ display: 'inline-block', color: '#00d4aa', border: '1px solid #00d4aa', borderRadius: '6px', padding: '10px 20px', textDecoration: 'none', fontSize: '14px', fontWeight: 700 }}>
              全国ランキングを見る
            </Link>
            <Link href="/articles" style={{ display: 'inline-block', color: '#00d4aa', border: '1px solid #00d4aa', borderRadius: '6px', padding: '10px 20px', textDecoration: 'none', fontSize: '14px', fontWeight: 700 }}>
              記事一覧に戻る
            </Link>
          </div>
        </div>
      </div>
    </main>
  );
}
