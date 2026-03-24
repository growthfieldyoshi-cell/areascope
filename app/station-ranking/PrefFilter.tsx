'use client';
import { useRouter } from 'next/navigation';

const PREFS = [
  { name: '全国', slug: '' },
  { name: '北海道', slug: 'hokkaido' },
  { name: '青森', slug: 'aomori' },
  { name: '岩手', slug: 'iwate' },
  { name: '宮城', slug: 'miyagi' },
  { name: '秋田', slug: 'akita' },
  { name: '山形', slug: 'yamagata' },
  { name: '福島', slug: 'fukushima' },
  { name: '茨城', slug: 'ibaraki' },
  { name: '栃木', slug: 'tochigi' },
  { name: '群馬', slug: 'gunma' },
  { name: '埼玉', slug: 'saitama' },
  { name: '千葉', slug: 'chiba' },
  { name: '東京', slug: 'tokyo' },
  { name: '神奈川', slug: 'kanagawa' },
  { name: '新潟', slug: 'niigata' },
  { name: '富山', slug: 'toyama' },
  { name: '石川', slug: 'ishikawa' },
  { name: '福井', slug: 'fukui' },
  { name: '山梨', slug: 'yamanashi' },
  { name: '長野', slug: 'nagano' },
  { name: '岐阜', slug: 'gifu' },
  { name: '静岡', slug: 'shizuoka' },
  { name: '愛知', slug: 'aichi' },
  { name: '三重', slug: 'mie' },
  { name: '滋賀', slug: 'shiga' },
  { name: '京都', slug: 'kyoto' },
  { name: '大阪', slug: 'osaka' },
  { name: '兵庫', slug: 'hyogo' },
  { name: '奈良', slug: 'nara' },
  { name: '和歌山', slug: 'wakayama' },
  { name: '鳥取', slug: 'tottori' },
  { name: '島根', slug: 'shimane' },
  { name: '岡山', slug: 'okayama' },
  { name: '広島', slug: 'hiroshima' },
  { name: '山口', slug: 'yamaguchi' },
  { name: '徳島', slug: 'tokushima' },
  { name: '香川', slug: 'kagawa' },
  { name: '愛媛', slug: 'ehime' },
  { name: '高知', slug: 'kochi' },
  { name: '福岡', slug: 'fukuoka' },
  { name: '佐賀', slug: 'saga' },
  { name: '長崎', slug: 'nagasaki' },
  { name: '熊本', slug: 'kumamoto' },
  { name: '大分', slug: 'oita' },
  { name: '宮崎', slug: 'miyazaki' },
  { name: '鹿児島', slug: 'kagoshima' },
  { name: '沖縄', slug: 'okinawa' },
];

export default function PrefFilter({ current }: { current: string }) {
  const router = useRouter();

  return (
    <div style={{ marginBottom: '24px' }}>
      <div style={{ fontFamily: 'monospace', fontSize: '11px', color: '#6b7a99', marginBottom: '8px' }}>
        // 都道府県で絞り込む
      </div>
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
        {PREFS.map((pref) => (
          <button
            key={pref.slug}
            onClick={() => router.push(pref.slug ? `/station-ranking?pref=${pref.slug}` : '/station-ranking')}
            style={{
              padding: '6px 12px',
              borderRadius: '6px',
              border: '1px solid',
              borderColor: current === pref.slug ? '#00d4aa' : '#1e2d45',
              background: current === pref.slug ? 'rgba(0,212,170,0.1)' : '#111827',
              color: current === pref.slug ? '#00d4aa' : '#6b7a99',
              fontSize: '12px',
              cursor: 'pointer',
              fontFamily: 'monospace',
            }}
          >
            {pref.name}
          </button>
        ))}
      </div>
    </div>
  );
}